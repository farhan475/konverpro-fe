"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { AxiosError } from "axios";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/login`,
        {
          email,
          password,
        },
      );

      const { access_token, user } = response.data;

      // 1. Simpan Token & User ke Cookie (Berlaku 7 hari)
      Cookies.set("token", access_token, { expires: 7 });
      Cookies.set("user_role", user.role, { expires: 7 });
      Cookies.set("user_univ", user.university_id, { expires: 7 });

      toast.success(`Selamat datang, ${user.name}`);

      // 2. Redirect sesuai Role
      if (user.role === "campus_admin") {
        router.push("/campus-admin");
      } else if (user.role === "super_admin") {
        router.push("/super-admin"); // Nanti kita buat
      } else {
        router.push("/");
      }
    } catch (error: unknown) {
      console.error(error);
      toast.error(
        error instanceof AxiosError && error.response?.data?.message
          ? error.response.data.message
          : "Login gagal",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-white">
            <Lock className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            Admin Portal
          </CardTitle>
          <CardDescription>
            Masuk untuk mengelola konversi & kurikulum
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Kampus</label>
              <Input
                type="email"
                placeholder="admin@kampus.ac.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 font-bold"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                "Masuk Dashboard"
              )}
            </Button>
          </form>
          <div className="mt-6 text-center text-xs text-slate-400">
            &copy; 2025 KonverPro Systems
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
