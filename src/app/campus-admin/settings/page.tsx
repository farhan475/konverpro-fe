"use client";

import Link from "next/link";
import Image, { type ImageLoaderProps } from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import {
  Buildings,
  GraduationCap,
  Book,
  Wallet,
  Info,
  CheckCircle,
  PencilSimple,
  Plus,
  Trash,
  Check,
  X,
  CreditCard,
  Receipt,
  DownloadSimple,
  ListChecks,
  CircleNotch,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import axios from "@/lib/axios";
import type { StudyProgramOption } from "@/components/campus-admin/types";
import {
  campusLogoLoader,
  clearStoredCampusLogo,
  getStoredCampusLogo,
  saveStoredCampusLogo,
} from "@/lib/campusBranding";

interface CampusProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  logo_path?: string;
  balance?: number;
}

interface DictionaryItem {
  id: string;
  name: string;
  keywords?: string[];
}

interface BillingTransaction {
  id: string;
  trx_id?: string;
  type: string;
  amount: number;
  amount_mhs?: number | string;
  created_at: string;
  status?: string;
  university_id?: string | null;
  university_name?: string;
}

interface BillingState {
  balance: number;
  transactions: BillingTransaction[];
}

type SettingsTab = "profil" | "prodi" | "kamus" | "billing" | "info";

const logoLoader = ({ src }: ImageLoaderProps) => {
  return campusLogoLoader({ src, width: 48, quality: 75 });
};

const isSettingsTab = (value: string | null): value is SettingsTab =>
  value === "profil" ||
  value === "prodi" ||
  value === "kamus" ||
  value === "billing" ||
  value === "info";

const settingsTabMeta: Record<
  SettingsTab,
  { title: string; description: string }
> = {
  profil: {
    title: "Profil institusi dan branding kampus",
    description:
      "Kelola identitas institusi yang dipakai di header, dokumen, dan pengalaman admin kampus.",
  },
  prodi: {
    title: "Program studi dan akses akademik",
    description:
      "Atur daftar prodi, akses akad settings, dan arahkan admin ke kurikulum yang aktif.",
  },
  kamus: {
    title: "Kamus pintar untuk auto-mapping",
    description:
      "Tambahkan variasi istilah mata kuliah agar pencocokan transkrip semakin akurat.",
  },
  billing: {
    title: "Tagihan, saldo, dan histori transaksi",
    description:
      "Pantau kebutuhan top up, histori billing, dan kesiapan saldo operasional kampus.",
  },
  info: {
    title: "Informasi lisensi dan status sistem",
    description:
      "Lihat ringkasan lisensi, versi aplikasi, dan kondisi sistem kampus Anda.",
  },
};

export default function PengaturanKampus() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profil");
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // States
  const [campusProfile, setCampusProfile] = useState<CampusProfile>({
    id: "",
    name: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    logo_path: "",
  });

  const [prodiList, setProdiList] = useState<StudyProgramOption[]>([]);
  const [dictionary, setDictionary] = useState<DictionaryItem[]>([]);
  const [billing, setBilling] = useState<BillingState>({
    balance: 0,
    transactions: [],
  });
  const [localLogoPreview, setLocalLogoPreview] = useState("");
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [customTopupAmount, setCustomTopupAmount] = useState("");

  // Modal States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [prodiModal, setProdiModal] = useState<{
    isOpen: boolean;
    data: StudyProgramOption | null;
  }>({ isOpen: false, data: null });
  const [dictModal, setDictModal] = useState<{
    isOpen: boolean;
    data: DictionaryItem | null;
    keywords: string;
  }>({ isOpen: false, data: null, keywords: "" });
  const [topupModal, setTopupModal] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const displayLogo = localLogoPreview || campusProfile.logo_path || "";
  const currentTabMeta = settingsTabMeta[activeTab];
  const pendingBillingCount = billing.transactions.filter(
    (transaction) => transaction.status === "pending",
  ).length;
  const totalDictionaryKeywords = dictionary.reduce(
    (total, item) => total + (item.keywords?.length ?? 0),
    0,
  );

  const loadAllData = useCallback(async () => {
    try {
      const [resProfile, resProdis, resDict, resBilling] = await Promise.all([
        axios.get("/campus/settings/profile"),
        axios.get("/campus/settings/prodi"),
        axios.get("/campus/settings/dictionary"),
        axios.get("/campus/settings/billing-history"),
      ]);

      setCampusProfile(resProfile.data.data as CampusProfile);
      setProdiList((resProdis.data.data ?? []) as StudyProgramOption[]);
      setDictionary((resDict.data.data ?? []) as DictionaryItem[]);
      setLocalLogoPreview(getStoredCampusLogo() ?? "");
      setBilling({
        balance: resProfile.data.data.balance || 0,
        transactions: [...((resBilling.data.data ?? []) as BillingTransaction[])].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ),
      });
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data pengaturan.");
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const nextTab = new URLSearchParams(window.location.search).get("tab");
    if (isSettingsTab(nextTab)) {
      setActiveTab(nextTab);
    }
  }, []);

  // --- ACTIONS ---
  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", campusProfile.name);
      formData.append("website", campusProfile.website || "");

      if (pendingLogoFile) {
        formData.append("logo", pendingLogoFile);
      }

      await axios.post("/campus/settings/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      clearStoredCampusLogo();
      setLocalLogoPreview("");
      setPendingLogoFile(null);
      await loadAllData();
      setIsEditingProfile(false);
      toast.success("Profil kampus berhasil diperbarui!");
    } catch {
      toast.error("Gagal memperbarui profil.");
    } finally {
      setLoading(false);
    }
  };

  const handleLocalLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File logo harus berupa gambar.");
      return;
    }

    setPendingLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        return;
      }

      saveStoredCampusLogo(reader.result);
      setLocalLogoPreview(reader.result);
      toast.success("Preview logo diperbarui.");
      toast.info("Simpan profil untuk mengunggah logo ke server.");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleSaveProdi = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const payload = {
      code: formData.get("code"),
      name: formData.get("nama"),
      level: formData.get("strata"),
    };

    try {
      if (prodiModal.data) {
        await axios.put(
          `/campus/settings/prodi/${prodiModal.data.id}`,
          payload,
        );
      } else {
        await axios.post("/campus/settings/prodi", payload);
      }
      await loadAllData();
      setProdiModal({ isOpen: false, data: null });
      toast.success("Data Prodi berhasil disimpan!");
    } catch {
      toast.error("Gagal menyimpan data Prodi.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProdi = async (id: string) => {
    if (confirm("Hapus prodi ini beserta kurikulumnya?")) {
      try {
        await axios.delete(`/campus/settings/prodi/${id}`);
        await loadAllData();
        toast.success("Prodi dihapus.");
      } catch {
        toast.error("Gagal menghapus prodi.");
      }
    }
  };

  const handleSaveDictionary = async () => {
    if (!dictModal.data) return;

    const keysArray = dictModal.keywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k);
    setLoading(true);
    try {
      await axios.put(`/campus/settings/dictionary/${dictModal.data.id}`, {
        keywords: keysArray,
      });
      await loadAllData();
      setDictModal({ isOpen: false, data: null, keywords: "" });
      toast.success("Sinonim diperbarui!");
    } catch {
      toast.error("Gagal memperbarui kamus.");
    } finally {
      setLoading(false);
    }
  };

  const requestTopup = async () => {
    const topupAmount = Number(customTopupAmount);
    if (!topupAmount || topupAmount < 500000) {
      toast.error("Nominal top-up minimum Rp 500.000.");
      return;
    }

    try {
      await axios.post("/campus/settings/topups", {
        amount: topupAmount,
      });
      await loadAllData();
      setTopupModal(false);
      setCustomTopupAmount("");
      toast.success("Permintaan top-up berhasil dikirim ke sistem.");
      return;
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengirim permintaan top-up ke sistem.");
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <CircleNotch className="animate-spin text-blue-900 w-12 h-12" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
          Menyiapkan Pengaturan...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-quick pb-20 lg:pb-0">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="font-heading text-lg lg:text-xl font-semibold tracking-tight text-[#001a33] uppercase">
            Pengaturan Sistem
          </h2>
          <p className="text-slate-400 text-xs lg:text-sm">
            Konfigurasi aplikasi KonverPro untuk kampus Anda.
          </p>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="relative overflow-hidden rounded-[2.75rem] bg-[#031f37] p-8 text-white shadow-[0_28px_80px_rgba(3,31,55,0.2)] lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(253,216,36,0.18),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.14),_transparent_30%)]" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">
              <Info weight="fill" className="h-4 w-4" />
              Campus Settings Hub
            </div>
            <h2 className="mt-5 max-w-3xl text-3xl font-black tracking-tight text-white lg:text-4xl">
              {currentTabMeta.title}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70">
              {currentTabMeta.description}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                  Institusi
                </p>
                <p className="mt-3 text-xl font-black text-white">
                  {campusProfile.name || "Belum diisi"}
                </p>
                <p className="mt-2 text-sm text-white/60">
                  Identitas utama kampus yang tampil di sistem.
                </p>
              </div>
              <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                  Program Studi
                </p>
                <p className="mt-3 text-4xl font-black text-white">
                  {prodiList.length}
                </p>
                <p className="mt-2 text-sm text-white/60">
                  Prodi aktif yang sedang terdaftar di kampus.
                </p>
              </div>
              <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                  Saldo
                </p>
                <p className="mt-3 text-2xl font-black text-amber-300">
                  Rp {billing.balance.toLocaleString("id-ID")}
                </p>
                <p className="mt-2 text-sm text-white/60">
                  Siap dipakai untuk workflow konversi berikutnya.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              Navigasi Cepat
            </p>
            <div className="mt-5 grid gap-4">
              <div className="rounded-[1.5rem] bg-slate-50 px-4 py-4">
                <p className="text-sm font-black text-[#001a33]">Tab aktif</p>
                <p className="mt-1 text-sm text-slate-500">
                  {activeTab === "profil"
                    ? "Profil Institusi"
                    : activeTab === "prodi"
                      ? "Program Studi"
                      : activeTab === "kamus"
                        ? "Kamus Pintar"
                        : activeTab === "billing"
                          ? "Tagihan & Token"
                          : "Informasi Sistem"}
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-slate-50 px-4 py-4">
                <p className="text-sm font-black text-[#001a33]">
                  Kata kunci pintar
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {dictionary.length} target dengan {totalDictionaryKeywords}{" "}
                  sinonim aktif.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-slate-50 px-4 py-4">
                <p className="text-sm font-black text-[#001a33]">
                  Permintaan billing
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {pendingBillingCount} request masih menunggu review admin
                  pusat.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-amber-100 bg-amber-50/70 p-6 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">
              Setting Tip
            </p>
            <h3 className="mt-3 text-xl font-black tracking-tight text-[#001a33]">
              Menjaga profil, prodi, dan billing tetap rapi akan mempermudah
              seluruh workflow konversi.
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Halaman ini saya arahkan menjadi hub pengaturan kampus, jadi admin
              bisa pindah dari branding, akademik, sampai billing tanpa terasa
              terputus.
            </p>
          </div>
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* SIDEBAR TABS */}
        <div className="w-full lg:w-64 shrink-0 flex flex-row lg:flex-col gap-2 overflow-x-auto no-scrollbar bg-white p-2 lg:p-3 shadow-sm border border-slate-100 rounded-[1.75rem] sticky top-24 z-10">
          <button
            onClick={() => setActiveTab("profil")}
            className={`flex-shrink-0 flex items-center justify-center lg:justify-start gap-3 p-3 lg:px-4 lg:py-3.5 rounded-xl font-bold transition-all text-xs lg:text-sm whitespace-nowrap ${activeTab === "profil" ? "bg-[#094E8B] text-white shadow-lg shadow-blue-900/20" : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"}`}
          >
            <Buildings
              weight={activeTab === "profil" ? "fill" : "regular"}
              className="text-lg lg:text-xl"
            />{" "}
            Profil Institusi
          </button>
          <button
            onClick={() => setActiveTab("prodi")}
            className={`flex-shrink-0 flex items-center justify-center lg:justify-start gap-3 p-3 lg:px-4 lg:py-3.5 rounded-xl font-bold transition-all text-xs lg:text-sm whitespace-nowrap ${activeTab === "prodi" ? "bg-[#094E8B] text-white shadow-lg shadow-blue-900/20" : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"}`}
          >
            <GraduationCap
              weight={activeTab === "prodi" ? "fill" : "regular"}
              className="text-lg lg:text-xl"
            />{" "}
            Program Studi
          </button>
          <button
            onClick={() => setActiveTab("kamus")}
            className={`flex-shrink-0 flex items-center justify-center lg:justify-start gap-3 p-3 lg:px-4 lg:py-3.5 rounded-xl font-bold transition-all text-xs lg:text-sm whitespace-nowrap ${activeTab === "kamus" ? "bg-[#094E8B] text-white shadow-lg shadow-blue-900/20" : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"}`}
          >
            <Book
              weight={activeTab === "kamus" ? "fill" : "regular"}
              className="text-lg lg:text-xl"
            />{" "}
            Kamus Pintar
          </button>
          <hr className="border-slate-100 my-1 hidden lg:block" />
          <button
            onClick={() => setActiveTab("billing")}
            className={`flex-shrink-0 flex items-center justify-center lg:justify-start gap-3 p-3 lg:px-4 lg:py-3.5 rounded-xl font-bold transition-all text-xs lg:text-sm whitespace-nowrap ${activeTab === "billing" ? "bg-[#094E8B] text-white shadow-lg shadow-blue-900/20" : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"}`}
          >
            <Wallet
              weight={activeTab === "billing" ? "fill" : "regular"}
              className="text-lg lg:text-xl"
            />{" "}
            Tagihan & Token
          </button>
          <button
            onClick={() => setActiveTab("info")}
            className={`flex-shrink-0 flex items-center justify-center lg:justify-start gap-3 p-3 lg:px-4 lg:py-3.5 rounded-xl font-bold transition-all text-xs lg:text-sm whitespace-nowrap ${activeTab === "info" ? "bg-[#094E8B] text-white shadow-lg shadow-blue-900/20" : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"}`}
          >
            <Info
              weight={activeTab === "info" ? "fill" : "regular"}
              className="text-lg lg:text-xl"
            />{" "}
            Informasi Sistem
          </button>
          <div className="hidden lg:block rounded-[1.4rem] border border-blue-100 bg-blue-50 px-4 py-4 mt-2">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-700">
              Campus Ops Note
            </p>
            <p className="mt-2 text-xs leading-relaxed text-blue-900/75">
              Hub ini sekarang diposisikan sebagai control panel kampus untuk
              branding, prodi, kamus istilah, dan request top up manual.
            </p>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 w-full min-w-0 bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 lg:p-8 min-h-[500px]">
          {/* TAB: PROFIL */}
          {activeTab === "profil" && (
            <div className="animate-fade-in-quick grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div>
                <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-heading font-bold text-[#001a33] flex items-center gap-2">
                    <Buildings
                      weight="duotone"
                      className="text-blue-600 text-2xl"
                    />{" "}
                    Identitas Kampus
                  </h3>
                  <button
                    onClick={() =>
                      isEditingProfile
                        ? handleSaveProfile()
                        : setIsEditingProfile(true)
                    }
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition ${isEditingProfile ? "bg-amber-400 text-amber-900 hover:brightness-95" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    {loading ? (
                      <CircleNotch className="animate-spin" />
                    ) : isEditingProfile ? (
                      <>
                        <Check weight="bold" /> Simpan
                      </>
                    ) : (
                      <>
                        <PencilSimple weight="bold" /> Edit Profil
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 block">
                        Nama Institusi Terdaftar
                      </label>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={campusProfile.name}
                          onChange={(e) =>
                            setCampusProfile({
                              ...campusProfile,
                              name: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-yellow-50 border border-amber-300 rounded-xl font-bold text-[#001a33] focus:ring-2 focus:ring-amber-200 outline-none"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-[#001a33] text-sm">
                          {campusProfile.name}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 block">
                        Email Resmi Terdaftar
                      </label>
                      <div className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-400 text-sm italic">
                        {campusProfile.email} (Non-editable)
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 block">
                        Website
                      </label>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={campusProfile.website || ""}
                          onChange={(e) =>
                            setCampusProfile({
                              ...campusProfile,
                              website: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-yellow-50 border border-amber-300 rounded-xl font-bold text-[#001a33] focus:ring-2 focus:ring-amber-200 outline-none"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-[#001a33] text-sm">
                          {campusProfile.website || "-"}
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white border border-blue-100 flex items-center justify-center shrink-0 overflow-hidden">
                          {displayLogo ? (
                            <Image
                              loader={logoLoader}
                              unoptimized
                              src={displayLogo}
                              alt="Logo"
                              width={48}
                              height={48}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Buildings className="text-blue-600" size={24} />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-blue-900">
                            Logo Institusi
                          </p>
                          <p className="text-[10px] text-blue-700/60">
                            Logo ini digunakan pada header aplikasi dan dokumen
                            PDF resmi.
                          </p>
                          {localLogoPreview && (
                            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-amber-600">
                              Mode lokal aktif
                            </p>
                          )}
                        </div>
                        {isEditingProfile && (
                          <>
                            <input
                              ref={logoInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleLocalLogoChange}
                            />
                            <button
                              type="button"
                              onClick={() => logoInputRef.current?.click()}
                              className="ml-auto text-xs font-bold text-blue-600 hover:underline"
                            >
                              Ubah Logo
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Branding Snapshot
                  </p>
                  <p className="mt-2 text-lg font-black text-[#001a33]">
                    {displayLogo
                      ? "Identitas kampus siap dipakai"
                      : "Logo kampus belum final"}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    Data profil ini tampil di header admin, composer dokumen,
                    dan berbagai titik identitas sistem kampus.
                  </p>
                </div>

                <div className="rounded-[2rem] border border-blue-100 bg-blue-50 p-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-700">
                    Identity Checklist
                  </p>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="rounded-xl bg-white px-4 py-3 font-bold text-[#001a33]">
                      Nama institusi: {campusProfile.name || "Belum diisi"}
                    </div>
                    <div className="rounded-xl bg-white px-4 py-3 font-bold text-[#001a33]">
                      Website: {campusProfile.website || "Belum ditautkan"}
                    </div>
                    <div className="rounded-xl bg-white px-4 py-3 font-bold text-[#001a33]">
                      Logo mode:{" "}
                      {localLogoPreview
                        ? "Preview belum disimpan"
                        : displayLogo
                          ? "Remote asset"
                          : "Belum ada"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PRODI */}
          {activeTab === "prodi" && (
            <div className="animate-fade-in-quick">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-slate-100 pb-4 gap-4">
                <h3 className="text-lg font-heading font-bold text-[#001a33] flex items-center gap-2">
                  <GraduationCap
                    weight="duotone"
                    className="text-blue-600 text-2xl"
                  />{" "}
                  Manajemen Program Studi
                </h3>
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                  <Link
                    href="/campus-admin/akad-settings"
                    className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-slate-50 transition shadow-sm w-full sm:w-auto justify-center"
                  >
                    <CheckCircle
                      weight="bold"
                      className="text-base text-emerald-600"
                    />{" "}
                    Akad Settings
                  </Link>
                  <Link
                    href="/campus-admin/curriculum"
                    className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-slate-50 transition shadow-sm w-full sm:w-auto justify-center"
                  >
                    <DownloadSimple weight="bold" className="text-base" />{" "}
                    Kelola Kurikulum
                  </Link>
                  <button
                    onClick={() => setProdiModal({ isOpen: true, data: null })}
                    className="px-4 py-2.5 bg-[#094E8B] text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-[#073e6f] transition shadow-md w-full sm:w-auto justify-center"
                  >
                    <Plus weight="bold" className="text-base" /> Tambah Prodi
                  </button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div className="rounded-[1.6rem] border border-slate-100 bg-slate-50 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Total Prodi
                  </p>
                  <p className="mt-2 text-3xl font-black text-[#001a33]">
                    {prodiList.length}
                  </p>
                </div>
                <div className="rounded-[1.6rem] border border-slate-100 bg-slate-50 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Hub Akademik
                  </p>
                  <p className="mt-2 text-sm font-black text-[#001a33]">
                    Sinkron ke kurikulum & akad settings
                  </p>
                </div>
                <div className="rounded-[1.6rem] border border-blue-100 bg-blue-50 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-700">
                    Catatan
                  </p>
                  <p className="mt-2 text-sm font-black text-[#001a33]">
                    Tarif prodi masih mengikuti aturan global kampus.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prodiList.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-400 font-bold border-2 border-dashed border-slate-200 rounded-2xl">
                    Belum ada Program Studi yang ditambahkan.
                  </div>
                ) : (
                  prodiList.map((p) => (
                    <div
                      key={p.id}
                      className="bg-slate-50 border border-slate-100 rounded-2xl p-5 hover:border-blue-200 transition group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100/50 rounded-full blur-xl -mr-4 -mt-4 group-hover:bg-blue-200/50 transition"></div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-[#094E8B] bg-blue-100 px-2 py-1 rounded uppercase">
                              {p.level}
                            </span>
                            <h4 className="font-bold text-slate-800">
                              {p.name}
                            </h4>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                            <button
                              onClick={() =>
                                setProdiModal({ isOpen: true, data: p })
                              }
                              className="w-7 h-7 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-amber-500 hover:border-amber-500 transition shadow-sm"
                            >
                              <PencilSimple weight="bold" />
                            </button>
                            <button
                              onClick={() => handleDeleteProdi(p.id)}
                              className="w-7 h-7 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-500 transition shadow-sm"
                            >
                              <Trash weight="bold" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-slate-500">
                            <span className="font-bold">Kode:</span> {p.code}
                          </p>
                          <p className="text-xs text-slate-500">
                            <span className="font-bold">Tarif Konversi:</span>{" "}
                            Rp 150.000 (Global)
                          </p>
                          <div className="flex flex-wrap gap-4 pt-2">
                            <Link
                              href="/campus-admin/curriculum"
                              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline"
                            >
                              Kelola Kurikulum
                            </Link>
                            <Link
                              href="/campus-admin/akad-settings"
                              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:underline"
                            >
                              Atur Akademik
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB: KAMUS PINTAR (Dictionary) */}
          {activeTab === "kamus" && (
            <div className="animate-fade-in-quick">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-100 pb-4 gap-4">
                <div>
                  <h3 className="text-lg font-heading font-bold text-[#001a33] flex items-center gap-2">
                    <Book weight="duotone" className="text-blue-600 text-2xl" />{" "}
                    Kamus Kata Kunci Pintar
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Tambahkan sinonim/variasi nama mata kuliah untuk
                    meningkatkan akurasi auto-mapping.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div className="rounded-[1.6rem] border border-slate-100 bg-slate-50 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Target Mapping
                  </p>
                  <p className="mt-2 text-3xl font-black text-[#001a33]">
                    {dictionary.length}
                  </p>
                </div>
                <div className="rounded-[1.6rem] border border-slate-100 bg-slate-50 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Total Sinonim
                  </p>
                  <p className="mt-2 text-3xl font-black text-blue-700">
                    {totalDictionaryKeywords}
                  </p>
                </div>
                <div className="rounded-[1.6rem] border border-amber-100 bg-amber-50 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-700">
                    Akurasi
                  </p>
                  <p className="mt-2 text-sm font-black text-[#001a33]">
                    Gunakan variasi istilah transkrip yang nyata di lapangan.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full admin-table min-w-[600px]">
                  <thead>
                    <tr>
                      <th className="w-1/3">Target Pencocokan</th>
                      <th>Kata Kunci Transkrip (Variasi)</th>
                      <th className="text-right w-24">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dictionary.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="py-8 text-center text-slate-400 font-bold italic"
                        >
                          Belum ada mata kuliah terdaftar. Silakan import
                          kurikulum terlebih dahulu.
                        </td>
                      </tr>
                    ) : (
                      dictionary.map((d) => (
                        <tr key={d.id} className="hover:bg-slate-50 transition">
                          <td className="font-bold text-[#001a33]">{d.name}</td>
                          <td>
                            <div className="flex flex-wrap gap-1.5">
                              {d.keywords && d.keywords.length > 0 ? (
                                d.keywords.map((k: string, j: number) => (
                                  <span
                                    key={j}
                                    className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-1 rounded uppercase tracking-wider"
                                  >
                                    {k}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-slate-400 italic">
                                  Belum ada kata kunci...
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="text-right">
                            <button
                              onClick={() =>
                                setDictModal({
                                  isOpen: true,
                                  data: d,
                                  keywords: d.keywords?.join(", ") || "",
                                })
                              }
                              className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-amber-500 transition shadow-sm"
                            >
                              <PencilSimple weight="bold" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: BILLING */}
          {activeTab === "billing" && (
            <div className="animate-fade-in-quick">
              <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                <h3 className="text-lg font-heading font-bold text-[#001a33] flex items-center gap-2">
                  <Wallet weight="duotone" className="text-blue-600 text-2xl" />{" "}
                  Saldo Perguruan Tinggi
                </h3>
              </div>

              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div className="rounded-[1.6rem] border border-slate-100 bg-slate-50 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Pending Request
                  </p>
                  <p className="mt-2 text-3xl font-black text-amber-600">
                    {pendingBillingCount}
                  </p>
                </div>
                <div className="rounded-[1.6rem] border border-slate-100 bg-slate-50 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Total Aktivitas
                  </p>
                  <p className="mt-2 text-3xl font-black text-[#001a33]">
                    {billing.transactions.length}
                  </p>
                </div>
                <div className="rounded-[1.6rem] border border-blue-100 bg-blue-50 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-700">
                    Flow Top Up
                  </p>
                  <p className="mt-2 text-sm font-black text-[#001a33]">
                    Request dikirim dulu, lalu diproses super admin.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-[#094E8B] to-[#052f53] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden h-[200px] flex flex-col justify-between group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>

                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">
                        Saldo Tersedia
                      </p>
                      <h4
                        className={`text-4xl font-black ${billing.balance <= 1000000 ? "text-amber-300" : "text-white"}`}
                      >
                        Rp {billing.balance.toLocaleString("id-ID")}
                      </h4>
                    </div>
                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                      <Wallet
                        weight="duotone"
                        className="text-3xl text-amber-400"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-end relative z-10">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${billing.balance <= 1000000 ? "bg-amber-400 animate-pulse" : "bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"}`}
                      ></div>
                      <span className="text-xs font-bold uppercase opacity-90">
                        {billing.balance <= 1000000 ? "Saldo Menipis" : "Aktif"}
                      </span>
                    </div>
                    <button
                      onClick={() => setTopupModal(true)}
                      className="px-5 py-2.5 bg-amber-400 text-[#001a33] font-black text-xs rounded-xl hover:bg-amber-300 transition shadow-lg flex items-center gap-2 transform active:scale-95"
                    >
                      <CreditCard weight="bold" className="text-base" /> Request
                      Top Up
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 flex flex-col justify-center h-[200px]">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 flex items-center gap-2">
                    <Receipt weight="bold" className="text-lg text-rose-400" />{" "}
                    Transaksi Terakhir
                  </p>
                  <h4 className="text-3xl font-black text-slate-800 mb-4">
                    {billing.transactions.length}{" "}
                    <span className="text-xs font-normal text-slate-400 uppercase tracking-widest">
                      Aktivitas
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Top-up saat ini berjalan lewat request manual kampus dan
                    persetujuan super admin, tanpa payment gateway otomatis.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-[#001a33] uppercase mb-4 flex items-center gap-2">
                  <ListChecks weight="bold" className="text-slate-400" />{" "}
                  Histori Billing
                </h4>
                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-5 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">
                          Item / Deskripsi
                        </th>
                        <th className="px-5 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">
                          Jumlah (Mhs)
                        </th>
                        <th className="px-5 py-3 text-center font-bold text-slate-500 uppercase tracking-wider">
                          Tanggal
                        </th>
                        <th className="px-5 py-3 text-right font-bold text-slate-500 uppercase tracking-wider">
                          Nominal
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {billing.transactions.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-5 py-8 text-center text-slate-400 italic font-bold"
                          >
                            Belum ada riwayat transaksi billing.
                          </td>
                        </tr>
                      ) : (
                        billing.transactions.map((transaction) => (
                          <tr
                            key={transaction.id}
                            className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50"
                          >
                            <td className="px-5 py-3 font-bold text-[#001a33]">
                              {transaction.type === "topup"
                                ? `Top-Up Saldo (#${transaction.trx_id})`
                                : transaction.type === "topup_request"
                                  ? `Permintaan Top-Up (#${transaction.trx_id})`
                                  : `Layanan Konversi (#${transaction.trx_id})`}
                              {transaction.status === "pending" && (
                                <span className="ml-2 rounded-full bg-amber-50 px-2 py-1 text-[9px] uppercase tracking-widest text-amber-600">
                                  pending
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3 font-bold text-slate-500">
                              {transaction.amount_mhs || "-"}
                            </td>
                            <td className="px-5 py-3 text-center font-mono text-slate-500">
                              {new Date(
                                transaction.created_at,
                              ).toLocaleDateString("id-ID")}
                            </td>
                            <td
                              className={`px-5 py-3 text-right font-black ${transaction.type === "topup" || transaction.type === "topup_request" ? "text-emerald-500" : "text-rose-500"}`}
                            >
                              {transaction.type === "topup" ||
                              transaction.type === "topup_request"
                                ? `+ Rp ${transaction.amount.toLocaleString()}`
                                : `- Rp ${transaction.amount.toLocaleString()}`}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: INFO */}
          {activeTab === "info" && (
            <div className="animate-fade-in-quick grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div>
                <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-heading font-bold text-[#001a33] flex items-center gap-2">
                    <Info weight="duotone" className="text-blue-600 text-2xl" />{" "}
                    Informasi Sistem
                  </h3>
                </div>

                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-[#094E8B] rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-900/10">
                      K
                    </div>
                    <div>
                      <h4 className="text-lg font-heading font-bold text-[#001a33]">
                        KonverPro Enterprise
                      </h4>
                      <p className="text-xs font-bold text-blue-600 bg-blue-100/50 inline-block px-2 py-0.5 rounded uppercase tracking-wider mt-1">
                        v.2.1.0-Release
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 text-sm font-medium text-slate-600 border-t border-blue-100 pt-6">
                    <div className="flex justify-between py-2 border-b border-slate-100/50">
                      <span className="text-slate-400">Lisensi Institusi</span>
                      <span className="font-bold text-[#001a33]">
                        {campusProfile.name}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100/50">
                      <span className="text-slate-400">Status Langganan</span>
                      <span className="font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle weight="fill" /> Aktif
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-400">Dukungan Teknis</span>
                      <a
                        href="mailto:support@konverpro.id"
                        className="font-bold text-blue-600 hover:underline"
                      >
                        support@konverpro.id
                      </a>
                    </div>
                  </div>

                  <div className="mt-8">
                    <button className="w-full py-3.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition shadow-sm text-xs uppercase flex items-center justify-center gap-2 active:scale-95">
                      <DownloadSimple weight="bold" className="text-base" />{" "}
                      Unduh Dokumen Panduan (PDF)
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Control Summary
                  </p>
                  <p className="mt-2 text-lg font-black text-[#001a33]">
                    Workspace kampus siap dipakai
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    Area ini merangkum identitas lisensi, channel support, dan
                    status aplikasi supaya operator kampus punya satu titik
                    referensi yang jelas.
                  </p>
                </div>

                <div className="rounded-[2rem] border border-blue-100 bg-blue-50 p-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-700">
                    Support Flow
                  </p>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="rounded-xl bg-white px-4 py-3 font-bold text-[#001a33]">
                      Email dukungan: support@konverpro.id
                    </div>
                    <div className="rounded-xl bg-white px-4 py-3 font-bold text-[#001a33]">
                      Billing: request manual via panel top up
                    </div>
                    <div className="rounded-xl bg-white px-4 py-3 font-bold text-[#001a33]">
                      Dokumen resmi: sinkron dengan akad settings
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL PRODI */}
      {prodiModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in-quick">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-slide-in">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-[#001a33] text-white">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/55">
                  Program Studi Workspace
                </p>
                <h3 className="mt-1 font-heading font-black uppercase text-xs tracking-widest">
                  {prodiModal.data ? "Edit" : "Tambah"} Program Studi
                </h3>
              </div>
              <button
                onClick={() => setProdiModal({ isOpen: false, data: null })}
                className="text-white/55 hover:text-white"
              >
                <X weight="bold" className="text-xl" />
              </button>
            </div>
            <form onSubmit={handleSaveProdi} className="p-8 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">
                    Strata
                  </label>
                  <select
                    name="strata"
                    defaultValue={prodiModal.data?.level || "S1"}
                    className="w-full p-3.5 border border-slate-200 rounded-xl text-sm font-bold focus:border-blue-400 outline-none bg-slate-50"
                  >
                    <option>D3</option>
                    <option>D4</option>
                    <option>S1</option>
                    <option>S2</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">
                    Nama Prodi
                  </label>
                  <input
                    name="nama"
                    defaultValue={prodiModal.data?.name || ""}
                    required
                    className="w-full p-3.5 border border-slate-200 rounded-xl text-sm font-bold focus:border-blue-400 outline-none placeholder:text-slate-300"
                    placeholder="Contoh: Teknik Informatika"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">
                  Kode Prodi Terdaftar (PDDIKTI)
                </label>
                <input
                  name="code"
                  defaultValue={prodiModal.data?.code || ""}
                  required
                  className="w-full p-3.5 border border-slate-200 rounded-xl text-sm font-bold focus:border-blue-400 outline-none"
                  placeholder="CP: 55201"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setProdiModal({ isOpen: false, data: null })}
                  className="flex-1 py-3.5 font-bold text-xs uppercase rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 font-black text-xs uppercase rounded-xl bg-[#094E8B] text-white hover:bg-[#073e6f] shadow-xl shadow-blue-900/20 flex items-center justify-center"
                >
                  {loading ? (
                    <CircleNotch className="animate-spin text-lg" />
                  ) : (
                    "Simpan Data"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DICTIONARY */}
      {dictModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in-quick">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-slide-in">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-[#001a33] text-white">
              <div className="max-w-[80%]">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/55">
                  Kamus Pintar
                </p>
                <h3 className="mt-1 font-heading font-black text-xs tracking-widest truncate uppercase">
                  Mapping: {dictModal.data?.name}
                </h3>
              </div>
              <button
                onClick={() =>
                  setDictModal({ isOpen: false, data: null, keywords: "" })
                }
                className="text-white/55 hover:text-white"
              >
                <X weight="bold" className="text-xl" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-3">
                  Variasi Nama MK di Transkrip (Pisahkan Koma)
                </label>
                <textarea
                  value={dictModal.keywords}
                  onChange={(e) =>
                    setDictModal({ ...dictModal, keywords: e.target.value })
                  }
                  className="w-full p-4 border border-amber-300 bg-amber-50/50 rounded-2xl text-sm font-bold focus:border-amber-400 outline-none min-h-[140px] text-amber-900 leading-relaxed shadow-inner"
                  placeholder="Statistika IT, Probabilitas & Statistika, Probstat"
                />
                <div className="p-3 bg-amber-100/50 rounded-xl mt-4 flex gap-3">
                  <Info
                    weight="fill"
                    className="text-amber-600 shrink-0 mt-0.5"
                  />
                  <p className="text-[10px] text-amber-700 leading-relaxed font-bold">
                    Sinonim membantu AI mengenali MK yang sama meskipun namanya
                    berbeda di transkrip asal.
                  </p>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  onClick={() =>
                    setDictModal({ isOpen: false, data: null, keywords: "" })
                  }
                  className="flex-1 py-3.5 font-bold text-xs uppercase rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveDictionary}
                  disabled={loading}
                  className="flex-1 py-3.5 font-black text-xs uppercase rounded-xl bg-[#094E8B] text-white hover:bg-[#073e6f] shadow-xl shadow-blue-900/20 flex items-center justify-center"
                >
                  {loading ? (
                    <CircleNotch className="animate-spin text-lg" />
                  ) : (
                    "Simpan Perubahan"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TOPUP */}
      {topupModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in-quick">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden text-center p-10 animate-slide-in">
            <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mx-auto mb-6 shadow-inner">
              <CreditCard weight="duotone" className="text-5xl" />
            </div>
            <h3 className="font-heading font-black text-xl text-[#001a33] mb-2 tracking-tight">
              Top-Up Saldo Token
            </h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Pilih Nominal Request
            </p>
            <p className="mb-8 text-xs leading-relaxed text-slate-500">
              Request ini akan masuk ke antrean super admin untuk ditinjau
              manual. Payment gateway belum dipakai di flow ini.
            </p>

            <div className="space-y-3 mb-8">
              <button
                type="button"
                onClick={() => setCustomTopupAmount("1000000")}
                className={`w-full py-4 border-2 rounded-2xl font-black transition-all transform active:scale-95 ${customTopupAmount === "1000000" ? "border-amber-400 bg-amber-50 text-amber-600" : "border-slate-100 text-slate-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-600"}`}
              >
                Rp 1.000.000
              </button>
              <button
                type="button"
                onClick={() => setCustomTopupAmount("2500000")}
                className={`w-full py-4 border-2 rounded-2xl font-black transition-all transform active:scale-95 ${customTopupAmount === "2500000" ? "border-amber-400 bg-amber-50 text-amber-600" : "border-slate-100 text-slate-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-600"}`}
              >
                Rp 2.500.000
              </button>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-left">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-tighter text-slate-400">
                  Atau Input Nominal Kustom
                </p>
                <input
                  type="number"
                  min="500000"
                  step="50000"
                  value={customTopupAmount}
                  onChange={(event) => setCustomTopupAmount(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-amber-400"
                  placeholder="Minimal 500000"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setTopupModal(false)}
                className="flex-1 py-4 font-bold text-xs uppercase rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                onClick={requestTopup}
                className="flex-1 py-4 font-black text-xs uppercase rounded-2xl bg-amber-400 text-amber-900 hover:bg-amber-300 shadow-xl shadow-amber-500/20"
              >
                Kirim Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
