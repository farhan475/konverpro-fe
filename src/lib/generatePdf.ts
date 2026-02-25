import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateConversionPDF = (data: any, isOfficial: boolean = false) => {
  const doc = new jsPDF();
  
  const title = isOfficial ? "BERITA ACARA KONVERSI SKS" : "HASIL SIMULASI KONVERSI SKS";
  const dateStr = new Date(data.created_at || new Date()).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric"
  });

  // --- HEADER ---
  doc.setFillColor(9, 78, 139); // Warna Primary Blue
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("KonverPro", 14, 20);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(title, 14, 30);

  // --- INFO MAHASISWA & KAMPUS ---
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  
  // Kolom Kiri
  doc.text(`ID Transaksi : ${data.trx_id}`, 14, 50);
  doc.text(`Tanggal      : ${dateStr}`, 14, 56);
  doc.text(`Nama         : ${data.student?.name || "-"}`, 14, 62);
  doc.text(`Email        : ${data.student?.email || "-"}`, 14, 68);

  // Kolom Kanan (Kotak Kampus Tujuan)
  doc.setFillColor(240, 245, 255);
  doc.roundedRect(110, 46, 85, 25, 3, 3, 'F');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Kampus Tujuan:", 115, 52);
  doc.setFontSize(11);
  doc.setTextColor(9, 78, 139);
  doc.setFont("helvetica", "bold");
  doc.text(data.university?.name || "Universitas Tujuan", 115, 58);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text(`Prodi: ${data.study_program?.name || "-"}`, 115, 65);

  // --- SUMMARY STATS ---
  let yPos = 85;
  const summaryData = [
      ["Total SKS Kurikulum (Target)", `${data.total_sks_target || 0} SKS`],
      ["Total SKS Diakui", `${data.total_sks_accepted || 0} SKS`],
      ["Sisa SKS Harus Ditempuh", `${Math.max((data.total_sks_target || 0) - (data.total_sks_accepted || 0), 0)} SKS`],
      ["Status Dokumen", isOfficial ? "APPROVED (VALID)" : "SIMULASI (DRAFT)"]
  ];
  
  autoTable(doc, {
      startY: yPos,
      head: [['Ringkasan', 'Nilai']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [9, 78, 139] },
      margin: { left: 14, right: 14 }
  });

  // --- DETAIL MATA KULIAH ---
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Rincian Mata Kuliah yang Diakui:", 14, (doc as any).lastAutoTable.finalY + 10);

  const rows: any[] = [];
  if (data.details && data.details.length > 0) {
      data.details.forEach((item: any) => {
          rows.push([
              item.target_course?.code || "-",
              item.target_course?.name || "Tidak Ditemukan",
              item.src_name || "-",
              `${item.src_sks} SKS (${item.src_grade})`,
              item.status === 'auto_accepted' ? 'Otomatis' : item.status === 'manual_accepted' ? 'Manual' : item.status
          ]);
      });
  }

  autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 14,
      head: [['Kode Target', 'MK Tujuan', 'MK Asal (Transkrip)', 'Nilai/SKS', 'Status']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [50, 50, 50] },
      styles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [248, 250, 252] }
  });

  // --- FOOTER & SIGNATURE ---
  const finalY = (doc as any).lastAutoTable.finalY;
  
  if (isOfficial) {
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text("Disetujui Oleh,", 150, finalY + 20);
      doc.setFont("helvetica", "bold");
      doc.text("Ketua Program Studi", 150, finalY + 40);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("*Dokumen ini sah dicetak dari sistem KonverPro", 14, finalY + 40);
  } else {
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("*Dokumen ini adalah hasil simulasi otomatis dan bukan bukti konversi resmi.", 14, finalY + 20);
  }

  // Save the PDF
  const filename = isOfficial ? `Berita_Acara_${data.trx_id}.pdf` : `Estimasi_SKS_${data.trx_id}.pdf`;
  doc.save(filename);
};