"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import axios from "@/lib/axios";
import {
  ArrowsClockwise,
  BookOpen,
  CircleNotch,
  FloppyDisk,
  GraduationCap,
  MagnifyingGlass,
  Plus,
  SealCheck,
  Trash,
  UploadSimple,
} from "@phosphor-icons/react";
import { toast } from "sonner";

import type {
  AcademicRequiredCourse,
  AcademicSettings,
  AcademicSemesterRule,
  CurriculumCourse,
  StudyProgramOption,
} from "@/components/campus-admin/types";
import {
  createDefaultAcademicSettings,
  getAcademicSettings,
  saveAcademicSettings,
} from "@/lib/academicSettings";

const gradeOptions = ["A", "B", "C", "D"];

export default function AcademicSettingsPage() {
  const [prodis, setProdis] = useState<StudyProgramOption[]>([]);
  const [selectedProdiId, setSelectedProdiId] = useState("");
  const [courses, setCourses] = useState<CurriculumCourse[]>([]);
  const [settings, setSettings] = useState<AcademicSettings | null>(null);
  const [loadingProdis, setLoadingProdis] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedProdi = useMemo(
    () => prodis.find((item) => item.id === selectedProdiId) ?? null,
    [prodis, selectedProdiId],
  );

  useEffect(() => {
    const fetchProdis = async () => {
      try {
        setLoadingProdis(true);
        const response = await axios.get("/curriculum/prodi");
        const data = (response.data?.data ?? []) as StudyProgramOption[];
        setProdis(data);
        if (data.length > 0) {
          setSelectedProdiId(data[0].id);
        }
      } catch {
        toast.error("Gagal memuat daftar program studi.");
      } finally {
        setLoadingProdis(false);
      }
    };

    void fetchProdis();
  }, []);

  useEffect(() => {
    if (!selectedProdi) return;

    let active = true;

    const fetchAcademicWorkspace = async () => {
      try {
        setLoadingCourses(true);

        const [coursesResponse, settingsResponse] = await Promise.all([
          axios.get(`/curriculum/prodi/${selectedProdi.id}/courses`),
          axios
            .get(`/campus/settings/prodi/${selectedProdi.id}/academic-settings`)
            .catch(() => null),
        ]);

        if (!active) return;

        const nextCourses = (coursesResponse.data?.data ?? []) as CurriculumCourse[];
        setCourses(nextCourses);

        const remoteSettings = settingsResponse?.data?.data as
          | AcademicSettings
          | undefined;

        const nextSettings =
          remoteSettings ?? getAcademicSettings(selectedProdi, nextCourses);

        setSettings(nextSettings);
        saveAcademicSettings(nextSettings);
      } catch {
        if (!active) return;
        toast.error("Gagal memuat data kurikulum prodi.");
        setCourses([]);
        setSettings(getAcademicSettings(selectedProdi, []));
      } finally {
        if (active) {
          setLoadingCourses(false);
        }
      }
    };

    void fetchAcademicWorkspace();

    return () => {
      active = false;
    };
  }, [selectedProdi]);

  const filteredCourses = useMemo(() => {
    if (!searchQuery) return courses;

    const query = searchQuery.toLowerCase();
    return courses.filter(
      (course) =>
        course.name.toLowerCase().includes(query) ||
        course.code.toLowerCase().includes(query),
    );
  }, [courses, searchQuery]);

  const updateSettings = <K extends keyof AcademicSettings>(
    key: K,
    value: AcademicSettings[K],
  ) => {
    setSettings((current) => (current ? { ...current, [key]: value } : current));
  };

  const updateSemesterRule = (
    index: number,
    key: keyof AcademicSemesterRule,
    value: number,
  ) => {
    setSettings((current) => {
      if (!current) return current;

      const nextRules = [...current.semesterRules];
      nextRules[index] = {
        ...nextRules[index],
        [key]: value,
      };

      return {
        ...current,
        semesterRules: nextRules,
      };
    });
  };

  const addSemesterRule = () => {
    setSettings((current) => {
      if (!current) return current;

      const nextSemester =
        Math.max(0, ...current.semesterRules.map((rule) => rule.semester)) + 1;

      return {
        ...current,
        semesterRules: [
          ...current.semesterRules,
          { semester: nextSemester, maxSks: 20 },
        ],
      };
    });
  };

  const removeSemesterRule = (index: number) => {
    setSettings((current) => {
      if (!current) return current;

      return {
        ...current,
        semesterRules: current.semesterRules.filter((_, itemIndex) => itemIndex !== index),
      };
    });
  };

  const toggleRequiredCourse = (course: CurriculumCourse) => {
    setSettings((current) => {
      if (!current) return current;

      const exists = current.requiredCourses.some((item) => item.id === course.id);

      const nextCourse: AcademicRequiredCourse = {
        id: course.id,
        code: course.code,
        name: course.name,
        semester: course.semester,
        sks: course.sks,
      };

      return {
        ...current,
        requiredCourses: exists
          ? current.requiredCourses.filter((item) => item.id !== course.id)
          : [...current.requiredCourses, nextCourse].sort(
              (a, b) => a.semester - b.semester || a.name.localeCompare(b.name),
            ),
      };
    });
  };

  const handleSignatureUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !settings) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File tanda tangan harus berupa gambar.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      updateSettings("signatureDataUrl", reader.result);
      toast.success("Tanda tangan digital berhasil diperbarui.");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleReset = () => {
    if (!selectedProdi) return;
    setSettings(createDefaultAcademicSettings(selectedProdi, courses));
    toast.info("Pengaturan dikembalikan ke default lokal.");
  };

  const handleSave = async () => {
    if (!settings || !selectedProdiId) return;
    setSaving(true);

    try {
      const response = await axios.put(
        `/campus/settings/prodi/${selectedProdiId}/academic-settings`,
        settings,
      );
      const nextSettings = (response.data?.data ?? settings) as AcademicSettings;
      setSettings(nextSettings);
      saveAcademicSettings(nextSettings);
      toast.success("Pengaturan akademik berhasil disimpan ke server.");
    } catch {
      toast.error("Pengaturan akademik gagal disimpan. Coba lagi beberapa saat.");
    } finally {
      setSaving(false);
    }
  };

  const requiredCourseCount = settings?.requiredCourses.length ?? 0;
  const semesterRuleCount = settings?.semesterRules.length ?? 0;
  const signatureReady = Boolean(settings?.signatureDataUrl);
  const policyStats = [
    {
      label: "MK Wajib",
      value: requiredCourseCount,
      helper: "tetap harus ditempuh",
    },
    {
      label: "Rule Semester",
      value: semesterRuleCount,
      helper: "batas SKS per tahap",
    },
    {
      label: "Max SKS",
      value: settings?.maxAcceptedSks ?? 0,
      helper: "maksimum diakui",
    },
  ];

  if (loadingProdis) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <CircleNotch className="h-10 w-10 animate-spin text-[#094E8B]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-quick bg-[radial-gradient(circle_at_top,_rgba(9,78,139,0.09),_transparent_38%),linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] pb-20">
      <section className="overflow-hidden rounded-[2.5rem] border border-[#001a33]/10 bg-[#001a33] p-7 text-white shadow-2xl shadow-slate-950/10">
        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/75">
                Academic Control
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                {selectedProdi?.level || "Program Studi"}
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                {signatureReady ? "Signature Ready" : "Signature Pending"}
              </span>
            </div>

            <div className="mt-5">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-200">
                Akademik & Dokumen Resmi
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">
                {selectedProdi?.name || "Academic Settings"}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-blue-100/80">
                Atur aturan konversi, format surat, penandatangan, dan mata kuliah
                wajib agar review konversi dan dokumen resmi tetap konsisten
                dengan kebijakan prodi.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {policyStats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4 backdrop-blur-sm"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-black text-white">{item.value}</p>
                  <p className="mt-2 text-xs font-medium text-white/65">
                    {item.helper}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-amber-200">
                  <SealCheck size={20} weight="bold" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                    Policy Snapshot
                  </p>
                  <p className="mt-1 text-sm font-black text-white">
                    Nilai minimum {settings?.minPassingGrade || "C"} • Maksimal{" "}
                    {settings?.maxAcceptedSks ?? 0} SKS
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-white/65">
                    Penandatangan: {settings?.kaprodiName || "Belum ditentukan"} •
                    Format surat: {settings?.letterFormat || "{YEAR}/{NO}/{PRODI}"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                Quick Actions
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-white/15"
                >
                  <ArrowsClockwise size={18} weight="bold" />
                  Reset Default
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!settings || saving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-[#001a33] shadow-lg transition hover:bg-blue-50 disabled:opacity-50"
                >
                  {saving ? (
                    <CircleNotch size={18} className="animate-spin" />
                  ) : (
                    <FloppyDisk size={18} weight="bold" />
                  )}
                  Simpan Pengaturan
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-12">
        <aside className="space-y-4 lg:col-span-3">
          <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
            <p className="mb-4 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              Program Studi
            </p>
            <div className="space-y-3">
              {prodis.map((prodi) => (
                <button
                  key={prodi.id}
                  type="button"
                  onClick={() => setSelectedProdiId(prodi.id)}
                  className={`w-full rounded-[1.5rem] p-4 text-left transition ${
                    selectedProdiId === prodi.id
                      ? "bg-[#094E8B] text-white shadow-lg shadow-blue-900/20"
                      : "border border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-100 hover:bg-blue-50/40"
                  }`}
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] opacity-70">
                    {prodi.level}
                  </p>
                  <p className="mt-1 text-sm font-black">{prodi.name}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-blue-100 bg-blue-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#094E8B] shadow-sm">
                <BookOpen size={20} weight="duotone" />
              </div>
              <div>
                <p className="text-sm font-black text-[#001a33]">
                  Governance note
                </p>
                <p className="mt-1 text-xs leading-relaxed text-blue-900/75">
                  Policy di halaman ini dipakai untuk preview dokumen resmi,
                  composer surat, dan batas konversi per prodi.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Mata Kuliah
              </p>
              <p className="mt-2 text-3xl font-black text-[#001a33]">
                {courses.length}
              </p>
            </div>
            <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Wajib Ditempuh
              </p>
              <p className="mt-2 text-3xl font-black text-emerald-600">
                {settings?.requiredCourses.length ?? 0}
              </p>
            </div>
          </div>
        </aside>

        <div className="space-y-8 lg:col-span-9">
          <section className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <GraduationCap size={24} weight="duotone" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#001a33]">
                  {selectedProdi?.name ?? "Pilih Program Studi"}
                </h3>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Identitas penandatangan & aturan akademik
                </p>
              </div>
            </div>

            {loadingCourses || !settings ? (
              <div className="flex items-center justify-center py-16">
                <CircleNotch className="h-8 w-8 animate-spin text-[#094E8B]" />
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Nama Kaprodi
                    </label>
                    <input
                      value={settings.kaprodiName}
                      onChange={(event) =>
                        updateSettings("kaprodiName", event.target.value)
                      }
                      className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 font-bold"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Jabatan Penandatangan
                    </label>
                    <input
                      value={settings.kaprodiTitle}
                      onChange={(event) =>
                        updateSettings("kaprodiTitle", event.target.value)
                      }
                      className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 font-bold"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Format Nomor Surat
                    </label>
                    <input
                      value={settings.letterFormat}
                      onChange={(event) =>
                        updateSettings("letterFormat", event.target.value)
                      }
                      className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 font-bold"
                    />
                    <p className="mt-2 text-[11px] text-slate-400">
                      Placeholder yang didukung: {"{YEAR}"}, {"{NO}"}, {"{PRODI}"}
                    </p>
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Nilai Minimum Lulus
                    </label>
                    <select
                      value={settings.minPassingGrade}
                      onChange={(event) =>
                        updateSettings("minPassingGrade", event.target.value)
                      }
                      className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 font-bold"
                    >
                      {gradeOptions.map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Maksimum SKS Diakui
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={settings.maxAcceptedSks}
                      onChange={(event) =>
                        updateSettings(
                          "maxAcceptedSks",
                          Number(event.target.value || 0),
                        )
                      }
                      className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 font-bold"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Maksimum Lama Studi
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={settings.maxStudyYears}
                      onChange={(event) =>
                        updateSettings(
                          "maxStudyYears",
                          Number(event.target.value || 1),
                        )
                      }
                      className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 font-bold"
                    />
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-slate-100 bg-slate-50/60 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-[#001a33]">
                        Tanda Tangan Digital
                      </h4>
                      <p className="text-xs text-slate-400">
                        Digunakan pada preview dokumen resmi dan berita acara.
                      </p>
                    </div>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-[#001a33]">
                      <UploadSimple size={16} weight="bold" />
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleSignatureUpload}
                      />
                    </label>
                  </div>

                  {settings.signatureDataUrl ? (
                    <Image
                      src={settings.signatureDataUrl}
                      alt="Tanda tangan digital"
                      width={180}
                      height={96}
                      unoptimized
                      className="h-24 rounded-2xl border border-slate-200 bg-white p-3"
                    />
                  ) : (
                    <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-xs font-bold uppercase tracking-[0.18em] text-slate-300">
                      Belum ada tanda tangan
                    </div>
                  )}
                </div>

                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-[#001a33]">
                        Aturan Semester
                      </h4>
                      <p className="text-xs text-slate-400">
                        Tentukan limit SKS yang direkomendasikan untuk tiap semester.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addSemesterRule}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-[#001a33]"
                    >
                      <Plus size={16} weight="bold" />
                      Tambah Rule
                    </button>
                  </div>

                  <div className="space-y-3">
                    {settings.semesterRules.map((rule, index) => (
                      <div
                        key={`${rule.semester}-${index}`}
                        className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 md:grid-cols-[1fr_1fr_auto]"
                      >
                        <input
                          type="number"
                          min="1"
                          value={rule.semester}
                          onChange={(event) =>
                            updateSemesterRule(
                              index,
                              "semester",
                              Number(event.target.value || 1),
                            )
                          }
                          className="h-12 rounded-xl border border-slate-200 bg-white px-4 font-bold"
                        />
                        <input
                          type="number"
                          min="0"
                          value={rule.maxSks}
                          onChange={(event) =>
                            updateSemesterRule(
                              index,
                              "maxSks",
                              Number(event.target.value || 0),
                            )
                          }
                          className="h-12 rounded-xl border border-slate-200 bg-white px-4 font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => removeSemesterRule(index)}
                          className="inline-flex h-12 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 px-4 text-rose-500"
                        >
                          <Trash size={18} weight="bold" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-black text-[#001a33]">
                        Mata Kuliah Wajib Ditempuh
                      </h4>
                      <p className="text-xs text-slate-400">
                        Pilih mata kuliah yang tetap wajib diambil meski ada hasil konversi.
                      </p>
                    </div>

                    <div className="relative w-full max-w-xs">
                      <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Cari mata kuliah..."
                        className="h-12 w-full rounded-xl border border-slate-100 bg-slate-50 pl-11 pr-4 text-sm font-bold outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-2">
                    {filteredCourses.map((course) => {
                      const selected = settings.requiredCourses.some(
                        (item) => item.id === course.id,
                      );

                      return (
                        <button
                          key={course.id}
                          type="button"
                          onClick={() => toggleRequiredCourse(course)}
                          className={`rounded-[1.5rem] border p-4 text-left transition ${
                            selected
                              ? "border-emerald-200 bg-emerald-50"
                              : "border-slate-100 bg-white hover:border-blue-100 hover:bg-blue-50/40"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                                {course.code}
                              </p>
                              <p className="mt-1 text-sm font-black text-[#001a33]">
                                {course.name}
                              </p>
                              <p className="mt-2 text-xs text-slate-500">
                                Semester {course.semester} • {course.sks} SKS
                              </p>
                            </div>
                            {selected && (
                              <SealCheck
                                size={22}
                                weight="fill"
                                className="text-emerald-600"
                              />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Catatan Akademik
                  </label>
                  <textarea
                    value={settings.notes}
                    onChange={(event) => updateSettings("notes", event.target.value)}
                    className="min-h-[120px] w-full rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5 text-sm font-medium text-slate-700 outline-none"
                  />
                </div>
              </div>
            )}
          </section>

          {settings && (
            <section className="rounded-[2rem] border border-slate-100 bg-[#001a33] p-8 text-white shadow-xl shadow-slate-900/10">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-amber-300">
                  <BookOpen size={24} weight="duotone" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.18em]">
                    Ringkasan Policy
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-blue-100/80">
                    Dokumen resmi akan memakai penandatangan{" "}
                    <span className="font-bold text-white">
                      {settings.kaprodiName}
                    </span>
                    , nilai minimum{" "}
                    <span className="font-bold text-white">
                      {settings.minPassingGrade}
                    </span>
                    , dan maksimum{" "}
                    <span className="font-bold text-white">
                      {settings.maxAcceptedSks} SKS
                    </span>
                    .
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
