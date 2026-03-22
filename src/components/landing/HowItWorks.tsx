const steps = [
  {
    number: "1",
    title: "Unduh Template",
    description:
      "Download file Excel standar kami untuk mengisi data nilai transkrip Anda.",
  },
  {
    number: "2",
    title: "Isi Data",
    description:
      "Salin data mata kuliah, nilai, dan SKS dari transkrip asli ke template.",
  },
  {
    number: "3",
    title: "Upload & Match",
    description:
      "Unggah file kembali. AI kami akan mencocokkan dengan kurikulum kampus.",
  },
  {
    number: "4",
    title: "Daftar Kuliah",
    description:
      "Lihat hasil konversi, bandingkan biaya, dan daftar ke kampus pilihan.",
  },
];

export default function HowItWorks() {
  return (
    <section id="prosedur" className="border-b border-slate-100 bg-white py-20">
      <div className="mx-auto max-w-[95%] px-4 sm:px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-3 text-3xl font-bold text-slate-900">
            Cara Kerja Sistem
          </h2>
          <p className="text-base text-slate-500">
            Ikuti 4 langkah mudah untuk mendapatkan hasil konversi instan.
          </p>
        </div>

        <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute left-0 top-12 hidden h-0.5 w-full bg-slate-100 lg:block" />
          {steps.map((step) => (
            <div
              key={step.number}
              className="group relative z-10 rounded-[1.75rem] bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1.5"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-brand-100 bg-white text-2xl font-bold text-brand-600 shadow-lg shadow-brand-100/50">
                {step.number}
              </div>

              <h3 className="mb-2 text-lg font-bold text-slate-800 transition-colors group-hover:text-brand-700">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-500">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
