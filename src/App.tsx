import React, { useState, useEffect } from "react";
import { Teacher } from "./types";
import LoginScreen from "./components/LoginScreen";
import DashboardProgress from "./components/DashboardProgress";
import AdminPanel from "./components/AdminPanel";
import TeacherPanel from "./components/TeacherPanel";
import WaliKelasPanel from "./components/WaliKelasPanel";
import SmpIslamSmartLogo from "./components/SmpIslamSmartLogo";
import { BookOpen, LogOut, Key, BarChart3, Settings, ShieldAlert, GraduationCap, PenTool, Sun, Moon } from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<Teacher | null>(null);
  
  // Navigation: active main view tab
  const [activeTab, setActiveTab] = useState<string>("progress");
  
  // State trigger to notify progress widgets to refetch summary info
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Global screen dark mode state synced with local storage
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("smp_islam_smart_theme") === "dark";
  });

  useEffect(() => {
    localStorage.setItem("smp_islam_smart_theme", darkMode ? "dark" : "light");
    if (darkMode) {
      document.body.classList.add("dark");
      document.documentElement.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Check if session exists on load
  useEffect(() => {
    const savedUser = localStorage.getItem("smp_islam_smart_user");
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setCurrentUser(u);
        // Default first tab on entry
        setActiveTab("progress");
      } catch (e) {
        localStorage.removeItem("smp_islam_smart_user");
      }
    }
  }, []);

  const handleLoginSuccess = (user: Teacher) => {
    setCurrentUser(user);
    localStorage.setItem("smp_islam_smart_user", JSON.stringify(user));
    
    // Default tabs depending on role
    if (user.subject === "Admin") {
      setActiveTab("progress");
    } else if (user.subject !== "Admin") {
      setActiveTab("progress");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("smp_islam_smart_user");
  };

  const triggerProgressRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // If there's no active user session, redirect to Login
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Determine which navigation tabs must be shown based on user role
  const isSysAdmin = currentUser.subject === "Admin";
  const isSubjectTeacher = currentUser.subject !== "Admin" && currentUser.subject !== "";
  const isWaliKelas = currentUser.isWaliKelas;

  return (
    <div className={`flex h-screen w-full overflow-hidden font-sans ${darkMode ? "dark bg-slate-900" : "bg-slate-50"}`} id="applet-viewport">
      {/* Sidebar Navigation */}
      <aside className="w-56 bg-emerald-900 text-white flex flex-col shrink-0 no-print" id="app-sidebar">
        {/* Sidebar Header Logo */}
        <div className="p-4 border-b border-emerald-800">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-white p-0.5 flex items-center justify-center shrink-0">
              <SmpIslamSmartLogo size="100%" />
            </div>
            <h1 className="text-sm font-bold tracking-tight uppercase">SMP Islam Smart</h1>
          </div>
          <p className="text-[10px] text-emerald-300 opacity-80 uppercase font-semibold">
            STS Reporting System
          </p>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 py-3 overflow-y-auto space-y-1">
          <div className="px-4 mb-2 text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
            Main Menu
          </div>
          
          <button
            onClick={() => setActiveTab("progress")}
            className={`w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-left transition-all cursor-pointer ${
              activeTab === "progress"
                ? "bg-emerald-800 border-l-4 border-amber-400 text-white"
                : "text-emerald-100 hover:bg-emerald-850 opacity-80 hover:opacity-100"
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-300" />
            <span>Progres Penginputan</span>
          </button>

          {/* If Subject Teacher OR Admin */}
          {(isSubjectTeacher || isSysAdmin) && (
            <button
              onClick={() => setActiveTab("grade_inputs")}
              className={`w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-left transition-all cursor-pointer ${
                activeTab === "grade_inputs"
                  ? "bg-emerald-800 border-l-4 border-amber-400 text-white"
                  : "text-emerald-100 hover:bg-emerald-850 opacity-80 hover:opacity-100"
            }`}
            >
              <PenTool className="w-4 h-4 text-emerald-300" />
              <span>Input Nilai Mapel</span>
            </button>
          )}

          {/* If Wali Kelas OR Admin */}
          {(isWaliKelas || isSysAdmin) && (
            <button
              onClick={() => setActiveTab("walikelas_panel")}
              className={`w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-left transition-all cursor-pointer ${
                activeTab === "walikelas_panel"
                  ? "bg-emerald-800 border-l-4 border-amber-400 text-white"
                  : "text-emerald-100 hover:bg-emerald-850 opacity-80 hover:opacity-100"
              }`}
            >
              <GraduationCap className="w-4 h-4 text-emerald-300" />
              <span>Wali Kelas Menu</span>
            </button>
          )}

          {/* If SysAdmin */}
          {isSysAdmin && (
            <>
              <div className="px-4 mt-6 mb-2 text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                Administrator
              </div>
              <button
                onClick={() => setActiveTab("admin_panel")}
                className={`w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-left transition-all cursor-pointer ${
                  activeTab === "admin_panel"
                    ? "bg-emerald-800 border-l-4 border-amber-400 text-amber-200"
                    : "text-amber-150 hover:bg-emerald-850 hover:text-amber-200"
                }`}
              >
                <Settings className="w-4 h-4 text-amber-400" />
                <span>Manajemen Guru</span>
              </button>
            </>
          )}
        </nav>

        {/* Sidebar Footer User Profile */}
        <div className="p-4 bg-emerald-950 border-t border-emerald-900 flex flex-col gap-1.5">
          <div className="text-xs font-semibold truncate text-white" title={currentUser.name}>
            {currentUser.name}
          </div>
          <div className="text-[10px] text-emerald-300 opacity-80 uppercase font-semibold">
            {isSysAdmin
              ? "Admin Sekolah"
              : isWaliKelas
              ? `Wali Kelas ${currentUser.kelas}`
              : `Guru ${currentUser.subject}`}
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Row */}
        <header className={`h-12 border-b flex items-center justify-between px-6 shrink-0 no-print transition-colors duration-200 ${darkMode ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-800"}`} id="app-navbar">
          <div className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            Semester Ganjil &bull; <span className={`font-bold ${darkMode ? "text-slate-200" : "text-slate-700"}`}>Sumatif Tengah Semester (STS)</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-bold transition shadow-2xs cursor-pointer select-none border ${
                darkMode 
                  ? "bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-600" 
                  : "bg-slate-800 hover:bg-slate-900 text-white border-slate-950"
              }`}
              title="Ganti Mode Tampilan"
            >
              {darkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-slate-950" />
                  <span className="hidden sm:inline">Mode Terang</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-white" />
                  <span className="hidden sm:inline">Mode Gelap</span>
                </>
              )}
            </button>

            <button
              onClick={handleLogout}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-bold border transition select-none cursor-pointer ${
                darkMode
                  ? "text-rose-450 bg-rose-950/20 border-rose-900 hover:bg-rose-900/30"
                  : "text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200"
              }`}
              id="logout-button"
            >
              <LogOut className="w-3.5 h-3.5" /> Keluar
            </button>
          </div>
        </header>

        {/* Inner Content Area */}
        <main className="flex-1 overflow-y-auto p-4 bg-slate-55 space-y-4" id="app-workspace">
          {/* Tab view containers */}
          <div className="tab-viewport animate-fade-in" id="tab-viewport">
            {activeTab === "progress" && (
              <div className="space-y-4">
                <div className="no-print bg-amber-50 rounded-lg p-3 border border-amber-200 text-[11px] text-amber-950 leading-relaxed">
                  📢 <strong>Sistem Sinkronisasi Terpadu:</strong> Halaman ini menangkap progres penginputan nilai dan ketercapaian siswa secara real-time. Jika salah satu guru menyelesaikan input nilai murid, status di bawah akan naik secara instan dan langsung menyesuaikan ke raport tengah semester.
                </div>
                <DashboardProgress onRefreshTrigger={refreshTrigger} />
              </div>
            )}

            {activeTab === "grade_inputs" && (
              <div>
                {isSysAdmin ? (
                  <div className="space-y-4">
                    {/* For admin, let them act as a specific teacher to test! */}
                    <div className="no-print bg-slate-50 border border-slate-200 p-3 rounded-lg">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 block mb-1">Kemampuan Admin</span>
                      <p className="text-[11px] text-slate-600 font-medium">Sebagai Admin Utama, Anda dapat bertindak sebagai Guru Mata Pelajaran mana saja atau menguji input nilai secara langsung dengan memilih ketersediaan peran di bawah ini.</p>
                    </div>
                    {/* Act as IPA Teacher by default for admin in workspace */}
                    <TeacherPanel
                      user={{ id: "admin_tester", name: "Pak Admin (Penguji)", username: "admin", subject: "Informatika", isWaliKelas: false, kelas: "" }}
                      onRefreshTrigger={triggerProgressRefresh}
                    />
                  </div>
                ) : (
                  <TeacherPanel user={currentUser} onRefreshTrigger={triggerProgressRefresh} />
                )}
              </div>
            )}

            {activeTab === "walikelas_panel" && (
              <div>
                {/* Wali Kelas dashboard integration */}
                <WaliKelasPanel user={currentUser} onRefreshTrigger={triggerProgressRefresh} />
              </div>
            )}

            {activeTab === "admin_panel" && isSysAdmin && (
              <div>
                {/* Admin Database control hub */}
                <AdminPanel onRefreshTrigger={triggerProgressRefresh} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
