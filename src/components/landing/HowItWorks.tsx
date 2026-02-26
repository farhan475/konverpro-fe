import { Card, CardContent } from "@/components/ui/card";

export default function HowItWorks() {
  const steps = [
    { num: 1, title: "Unduh Template", desc: "Download file Excel standar kami untuk mengisi data nilai transkrip Anda." },
    { num: 2, title: "Isi Data", desc: "Salin data mata kuliah, nilai, dan SKS dari transkrip asli ke template." },
    { num: 3, title: "Upload & Match", desc: "Unggah file kembali. Sistem cerdas kami akan mencocokkan dengan kurikulum." },
    { num: 4, title: "Daftar Kuliah", desc: "Lihat hasil konversi, bandingkan biaya, dan daftar ke kampus pilihan." }
  ];

  return (
    <section id="prosedur" className="py-20 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Cara Kerja Sistem</h2>
          <p className="text-slate-500 text-base">Ikuti 4 langkah mudah untuk mendapatkan hasil konversi instan.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Garis background penghubung */}
          <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-slate-100 -z-10"></div>
          
          {steps.map((step) => (
            <Card key={step.num} className="border-0 shadow-none bg-transparent hover:-translate-y-1 transition-transform duration-300">
              <CardContent className="p-0 text-center relative">
                <div className="w-16 h-16 rounded-2xl bg-white border-2 border-brand-100 text-brand-600 flex items-center justify-center text-2xl font-bold mb-6 mx-auto shadow-lg shadow-brand-100/50 z-10">
                  {step.num}
                </div>
                <h4 className="font-bold text-slate-800 mb-2 text-lg">{step.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}