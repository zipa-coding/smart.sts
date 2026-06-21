import React, { useState } from "react";
import { Student, Grade, WaliKelasNote, Teacher } from "../types";
import { Printer, FileDown, ArrowLeft, Sun, Moon } from "lucide-react";
import SmpIslamSmartLogo from "./SmpIslamSmartLogo";

interface PrintRaportViewProps {
  student: Student;
  grades: Grade[];
  waliKelasNote: WaliKelasNote;
  waliKelas: Teacher | null;
  onBack: () => void;
}

export default function PrintRaportView({
  student,
  grades,
  waliKelasNote,
  waliKelas,
  onBack
}: PrintRaportViewProps) {
  // Use React state to toggle between screen light and dark modes
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("smp_islam_smart_theme") === "dark";
  });

  // Dynamic state for Headmaster/Principal info & Raport format configurations
  const [principal, setPrincipal] = useState({
    name: "Ustadz H. Ir. Abdul Muhyi, M.Pd",
    nip: "19780512 200501 1 002"
  });

  const [format, setFormat] = useState({
    semesterName: "Ganjil",
    tahunPelajaran: "2026/2027",
    fontSize: "11pt",
    showLogo: false,
    showSpiritual: true,
    showSosial: true,
    showAttendance: true,
    showCatatan: true,
    fontFamily: "Times New Roman"
  });

  React.useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.principalName && data.principalNip) {
          setPrincipal({
            name: data.principalName,
            nip: data.principalNip
          });
        }
        if (data.format) {
          setFormat({
            semesterName: data.format.semesterName || "Ganjil",
            tahunPelajaran: data.format.tahunPelajaran || "2026/2027",
            fontSize: data.format.fontSize || "11pt",
            showLogo: !!data.format.showLogo,
            showSpiritual: data.format.showSpiritual !== undefined ? !!data.format.showSpiritual : true,
            showSosial: data.format.showSosial !== undefined ? !!data.format.showSosial : true,
            showAttendance: data.format.showAttendance !== undefined ? !!data.format.showAttendance : true,
            showCatatan: data.format.showCatatan !== undefined ? !!data.format.showCatatan : true,
            fontFamily: data.format.fontFamily || "Times New Roman"
          });
        }
      })
      .catch((err) => console.error("Error loading principal settings:", err));
  }, []);

  const handleToggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    localStorage.setItem("smp_islam_smart_theme", nextDark ? "dark" : "light");
    if (nextDark) {
      document.body.classList.add("dark");
      document.documentElement.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
      document.documentElement.classList.remove("dark");
    }
  };

  // Standard 11 Subject keys in Kurikulum Merdeka preferred order
  const subjectsOrdered = [
    "PAI", "PPKN", "Bahasa Indonesia", "Matematika", "IPA", "IPS", "Bahasa Inggris", "PJOK", "Bahasa Arab", "Informatika", "Prakarya"
  ];

  // Helper with beautiful full human readable subject names
  const getOfficialSubjectName = (sub: string, index: number) => {
    const map: { [key: string]: string } = {
      "PAI": "Pendidikan Agama Islam",
      "PPKN": "Pendidikan Pancasila dan Kewarganegaraan",
      "Bahasa Indonesia": "Bahasa Indonesia",
      "Matematika": "Matematika",
      "IPA": "Ilmu Pengetahuan Alam",
      "IPS": "Ilmu Pengetahuan Sosial",
      "Bahasa Inggris": "Bahasa Inggris",
      "PJOK": "Pendidikan Jasmani Olahraga dan Kesehatan",
      "Bahasa Arab": "Bahasa Arab",
      "Informatika": "Informatika",
      "Prakarya": "Prakarya"
    };
    return `${index + 1}. ${map[sub] || sub}`;
  };

  const formatFaseKelas = (kelas: string) => {
    if (kelas === "7") return "D / VII (Tujuh)";
    if (kelas === "8") return "D / VIII (Delapan)";
    if (kelas === "9") return "D / IX (Sembilan)";
    return `D / ${kelas}`;
  };

  // Generate automated narrative backup fallback if subject deskripsi is empty
  const generateDescription = (g: Grade | undefined) => {
    if (!g || !g.tps || g.tps.length === 0) {
      return "Belum ada deskripsi capaian pembelajaran.";
    }

    const achieved = g.tps.filter(tp => tp.achieved).map(tp => tp.text);
    const needImprovement = g.tps.filter(tp => !tp.achieved).map(tp => tp.text);

    let desc = "";
    if (achieved.length > 0) {
      desc += `Mampu menguasai kompetensi yang optimal dalam hal ${achieved.join(", ")}. `;
    }

    if (needImprovement.length > 0) {
      desc += `Perlu peningkatan bimbingan lebih lanjut dalam hal ${needImprovement.join(", ")}.`;
    }

    if (achieved.length === 0 && needImprovement.length === 0) {
      return "Menunjukkan partisipasi cukup baik dalam proses pembelajaran.";
    }

    return desc.trim();
  };

  const getSubjectScore = (sub: string) => {
    const g = grades.find(x => x.subject === sub);
    return g ? g.score : "-";
  };

  const getSubjectUsaha = (sub: string) => {
    const g = grades.find(x => x.subject === sub);
    return g ? (g.usaha || "B") : "-";
  };

  const getSubjectProses = (sub: string) => {
    const g = grades.find(x => x.subject === sub);
    return g ? (g.proses || "B") : "-";
  };

  const getSubjectCapaian = (sub: string) => {
    const g = grades.find(x => x.subject === sub);
    return g ? (g.capaian || "B") : "-";
  };

  const getSubjectDescription = (sub: string) => {
    const g = grades.find(x => x.subject === sub);
    if (!g) return "Belum ada catatan atau tujuan pembelajaran dari guru mata pelajaran.";
    if (g.deskripsi) return g.deskripsi;
    return generateDescription(g);
  };

  const handlePrint = () => {
    window.print();
  };

  // Convert report card layout to Microsoft Word compatible .doc format
  const handleDownloadWord = () => {
    const title = `Raport_STS_${student.name.replace(/\s+/g, "_")}`;
    
    const htmlHeader = `
      <html xmlns:o='urn:schemas-microsoft-500-col:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>Raport Sumatif Tengah Semester - SMP Islam Smart</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.4; color: #000; }
          .meta-table { width: 100%; border: none; margin-bottom: 20px; font-size: 11pt; }
          .meta-table td { padding: 4px; vertical-align: top; }
          .box-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; border: 1.5px solid black; }
          .box-table td { border: 1px solid black; padding: 6px 8px; vertical-align: top; }
          .signature-section { width: 100%; border: none; margin-top: 30px; }
          .signature-section td { text-align: center; vertical-align: top; }
        </style>
      </head>
      <body>
    `;

    const htmlBody = `
      <div style="text-align: center; margin-bottom: 5px;">
        <h2 style="margin: 0; text-transform: uppercase; font-size: 14pt;">SMP ISLAM SMART PANGKAL PINANG</h2>
        <h3 style="margin: 3px 0; text-transform: uppercase; font-size: 12pt;">LAPORAN SUMATIF TENGAH SEMESTER (STS)</h3>
        <h4 style="margin: 3px 0; font-size: 11pt;">SEMESTER ${format.semesterName ? format.semesterName.toUpperCase() : "GANJIL"}</h4>
        <p style="margin: 2px 0 15px 0; font-size: 10.5pt; font-weight: bold;">TAHUN PELAJARAN ${format.tahunPelajaran || "2026-2027"}</p>
      </div>

      <hr style="border: 1.5px solid black; margin-bottom: 15px;" />

      <table class="meta-table">
        <tr>
          <td style="width: 15%; font-weight: bold;">Nama Siswa</td>
          <td style="width: 2%;">:</td>
          <td style="width: 35%; font-weight: bold; text-transform: uppercase;">${student.name}</td>
          <td style="width: 18%; font-weight: bold;">Fase/Kelas</td>
          <td style="width: 2%;">:</td>
          <td style="width: 28%; font-weight: bold;">${formatFaseKelas(student.kelas)}</td>
        </tr>
        <tr>
          <td>NISN / No. Induk</td>
          <td>:</td>
          <td>${student.nisn}</td>
          <td>Semester</td>
          <td>:</td>
          <td>${format.semesterName || "Ganjil"}</td>
        </tr>
      </table>

      <h4 style="margin: 15px 0 8px 0; text-transform: uppercase; font-size: 11pt; border-bottom: 1px solid black; padding-bottom: 2px;">A. SIKAP</h4>
      
      <!-- Spiritual Aspect Table -->
      <table class="box-table" style="page-break-inside: avoid;">
        <tr>
          <td rowspan="2" style="width: 50%; font-weight: bold; font-size: 11pt; vertical-align: middle;">
            1. Spiritual
          </td>
          <td style="width: 16.6%; text-align: center; font-weight: bold; font-size: 10pt; background-color: #f2f2f2; height: 18px;">
            Usaha
          </td>
          <td style="width: 16.6%; text-align: center; font-weight: bold; font-size: 10pt; background-color: #f2f2f2;">
            Proses
          </td>
          <td style="width: 16.6%; text-align: center; font-weight: bold; font-size: 10pt; background-color: #f2f2f2;">
            Capaian
          </td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold; font-size: 11pt;">
            ${waliKelasNote.spiritualUsaha || "B"}
          </td>
          <td style="text-align: center; font-weight: bold; font-size: 11pt;">
            ${waliKelasNote.spiritualProses || "B"}
          </td>
          <td style="text-align: center; font-weight: bold; font-size: 11pt;">
            ${waliKelasNote.spiritualCapaian || "B"}
          </td>
        </tr>
        <tr>
          <td colspan="4" style="padding: 8px; font-size: 10pt; text-align: justify; line-height: 1.4;">
            <strong>Deskripsi:</strong> ${waliKelasNote.spiritualDeskripsi || "Menunjukkan pembiasaan akhlak shaleh serta ketaatan ibadah yang baik."}
          </td>
        </tr>
      </table>

      <!-- Sosial Aspect Table -->
      <table class="box-table" style="page-break-inside: avoid;">
        <tr>
          <td rowspan="2" style="width: 50%; font-weight: bold; font-size: 11pt; vertical-align: middle;">
            2. Sosial
          </td>
          <td style="width: 16.6%; text-align: center; font-weight: bold; font-size: 10pt; background-color: #f2f2f2; height: 18px;">
            Usaha
          </td>
          <td style="width: 16.6%; text-align: center; font-weight: bold; font-size: 10pt; background-color: #f2f2f2;">
            Proses
          </td>
          <td style="width: 16.6%; text-align: center; font-weight: bold; font-size: 10pt; background-color: #f2f2f2;">
            Capaian
          </td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold; font-size: 11pt;">
            ${waliKelasNote.sosialUsaha || "B"}
          </td>
          <td style="text-align: center; font-weight: bold; font-size: 11pt;">
            ${waliKelasNote.sosialProses || "B"}
          </td>
          <td style="text-align: center; font-weight: bold; font-size: 11pt;">
            ${waliKelasNote.sosialCapaian || "B"}
          </td>
        </tr>
        <tr>
          <td colspan="4" style="padding: 8px; font-size: 10pt; text-align: justify; line-height: 1.4;">
            <strong>Deskripsi:</strong> ${waliKelasNote.sosialDeskripsi || "Menunjukkan sikap tolong-menolong, kesopanan santun, serta kerjasama yang baik dengan sesama kawan."}
          </td>
        </tr>
      </table>

      <h4 style="margin: 20px 0 8px 0; text-transform: uppercase; font-size: 11pt; border-bottom: 1px solid black; padding-bottom: 2px;">B. UMUM</h4>

      <!-- Subject specific boxed items -->
      ${subjectsOrdered.map((sub, idx) => {
        const title = getOfficialSubjectName(sub, idx);
        const score = getSubjectScore(sub);
        const usahaGrade = getSubjectUsaha(sub);
        const prosesGrade = getSubjectProses(sub);
        const capaianGrade = getSubjectCapaian(sub);
        const desc = getSubjectDescription(sub);

        return `
          <table class="box-table" style="page-break-inside: avoid;">
            <tr>
              <td rowspan="2" style="width: 44%; font-weight: bold; font-size: 11pt; vertical-align: middle;">
                ${title}
              </td>
              <td style="width: 14%; text-align: center; font-weight: bold; font-size: 10pt; background-color: #f2f2f2; height: 18px;">
                Nilai
              </td>
              <td style="width: 14%; text-align: center; font-weight: bold; font-size: 10pt; background-color: #f2f2f2;">
                Usaha
              </td>
              <td style="width: 14%; text-align: center; font-weight: bold; font-size: 10pt; background-color: #f2f2f2;">
                Proses
              </td>
              <td style="width: 14%; text-align: center; font-weight: bold; font-size: 10pt; background-color: #f2f2f2;">
                Capaian
              </td>
            </tr>
            <tr>
              <td style="text-align: center; font-weight: bold; font-size: 11pt;">
                ${score}
              </td>
              <td style="text-align: center; font-weight: bold; font-size: 11pt;">
                ${usahaGrade}
              </td>
              <td style="text-align: center; font-weight: bold; font-size: 11pt;">
                ${prosesGrade}
              </td>
              <td style="text-align: center; font-weight: bold; font-size: 11pt;">
                ${capaianGrade}
              </td>
            </tr>
            <tr>
              <td colspan="5" style="padding: 8px; font-size: 10.5px; text-align: justify; line-height: 1.4;">
                <strong>Deskripsi:</strong> ${desc}
              </td>
            </tr>
          </table>
        `;
      }).join('')}

      <h4 style="margin: 20px 0 8px 0; text-transform: uppercase; font-size: 11pt; border-bottom: 1px solid black; padding-bottom: 2px;">C. KETIDAKHADIRAN</h4>
      <table class="box-table" style="width: 50%; page-break-inside: avoid;">
        <tr>
          <td style="font-size: 10pt;">Sakit (S)</td>
          <td style="text-align: center; font-weight: bold; font-size: 10.5pt; width: 35%;">${waliKelasNote.sakit || 0} hari</td>
        </tr>
        <tr>
          <td style="font-size: 10pt;">Izin (I)</td>
          <td style="text-align: center; font-weight: bold; font-size: 10.5pt;">${waliKelasNote.izin || 0} hari</td>
        </tr>
        <tr>
          <td style="font-size: 10pt;">Tanpa Keterangan (Alpa)</td>
          <td style="text-align: center; font-weight: bold; font-size: 10.5pt; color: #ff0000;">${waliKelasNote.alpa || 0} hari</td>
        </tr>
      </table>

      <h4 style="margin: 20px 0 8px 0; text-transform: uppercase; font-size: 11pt; border-bottom: 1px solid black; padding-bottom: 2px;">D. CATATAN PERKEMBANGAN WALI KELAS</h4>
      <table class="box-table" style="page-break-inside: avoid;">
        <tr>
          <td style="padding: 12px; font-size: 10.5pt; text-align: justify; line-height: 1.5; font-style: italic;">
            "${waliKelasNote.catatan || "Ananda memiliki kelakuan baik dan bersemangat tinggi dalam menuntut ilmu. Tingkatkan terus di masa depan."}"
          </td>
        </tr>
      </table>

      <br />

      <table class="signature-section" style="width: 100%; border: none;">
        <tr>
          <td style="width: 50%; padding-bottom: 60px;">
            <p style="margin: 0 0 55px 0;">&nbsp;<br />Orang Tua/Wali Siswa</p>
            <p style="margin: 0; font-weight: bold;">___________________________</p>
          </td>
          <td style="width: 50%; padding-bottom: 60px;">
            <p style="margin: 0 0 55px 0;">Pangkal Pinang, 17 Juni 2026<br />Wali Kelas Kelas ${student.kelas}</p>
            <p style="margin: 0; font-weight: bold; text-decoration: underline;">${waliKelas ? waliKelas.name : "___________________________"}</p>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="text-align: center; padding-top: 20px;">
            <p style="margin: 0 0 55px 0; line-height: 1.3;">Mengetahui,<br />Kepala Sekolah</p>
            <p style="margin: 0; font-weight: bold; text-decoration: underline;">${principal.name}</p>
            <p style="margin: 3px 0 0 0; font-size: 9.5pt; color: #555;">NIP. ${principal.nip}</p>
          </td>
        </tr>
      </table>
    `;

    const htmlFooter = `
      </body>
      </html>
    `;

    const docContent = htmlHeader + htmlBody + htmlFooter;
    const blob = new Blob(['\ufeff' + docContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="print-view-panel">
      {/* Dynamic custom CSS style overrides for printing natively in correct page sizes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background-color: white !important;
            color: black !important;
            font-family: 'Times New Roman', Times, serif !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            max-width: 100% !important;
            margin: 0 !important;
            background-color: white !important;
            color: black !important;
          }
          .page-break-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          /* Force physical printing settings over any active Screen dark styles */
          .print-container, 
          .print-container * {
            color: black !important;
            border-color: black !important;
            background-color: transparent !important;
          }
          .print-container tr,
          .print-container td,
          .print-container th,
          .print-container div {
            border-color: black !important;
          }
        }
      `}} />

      {/* Action Header bar */}
      <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 no-print p-3 rounded-lg border shadow-sm transition-colors duration-200 ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-gray-150 text-gray-800"}`}>
        <button
          onClick={onBack}
          className={`flex items-center gap-1 text-xs transition py-1 px-2.5 border rounded cursor-pointer font-bold ${darkMode ? "text-slate-300 hover:text-white border-slate-650 hover:bg-slate-700" : "text-gray-550 hover:text-gray-800 border-gray-200 hover:bg-gray-50"}`}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Light/Dark Mode Switcher */}
          <button
            onClick={handleToggleDarkMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition cursor-pointer border shadow-2xs ${darkMode ? "bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-600" : "bg-slate-800 hover:bg-slate-900 text-white border-slate-950"}`}
            title="Ganti Mode Tampilan"
          >
            {darkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-slate-950" />
                <span>Mode Terang</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-white" />
                <span>Mode Gelap</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadWord}
            className={`flex items-center gap-1 px-3 py-1.5 border rounded text-xs font-bold transition cursor-pointer shadow-2xs ${darkMode ? "bg-emerald-950/40 border-emerald-800 text-emerald-300 hover:bg-emerald-900/40" : "bg-emerald-50 border-emerald-250 text-emerald-800 hover:bg-emerald-100"}`}
          >
            <FileDown className="w-3.5 h-3.5" /> Unduh Dokumen Word (.doc)
          </button>
          
          <button
            onClick={handlePrint}
            className="flex items-center gap-1 px-4 py-1.5 bg-emerald-800 text-white rounded hover:bg-emerald-900 text-xs font-bold transition shadow-2xs cursor-pointer border border-emerald-700"
          >
            <Printer className="w-3.5 h-3.5" /> Cetak Raport
          </button>
        </div>
      </div>

      {/* Raport Sheet Preview Container */}
      <div 
        className="rounded-lg border p-6 md:p-8 bg-white border-gray-300 text-slate-950 shadow-md max-w-4xl mx-auto print-container transition-all duration-300 shadow-slate-900/10" 
        id="raport-sheet-print"
      >
        
        {/* Formal Report Header */}
        <div className="text-center pb-4 border-b-2 border-double mb-6 font-serif border-gray-800">
          <h2 className="text-base md:text-lg font-extrabold uppercase mt-0.5 tracking-wide text-black">
            SMP ISLAM SMART PANGKAL PINANG
          </h2>
          <h3 className="text-xs md:text-sm font-bold tracking-wider uppercase mt-0.5 text-gray-800">
            LAPORAN SUMATIF TENGAH SEMESTER (STS)
          </h3>
          <h4 className="text-xs font-semibold uppercase mt-0.5 font-sans text-emerald-800">
            SEMESTER {format.semesterName ? format.semesterName.toUpperCase() : "GANJIL"}
          </h4>
          <p className="text-[10px] text-gray-500 font-medium italic mt-0.5 font-sans">
            TAHUN PELAJARAN {format.tahunPelajaran || "2026-2027"}
          </p>
        </div>

        {/* Student metadata tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-6 font-serif">
          <table className="w-full border-none">
            <tbody>
              <tr>
                <td className="w-1/3 py-1 font-semibold text-gray-650">Nama Siswa</td>
                <td className="w-4 py-1 text-gray-450">:</td>
                <td className="py-1 font-bold uppercase text-black">{student.name}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold text-gray-650">NISN / No. Induk</td>
                <td className="py-1 text-gray-450">:</td>
                <td className="py-1 font-mono font-bold text-black">{student.nisn}</td>
              </tr>
            </tbody>
          </table>

          <table className="w-full border-none">
            <tbody>
              <tr>
                <td className="w-1/3 py-1 font-semibold text-gray-650">Fase / Kelas</td>
                <td className="w-4 py-1 text-gray-450">:</td>
                <td className="py-1 font-bold text-black">{formatFaseKelas(student.kelas)}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold text-gray-650">Semester</td>
                <td className="py-1 text-gray-450">:</td>
                <td className="py-1 text-black">{format.semesterName || "Ganjil"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SECTION A: SIKAP */}
        <div className="mb-6 font-serif">
          <h4 className="text-xs md:text-sm font-bold mb-3 uppercase tracking-wide border-b pb-0.5 text-black border-gray-400">
            A. SIKAP
          </h4>
          
          {/* Spiritual Aspect Box */}
          <div className="page-break-avoid border p-0 mb-3 border-black bg-white text-black">
            <table className="w-full border-collapse border-none">
              <tbody>
                <tr className="border-b border-black">
                  <td className="w-1/2 p-3 font-bold text-xs md:text-sm align-middle border-r font-serif border-black text-black">
                    1. Spiritual
                  </td>
                  <td className="w-1/6 p-1 text-center font-bold text-[10px] md:text-xs border-r border-black bg-gray-50/50 text-gray-500">
                    <div className="text-[9px] font-sans mb-0.5 opacity-85 text-gray-500">Usaha</div>
                    <div className="text-xs md:text-sm font-bold text-black">{waliKelasNote.spiritualUsaha || "B"}</div>
                  </td>
                  <td className="w-1/6 p-1 text-center font-bold text-[10px] md:text-xs border-r border-black bg-gray-50/50 text-gray-500">
                    <div className="text-[9px] font-sans mb-0.5 opacity-85 text-gray-500">Proses</div>
                    <div className="text-xs md:text-sm font-bold text-black">{waliKelasNote.spiritualProses || "B"}</div>
                  </td>
                  <td className="w-1/6 p-1 text-center font-bold text-[10px] md:text-xs bg-gray-50/50 text-gray-500">
                    <div className="text-[9px] font-sans mb-0.5 opacity-85 text-gray-500">Capaian</div>
                    <div className="text-xs md:text-sm font-bold text-black">{waliKelasNote.spiritualCapaian || "B"}</div>
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="p-3 text-[11px] md:text-xs leading-relaxed text-justify">
                    <strong className="font-semibold mr-1 text-black">Deskripsi:</strong>
                    <span className="text-gray-800">
                      {waliKelasNote.spiritualDeskripsi || "Menunjukkan pembiasaan akhlak shaleh serta ketaatan ibadah yang baik."}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Sosial Aspect Box */}
          <div className="page-break-avoid border p-0 mb-3 border-black bg-white text-black">
            <table className="w-full border-collapse border-none">
              <tbody>
                <tr className="border-b border-black">
                  <td className="w-1/2 p-3 font-bold text-xs md:text-sm align-middle border-r font-serif border-black text-black">
                    2. Sosial
                  </td>
                  <td className="w-1/6 p-1 text-center font-bold text-[10px] md:text-xs border-r border-black bg-gray-50/50 text-gray-500">
                    <div className="text-[9px] font-sans mb-0.5 opacity-85 text-gray-500">Usaha</div>
                    <div className="text-xs md:text-sm font-bold text-black">{waliKelasNote.sosialUsaha || "B"}</div>
                  </td>
                  <td className="w-1/6 p-1 text-center font-bold text-[10px] md:text-xs border-r border-black bg-gray-50/50 text-gray-500">
                    <div className="text-[9px] font-sans mb-0.5 opacity-85 text-gray-500">Proses</div>
                    <div className="text-xs md:text-sm font-bold text-black">{waliKelasNote.sosialProses || "B"}</div>
                  </td>
                  <td className="w-1/6 p-1 text-center font-bold text-[10px] md:text-xs bg-gray-50/50 text-gray-500">
                    <div className="text-[9px] font-sans mb-0.5 opacity-85 text-gray-500">Capaian</div>
                    <div className="text-xs md:text-sm font-bold text-black">{waliKelasNote.sosialCapaian || "B"}</div>
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="p-3 text-[11px] md:text-xs leading-relaxed text-justify">
                    <strong className="font-semibold mr-1 text-black">Deskripsi:</strong>
                    <span className="text-gray-800">
                      {waliKelasNote.sosialDeskripsi || "Menunjukkan sikap tolong-menolong, kesopanan santun, serta kerjasama yang baik dengan sesama kawan."}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION B: UMUM */}
        <div className="mb-6 font-serif">
          <h4 className="text-xs md:text-sm font-bold mb-3 uppercase tracking-wide border-b pb-0.5 text-black border-gray-400">
            B. UMUM
          </h4>

          {subjectsOrdered.map((sub, idx) => {
            const name = getOfficialSubjectName(sub, idx);
            const score = getSubjectScore(sub);
            const usahaGrade = getSubjectUsaha(sub);
            const prosesGrade = getSubjectProses(sub);
            const capaianGrade = getSubjectCapaian(sub);
            const desc = getSubjectDescription(sub);

            return (
              <div key={sub} className="page-break-avoid border p-0 mb-4 border-black bg-white text-black">
                <table className="w-full border-collapse border-none">
                  <tbody>
                    <tr className="border-b border-black">
                      <td className="w-[44%] p-3 font-bold text-xs md:text-sm align-middle border-r font-serif border-black text-slate-900">
                        {name}
                      </td>
                      <td className="w-[14%] p-1 text-center font-bold text-[10px] md:text-xs border-r border-black bg-gray-50/50">
                        <div className="text-[9px] font-sans mb-0.5 text-gray-500">Nilai</div>
                        <div className="text-xs md:text-sm font-mono font-bold text-black">{score}</div>
                      </td>
                      <td className="w-[14%] p-1 text-center font-bold text-[10px] md:text-xs border-r border-black bg-gray-50/50">
                        <div className="text-[9px] font-sans mb-0.5 text-gray-500">Usaha</div>
                        <div className="text-xs md:text-sm font-mono text-black">{usahaGrade}</div>
                      </td>
                      <td className="w-[14%] p-1 text-center font-bold text-[10px] md:text-xs border-r border-black bg-gray-50/50">
                        <div className="text-[9px] font-sans mb-0.5 text-gray-500">Proses</div>
                        <div className="text-xs md:text-sm font-mono text-black">{prosesGrade}</div>
                      </td>
                      <td className="w-[14%] p-1 text-center font-bold text-[10px] md:text-xs bg-gray-50/50">
                        <div className="text-[9px] font-sans mb-0.5 text-gray-500">Capaian</div>
                        <div className="text-xs md:text-sm font-mono text-black">{capaianGrade}</div>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={5} className="p-3 text-[10.5px] md:text-xs leading-relaxed text-justify text-slate-850">
                        <strong className="font-semibold mr-1 text-black">Deskripsi Capaian Pembelajaran:</strong>
                        <span>
                          {desc}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>

        {/* SECTION C: PRESENSI */}
        <div className="mb-6 font-serif page-break-avoid">
          <h4 className="text-xs md:text-sm font-bold mb-3 uppercase tracking-wide border-b pb-0.5 text-black border-gray-400">
            C. KETIDAKHADIRAN (PRESENSI)
          </h4>
          <table className="w-full md:w-1/2 border-collapse border text-xs border-black text-black bg-white">
            <tbody>
              <tr className="border-b border-black">
                <td className="border-r py-3 px-3 border-black text-gray-700 font-medium">Sakit (S)</td>
                <td className="py-3 px-3 text-center font-bold font-mono w-28 text-black">
                  {waliKelasNote.sakit || 0} hari
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r py-3 px-3 border-black text-gray-700 font-medium">Izin (I)</td>
                <td className="py-3 px-3 text-center font-bold font-mono w-28 text-black">
                  {waliKelasNote.izin || 0} hari
                </td>
              </tr>
              <tr>
                <td className="border-r py-3 px-3 border-black text-gray-700 font-medium">Tanpa Keterangan (Alpa)</td>
                <td className="py-3 px-3 text-center font-bold font-mono w-28 text-red-650 font-semibold">
                  {waliKelasNote.alpa || 0} hari
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SECTION D: CATATAN WALI KELAS */}
        <div className="mb-10 font-serif page-break-avoid">
          <h4 className="text-xs md:text-sm font-bold mb-3 uppercase tracking-wide border-b pb-0.5 text-black border-gray-400">
            D. CATATAN PERKEMBANGAN WALI KELAS
          </h4>
          <div className="border p-4 text-[11px] md:text-xs leading-relaxed text-justify bg-gray-50/50 italic border-black text-slate-900 font-medium">
            "{waliKelasNote.catatan || "Ananda memiliki kelakuan baik dan bersemangat tinggi dalam menuntut ilmu. Tingkatkan terus di masa depan."}"
          </div>
        </div>

        {/* Signatures section aligned side-by-side */}
        <div className="text-xs mt-8 space-y-12 font-serif page-break-avoid text-black">
          {/* Wali Kelas and Parent side-by-side */}
          <div className="grid grid-cols-2 text-center gap-4">
            <div>
              <p className="mb-16 text-black font-semibold">
                <span className="invisible block">&nbsp;</span>
                Orang Tua/Wali Siswa
              </p>
              <div className="border-b inline-block w-44 pb-0.5 text-center border-black">
                &nbsp;
              </div>
            </div>
            <div>
              <p className="mb-16 text-black">Pangkal Pinang, 17 Juni 2026<br /><span className="font-semibold">Wali Kelas Kelas {student.kelas}</span></p>
              <div className="font-bold inline-block border-b pb-0.5 px-4 text-center border-black text-black">
                {waliKelas ? waliKelas.name : "___________________________"}
              </div>
            </div>
          </div>

          {/* Underneath: Kepala sekolah centring */}
          <div className="text-center pt-4">
            <div className="max-w-md mx-auto justify-center text-black">
              <p className="mb-16 uppercase font-bold tracking-wide text-black">
                Mengetahui,<br />Kepala Sekolah
              </p>
              <div className="font-bold inline-block border-b pb-0.5 px-6 border-black text-black">
                {principal.name}
              </div>
              <p className="text-[10px] text-gray-500 font-mono mt-1 font-bold">NIP. {principal.nip}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
