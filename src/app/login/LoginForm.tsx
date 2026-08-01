"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, User, Lock, ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full max-w-md p-8 rounded-3xl backdrop-blur-2xl bg-white/10 border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] overflow-hidden"
    >
      {/* Decorative gradient blob inside the card */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-400 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4">
          <LogIn className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-100 to-white">
          MANTAU IKU
        </h1>
        <p className="text-emerald-100/70 text-sm mt-2 font-medium tracking-wide">
          Sistem Manajemen Indikator Kinerja Utama
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-100 text-sm p-3 rounded-xl backdrop-blur-md">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-white/80 ml-1">Email / ID Pengguna</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="w-5 h-5 text-white/50 group-focus-within:text-emerald-400 transition-colors" />
            </div>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all backdrop-blur-md"
              placeholder="admin@stimi-yapmi.ac.id"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-white/80 ml-1">Kata Sandi</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="w-5 h-5 text-white/50 group-focus-within:text-emerald-400 transition-colors" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all backdrop-blur-md"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="relative w-full group overflow-hidden rounded-xl p-[1px] mt-4"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center justify-center gap-2 bg-black/20 backdrop-blur-sm px-4 py-3.5 rounded-xl transition-all duration-300 group-hover:bg-transparent">
            <span className="font-semibold text-white tracking-wide">
              {loading ? "Memverifikasi..." : "Masuk Sistem"}
            </span>
            {!loading && <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />}
          </div>
        </button>
      </form>

      <div className="relative z-10 mt-8 text-center text-xs text-white/50">
        <p>© 2026 STIMI YAPMI Makassar.</p>
        <p>Akses terbatas hanya untuk entitas internal kampus.</p>
      </div>
    </motion.div>
  );
}
