import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  getOfficialDocumentTemplateMeta,
  type OfficialDocumentTemplate,
} from "@/lib/officialDocumentTemplates";

interface PdfStudentSummary {
  name?: string;
  email?: string;
}

interface PdfUniversitySummary {
  name?: string;
}

interface PdfStudyProgramSummary {
  name?: string;
}

interface PdfConversionDetail {
  status?: string;
  src_name?: string;
  src_sks?: number;
  src_grade?: string;
  target_course?: {
    code?: string;
    name?: string;
  } | null;
}

interface PdfConversionData {
  trx_id?: string;
  created_at?: string;
  total_sks_accepted?: number;
  student?: PdfStudentSummary | null;
  university?: PdfUniversitySummary | null;
  study_program?: PdfStudyProgramSummary | null;
  details?: PdfConversionDetail[];
}

export interface OfficialDocumentMeta {
  campusName?: string;
  documentNumber?: string;
  signatoryName?: string;
  signatoryTitle?: string;
  notes?: string;
  signatureDataUrl?: string;
}

interface GenerateConversionPdfOptions {
  template?: OfficialDocumentTemplate;
}

export interface AcademicReportStats {
  approved: number;
  pending: number;
  revisi: number;
  rejected: number;
}

export interface AcademicOriginDatum {
  name: string;
  value: number;
}

export interface AcademicProgramDatum {
  name: string;
  students: number;
  avgSks: number;
  ipk: string;
}

interface AcademicReportPayload {
  stats: AcademicReportStats;
  origins: AcademicOriginDatum[];
  programs: AcademicProgramDatum[];
  campusName?: string;
  generatedAt?: Date;
}

type PdfWithTableState = jsPDF & {
  lastAutoTable?: {
    finalY: number;
  };
};

export const generateConversionPDF = (
  data: PdfConversionData,
  isOfficial: boolean = false,
  officialMeta?: OfficialDocumentMeta,
  options?: GenerateConversionPdfOptions,
) => {
  const doc = new jsPDF();
  const campusName = officialMeta?.campusName || data.university?.name || "-";
  const template = options?.template ?? "berita_acara";
  const templateMeta = getOfficialDocumentTemplateMeta(template);
  
  const title = isOfficial
    ? templateMeta.title.toUpperCase()
    : "HASIL SIMULASI KONVERSI SKS";
  const dateStr = new Date(data.created_at || new Date()).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric"
  });

  // --- 1. HEADER (Kop Surat) ---
  doc.setFillColor(9, 78, 139); // Warna Biru Brand
  doc.rect(0, 0, 210, 35, 'F'); 
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("KonverPro", 14, 18);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(title, 14, 26);

  if (isOfficial) {
    doc.setFontSize(8);
    doc.text(templateMeta.label.toUpperCase(), 166, 18, { align: "right" });
  }

  // --- 2. INFO MAHASISWA ---
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9);
  
  const startY = 45;
  // Kiri
  doc.text(`ID Transaksi`, 14, startY);      doc.text(`: ${data.trx_id}`, 40, startY);
  doc.text(`Tanggal`, 14, startY + 5);       doc.text(`: ${dateStr}`, 40, startY + 5);
  doc.text(`Nama Mhs`, 14, startY + 10);     doc.text(`: ${data.student?.name || "-"}`, 40, startY + 10);
  doc.text(`Email`, 14, startY + 15);        doc.text(`: ${data.student?.email || "-"}`, 40, startY + 15);

  // Kanan
  doc.text(`Kampus Tujuan`, 120, startY);    doc.text(`: ${campusName}`, 150, startY);
  doc.text(`Program Studi`, 120, startY + 5); doc.text(`: ${data.study_program?.name || "-"}`, 150, startY + 5);
  if (isOfficial) {
    doc.text(`No. Dokumen`, 120, startY + 10);
    doc.text(`: ${officialMeta?.documentNumber || "-"}`, 150, startY + 10);
  }

  // --- 3. TABEL DETAIL ---
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(
    template === "lampiran_studi"
      ? "Ringkasan Mata Kuliah yang Sudah Dipetakan:"
      : "Rincian Hasil Konversi:",
    14,
    startY + 30,
  );

  const rows: Array<[string, string, string, string, string]> = [];
  if (data.details && data.details.length > 0) {
      data.details.forEach((item) => {
          let statusText = "-";
          if (item.status === 'auto_accepted' || item.status === 'manual_accepted' || item.status === 'approved') {
              statusText = "Diterima";
          } else if (item.status === 'rejected') {
              statusText = "Ditolak";
          } else {
              statusText = "Menunggu";
          }

          rows.push([
              item.target_course?.code || "-",
              item.target_course?.name || "Tidak Ditemukan",
              item.src_name || "-",
              `${item.src_sks} SKS / ${item.src_grade}`,
              statusText
          ]);
      });
  }

  autoTable(doc, {
      startY: startY + 35,
      head: [[
        template === "surat_keputusan" ? "Kode SK" : "Kode",
        'MK Tujuan (Kurikulum)',
        'MK Asal (Transkrip)',
        'Nilai Asal',
        template === "lampiran_studi" ? "Status" : 'Keputusan',
      ]],
      body: rows,
      theme: 'grid',
      // KEMBALI KE WARNA BIRU
      headStyles: { 
          fillColor: [9, 78, 139], // Biru Brand
          textColor: [255, 255, 255], // Teks Putih
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'center'
      },
      bodyStyles: {
          fontSize: 8,
          textColor: [60, 60, 60]
      },
      // Layout Kolom Tetap Rapi
      columnStyles: {
          0: { cellWidth: 20, halign: 'center' }, // Kode
          1: { cellWidth: 60 }, // MK Tujuan
          2: { cellWidth: 60 }, // MK Asal
          3: { cellWidth: 25, halign: 'center' }, // Nilai
          4: { cellWidth: 20, halign: 'center' }  // Status
      },
      margin: { left: 14, right: 14 }
  });

  // --- 4. FOOTER & TTD ---
  let finalY = (doc as PdfWithTableState).lastAutoTable?.finalY ?? startY + 45;

  if (finalY > 230) {
      doc.addPage();
      finalY = 20;
  }

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(`Total SKS Diakui: ${data.total_sks_accepted} SKS`, 14, finalY + 10);

  if (isOfficial) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);

      if (officialMeta?.notes) {
          const noteLines = doc.splitTextToSize(officialMeta.notes, 110);
          doc.setFontSize(9);
          const noteTitle =
            template === "surat_keputusan"
              ? "Dasar Penetapan:"
              : template === "lampiran_studi"
                ? "Catatan Rencana Studi:"
                : "Catatan Akademik:";
          doc.setFont("helvetica", "bold");
          doc.text(noteTitle, 14, finalY + 18);
          doc.setFont("helvetica", "normal");
          doc.text(noteLines, 14, finalY + 24);
      }

      const sigX = 140; 
      const sigY = finalY + 36;

      doc.text(`Jakarta, ${dateStr}`, sigX, sigY);
      doc.text(
        template === "surat_keputusan" ? "Ditetapkan Oleh," : "Disetujui Oleh,",
        sigX,
        sigY + 5,
      );
      
      doc.setFont("helvetica", "bold");
      doc.text(officialMeta?.signatoryTitle || "Ketua Program Studi", sigX, sigY + 10);

      if (officialMeta?.signatureDataUrl) {
          try {
              const format = officialMeta.signatureDataUrl.includes("image/jpeg") || officialMeta.signatureDataUrl.includes("image/jpg")
                ? "JPEG"
                : officialMeta.signatureDataUrl.includes("image/webp")
                  ? "WEBP"
                  : "PNG";
              doc.addImage(officialMeta.signatureDataUrl, format, sigX, sigY + 12, 34, 18);
          } catch (error) {
              console.error("Failed to render signature image in PDF", error);
          }
      }
      
      doc.setFont("helvetica", "normal");
      doc.line(sigX, sigY + 35, sigX + 45, sigY + 35); 
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.text(officialMeta?.signatoryName || "Ketua Program Studi", sigX, sigY + 40);
      
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `*Dokumen ini sah dicetak secara digital oleh sistem KonverPro dalam format ${templateMeta.label}.`,
        14,
        285,
      );
  } else {
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("*Dokumen ini adalah hasil simulasi otomatis (Draft).", 14, finalY + 20);
  }

  const officialFilenamePrefix =
    template === "surat_keputusan"
      ? "Surat_Keputusan"
      : template === "lampiran_studi"
        ? "Lampiran_Studi"
        : "Berita_Acara";
  const filename = isOfficial
    ? `${officialFilenamePrefix}_${data.trx_id}.pdf`
    : `Estimasi_SKS_${data.trx_id}.pdf`;
  doc.save(filename);
};

export const generateAcademicReportPDF = ({
  stats,
  origins,
  programs,
  campusName = "KonverPro Campus Admin",
  generatedAt = new Date(),
}: AcademicReportPayload) => {
  const doc = new jsPDF();
  const generatedDate = generatedAt.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  doc.setFillColor(9, 78, 139);
  doc.rect(0, 0, 210, 34, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("KonverPro", 14, 17);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("LAPORAN AKADEMIK KONVERSI", 14, 25);

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.text(`Institusi: ${campusName}`, 14, 45);
  doc.text(`Tanggal cetak: ${generatedDate}`, 14, 51);

  const summaryCards = [
    { label: "Disetujui", value: stats.approved, color: [16, 185, 129] as const },
    { label: "Pending", value: stats.pending, color: [37, 99, 235] as const },
    { label: "Revisi", value: stats.revisi, color: [245, 158, 11] as const },
    { label: "Ditolak", value: stats.rejected, color: [244, 63, 94] as const },
  ];

  summaryCards.forEach((card, index) => {
    const x = 14 + index * 47;
    doc.setDrawColor(230, 232, 236);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, 60, 42, 24, 3, 3, "FD");
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(8);
    doc.text(card.label.toUpperCase(), x + 3, 68);
    doc.setTextColor(card.color[0], card.color[1], card.color[2]);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(String(card.value), x + 3, 78);
  });

  autoTable(doc, {
    startY: 95,
    head: [["Top Asal Kampus", "Jumlah Mahasiswa"]],
    body:
      origins.length > 0
        ? origins.map((item) => [item.name, item.value.toString()])
        : [["Belum ada data", "0"]],
    theme: "grid",
    headStyles: {
      fillColor: [9, 78, 139],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [60, 60, 60],
    },
    margin: { left: 14, right: 14 },
  });

  const afterOriginsY = (doc as PdfWithTableState).lastAutoTable?.finalY ?? 120;

  autoTable(doc, {
    startY: afterOriginsY + 12,
    head: [["Program Studi", "Mahasiswa", "Rata-rata SKS", "Est. IPK"]],
    body:
      programs.length > 0
        ? programs.map((item) => [
            item.name,
            item.students.toString(),
            item.avgSks.toString(),
            item.ipk,
          ])
        : [["Belum ada data", "0", "0", "-"]],
    theme: "grid",
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [60, 60, 60],
    },
    margin: { left: 14, right: 14 },
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "Dokumen ini dibuat otomatis dari dashboard KonverPro.",
    14,
    286,
  );

  doc.save(`Laporan_Akademik_${generatedAt.getTime()}.pdf`);
};
