export type OfficialDocumentTemplate =
  | "berita_acara"
  | "surat_keputusan"
  | "lampiran_studi";

export interface OfficialDocumentTemplateMeta {
  value: OfficialDocumentTemplate;
  label: string;
  title: string;
  description: string;
  shortLabel: string;
}

export const officialDocumentTemplates: OfficialDocumentTemplateMeta[] = [
  {
    value: "berita_acara",
    label: "Berita Acara",
    title: "Berita Acara Konversi SKS",
    description:
      "Format formal untuk hasil padanan mata kuliah yang siap dicetak setelah finalisasi.",
    shortLabel: "BA",
  },
  {
    value: "surat_keputusan",
    label: "Surat Keputusan",
    title: "Surat Keputusan Konversi",
    description:
      "Format keputusan resmi program studi dengan fokus pada dasar penetapan dan hasil akhir.",
    shortLabel: "SK",
  },
  {
    value: "lampiran_studi",
    label: "Lampiran Studi",
    title: "Lampiran Rencana Studi Lanjutan",
    description:
      "Format ringkasan akademik untuk melihat sisa beban studi, policy semester, dan mata kuliah inti.",
    shortLabel: "LS",
  },
];

export function getOfficialDocumentTemplateMeta(
  template: OfficialDocumentTemplate,
) {
  return (
    officialDocumentTemplates.find((item) => item.value === template) ??
    officialDocumentTemplates[0]
  );
}
