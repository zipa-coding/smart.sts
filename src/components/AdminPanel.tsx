import React, { useState, useEffect } from "react";
import { Teacher, Student, SUBJECT_LIST } from "../types";
import {
  Users,
  GraduationCap,
  Plus,
  Trash2,
  Edit,
  Key,
  Save,
  BookOpen,
  CalendarDays,
  UserCheck,
  X,
  AlertCircle
} from "lucide-react";

interface AdminPanelProps {
  onRefreshTrigger: () => void;
}

export default function AdminPanel({ onRefreshTrigger }: AdminPanelProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"teachers" | "students" | "tps" | "settings">("teachers");

  // State arrays fetched from API
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [tpsTemplates, setTpsTemplates] = useState<{ [subject: string]: { id: string, text: string }[] }>({});

  // Principal settings state
  const [principalName, setPrincipalName] = useState("Ustadz H. Ir. Abdul Muhyi, M.Pd");
  const [principalNip, setPrincipalNip] = useState("19780512 200501 1 002");
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Raport formatting settings state
  const [semesterName, setSemesterName] = useState("Ganjil");
  const [tahunPelajaran, setTahunPelajaran] = useState("2026/2027");
  const [fontSize, setFontSize] = useState("11pt");
  const [showLogo, setShowLogo] = useState(false);
  const [showSpiritual, setShowSpiritual] = useState(true);
  const [showSosial, setShowSosial] = useState(true);
  const [showAttendance, setShowAttendance] = useState(true);
  const [showCatatan, setShowCatatan] = useState(true);
  const [fontFamily, setFontFamily] = useState("Times New Roman");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modals / Form States
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [teacherForm, setTeacherForm] = useState({
    name: "",
    username: "",
    password: "",
    subject: "IPA",
    isWaliKelas: false,
    kelas: ""
  });

  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentForm, setStudentForm] = useState({
    name: "",
    nisn: "",
    kelas: "7"
  });

  const [tpForm, setTpForm] = useState({
    subject: "IPA",
    text: ""
  });

  // Fetch all starting info
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [resT, resS, resTp, resSet] = await Promise.all([
        fetch("/api/teachers"),
        fetch("/api/students"),
        fetch("/api/tps"),
        fetch("/api/settings")
      ]);

      const tData = await resT.json();
      const sData = await resS.json();
      const tpData = await resTp.json();
      const setData = await resSet.json();

      setTeachers(tData);
      setStudents(sData);
      setTpsTemplates(tpData);
      if (setData.principalName) {
        setPrincipalName(setData.principalName);
      }
      if (setData.principalNip) {
        setPrincipalNip(setData.principalNip);
      }
      if (setData.format) {
        setSemesterName(setData.format.semesterName || "Ganjil");
        setTahunPelajaran(setData.format.tahunPelajaran || "2026/2027");
        setFontSize(setData.format.fontSize || "11pt");
        setShowLogo(setData.format.showLogo || false);
        setShowSpiritual(setData.format.showSpiritual !== undefined ? setData.format.showSpiritual : true);
        setShowSosial(setData.format.showSosial !== undefined ? setData.format.showSosial : true);
        setShowAttendance(setData.format.showAttendance !== undefined ? setData.format.showAttendance : true);
        setShowCatatan(setData.format.showCatatan !== undefined ? setData.format.showCatatan : true);
        setFontFamily(setData.format.fontFamily || "Times New Roman");
      }
    } catch (err) {
      setError("Gagal memuat database dari server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [activeTab]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // TEACHER CRUD
  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const url = editingTeacher ? `/api/teachers/${editingTeacher.id}` : "/api/teachers";
      const method = editingTeacher ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teacherForm)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menyimpan rincian guru.");

      await fetchAllData();
      onRefreshTrigger();
      setIsTeacherModalOpen(false);
      setEditingTeacher(null);
      setTeacherForm({
        name: "",
        username: "",
        password: "",
        subject: "IPA",
        isWaliKelas: false,
        kelas: ""
      });
      showSuccess(editingTeacher ? "Data guru berhasil diperbarui!" : "Guru baru berhasil ditambahkan!");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    }
  };

  const startEditTeacher = (t: Teacher) => {
    setEditingTeacher(t);
    setTeacherForm({
      name: t.name,
      username: t.username,
      password: t.password || "123",
      subject: t.subject,
      isWaliKelas: t.isWaliKelas,
      kelas: t.kelas || ""
    });
    setIsTeacherModalOpen(true);
  };

  const deleteTeacher = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus akun guru ini?")) return;
    setError("");

    try {
      const response = await fetch(`/api/teachers/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menghapus guru.");

      await fetchAllData();
      onRefreshTrigger();
      showSuccess("Guru berhasil dihapus.");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    }
  };

  // STUDENT CRUD
  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const url = editingStudent ? `/api/students/${editingStudent.id}` : "/api/students";
      const method = editingStudent ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentForm)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menyimpan rincian siswa.");

      await fetchAllData();
      onRefreshTrigger();
      setIsStudentModalOpen(false);
      setEditingStudent(null);
      setStudentForm({
        name: "",
        nisn: "",
        kelas: "7"
      });
      showSuccess(editingStudent ? "Data siswa berhasil diperbarui!" : "Siswa baru berhasil ditambahkan!");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    }
  };

  const startEditStudent = (s: Student) => {
    setEditingStudent(s);
    setStudentForm({
      name: s.name,
      nisn: s.nisn,
      kelas: s.kelas
    });
    setIsStudentModalOpen(true);
  };

  const deleteStudent = async (id: string) => {
    if (!confirm("Menghapus siswa ini juga akan menghapus seluruh data nilai dan catatan wali kelasnya. Lanjutkan?")) return;
    setError("");

    try {
      const response = await fetch(`/api/students/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menghapus siswa.");

      await fetchAllData();
      onRefreshTrigger();
      showSuccess("Siswa dihapus bersama relasi nilainya.");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    }
  };

  // Objectives (TP) Adding
  const addTpObjective = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tpForm.text) return;
    setError("");

    try {
      const response = await fetch("/api/tps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: tpForm.subject,
          tpText: tpForm.text
        })
      });

      if (!response.ok) throw new Error("Gagal menambah Tujuan Pembelajaran.");

      setTpForm(prev => ({ ...prev, text: "" }));
      await fetchAllData();
      showSuccess("Tujuan Pembelajaran berhasil ditambahkan!");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    }
  };

  const deleteTpObjective = async (subject: string, tpId: string) => {
    if (!confirm("Hapus Tujuan Pembelajaran (TP) template ini?")) return;
    setError("");

    try {
      const response = await fetch(`/api/tps/${subject}/${tpId}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Gagal menghapus tujuan pembelajaran.");

      await fetchAllData();
      showSuccess("Tujuan Pembelajaran berhasil dihapus!");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSettingsLoading(true);

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          principalName,
          principalNip,
          format: {
            semesterName,
            tahunPelajaran,
            fontSize,
            showLogo,
            showSpiritual,
            showSosial,
            showAttendance,
            showCatatan,
            fontFamily
          }
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menyimpan rincian kepala sekolah.");

      showSuccess("Rincian Kepala Sekolah berhasil diperbarui!");
      onRefreshTrigger();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setSettingsLoading(false);
    }
  };

  return (
    <div className="space-y-4" id="admin-panel">
      {/* Messages */}
      {error && (
        <div className="p-2.5 bg-red-50 border-l-4 border-red-500 rounded text-xs text-red-700 flex gap-2 items-start shadow-2xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-2.5 bg-green-50 border-l-4 border-green-500 text-green-800 rounded text-xs font-bold transition-all animate-fade-in shadow-2xs">
          🎉 {successMsg}
        </div>
      )}

      {/* Admin Tab Headers */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto" id="admin-nav-tabs">
        <button
          onClick={() => setActiveTab("teachers")}
          className={`py-1.5 px-3.5 text-xs font-bold tracking-wider uppercase border-b-2 transition flex items-center gap-1.5 cursor-pointer ${activeTab === "teachers" ? "border-emerald-850 text-emerald-850 bg-emerald-50/40" : "border-transparent text-slate-500 hover:text-slate-805"}`}
        >
          <Users className="w-3.5 h-3.5" /> Manajemen Guru
        </button>
        <button
          onClick={() => setActiveTab("students")}
          className={`py-1.5 px-3.5 text-xs font-bold tracking-wider uppercase border-b-2 transition flex items-center gap-1.5 cursor-pointer ${activeTab === "students" ? "border-emerald-850 text-emerald-850 bg-emerald-50/40" : "border-transparent text-slate-500 hover:text-slate-805"}`}
        >
          <GraduationCap className="w-3.5 h-3.5" /> Manajemen Siswa
        </button>
        <button
          onClick={() => setActiveTab("tps")}
          className={`py-1.5 px-3.5 text-xs font-bold tracking-wider uppercase border-b-2 transition flex items-center gap-1.5 cursor-pointer ${activeTab === "tps" ? "border-emerald-850 text-emerald-850 bg-emerald-50/40" : "border-transparent text-slate-500 hover:text-slate-805"}`}
        >
          <BookOpen className="w-3.5 h-3.5" /> Template TP (Mata Pelajaran)
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`py-1.5 px-3.5 text-xs font-bold tracking-wider uppercase border-b-2 transition flex items-center gap-1.5 cursor-pointer ${activeTab === "settings" ? "border-emerald-850 text-emerald-850 bg-emerald-50/40" : "border-transparent text-slate-500 hover:text-slate-805"}`}
        >
          <UserCheck className="w-3.5 h-3.5" /> Pengaturan Raport
        </button>
      </div>

      {/* TEACHERS TAB */}
      {activeTab === "teachers" && (
        <div className="bg-white rounded-lg border border-slate-205 shadow-sm p-4" id="teacher-management-panel">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Dafar Guru & Hak Akses</h2>
              <p className="text-[10px] text-slate-400">Kelola akun guru mata pelajaran, hak wali kelas, dan sandi sistem keamanan masuk</p>
            </div>
            <button
              onClick={() => {
                setEditingTeacher(null);
                setTeacherForm({
                  name: "",
                  username: "",
                  password: "",
                  subject: "IPA",
                  isWaliKelas: false,
                  kelas: ""
                });
                setIsTeacherModalOpen(true);
              }}
              className="px-3 py-1 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white text-xs font-bold rounded flex items-center gap-1 shadow-xs cursor-pointer transition"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Guru
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm border-collapse text-gray-700">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider">Nama Guru</th>
                  <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider">Login Username</th>
                  <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider">Keamanan Sandi</th>
                  <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider">Mata Pelajaran (Mapel)</th>
                  <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider">Tugas Wali Kelas</th>
                  <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {teachers.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/30">
                    <td className="p-3 font-bold text-gray-850">{t.name}</td>
                    <td className="p-3 font-mono text-emerald-800">{t.username}</td>
                    <td className="p-3 font-mono text-gray-400 font-bold">&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${t.subject === "Admin" ? "bg-red-150 text-red-800" : "bg-emerald-100 text-emerald-900"}`}>
                        {t.subject}
                      </span>
                    </td>
                    <td className="p-3 text-xs">
                      {t.isWaliKelas ? (
                        <span className="text-green-700 bg-green-50 border border-green-200 py-0.5 px-2.5 rounded-full font-semibold">
                          Wali Kelas {t.kelas}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Bukan Wali</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {t.id === "t1" ? (
                        <span className="text-2xs text-gray-400 italic bg-gray-50 p-1 rounded">Utama</span>
                      ) : (
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => startEditTeacher(t)}
                            className="p-1 text-sky-650 hover:bg-sky-50 rounded transition cursor-pointer"
                            title="Edit Guru"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteTeacher(t.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STUDENTS TAB */}
      {activeTab === "students" && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4" id="student-management-panel">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Dafar Siswa SMP</h2>
              <p className="text-[10px] text-slate-400">Masukkan, edit nama, NISN, dan kualifikasi kelas siswa yang terdaftar</p>
            </div>
            <button
              onClick={() => {
                setEditingStudent(null);
                setStudentForm({
                  name: "",
                  nisn: "",
                  kelas: "7"
                });
                setIsStudentModalOpen(true);
              }}
              className="px-3 py-1 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white text-xs font-bold rounded flex items-center gap-1 shadow-xs cursor-pointer transition"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Siswa
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-4">
            {/* Quick Filter Info Cards */}
            {["7", "8", "9"].map((cls, ci) => (
              <div key={ci} className="p-2.5 bg-slate-50 border border-slate-205 rounded flex items-center justify-between">
                <div>
                  <span className="text-emerald-850 text-xs font-extrabold block">Kelas {cls}</span>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Total Terdaftar</span>
                </div>
                <span className="text-base font-extrabold text-slate-800">
                  {students.filter(s => s.kelas === cls).length} Siswa
                </span>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm border-collapse text-gray-700">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider">Nama Siswa</th>
                  <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider">NISN Siswa</th>
                  <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider">Kelas</th>
                  <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/30">
                    <td className="p-3 font-bold text-gray-800">{s.name}</td>
                    <td className="p-3 font-mono text-gray-500">{s.nisn}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-850 border border-emerald-200 rounded text-xs font-bold">
                        Kelas {s.kelas}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => startEditStudent(s)}
                          className="p-1 text-sky-650 hover:bg-sky-50 rounded transition cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteStudent(s.id)}
                          className="p-1 text-red-650 hover:bg-red-50 rounded transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TPS (MATA PELAJARAN / LEARNING OBJECTIVES TEMPLATES) TAB */}
      {activeTab === "tps" && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6" id="tp-templates-panel">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Template Capaian / Tujuan Pembelajaran (TP)</h2>
            <p className="text-xs text-gray-400">Guru mata pelajaran akan menchecklist capaian ini untuk menyusun narasi deskripsi raport secara cerdas</p>
          </div>

          <form onSubmit={addTpObjective} className="p-4 bg-emerald-50 border border-emerald-150 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-emerald-900 uppercase tracking-wider mb-1.5">
                Pilih Mata Pelajaran
              </label>
              <select
                value={tpForm.subject}
                onChange={(e) => setTpForm(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full p-2 bg-white border border-emerald-200 rounded-lg text-xs md:text-sm focus:outline-none focus:border-emerald-600 transition"
              >
                {SUBJECT_LIST.map((sub, i) => (
                  <option key={i} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-emerald-900 uppercase tracking-wider mb-1.5">
                Ketik Deskripsi Ringkas TP (Tujuan Pembelajaran)
              </label>
              <input
                type="text"
                value={tpForm.text}
                onChange={(e) => setTpForm(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Contoh: Memahami sistem organ pernapasan dan pencernaan manusia..."
                className="w-full p-2 bg-white border border-emerald-200 rounded-lg text-xs md:text-sm focus:outline-none focus:border-emerald-600 transition"
              />
            </div>
            <div className="md:col-span-1">
              <button
                type="submit"
                className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold shadow-sm flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Simpan Capaian (TP)
              </button>
            </div>
          </form>

          {/* Group display of subject templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {SUBJECT_LIST.map((subject) => {
              const items = tpsTemplates[subject] || [];
              return (
                <div key={subject} className="bg-white rounded-xl border border-gray-150 p-4 shadow-3xs">
                  <span className="px-3 py-1 bg-emerald-800 text-white rounded text-2xs uppercase tracking-wider font-bold">
                    {subject}
                  </span>
                  <div className="mt-3.5 space-y-2">
                    {items.length === 0 ? (
                      <p className="text-2xs text-gray-450 italic py-2">Belum ada template tujuan pembelajaran untuk mapel ini.</p>
                    ) : (
                      items.map((item) => (
                        <div key={item.id} className="p-2.5 bg-gray-50/60 rounded border border-gray-100 flex items-start justify-between gap-3 text-xs hover:bg-gray-50 transition">
                          <p className="text-gray-700 leading-relaxed text-justify flex-1">{item.text}</p>
                          <button
                            onClick={() => deleteTpObjective(subject, item.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition cursor-pointer shrink-0"
                            title="Hapus TP"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SETTINGS (PENGATURAN RAPORT) TAB */}
      {activeTab === "settings" && (
        <div className="bg-white rounded-xl border border-gray-150 shadow-sm p-6 max-w-2xl animate-fade-in" id="school-settings-panel">
          <div className="mb-6">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <span>Pengaturan Format & Atribut Raport</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Akses Admin</span>
            </h2>
            <p className="text-[10px] text-slate-400 mt-1">
              Sesuaikan identitas, tampilan, font, ukuran, serta bagian-bagian format yang ingin ditampilkan pada cetak raport siswa.
            </p>
          </div>

          <form onSubmit={handleSettingsSubmit} className="space-y-6">
            {/* Bagian 1: Identitas Kepala Sekolah */}
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1">1. Identitas Penandatangan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Nama Kepala Sekolah & Gelar
                  </label>
                  <input
                    type="text"
                    required
                    value={principalName}
                    onChange={(e) => setPrincipalName(e.target.value)}
                    placeholder="Contoh: Ustadz H. Ir. Abdul Muhyi, M.Pd"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs md:text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    NIP Kepala Sekolah
                  </label>
                  <input
                    type="text"
                    required
                    value={principalNip}
                    onChange={(e) => setPrincipalNip(e.target.value)}
                    placeholder="Contoh: 19780512 200501 1 002"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs md:text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  />
                </div>
              </div>
            </div>

            {/* Bagian 2: Kustomisasi Teks & Sesi */}
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1">2. Informasi Semester & Tahun Pelajaran</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Nama Semester
                  </label>
                  <input
                    type="text"
                    required
                    value={semesterName}
                    onChange={(e) => setSemesterName(e.target.value)}
                    placeholder="Contoh: Ganjil"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs md:text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Tahun Pelajaran
                  </label>
                  <input
                    type="text"
                    required
                    value={tahunPelajaran}
                    onChange={(e) => setTahunPelajaran(e.target.value)}
                    placeholder="Contoh: 2026/2027"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs md:text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  />
                </div>
              </div>
            </div>

            {/* Bagian 3: Tata Letak & Gaya */}
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1">3. Gaya & Desain Cetak</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Jenis Font Word/Cetak
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs md:text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  >
                    <option value="Times New Roman">Times New Roman (Formal)</option>
                    <option value="Arial">Arial (Modern & Bersih)</option>
                    <option value="Georgia">Georgia (Elegan & Klasik)</option>
                    <option value="Courier New">Courier New (Monospace)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Ukuran Font Dasar
                  </label>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs md:text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  >
                    <option value="10pt">Sangat Kecil (10pt)</option>
                    <option value="11pt">Standar (11pt)</option>
                    <option value="12pt">Besar (12pt)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bagian 4: Visibilitas Komponen */}
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1">4. Visibilitas Elemen Raport</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-700">
                <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition">
                  <input
                    type="checkbox"
                    checked={showLogo}
                    onChange={(e) => setShowLogo(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-550 w-4 h-4"
                  />
                  <span>Tampilkan Logo Kop Sekolah</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition">
                  <input
                    type="checkbox"
                    checked={showSpiritual}
                    onChange={(e) => setShowSpiritual(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-550 w-4 h-4"
                  />
                  <span>Tampilkan Aspek Sikap Spiritual</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition">
                  <input
                    type="checkbox"
                    checked={showSosial}
                    onChange={(e) => setShowSosial(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-550 w-4 h-4"
                  />
                  <span>Tampilkan Aspek Sikap Sosial</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition">
                  <input
                    type="checkbox"
                    checked={showAttendance}
                    onChange={(e) => setShowAttendance(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-550 w-4 h-4"
                  />
                  <span>Tampilkan Presensi Kehadiran</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition text-nowrap">
                  <input
                    type="checkbox"
                    checked={showCatatan}
                    onChange={(e) => setShowCatatan(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-550 w-4 h-4"
                  />
                  <span>Tampilkan Catatan Wali Kelas</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={settingsLoading}
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {settingsLoading ? "Saving..." : "Simpan Format Raport"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TEACHER MODAL FORM */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-scale-up">
            <div className="bg-emerald-800 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm uppercase tracking-wide">
                {editingTeacher ? "Edit Akun Guru" : "Tambah Guru Baru"}
              </h3>
              <button
                onClick={() => setIsTeacherModalOpen(false)}
                className="text-white/85 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTeacherSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-750 mb-1.5">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  value={teacherForm.name}
                  onChange={(e) => setTeacherForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Contoh: Dr. H. Slamet, M.Pd"
                  className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs md:text-sm focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-750 mb-1.5">Login Username</label>
                  <input
                    type="text"
                    required
                    value={teacherForm.username}
                    onChange={(e) => setTeacherForm(prev => ({ ...prev, username: e.target.value.toLowerCase() }))}
                    placeholder="nama_panggil"
                    className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs md:text-sm focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-750 mb-1.5">Masuk/PIN Sandi</label>
                  <input
                    type="text"
                    required
                    value={teacherForm.password}
                    onChange={(e) => setTeacherForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Sandi Aman"
                    className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs md:text-sm focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-750 mb-1.5">Mata Pelajaran yang Diampu</label>
                <select
                  value={teacherForm.subject}
                  onChange={(e) => setTeacherForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs md:text-sm focus:outline-none focus:border-emerald-600 focus:bg-white"
                >
                  {SUBJECT_LIST.map((sub, i) => (
                    <option key={i} value={sub}>{sub}</option>
                  ))}
                  <option value="Admin">Hanya Admin</option>
                </select>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs md:text-sm text-gray-800">
                  <input
                    type="checkbox"
                    checked={teacherForm.isWaliKelas}
                    onChange={(e) => setTeacherForm(prev => ({ ...prev, isWaliKelas: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-emerald-800 focus:ring-emerald-500"
                  />
                  <span>Tugaskan sebagai Wali Kelas</span>
                </label>
              </div>

              {teacherForm.isWaliKelas && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-150 animate-fade-in">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Kelas yang Diajar & Asuh</label>
                  <select
                    value={teacherForm.kelas}
                    onChange={(e) => setTeacherForm(prev => ({ ...prev, kelas: e.target.value }))}
                    className="w-full p-2 bg-white border border-gray-250 rounded text-xs focus:outline-none focus:border-emerald-600"
                  >
                    <option value="">-- Pilih Kelas --</option>
                    <option value="7">Kelas 7</option>
                    <option value="8">Kelas 8</option>
                    <option value="9">Kelas 9</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsTeacherModalOpen(false)}
                  className="w-1/2 py-2.5 border border-gray-250 text-gray-650 hover:bg-gray-50 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1"
                >
                  <Save className="w-4 h-4" /> Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT MODAL FORM */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-scale-up">
            <div className="bg-emerald-800 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm uppercase tracking-wide">
                {editingStudent ? "Edit Identitas Siswa" : "Tambah Siswa Baru"}
              </h3>
              <button
                onClick={() => setIsStudentModalOpen(false)}
                className="text-white/85 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStudentSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-750 mb-1.5">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  required
                  value={studentForm.name}
                  onChange={(e) => setStudentForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Contoh: Muhammad Al-Farabi"
                  className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs md:text-sm focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-750 mb-1.5">NISN Siswa (Nomor Induk Nasional)</label>
                <input
                  type="text"
                  required
                  value={studentForm.nisn}
                  onChange={(e) => setStudentForm(prev => ({ ...prev, nisn: e.target.value.replace(/\D/g, "") }))}
                  placeholder="Contoh: 0134988712 (10 digit numerik)"
                  className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs md:text-sm focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-750 mb-1.5">Kelas / Rombongan Belajar</label>
                <select
                  value={studentForm.kelas}
                  onChange={(e) => setStudentForm(prev => ({ ...prev, kelas: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs md:text-sm focus:outline-none focus:border-emerald-600 focus:bg-white"
                >
                  <option value="7">Kelas 7</option>
                  <option value="8">Kelas 8</option>
                  <option value="9">Kelas 9</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="w-1/2 py-2.5 border border-gray-250 text-gray-650 hover:bg-gray-50 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1"
                >
                  <Save className="w-4 h-4" /> Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
