"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Download } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";

interface Campus {
  id: number | string;
  name: string;
  conversions_count?: number;
}

export default function IncomeReportPage() {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCampusId, setFilterCampusId] = useState<string>("all");

  // Data State
  const [totalIncome, setTotalIncome] = useState(0);
  const [internalIncome, setInternalIncome] = useState(0);
  const [leadsIncome, setLeadsIncome] = useState(0);

  const fetchData = async () => {
    try {
      const res = await axios.get("/super-admin/campuses");
      setCampuses(res.data.data);
      calculateIncome(res.data.data, "all");
    } catch {
      toast.error("Gagal memuat data kampus untuk laporan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calculateIncome = (data: Campus[], campusId: string) => {
    let target = data;
    if (campusId !== "all") {
      target = data.filter((c) => c.id.toString() === campusId);
    }

    let iIncome = 0;
    let lIncome = 0;

    target.forEach((c) => {
      // Mocking business logic matching HTML
      const totalConvs = c.conversions_count || 0;
      const internal = Math.floor(totalConvs * 0.7);
      const leads = totalConvs - internal;

      iIncome += internal * 150000;
      lIncome += leads * 350000;
    });

    setInternalIncome(iIncome);
    setLeadsIncome(lIncome);
    setTotalIncome(iIncome + lIncome);
  };

  const handleFilterChange = (val: string) => {
    setFilterCampusId(val);
    calculateIncome(campuses, val);
  };

  const pieData = [
    { name: "Internal Conversion", value: internalIncome },
    { name: "Lead Acquisition", value: leadsIncome },
  ];
  const COLORS = ["#3B82F6", "#F59E0B"];

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-blue-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm p-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-black uppercase text-blue-900">
            Report Revenue Global
          </h2>
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              className="text-xs font-bold uppercase text-slate-600 bg-slate-50 flex-1 md:flex-none"
            >
              <Download className="w-4 h-4 mr-2" /> Export Excel
            </Button>
            <Select value={filterCampusId} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-full md:w-56 font-bold bg-slate-50 border-none">
                <SelectValue placeholder="Pilih Kampus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Seluruh Kampus</SelectItem>
                {campuses.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center border-b-4 border-b-blue-900 shadow-sm">
          <CardContent className="p-6">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-2">
              Total Pemasukan
            </p>
            <h3 className="text-3xl font-black text-blue-900 wrap-break-word">
              Rp {totalIncome.toLocaleString("id-ID")}
            </h3>
          </CardContent>
        </Card>
        <Card className="text-center border-b-4 border-b-blue-500 shadow-sm">
          <CardContent className="p-6">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-2">
              Internal Conversion
            </p>
            <h3 className="text-3xl font-black text-blue-600 wrap-break-word">
              Rp {internalIncome.toLocaleString("id-ID")}
            </h3>
          </CardContent>
        </Card>
        <Card className="text-center border-b-4 border-b-amber-500 shadow-sm">
          <CardContent className="p-6">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-2">
              Lead Generation
            </p>
            <h3 className="text-3xl font-black text-amber-600 wrap-break-word">
              Rp {leadsIncome.toLocaleString("id-ID")}
            </h3>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm h-96 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <RechartsTooltip
              formatter={(val: number | undefined) =>
                `Rp ${(val || 0).toLocaleString("id-ID")}`
              }
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                fontWeight: "bold",
              }}
            />
            <Legend iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
