"use client";

import { useState } from "react";
import { AlertCircle, Lock, User, Sparkles } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleQuickFill = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setError("");
  };

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
    <div className="w-full bg-white/80 backdrop-blur-2xl shadow-[0_12px_40px_0_rgba(2,132,199,0.12)] rounded-[2.5rem] p-8 sm:p-10 border border-white/80 relative overflow-hidden">
      
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-400/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-sky-500/15 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center gap-5 mb-2">
          <Image 
            src="/logo_stimi.png" 
            alt="Logo STIMI" 
            width={60} 
            height={60}
            className="object-contain drop-shadow-md"
            priority
          />
          <div className="w-px h-10 bg-slate-300 hidden sm:block"></div>
          <div className="flex items-center justify-center w-[58px] h-[58px] bg-gradient-to-tr from-sky-600 to-cyan-500 rounded-2xl shadow-lg shadow-sky-600/25">
            <span className="text-white font-black text-xl tracking-tighter">IKU</span>
          </div>
        </div>

        <h2 className="mt-5 text-center text-2xl font-extrabold tracking-tight text-slate-900">
          Masuk ke MANTAU IKU
        </h2>
        <p className="mt-1 text-center text-xs font-medium text-slate-600">
          Sistem Monitoring 12 Indikator Kinerja Utama <br /> STIMI YAPMI Makassar
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        {error && (
          <div className="rounded-2xl bg-rose-50 p-3.5 border border-rose-200 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <p className="text-xs font-semibold text-rose-800">{error}</p>
          </div>
        )}

        <div className="space-y-3.5">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-slate-400 group-focus-within:text-sky-600 transition-colors" />
            </div>
            <input
              id="email"
              name="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block w-full rounded-2xl border-0 py-3.5 pl-11 pr-4 text-slate-900 bg-slate-50/80 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 focus:bg-white transition-all text-sm shadow-xs"
              placeholder="Email PIC / Administrator"
            />
          </div>
          
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-sky-600 transition-colors" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full rounded-2xl border-0 py-3.5 pl-11 pr-4 text-slate-900 bg-slate-50/80 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 focus:bg-white transition-all text-sm shadow-xs"
              placeholder="Kata Sandi"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full justify-center rounded-2xl bg-gradient-to-r from-sky-600 via-sky-600 to-cyan-600 px-4 py-3.5 text-sm font-bold text-white hover:from-sky-700 hover:to-cyan-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-600 transition-all shadow-md shadow-sky-600/30 hover:shadow-lg hover:shadow-sky-600/40 disabled:opacity-70"
          >
            {loading ? "Sedang memverifikasi..." : "Masuk ke Dashboard"}
          </button>
        </div>

        {/* Quick Access Account Selector */}
        <div className="pt-4 border-t border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              Pilih Akun Cepat (Testing RBAC):
            </span>
            <span className="text-slate-400">Pass: password123</span>
          </div>
          
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickFill("lpm@stimi.ac.id", "password123")}
              className="text-left px-2.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-[11px] font-semibold transition-colors border border-sky-200/60"
            >
              👑 LPM (Admin)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("wk3@stimi.ac.id", "password123")}
              className="text-left px-2.5 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-[11px] font-semibold transition-colors border border-cyan-200/60"
            >
              🎓 WK III (IKU 1-3)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("wk2@stimi.ac.id", "password123")}
              className="text-left px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors border border-slate-200"
            >
              🤝 WK II (IKU 5,9,11)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("wk1@stimi.ac.id", "password123")}
              className="text-left px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors border border-slate-200"
            >
              🔬 WK I (IKU 4,6,8)
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
