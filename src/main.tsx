import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import dbData from './data/db.json';

// Keep reference to original fetch
const originalFetch = window.fetch;

// Determine if we should use local localStorage mock API
// We use mock API if on *.github.io, if protocol is file:, or if there is no server running
const isStaticHost = 
  window.location.hostname.includes('github.io') || 
  window.location.hostname.includes('gmpg.io') ||
  window.location.protocol === 'file:';

// Initialize localStorage with db.json seed data if empty
function initializeLocalStorage() {
  if (!localStorage.getItem('smart_sts_db')) {
    localStorage.setItem('smart_sts_db', JSON.stringify(dbData));
  }
}

// Wrapper to simulate fetch for /api/* requests on static deployments
const localFetchInterception = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const urlStr = typeof input === 'string' ? input : (input as any).url || '';
  
  // Only intercept /api/ requests
  if (!urlStr.includes('/api/')) {
    return originalFetch(input, init);
  }

  initializeLocalStorage();
  const getDB = () => JSON.parse(localStorage.getItem('smart_sts_db') || '{}');
  const saveDB = (data: any) => localStorage.setItem('smart_sts_db', JSON.stringify(data));

  const path = urlStr.startsWith('http') 
    ? new URL(urlStr).pathname 
    : urlStr.split('?')[0];
    
  const method = init?.method?.toUpperCase() || 'GET';
  const body = init?.body ? JSON.parse(init.body as string) : null;

  // Let's add an artificial lag for realism
  await new Promise(resolve => setTimeout(resolve, 80));

  try {
    // 1. POST /api/login
    if (path === '/api/login' && method === 'POST') {
      const { username, password } = body || {};
      const db = getDB();
      const teacher = db.teachers.find(
        (t: any) => t.username.toLowerCase() === username?.toLowerCase() && t.password === password
      );
      if (!teacher) {
        return new Response(JSON.stringify({ error: "Kombinasi pengguna dan kata sandi salah." }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({
        id: teacher.id,
        name: teacher.name,
        username: teacher.username,
        subject: teacher.subject,
        isWaliKelas: teacher.isWaliKelas || false,
        kelas: teacher.kelas || ""
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // 2. GET /api/teachers
    if (path === '/api/teachers' && method === 'GET') {
      const db = getDB();
      return new Response(JSON.stringify(db.teachers), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // POST /api/teachers
    if (path === '/api/teachers' && method === 'POST') {
      const { name, username, password, subject, isWaliKelas, kelas } = body || {};
      const db = getDB();
      const exists = db.teachers.some((t: any) => t.username.toLowerCase() === username?.toLowerCase());
      if (exists) {
        return new Response(JSON.stringify({ error: "Username sudah digunakan." }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const newTeacher = {
        id: "t_" + Date.now(),
        name,
        username,
        password,
        subject,
        isWaliKelas: !!isWaliKelas,
        kelas: kelas || ""
      };
      db.teachers.push(newTeacher);
      saveDB(db);
      return new Response(JSON.stringify(newTeacher), { status: 201, headers: { 'Content-Type': 'application/json' } });
    }

    // PUT /api/teachers/:id
    if (path.startsWith('/api/teachers/') && method === 'PUT') {
      const id = path.split('/').pop();
      const { name, username, password, subject, isWaliKelas, kelas } = body || {};
      const db = getDB();
      const index = db.teachers.findIndex((t: any) => t.id === id);
      if (index === -1) {
        return new Response(JSON.stringify({ error: "Guru tidak ditemukan." }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }
      db.teachers[index] = { ...db.teachers[index], name, username, password, subject, isWaliKelas: !!isWaliKelas, kelas: kelas || "" };
      saveDB(db);
      return new Response(JSON.stringify(db.teachers[index]), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // DELETE /api/teachers/:id
    if (path.startsWith('/api/teachers/') && method === 'DELETE') {
      const id = path.split('/').pop();
      if (id === 't1') {
        return new Response(JSON.stringify({ error: "Akun Super Admin utama tidak boleh dihapus." }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const db = getDB();
      db.teachers = db.teachers.filter((t: any) => t.id !== id);
      saveDB(db);
      return new Response(JSON.stringify({ message: "Guru berhasil dihapus." }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // 3. GET /api/students
    if (path === '/api/students' && method === 'GET') {
      const db = getDB();
      return new Response(JSON.stringify(db.students), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // POST /api/students
    if (path === '/api/students' && method === 'POST') {
      const { name, nisn, kelas } = body || {};
      const db = getDB();
      const exists = db.students.some((s: any) => s.nisn === nisn);
      if (exists) {
        return new Response(JSON.stringify({ error: "Siswa dengan NISN ini sudah terdaftar." }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const newStudent = { id: "s_" + Date.now(), nisn, name, kelas };
      db.students.push(newStudent);
      saveDB(db);
      return new Response(JSON.stringify(newStudent), { status: 201, headers: { 'Content-Type': 'application/json' } });
    }

    // PUT /api/students/:id
    if (path.startsWith('/api/students/') && method === 'PUT') {
      const id = path.split('/').pop();
      const { name, nisn, kelas } = body || {};
      const db = getDB();
      const index = db.students.findIndex((s: any) => s.id === id);
      if (index === -1) {
        return new Response(JSON.stringify({ error: "Siswa tidak ditemukan." }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }
      db.students[index] = { ...db.students[index], name, nisn, kelas };
      saveDB(db);
      return new Response(JSON.stringify(db.students[index]), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // DELETE /api/students/:id
    if (path.startsWith('/api/students/') && method === 'DELETE') {
      const id = path.split('/').pop();
      const db = getDB();
      db.students = db.students.filter((s: any) => s.id !== id);
      db.grades = db.grades.filter((g: any) => g.studentId !== id);
      if (db.walikelas_notes && db.walikelas_notes[id!]) {
        delete db.walikelas_notes[id!];
      }
      saveDB(db);
      return new Response(JSON.stringify({ message: "Siswa berhasil dihapus." }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // 4. GET /api/grades
    if (path === '/api/grades' && method === 'GET') {
      const db = getDB();
      return new Response(JSON.stringify(db.grades), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // POST /api/grades
    if (path === '/api/grades' && method === 'POST') {
      const { studentId, subject, score, tps, teacherName, usaha, proses, capaian, deskripsi } = body || {};
      const db = getDB();
      const index = db.grades.findIndex((g: any) => g.studentId === studentId && g.subject === subject);
      const updatedGrade = {
        studentId,
        subject,
        score: Number(score),
        tps,
        usaha: usaha || "B",
        proses: proses || "B",
        capaian: capaian || "B",
        deskripsi: deskripsi || "",
        lastUpdatedBy: teacherName || "Guru Mata Pelajaran",
        lastUpdatedAt: new Date().toISOString()
      };
      if (index !== -1) {
        db.grades[index] = updatedGrade;
      } else {
        db.grades.push(updatedGrade);
      }
      saveDB(db);
      return new Response(JSON.stringify(updatedGrade), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // 5. GET /api/walikelas/notes
    if (path === '/api/walikelas/notes' && method === 'GET') {
      const db = getDB();
      return new Response(JSON.stringify(db.walikelas_notes || {}), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // POST /api/walikelas/notes
    if (path === '/api/walikelas/notes' && method === 'POST') {
      const { studentId, sakit, izin, alpa, catatan, spiritualUsaha, spiritualProses, spiritualCapaian, spiritualDeskripsi, sosialUsaha, sosialProses, sosialCapaian, sosialDeskripsi } = body || {};
      const db = getDB();
      if (!db.walikelas_notes) db.walikelas_notes = {};
      db.walikelas_notes[studentId] = {
        sakit: Number(sakit || 0),
        izin: Number(izin || 0),
        alpa: Number(alpa || 0),
        catatan: catatan || "",
        spiritualUsaha: spiritualUsaha || "B",
        spiritualProses: spiritualProses || "B",
        spiritualCapaian: spiritualCapaian || "B",
        spiritualDeskripsi: spiritualDeskripsi || "",
        sosialUsaha: sosialUsaha || "B",
        sosialProses: sosialProses || "B",
        sosialCapaian: sosialCapaian || "B",
        sosialDeskripsi: sosialDeskripsi || ""
      };
      saveDB(db);
      return new Response(JSON.stringify({ studentId, ...db.walikelas_notes[studentId] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // 6. GET /api/tps
    if (path === '/api/tps' && method === 'GET') {
      const db = getDB();
      return new Response(JSON.stringify(db.tujuan_pembelajaran_templates || {}), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // POST /api/tps
    if (path === '/api/tps' && method === 'POST') {
      const { subject, tpText } = body || {};
      const db = getDB();
      if (!db.tujuan_pembelajaran_templates) db.tujuan_pembelajaran_templates = {};
      if (!db.tujuan_pembelajaran_templates[subject]) db.tujuan_pembelajaran_templates[subject] = [];
      const newTP = { id: "tp_" + Date.now(), text: tpText };
      db.tujuan_pembelajaran_templates[subject].push(newTP);
      saveDB(db);
      return new Response(JSON.stringify(newTP), { status: 201, headers: { 'Content-Type': 'application/json' } });
    }

    // DELETE /api/tps/:subject/:tpId
    if (path.startsWith('/api/tps/') && method === 'DELETE') {
      const parts = path.split('/');
      const tpId = parts.pop();
      const subject = decodeURIComponent(parts.pop() || '');
      const db = getDB();
      if (db.tujuan_pembelajaran_templates && db.tujuan_pembelajaran_templates[subject]) {
        db.tujuan_pembelajaran_templates[subject] = db.tujuan_pembelajaran_templates[subject].filter((tp: any) => tp.id !== tpId);
        saveDB(db);
        return new Response(JSON.stringify({ message: "TP berhasil dihapus." }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ error: "TP tidak ditemukan." }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    // 6.5 GET /api/settings
    if (path === '/api/settings' && method === 'GET') {
      const db = getDB();
      const principalName = db.settings?.principalName || "Ustadz H. Ir. Abdul Muhyi, M.Pd";
      const principalNip = db.settings?.principalNip || "19780512 200501 1 002";
      const format = db.settings?.format || {
        semesterName: "Ganjil",
        tahunPelajaran: "2026/2027",
        fontSize: "11pt",
        showLogo: false,
        showSpiritual: true,
        showSosial: true,
        showAttendance: true,
        showCatatan: true,
        fontFamily: "Times New Roman"
      };
      return new Response(JSON.stringify({ principalName, principalNip, format }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // POST /api/settings
    if (path === '/api/settings' && method === 'POST') {
      const { principalName, principalNip, format } = body || {};
      const db = getDB();
      if (!db.settings) db.settings = {};
      db.settings.principalName = principalName || "Ustadz H. Ir. Abdul Muhyi, M.Pd";
      db.settings.principalNip = principalNip || "19780512 200501 1 002";
      if (format) {
        db.settings.format = {
          semesterName: format.semesterName || "Ganjil",
          tahunPelajaran: format.tahunPelajaran || "2026/2027",
          fontSize: format.fontSize || "11pt",
          showLogo: format.showLogo !== undefined ? format.showLogo : false,
          showSpiritual: format.showSpiritual !== undefined ? format.showSpiritual : true,
          showSosial: format.showSosial !== undefined ? format.showSosial : true,
          showAttendance: format.showAttendance !== undefined ? format.showAttendance : true,
          showCatatan: format.showCatatan !== undefined ? format.showCatatan : true,
          fontFamily: format.fontFamily || "Times New Roman"
        };
      }
      saveDB(db);
      return new Response(JSON.stringify({ success: true, settings: db.settings }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // 7. GET /api/summary
    if (path === '/api/summary' && method === 'GET') {
      const db = getDB();
      const subjectsList = ["IPA", "IPS", "PPKN", "Matematika", "Bahasa Indonesia", "Bahasa Inggris", "Bahasa Arab", "Informatika", "Prakarya", "PJOK", "PAI"];
      const totalStudents = db.students.length;
      const subjectProgress = subjectsList.map(sub => {
        const filledGradesForSub = db.grades.filter((g: any) => g.subject === sub);
        const completedCount = filledGradesForSub.length;
        const percentage = totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0;
        const teacher = db.teachers.find((t: any) => t.subject === sub);
        return {
          subject: sub,
          completed: completedCount,
          total: totalStudents,
          percent: percentage,
          teacherName: teacher ? teacher.name : "Belum Ditugaskan"
        };
      });

      const classes = Array.from(new Set(db.students.map((s: any) => s.kelas))) as string[];
      const classProgress = classes.map(cls => {
        const studentsInClass = db.students.filter((s: any) => s.kelas === cls);
        const totalGradesNeeded = studentsInClass.length * subjectsList.length;
        let gradesFilledCount = 0;
        const studentIds = studentsInClass.map((s: any) => s.id);
        db.grades.forEach((g: any) => {
          if (studentIds.includes(g.studentId)) {
            gradesFilledCount++;
          }
        });
        const percent = totalGradesNeeded > 0 ? Math.round((gradesFilledCount / totalGradesNeeded) * 100) : 0;
        const waliKelas = db.teachers.find((t: any) => t.isWaliKelas && t.kelas === cls);
        return {
          kelas: cls,
          studentCount: studentsInClass.length,
          filledGrades: gradesFilledCount,
          totalNeeded: totalGradesNeeded,
          percent,
          waliKelasName: waliKelas ? waliKelas.name : "Belum Ditugaskan"
        };
      });

      return new Response(JSON.stringify({
        totalStudents,
        totalTeachers: db.teachers.length,
        subjectProgress,
        classProgress,
        lastUpdate: new Date().toISOString()
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: "Endpoint not found in client-side mock" }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error("Local mock server error:", error);
    return new Response(JSON.stringify({ error: "Internal client-server error in mock mode" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

// Implement global window.fetch fallback strategy
window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const urlStr = typeof input === 'string' ? input : (input as any).url || '';

  // Non-API fetches are bypassed
  if (!urlStr.includes('/api/')) {
    return originalFetch(input, init);
  }

  // If we're on a static host like GitHub Pages, go straight to mock
  if (isStaticHost) {
    return localFetchInterception(input, init);
  }

  // Otherwise try the real API - if it fails with network error or returns a 404/Not Found indicating static server fallback, intercept
  try {
    const res = await originalFetch(input, init);
    // Express dev server/production is fine, but the user's hosting might serve static 404 HTML for missing API routes
    const contentType = res.headers.get('content-type') || '';
    if (res.status === 404 || contentType.includes('text/html')) {
      return localFetchInterception(input, init);
    }
    return res;
  } catch (error) {
    // Connection refused / Network error -> transparently fallback to LocalStorage!
    console.warn("Failed to reach real API, falling back to client-side localStorage simulation:", error);
    return localFetchInterception(input, init);
  }
};

// Mount application
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

