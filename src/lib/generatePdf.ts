import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateConversionPDF = (data: any, isOfficial: boolean = false) => {
  const doc = new jsPDF();
  
  const title = isOfficial ? "BERITA ACARA KONVERSI SKS" : "HASIL SIMULASI KONVERSI SKS";
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
  doc.text(`Kampus Tujuan`, 120, startY);    doc.text(`: ${data.university?.name || "-"}`, 150, startY);
  doc.text(`Program Studi`, 120, startY + 5); doc.text(`: ${data.study_program?.name || "-"}`, 150, startY + 5);

  // --- 3. TABEL DETAIL ---
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Rincian Hasil Konversi:", 14, startY + 30);

  const rows: any[] = [];
  if (data.details && data.details.length > 0) {
      data.details.forEach((item: any) => {
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
      head: [['Kode', 'MK Tujuan (Kurikulum)', 'MK Asal (Transkrip)', 'Nilai Asal', 'Keputusan']],
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
  let finalY = (doc as any).lastAutoTable.finalY;

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

      const sigX = 140; 
      const sigY = finalY + 30;

      doc.text(`Jakarta, ${dateStr}`, sigX, sigY);
      doc.text("Disetujui Oleh,", sigX, sigY + 5);
      
      doc.setFont("helvetica", "bold");
      doc.text("Ketua Program Studi", sigX, sigY + 10);
      
      doc.setFont("helvetica", "normal");
      doc.line(sigX, sigY + 35, sigX + 45, sigY + 35); 
      
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("*Dokumen ini sah dicetak secara digital oleh sistem KonverPro.", 14, 285);
  } else {
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("*Dokumen ini adalah hasil simulasi otomatis (Draft).", 14, finalY + 20);
  }

  const filename = isOfficial ? `Berita_Acara_${data.trx_id}.pdf` : `Estimasi_SKS_${data.trx_id}.pdf`;
  doc.save(filename);
};