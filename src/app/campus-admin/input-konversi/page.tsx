"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  FileArrowUp,
  GraduationCap,
  Scan,
  ShieldCheck,
} from "@phosphor-icons/react";

import axios from "@/lib/axios";
import ConversionMappingPanel from "@/components/campus-admin/input-konversi/ConversionMappingPanel";
import ConversionSummaryCard from "@/components/campus-admin/input-konversi/ConversionSummaryCard";
import ScanResultModal from "@/components/campus-admin/input-konversi/ScanResultModal";
import StudentBioCard from "@/components/campus-admin/input-konversi/StudentBioCard";
import UploadTranscriptCard from "@/components/campus-admin/input-konversi/UploadTranscriptCard";
import type {
  CurriculumCourse,
  CurriculumSemester,
  RawTranscriptItem,
  SelectedCourse,
  StudentBio,
  StudyProgramOption,
} from "@/components/campus-admin/types";

const DEFAULT_STUDENT_BIO: StudentBio = {
  name: "-",
  univ: "-",
  email: "",
  phone: "",
};

const MATCHING_KEYWORDS = {
  name: ["nama", "mata kuliah", "matakuliah", "course", "subject", "mk"],
  sks: ["sks", "kredit", "credit", "unit"],
  grade: ["nilai", "grade", "huruf", "indeks"],
};

function toCellString(value: unknown) {
  return String(value ?? "").trim();
}

function toInteger(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
}

function buildCurriculumBySemester(courses: CurriculumCourse[]): CurriculumSemester[] {
  const grouped = new Map<number, CurriculumCourse[]>();

  courses.forEach((course) => {
    const semester = course.semester || 1;
    const items = grouped.get(semester) ?? [];
    items.push(course);
    grouped.set(semester, items);
  });

  return [...grouped.entries()]
    .sort(([left], [right]) => left - right)
    .map(([semester, semesterCourses]) => ({
      semester,
      courses: semesterCourses,
    }));
}

export default function InputKonversi() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [prodiList, setProdiList] = useState<StudyProgramOption[]>([]);
  const [selectedProdiId, setSelectedProdiId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [scanResultModal, setScanResultModal] = useState(false);
  const [scanResultSks, setScanResultSks] = useState(0);
  const [rawTranscript, setRawTranscript] = useState<RawTranscriptItem[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<Record<string, SelectedCourse>>({});
  const [curriculum, setCurriculum] = useState<CurriculumSemester[]>([]);
  const [studentBio, setStudentBio] = useState<StudentBio>(DEFAULT_STUDENT_BIO);
  const [isBioEditing, setIsBioEditing] = useState(false);

  useEffect(() => {
    const fetchProdis = async () => {
      try {
        const response = await axios.get("/curriculum/prodi");
        const items = (response.data?.data ?? []) as StudyProgramOption[];

        setProdiList(items);
        if (items.length > 0) {
          setSelectedProdiId(items[0].id);
        }
      } catch {
        toast.error("Gagal memuat prodi");
      }
    };

    fetchProdis();
  }, []);

  useEffect(() => {
    const loadCurriculum = async () => {
      if (!selectedProdiId) return;

      try {
        const response = await axios.get(`/curriculum/prodi/${selectedProdiId}/courses`);
        const courses = (response.data?.data ?? []) as CurriculumCourse[];
        setCurriculum(buildCurriculumBySemester(courses));
        setSelectedCourses({});
      } catch {
        toast.error("Gagal memuat kurikulum.");
      }
    };

    loadCurriculum();
  }, [selectedProdiId]);

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] ?? null);
  };

  const downloadTranscriptTemplate = () => {
    const workbook = XLSX.utils.book_new();
    const worksheetData = [
      ["DATA MAHASISWA", ""],
      ["Nama Mahasiswa", "Budi Santoso"],
      ["Asal Perguruan Tinggi", "Politeknik Negeri Jakarta"],
      ["Email", "budi@example.com"],
      ["Phone", "08123456789"],
      [],
      ["NO", "KODE_MK", "NAMA_MATAKULIAH", "SKS", "NILAI"],
      [1, "COMP101", "Algoritma dan Pemrograman", 3, "A"],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    worksheet["!cols"] = [{ wch: 20 }, { wch: 15 }, { wch: 40 }, { wch: 10 }, { wch: 10 }];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Template_Transkrip");
    XLSX.writeFile(workbook, "Template_Transkrip_Mahasiswa.xlsx");
  };

  const triggerScan = () => {
    if (!file) {
      toast.error("Silakan upload file transkrip terlebih dahulu.");
      return;
    }

    setLoading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      window.setTimeout(() => {
        try {
          const buffer = event.target?.result;
          if (!(buffer instanceof ArrayBuffer)) {
            throw new Error("File tidak bisa dibaca.");
          }

          const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json<unknown[]>(firstSheet, {
            header: 1,
          }) as unknown[][];

          let extractedName = "";
          let extractedUniv = "";
          let extractedEmail = "";
          let extractedPhone = "";

          rows.slice(0, 10).forEach((row) => {
            const rowValues = Array.isArray(row) ? row : [];
            const normalized = rowValues.map((value) => toCellString(value).toLowerCase());

            normalized.forEach((cell, index) => {
              if (cell.includes("nama") && !extractedName) {
                extractedName = toCellString(rowValues[index + 1]).replace(":", "").trim();
              }
              if (
                (cell.includes("universitas") ||
                  cell.includes("perguruan") ||
                  cell.includes("kampus")) &&
                !extractedUniv
              ) {
                extractedUniv = toCellString(rowValues[index + 1]).replace(":", "").trim();
              }
              if (cell.includes("email") && !extractedEmail) {
                extractedEmail = toCellString(rowValues[index + 1]).replace(":", "").trim();
              }
              if ((cell.includes("phone") || cell.includes("telepon") || cell.includes("whatsapp")) && !extractedPhone) {
                extractedPhone = toCellString(rowValues[index + 1]).replace(":", "").trim();
              }
            });
          });

          setStudentBio((previous) => ({
            ...previous,
            name: extractedName || previous.name,
            univ: extractedUniv || previous.univ,
            email: extractedEmail || previous.email,
            phone: extractedPhone || previous.phone,
          }));

          const colMap = { name: -1, grade: -1, sks: -1 };
          let headerRowIndex = -1;

          for (let rowIndex = 0; rowIndex < Math.min(rows.length, 50); rowIndex += 1) {
            const row = Array.isArray(rows[rowIndex]) ? rows[rowIndex] : [];

            row.forEach((cell, columnIndex) => {
              const text = toCellString(cell).toLowerCase();
              if (MATCHING_KEYWORDS.name.some((keyword) => text.includes(keyword))) {
                colMap.name = columnIndex;
              }
              if (MATCHING_KEYWORDS.grade.some((keyword) => text.includes(keyword))) {
                colMap.grade = columnIndex;
              }
              if (MATCHING_KEYWORDS.sks.some((keyword) => text.includes(keyword))) {
                colMap.sks = columnIndex;
              }
            });

            if (colMap.name !== -1 && (colMap.grade !== -1 || colMap.sks !== -1)) {
              headerRowIndex = rowIndex;
              break;
            }
          }

          const dataRows = rows.slice(headerRowIndex + 1);
          const transcriptItems: RawTranscriptItem[] = dataRows.reduce<RawTranscriptItem[]>(
            (accumulator, row) => {
              if (!Array.isArray(row)) return accumulator;

              const name =
                colMap.name !== -1 ? toCellString(row[colMap.name]) : "";
              const grade =
                colMap.grade !== -1
                  ? toCellString(row[colMap.grade]).toUpperCase()
                  : "";
              const sks = colMap.sks !== -1 ? toInteger(row[colMap.sks]) : 0;

              if (name.length > 2 && !name.toLowerCase().includes("total")) {
                accumulator.push({ name, grade, sks });
              }

              return accumulator;
            },
            [],
          );

          setRawTranscript(transcriptItems);

          const flatCourses = curriculum.flatMap((semester) => semester.courses);
          const nextSelected: Record<string, SelectedCourse> = {};
          let totalCredit = 0;

          flatCourses.forEach((targetCourse) => {
            const bestMatch = transcriptItems.find((sourceCourse) => {
              const sourceName = sourceCourse.name.toLowerCase();
              const targetName = targetCourse.name.toLowerCase();

              if (sourceName.includes(targetName) || targetName.includes(sourceName)) {
                return true;
              }

              return (targetCourse.keywords ?? []).some((keyword) =>
                sourceName.includes(keyword.toLowerCase()),
              );
            });

            if (bestMatch && ["A", "B", "C"].some((grade) => bestMatch.grade.startsWith(grade))) {
              nextSelected[targetCourse.name] = {
                sks: targetCourse.sks,
                matchedName: bestMatch.name,
                grade: bestMatch.grade,
              };
              totalCredit += targetCourse.sks;
            }
          });

          setSelectedCourses(nextSelected);
          setScanResultSks(totalCredit);
          setScanResultModal(true);
          window.setTimeout(() => setScanResultModal(false), 2500);
        } catch {
          toast.error("Gagal membaca file excel.");
        } finally {
          setLoading(false);
        }
      }, 1500);
    };

    reader.readAsArrayBuffer(file);
  };

  const manualMap = (targetName: string, sks: number, sourceName: string) => {
    setSelectedCourses((previous) => {
      const nextSelected = { ...previous };

      if (!sourceName) {
        delete nextSelected[targetName];
        return nextSelected;
      }

      const source = rawTranscript.find((item) => item.name === sourceName);
      if (!source) {
        return nextSelected;
      }

      nextSelected[targetName] = {
        sks,
        matchedName: source.name,
        grade: source.grade,
      };

      return nextSelected;
    });
  };

  const saveToKaprodi = async () => {
    if (studentBio.name === "-" || !studentBio.name) {
      toast.error("Isi Nama Mahasiswa dulu.");
      return;
    }

    const payload = {
      student_name: studentBio.name,
      origin_campus: studentBio.univ,
      email: studentBio.email,
      phone: studentBio.phone,
      study_program_id: selectedProdiId,
      matched_courses: selectedCourses,
      total_sks: Object.values(selectedCourses).reduce(
        (sum, course) => sum + course.sks,
        0,
      ),
    };

    setFormLoading(true);
    try {
      await axios.post("/conversions", payload);
      toast.success("Pengajuan berhasil dikirim!");
      router.push("/campus-admin/conversions");
    } catch {
      toast.error("Pengajuan gagal dikirim. Silakan cek data dan coba lagi.");
    } finally {
      setFormLoading(false);
    }
  };

  const totalWajib = curriculum.reduce(
    (sum, semester) =>
      sum + semester.courses.reduce((courseSum, course) => courseSum + course.sks, 0),
    0,
  );
  const totalDiakui = Object.values(selectedCourses).reduce(
    (sum, match) => sum + match.sks,
    0,
  );
  const sisaSks = Math.max(totalWajib - totalDiakui, 0);
  const estSem = Math.max(Math.ceil(sisaSks / 20), 0);
  const mappedCount = Object.keys(selectedCourses).length;

  return (
    <div className="space-y-10 animate-fade-in-quick">
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="relative overflow-hidden rounded-[2.75rem] bg-[#031f37] p-8 text-white shadow-[0_28px_80px_rgba(3,31,55,0.2)] lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(253,216,36,0.18),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.14),_transparent_30%)]" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">
              <Scan weight="fill" className="h-4 w-4" />
              Conversion Workspace
            </div>
            <h2 className="mt-5 max-w-3xl text-3xl font-black tracking-tight text-white lg:text-4xl">
              Upload transkrip, lakukan pencocokan, lalu kirim hasil review ke
              alur validasi kampus.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70">
              Halaman ini sekarang diposisikan seperti ruang kerja admin kampus:
              ada alur scan, ringkasan bio mahasiswa, mapping kurikulum, dan
              keputusan akhir dalam satu layar.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                  Target Prodi
                </p>
                <p className="mt-3 text-xl font-black text-white">
                  {prodiList.find((item) => item.id === selectedProdiId)?.name ??
                    "Belum dipilih"}
                </p>
                <p className="mt-2 text-sm text-white/60">
                  Prodi tujuan aktif untuk proses mapping.
                </p>
              </div>
              <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                  Mata Kuliah Asal
                </p>
                <p className="mt-3 text-4xl font-black text-white">
                  {rawTranscript.length}
                </p>
                <p className="mt-2 text-sm text-white/60">
                  Item transkrip yang sudah berhasil dibaca sistem.
                </p>
              </div>
              <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                  Padanan Aktif
                </p>
                <p className="mt-3 text-4xl font-black text-amber-300">
                  {mappedCount}
                </p>
                <p className="mt-2 text-sm text-white/60">
                  Mata kuliah tujuan yang sudah memiliki padanan.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              Checklist Cepat
            </p>
            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-4 rounded-[1.5rem] bg-slate-50 px-4 py-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                  <FileArrowUp weight="duotone" className="text-xl" />
                </div>
                <div>
                  <p className="text-sm font-black text-[#001a33]">
                    Upload template/transkrip
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    Sistem membaca file Excel/CSV untuk menyiapkan mapping awal.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-[1.5rem] bg-slate-50 px-4 py-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <GraduationCap weight="duotone" className="text-xl" />
                </div>
                <div>
                  <p className="text-sm font-black text-[#001a33]">
                    Review padanan kurikulum
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    Admin bisa cek hasil auto-match lalu koreksi manual bila
                    diperlukan.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-[1.5rem] bg-slate-50 px-4 py-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                  <ShieldCheck weight="duotone" className="text-xl" />
                </div>
                <div>
                  <p className="text-sm font-black text-[#001a33]">
                    Kirim ke workflow review
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    Hasil akhir masuk ke halaman validasi dan dokumen resmi.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-amber-100 bg-amber-50/70 p-6 shadow-sm">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">
              <CheckCircle weight="fill" className="h-4 w-4" />
              Insight Mapping
            </p>
            <h3 className="mt-3 text-xl font-black tracking-tight text-[#001a33]">
              {mappedCount > 0
                ? "Sebagian padanan sudah terbentuk dan siap direview."
                : "Mulai dari upload file agar sistem bisa membuat padanan awal."}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Semakin lengkap data mahasiswa dan file transkrip, semakin stabil
              hasil pencocokan awal yang tampil di panel kurikulum.
            </p>
          </div>
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1 min-w-0 space-y-10">
          <UploadTranscriptCard
            prodiList={prodiList}
            selectedProdiId={selectedProdiId}
            onSelectProdi={setSelectedProdiId}
            onDownloadTemplate={downloadTranscriptTemplate}
            onFileSelection={handleFileSelection}
            onTriggerScan={triggerScan}
            file={file}
            loading={loading}
            fileInputRef={fileInputRef}
          />

          <ConversionMappingPanel
            curriculum={curriculum}
            rawTranscript={rawTranscript}
            selectedCourses={selectedCourses}
            totalDiakui={totalDiakui}
            onManualMap={manualMap}
          />
        </div>

        <div className="lg:w-96 space-y-8">
          <StudentBioCard
            studentBio={studentBio}
            isEditing={isBioEditing}
            onToggleEditing={() => setIsBioEditing((previous) => !previous)}
            onChange={setStudentBio}
          />

          <div className="sticky top-10 space-y-6">
            <ConversionSummaryCard
              totalWajib={totalWajib}
              totalDiakui={totalDiakui}
              sisaSks={sisaSks}
              estSem={estSem}
              formLoading={formLoading}
              onSubmit={saveToKaprodi}
            />
          </div>
        </div>
      </div>

      <ScanResultModal open={scanResultModal} scanResultSks={scanResultSks} />
    </div>
  );
}
