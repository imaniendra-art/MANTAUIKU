"use client";

import { useState } from "react";
import { AlertCircle, Lock, User } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="w-full bg-white/60 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(15,59,119,0.15)] rounded-[2rem] p-10 border border-white/50 relative overflow-hidden">
      
      {/* Subtle decorative glow inside the card */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 rounded-[2rem]">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/60 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
      </div>

      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center gap-6 mb-2">
          <Image 
            src="/logo_stimi.png" 
            alt="Logo STIMI" 
            width={65} 
            height={65}
            className="object-contain drop-shadow-md"
          />
          <div className="w-px h-12 bg-gray-400 hidden sm:block"></div>
          {/* IKU Placeholder Icon until custom logo */}
          <div className="flex items-center justify-center w-[65px] h-[65px] bg-gradient-to-tr from-emerald-600 to-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
            <span className="text-white font-black text-2xl tracking-tighter">IKU</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm">
          Masuk ke MANTAU IKU
        </h2>
        <p className="mt-2 text-center text-sm font-medium text-gray-700">
          Sistem Manajemen Indikator Kinerja Utama <br/> STIMI YAPMI Makassar
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <div className="rounded-2xl bg-red-50/90 p-4 border border-red-200 flex items-center gap-3 backdrop-blur-sm">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="relative group">
            <label htmlFor="email" className="sr-only">Email / ID Pengguna</label>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-500 group-focus-within:text-emerald-600 transition-colors" />
            </div>
            <input
              id="email"
              name="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block w-full rounded-2xl border-0 py-3.5 pl-11 pr-4 text-gray-900 bg-white/70 ring-1 ring-inset ring-gray-300 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-emerald-600 focus:bg-white transition-all sm:text-sm sm:leading-6 backdrop-blur-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
              placeholder="Email / ID Pengguna"
            />
          </div>
          
          <div className="relative group">
            <label htmlFor="password" className="sr-only">Kata Sandi</label>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-emerald-600 transition-colors" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full rounded-2xl border-0 py-3.5 pl-11 pr-4 text-gray-900 bg-white/70 ring-1 ring-inset ring-gray-300 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-emerald-600 focus:bg-white transition-all sm:text-sm sm:leading-6 backdrop-blur-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
              placeholder="Kata Sandi"
            />
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-gray-800 cursor-pointer">
              Ingat saya
            </label>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full justify-center rounded-2xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-all shadow-[0_4px_14px_0_rgba(5,150,105,0.39)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.23)] hover:-translate-y-[1px] disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {loading ? "Sedang memverifikasi..." : "Masuk ke Dashboard"}
          </button>
        </div>
      </form>
    </div>
  );
}
