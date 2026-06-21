import React, { useState } from "react";
import { LogIn, ShieldAlert, Key, User } from "lucide-react";
import { Teacher } from "../types";
import SmpIslamSmartLogo from "./SmpIslamSmartLogo";

interface LoginScreenProps {
  onLoginSuccess: (user: Teacher) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Username dan kata sandi harus diisi.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Terjadi kesalahan saat masuk.");
      }

      onLoginSuccess(data);
    } catch (err: any) {
      setError(err.message || "Gagal menghubungkan ke server.");
    } finally {
      setLoading(false);
    }
  };

  const fillQuickAcc = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12" id="login-container">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden" id="login-card">
        {/* Header decoration */}
        <div className="bg-emerald-800 px-6 py-8 text-center text-white relative">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500"></div>
          <div className="mx-auto w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 p-1.5 shadow-md">
            <SmpIslamSmartLogo size="100%" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">SMP ISLAM SMART</h1>
          <p className="text-xs text-emerald-200 mt-1 uppercase tracking-widest font-mono">
            Sistem Raport STS Terintegrasi
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 bg-red-50 border-l-4 border-red-500 rounded text-xs text-red-700 flex items-start gap-2.5" id="login-error">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Nama Pengguna (Username)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User className="h-4.5 w-4.5" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  id="username-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Kunci Pengaman (Kata Sandi)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Key className="h-4.5 w-4.5" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  id="password-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white rounded-lg text-sm font-semibold tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              id="login-button"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Masuk ke Dashboard
                </>
              )}
            </button>
          </form>

          {/* Quick accounts list */}
          <div className="mt-8 pt-6 border-t border-gray-100" id="quick-accounts">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-center mb-3">
              Akun Cepat Untuk Peninjauan
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => fillQuickAcc("admin", "123")}
                className="p-2 border border-dashed border-gray-200 rounded-lg hover:border-emerald-600 hover:bg-emerald-50 text-left text-gray-650 transition cursor-pointer"
              >
                <span className="font-semibold text-emerald-800 block">👤 Admin</span>
                <span>User: admin / Pass: 123</span>
              </button>
              <button
                onClick={() => fillQuickAcc("ahmad", "123")}
                className="p-2 border border-dashed border-gray-200 rounded-lg hover:border-emerald-600 hover:bg-emerald-50 text-left text-gray-650 transition cursor-pointer"
              >
                <span className="font-semibold text-emerald-800 block">🔬 Guru IPA (Wali 7)</span>
                <span>User: ahmad / Pass: 123</span>
              </button>
              <button
                onClick={() => fillQuickAcc("fatimah", "123")}
                className="p-2 border border-dashed border-gray-200 rounded-lg hover:border-emerald-600 hover:bg-emerald-50 text-left text-gray-650 transition cursor-pointer"
              >
                <span className="font-semibold text-emerald-800 block">📐 Guru MTK (Wali 8)</span>
                <span>User: fatimah / Pass: 123</span>
              </button>
              <button
                onClick={() => fillQuickAcc("khadijah", "123")}
                className="p-2 border border-dashed border-gray-200 rounded-lg hover:border-emerald-600 hover:bg-emerald-50 text-left text-gray-650 transition cursor-pointer"
              >
                <span className="font-semibold text-emerald-800 block">📝 Guru B.Indo (Wali 9)</span>
                <span>User: khadijah / Pass: 123</span>
              </button>
              <button
                onClick={() => fillQuickAcc("lukman", "123")}
                className="p-2 border border-dashed border-gray-200 rounded-lg hover:border-emerald-600 hover:bg-emerald-50 text-left text-gray-650 transition cursor-pointer"
              >
                <span className="font-semibold text-emerald-800 block">🕌 Guru PAI (Mapel)</span>
                <span>User: lukman / Pass: 123</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
