import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outPath = path.resolve(__dirname, '../Project_Documentation.pdf');

// Colors
const C = {
  primary: '#0f172a',
  accent: '#2563eb',
  accentLight: '#eff6ff',
  gray900: '#0f172a',
  gray700: '#334155',
  gray500: '#64748b',
  gray200: '#e2e8f0',
  gray100: '#f1f5f9',
  amberBg: '#fffbeb',
  amberBorder: '#f59e0b',
  amberText: '#92400e',
  greenBg: '#f0fdf4',
  greenBorder: '#22c55e',
};

const doc = new PDFDocument({
  size: 'A4',
  bufferPages: true,
  margins: { top: 50, bottom: 50, left: 50, right: 50 },
  info: {
    Title: 'EMS - Employee Management System - Tech Stack & SDLC Documentation',
    Author: 'EMS Project',
    Subject: 'Front-End and Back-End Uses with SDLC Reference',
    CreationDate: new Date('2026-09-11'),
  }
});

doc.pipe(fs.createWriteStream(outPath));

// Helpers
let yCursor = 0;
function ensureSpace(needed, newPageHeader) {
  if (doc.y + needed > 785) {
    doc.addPage();
    if (newPageHeader) drawPageHeader();
  }
}
function drawPageHeader() {
  doc.save().rect(0, 0, 595, 6).fill(C.accent).restore();
}
function drawFooter() {
  const bottom = doc.page.height - 30;
  doc.save().fontSize(7).fillColor(C.gray500).text(`EMS — Employee Management System  •  Generated 2026-09-11  •  front-end/package.json | back-end/package.json | back-end/index.mjs`, 50, bottom, { align: 'center', width: 495 }).restore();
  doc.save().rect(0, 836, 595, 6).fill(C.accent).restore();
}
// initial header
drawPageHeader();

// Title block
doc.save().rect(50, 30, 495, 85).fill(C.primary).restore();
doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(20).text('EMS — Employee Management System', 50, 42, { align: 'center', width: 495 });
doc.font('Helvetica').fontSize(9).fillColor('#cbd5e1').text('Full-Stack Documentation  •  Front-End & Back-End Uses  •  SDLC Reference (Steps 1–6)', 50, 68, { align: 'center', width: 495 });
doc.fontSize(7).fillColor('#94a3b8').text('React 19 + Vite + Tailwind  •  Node.js + Express 5 + MongoDB + Mongoose  •  JWT Auth  •  Vercel', 50, 85, { align: 'center', width: 495 });
doc.fillColor(C.gray900);

// Subtitle meta
doc.moveDown(1.2);
doc.font('Helvetica').fontSize(7).fillColor(C.gray500).text('File references use pattern file_path:line_number  •  Verified against workspace on 2026-09-11  •  Project root: C:\\yeyeyeygames\\project', { align: 'center' });
doc.fillColor(C.gray900);

// Utility to draw section title
function sectionTitle(num, title, subtitle) {
  ensureSpace(45);
  doc.moveDown(0.8);
  const y = doc.y;
  doc.save().roundedRect(50, y, 495, 26, 4).fill(C.accent).restore();
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10).text(`${num}  ${title}`, 60, y + 8, { width: 475 });
  if (subtitle) {
    doc.font('Helvetica').fontSize(6).fillColor('#dbeafe').text(subtitle, 60, y + 17, { width: 475 });
  }
  doc.fillColor(C.gray900);
  doc.moveDown(1.2);
  // need to move y past rect
  doc.y = y + 32;
}
function subHeading(text) {
  ensureSpace(20);
  doc.font('Helvetica-Bold').fontSize(8).fillColor(C.accent).text(text.toUpperCase(), { characterSpacing: 0.5 });
  doc.moveDown(0.3);
  doc.save().moveTo(50, doc.y).lineTo(545, doc.y).strokeColor(C.gray200).lineWidth(0.5).stroke().restore();
  doc.moveDown(0.5);
  doc.fillColor(C.gray700);
}
function bodyText(text, opts = {}) {
  doc.font('Helvetica').fontSize(7.5).fillColor(C.gray700).text(text, { align: 'justify', lineGap: 2, ...opts });
  doc.moveDown(0.4);
}
function bulletList(items) {
  items.forEach(it => {
    ensureSpace(14);
    const x = 58;
    doc.save().circle(x, doc.y + 4, 1.8).fill(C.accent).restore();
    doc.font('Helvetica').fontSize(7.5).fillColor(C.gray700).text(it, 65, doc.y - 1, { width: 475, lineGap: 1.5 });
    doc.moveDown(0.2);
  });
  doc.moveDown(0.2);
}
function tag(text) {
  const w = doc.widthOfString(text) + 8;
  const y = doc.y;
  doc.save().roundedRect(doc.x, y - 1, w, 10, 3).fill(C.gray100).strokeColor(C.gray200).stroke().restore();
  doc.font('Helvetica').fontSize(6).fillColor(C.gray500).text(text, doc.x + 4, y + 1, { width: w - 8, lineBreak: false });
  doc.moveDown(0.6);
}

// Simple table drawer
function drawTable(headers, rows, colWidths, options = {}) {
  const startX = 50;
  const tableWidth = colWidths.reduce((a, b) => a + b, 0);
  const headerH = 18;
  const rowH = options.compact ? 13 : 16;
  // Check if enough space, else new page
  const needed = headerH + rows.length * rowH + 10;
  ensureSpace(needed > 400 ? 120 : needed);

  let y = doc.y;
  // Header bg
  doc.save().roundedRect(startX, y, tableWidth, headerH, 3).fill(C.primary).restore();
  let x = startX;
  headers.forEach((h, i) => {
    doc.font('Helvetica-Bold').fontSize(6.5).fillColor('#ffffff').text(h, x + 4, y + 6, { width: colWidths[i] - 8, align: i === 0 ? 'left' : 'left' });
    x += colWidths[i];
  });
  y += headerH;
  // Rows
  rows.forEach((row, ri) => {
    if (y + rowH > 782) {
      doc.addPage(); drawPageHeader();
      y = 50;
      // redraw header on new page
      doc.save().roundedRect(startX, y, tableWidth, headerH, 3).fill(C.primary).restore();
      x = startX;
      headers.forEach((h, i) => {
        doc.font('Helvetica-Bold').fontSize(6.5).fillColor('#ffffff').text(h, x + 4, y + 6, { width: colWidths[i] - 8 });
        x += colWidths[i];
      });
      y += headerH;
    }
    const isAlt = ri % 2 === 1;
    if (isAlt) doc.save().rect(startX, y, tableWidth, rowH).fill(C.gray100).restore();
    else doc.save().rect(startX, y, tableWidth, rowH).fill('#ffffff').restore();
    // border bottom
    doc.save().moveTo(startX, y + rowH).lineTo(startX + tableWidth, y + rowH).strokeColor(C.gray200).lineWidth(0.3).stroke().restore();

    x = startX;
    row.forEach((cell, ci) => {
      const isFirstCol = ci === 0;
      doc.font(isFirstCol ? 'Helvetica-Bold' : 'Helvetica').fontSize(6.5).fillColor(C.gray700).text(cell, x + 4, y + 4.5, { width: colWidths[ci] - 8, lineBreak: false, ellipsis: true });
      // vertical separator
      if (ci < row.length - 1) {
        doc.save().moveTo(x + colWidths[ci], y).lineTo(x + colWidths[ci], y + rowH).strokeColor(C.gray200).lineWidth(0.3).stroke().restore();
      }
      x += colWidths[ci];
    });
    y += rowH;
  });
  doc.y = y + 6;
  doc.fillColor(C.gray900);
}

// ==================== CONTENT ====================

// --- Intro ---
subHeading('Document Purpose');
bodyText('This document inventories the actual Front-End and Back-End technologies used in the EMS workspace (verified from package manifests and source) and reproduces the 6-step SDLC reference you provided. Step 3 is intentionally left as a placeholder pending instructor approval, honoring the gate stated in Step 2 (“Get Instructor Approval Before Moving to Step 3”). All file references follow the pattern file_path:line_number for direct navigation.');
bodyText('Primary sources: front-end/package.json:1, front-end/vite.config.js:1, front-end/tailwind.config.js:1, front-end/src/App.jsx:1, back-end/package.json:1, back-end/index.mjs:1, back-end/models/User.mjs:1, back-end/models/Employee.js:1, back-end/db/db.mjs:1, README.md:1.');

// --- FRONT END ---
sectionTitle('01', 'Front-End Uses', 'front-end/package.json:1  •  front-end/vite.config.js:1  •  front-end/tailwind.config.js:1');
subHeading('Stack Overview');
bodyText('The front-end is a Single-Page Application (SPA) built with React 19 and Vite, styled with Tailwind CSS v4, routed with React Router v7, and deployed on Vercel. Axios handles HTTP, and react-data-table-component powers tabular views for employees, departments, and leaves.');

// Front-end table
drawTable(
  ['Technology', 'Version', 'Purpose & Usage', 'Reference'],
  [
    ['React + React-DOM', '19.2.8', 'UI framework, component model', 'front-end/package.json:16-18'],
    ['Vite', '8.2.0', 'Dev server & production bundler', 'front-end/vite.config.js:1'],
    ['@vitejs/plugin-react', '6.0.5', 'JSX/Fast Refresh for Vite', 'front-end/package.json:24'],
    ['React Router DOM', '7.18.2', 'Client routing & protected routes', 'front-end/src/App.jsx:1'],
    ['Tailwind CSS', '4.3.3', 'Utility-first styling', 'front-end/tailwind.config.js:1'],
    ['@tailwindcss/vite / postcss', '4.3.3', 'Vite integration for Tailwind', 'front-end/vite.config.js:3'],
    ['Axios', '1.19.0', 'HTTP client for API calls', 'front-end/src/utils/'],
    ['react-data-table', '8.8.0', 'Sortable/filterable tables', 'front-end/package.json:18'],
    ['Supabase JS', '2.112.0', 'Installed; ready for BaaS/auth', 'front-end/package.json:14'],
    ['Vercel', '—', 'Front-end hosting & CDN', 'front-end/vercel.json:1'],
  ],
  [110, 70, 170, 145]
);

subHeading('Structure & Key Files');
bulletList([
  'Entry: front-end/index.html:16 → src/main.jsx:1 (BrowserRouter + AuthProvider + ThemeContextProvider) → src/App.jsx:27 (Routes)',
  'Pages: src/pages/Login.jsx, AdminDashboard.jsx, EmployeeDashboard.jsx — role-gated via src/privateRoutes.jsx:1 and src/utils/RoleBaseRoutes.jsx:1',
  'Components: src/components/employee/, department/, salar/, Leaves/, dashboard/, EmployeeDashboard/ — role-specific views',
  'State/Context: src/context/authcontext.jsx:1 (JWT), src/context/ThemeContext.jsx:1 (light/dark)',
  'Config: front-end/vite.config.js:5 (base + plugins), front-end/tailwind.config.js:7 (fontFamily extensions), front-end/.env.local (VITE_API_URL)',
]);

subHeading('Routing Highlights');
bodyText('App.jsx defines /login, /unauthorized, /admin-dashboard/* (9 nested routes: employee, department-dashboard, add-department, salary-dashboard, Leaves, Profile, Settings, etc. — see front-end/src/App.jsx:40-57) and /employee-dashboard/* (6 nested routes: Profile, Leaves, salary selfService, add-leave, Settings — see front-end/src/App.jsx:60-73). PrivateRoutes + RoleBaseRoutes enforce JWT + role = admin|user.');

// --- BACK END ---
sectionTitle('02', 'Back-End Uses', 'back-end/package.json:1  •  back-end/index.mjs:1  •  back-end/models/:1');

subHeading('Stack Overview');
bodyText('The back-end is a Node.js + Express 5 REST API backed by MongoDB Atlas via Mongoose 9, with JWT-based authentication, bcrypt password hashing, and Multer for profile image uploads. CORS is scoped via FRONTEND_URL, and the service is deployed as Vercel Serverless Functions (back-end/api/). A minimal legacy server/ folder (Express 5 + Mongoose, CommonJS — server/package.json:1) exists but the primary API is back-end/.');

drawTable(
  ['Technology', 'Version', 'Purpose & Usage', 'Reference'],
  [
    ['Node.js (ESM)', '24.x', 'Runtime, type: module', 'back-end/package.json:12'],
    ['Express', '5.2.1', 'HTTP framework, middleware', 'back-end/index.mjs:3'],
    ['Mongoose', '9.9.1', 'ODM for MongoDB Atlas', 'back-end/db/db.mjs:1'],
    ['MongoDB Atlas', '—', 'Document DB (MONGODB_URL)', 'back-end/index.mjs:14'],
    ['jsonwebtoken', '9.0.3', 'JWT sign/verify (JWT_KEY)', 'back-end/index.mjs:15'],
    ['bcryptjs', '3.0.2', 'Password hashing (salt 10)', 'back-end/models/User.mjs:17'],
    ['Multer', '2.2.0', 'Multipart / profile uploads', 'back-end/index.mjs:21'],
    ['CORS + Dotenv', '2.8.6 / 17.4.2', 'CORS + env config', 'back-end/index.mjs:19'],
    ['Nodemon', '3.1.14', 'Dev auto-reload', 'back-end/package.json:23'],
    ['Vercel Functions', '—', 'Serverless deployment', 'back-end/vercel.json:1'],
  ],
  [110, 70, 170, 145]
);

subHeading('API & Data Model');
drawTable(
  ['Method', 'Endpoint', 'Description', 'File'],
  [
    ['POST', '/api/auth/login', 'Login, return JWT (role)', 'back-end/routes/auth.js:1'],
    ['GET/POST', '/api/employee', 'List / create employees', 'back-end/routes/employee.js:1'],
    ['GET/PUT/DEL', '/api/employee/:id', 'View / update / delete', 'back-end/routes/employee.js:1'],
    ['GET', '/api/employee/dept/:id', 'Employees by department', 'back-end/routes/employee.js:1'],
    ['GET', '/api/department', 'List/create departments', 'back-end/routes/department.js:1'],
    ['GET/POST', '/api/leave / /add', 'List / apply leave', 'back-end/routes/Leave.js:1'],
    ['GET', '/api/leave/my-leaves', 'User leave history', 'back-end/routes/Leave.js:1'],
    ['GET', '/api/salary', 'List salaries', 'back-end/routes/Salary.js:1'],
    ['GET', '/api/settings', 'User settings', 'back-end/routes/Settings.js:1'],
    ['STATIC', '/uploads/*', 'Serve profile images', 'back-end/index.mjs:21'],
  ],
  [70, 125, 155, 145],
  { compact: true }
);
bodyText('Mongoose models (back-end/models/): User.mjs:4 (name, email, password, role=user|admin, pre-save bcrypt), Employee.js:4 (userId→User, employeeId, department→Department, salary, dob/gender), Department.js, Leave.js (status pending/approved/rejected), Salary.js. Connection helper back-end/db/db.mjs:5 reuses connectionPromise with 15s serverSelectionTimeoutMS. Middleware: back-end/middleware/authmiddleware (JWT verification), back-end/controllers/ (business logic), uploads stored in back-end/uploads/ and served via express.static with maxAge 1d and dotfiles deny (back-end/index.mjs:21).');

subHeading('Configuration');
bulletList([
  'Env: MONGODB_URL, JWT_KEY, PORT, FRONTEND_URL / VITE_API_URL (see back-end/.env.example:1 and back-end/index.mjs:14-18)',
  'Security: CORS origin = FRONTEND_URL split by comma or * (back-end/index.mjs:19), JSON limit 1mb (back-end/index.mjs:20)',
  'Startup: export default app + conditional listen if main module (back-end/index.mjs:31-36) — enables both Vercel and node direct run',
]);

// --- SDLC REFERENCE ---
sectionTitle('03', 'SDLC Reference — Steps 1 to 6', 'Your 6-step framework reproduced verbatim • Step 3 is a placeholder pending approval');

// Step 1
subHeading('Step 1: Define the Problem (Full Problem Scenario)');
bodyText('Your reference text (reproduced verbatim):', { continued: false });
bulletList([
  '1. Describe the full real-world situation in detail.',
  '2. Explain the exact problem you want to solve.',
  '3. Identify who will use the system and how it will help them in real life.',
]);
doc.font('Helvetica-Oblique').fontSize(7.5).fillColor(C.gray700).text('EMS Instantiation (project-specific interpretation for instructor review):', { lineGap: 2 });
doc.moveDown(0.3);
bodyText('In many organizations, employee records, department assignments, salary disbursements, and leave requests are managed manually via spreadsheets or paper forms. This causes duplicate data, slow approvals, lost leave applications, and inconsistent salary tracking. HR/Admin staff lack a centralized dashboard, while employees have no self-service to check leave status or salary history. The problem to solve is building a centralized, role-based Employee Management System that digitizes employee onboarding (with profile photos), department structuring, salary management, and a complete leave lifecycle (apply → review → approve/reject) with auditability.');
bodyText('Users: (1) Admin/HR — creates/edits departments (back-end/routes/department.js:1), manages employees (front-end/src/components/employee/List.jsx:1, back-end/routes/employee.js:1), sets salaries (back-end/routes/Salary.js:1), reviews all leaves (front-end/src/components/Leaves/Table.jsx:1); (2) Employee (role=user) — logs in via JWT (back-end/routes/auth.js:1, back-end/models/User.mjs:8), views profile (front-end/src/components/EmployeeDashboard/MyProfile.jsx:1), applies for leave (front-end/src/components/Leaves/AddLeave.jsx:1), tracks leave history (front-end/src/components/Leaves/Leavelist.jsx:1), views own salary (front-end/src/components/salar/SalaryList.jsx:1). Benefits: single source of truth in MongoDB, faster approvals, transparency, and reduced HR overhead.');
// flow hint
doc.save().roundedRect(50, doc.y, 495, 28, 4).fill(C.accentLight).strokeColor(C.accent).stroke().restore();
doc.font('Helvetica').fontSize(6.5).fillColor(C.accent).text('↗  Information Flow:  Employee (React form → Axios → Express → Mongoose → MongoDB)  →  Admin reviews via Dashboard (DataTable)  →  Status update persisted  →  Employee sees updated history (my-leaves).  Auth via JWT on every /api/* request.', 60, doc.y + 4, { width: 475, align: 'center' });
doc.y += 32;

// Step 2
subHeading('Step 2: Design the Solution (Algorithm & Structure)');
bulletList([
  '1. Algorithm Declaration: Clearly state and explain the algorithms and data structures you will use to solve the problem.',
  '2. Create step-by-step logic plans using tools like pseudocode, and flowcharts / object class diagrams.',
  '3. Outline how information will flow through your system.',
  '4. Get Instructor Approval Before Moving to Step 3',
]);
bodyText('Declared Algorithms & Data Structures (EMS):');
bulletList([
  'Auth: bcryptjs genSalt(10)+hash on User pre-save (back-end/models/User.mjs:17) + JWT sign/verify (jsonwebtoken 9.0.3); middleware checks Authorization: Bearer <token> for /api/*',
  'CRUD + ODM: Mongoose schemas as domain classes (User, Employee, Department, Leave, Salary) with refs (Employee.userId→User, Employee.department→Department) and enums (role, gender, leave status); indexed unique fields (email, employeeId)',
  'File handling: Multer diskStorage → back-end/uploads/ with static serving (back-end/index.mjs:21); filtering by mimetype and size',
  'Frontend state: Context API (AuthProvider, ThemeContextProvider) + React Router guards (PrivateRoutes, RoleBaseRoutes) + Axios interceptors attaching JWT',
]);
bodyText('Pseudocode — Login & Leave Apply:', { continued: false });
doc.save().roundedRect(50, doc.y, 495, 66, 4).fill('#f8fafc').strokeColor(C.gray200).stroke().restore();
const pY = doc.y + 5;
doc.font('Courier').fontSize(6).fillColor(C.gray700)
  .text('function login(email, password):', 60, pY)
  .text('  user = await User.findOne({email})', 60, pY + 9)
  .text('  if !user or !bcrypt.compare(password, user.password) → throw 401', 60, pY + 18)
  .text('  token = jwt.sign({id:user._id, role:user.role}, JWT_KEY, {expiresIn:"1d"})', 60, pY + 27)
  .text('  return {token, role}', 60, pY + 36)
  .text('function applyLeave(userId, {type, from, to, reason}):', 60, pY + 45)
  .text('  validate dates & overlap → Leave.create({userId, type, status:"pending"}) → notify Admin', 60, pY + 54);
doc.y = pY + 70;
bodyText('Class Diagram (textual placeholder — replace with drawn diagram for submission):');
doc.save().roundedRect(50, doc.y, 495, 52, 4).fill('#f8fafc').strokeColor(C.gray200).stroke().restore();
const cY = doc.y + 5;
doc.font('Courier').fontSize(6).fillColor(C.gray700)
  .text('┌─User──────────────────┐   ┌─Employee──────────────┐   ┌─Department─────────┐', 60, cY)
  .text('│ _id, name, email      │1──│ userId→User, empId    │──→│ _id, name, desc    │', 60, cY + 9)
  .text('│ password(hash), role  │   │ department→Dept,     │   └────────────────────┘', 60, cY + 18)
  .text('└───────────────────────┘   │ salary, dob, gender  │   ┌─Leave──────────────┐', 60, cY + 27)
  .text('         │1                 └───────────────────────┘──→│ userId, type, dates│', 60, cY + 36)
  .text('         └─────────────────────────────────────────────→│ status, reason     │', 60, cY + 45);
doc.y = cY + 56;
bodyText('Information Flow: Browser (React form → Axios with JWT) → Express Router (cors, json, authmiddleware) → Controller → Mongoose Model → MongoDB Atlas → Response → React State/Context → UI update. Upload flow: multipart/form-data → Multer → disk → /uploads static URL stored in DB.');

// Approval gate
ensureSpace(34);
doc.save().roundedRect(50, doc.y, 495, 28, 4).fill(C.amberBg).strokeColor(C.amberBorder).stroke().restore();
doc.font('Helvetica-Bold').fontSize(7.5).fillColor(C.amberText).text('⛔  INSTRUCTOR APPROVAL GATE — Do not proceed to Step 3 until Step 2 is approved.  Step 3 below is an intentional placeholder.', 60, doc.y + 6, { width: 475, align: 'center' });
doc.font('Helvetica').fontSize(6).fillColor(C.amberText).text('Present this document for sign-off; code implementation begins only after approval.', 60, doc.y + 3, { width: 475, align: 'center' });
doc.y += 10;

// Step 3 placeholder
subHeading('Step 3: Code the Program (Implementation) — PLACEHOLDER');
doc.save().roundedRect(50, doc.y, 495, 58, 6).fill('#ffffff').strokeColor(C.gray200).dash(4, { space: 4 }).stroke().restore();
doc.save().rect(50, doc.y, 495, 14).fill(C.gray100).restore();
doc.font('Helvetica-Bold').fontSize(7.5).fillColor(C.gray500).text('PLACEHOLDER — PENDING INSTRUCTOR APPROVAL', 50, doc.y + 4, { align: 'center', width: 495 });
doc.moveDown(0.6);
doc.font('Helvetica').fontSize(7).fillColor(C.gray700).text('Source code implementation will be inserted after approval of Step 2 per your SDLC gate.', 60, doc.y, { width: 475, align: 'center' });
doc.moveDown(0.2);
doc.font('Helvetica').fontSize(6.5).fillColor(C.gray500).text('Planned implementation (not yet executed):', 60, doc.y, { width: 475 });
bulletList([
  'Build program using OOP concepts: Mongoose Models as classes (User, Employee, Department, Leave, Salary) with inheritance via Schema discriminators where applicable; Controllers as service objects.',
  'Front-End: React functional components + hooks + Context (AuthProvider, ThemeContext) fulfilling OOP composition; reusable Table component (react-data-table-component).',
  'Routes mounted in back-end/index.mjs:22-27 and front-end/src/App.jsx:27; status: ⏳ Awaiting Approval.',
]);
doc.save().undash().restore();
doc.fillColor(C.gray700);
bodyText('Your reference text preserved verbatim above: Write the source code using your declared programming language. Build your program using Object-Oriented Programming concepts (classes, objects, inheritance, etc.). No code is included in this placeholder to strictly honor the approval requirement.');

// Step 4
subHeading('Step 4: Test and Debug the Program');
bulletList([
  'Run your program with sample data to check for mistakes or bugs.',
  'Ensure all features work correctly and the system handles errors smoothly.',
]);
bodyText('Planned verification (post-approval): seed test users via back-end/userSeed.mjs:1, manual login as admin/user, CRUD employees/departments, salary assignment, leave apply/approve flows, invalid JWT and role-guard tests (front-end/src/privateRoutes.jsx:1), file upload limits, DB connection failure handling (back-end/db/db.mjs:13, back-end/index.mjs:16). Handle errors with try/catch in controllers and Axios error boundaries in UI.');

// Step 5
subHeading('Step 5: Document the Program');
bulletList([
  'Write clear instructions on how to install, set up, and use your system.',
  'Include code comments explaining how major functions work.',
]);
bodyText('This PDF + README.md:1 together satisfy documentation. Installation: see README.md:59-101 (npm install in back-end/ and front-end/, .env with MONGODB_URL/JWT_KEY, VITE_API_URL, npm run dev). Usage: Admin vs Employee dashboards described in Section 02 and Step 1. Code comments: key functions (User pre-save hook back-end/models/User.mjs:14, connectDB back-end/db/db.mjs:5, Express setup back-end/index.mjs:17-27) will carry inline comments post-implementation.');

// Step 6
subHeading('Step 6: Maintain and Update the Program');
bulletList([
  'List potential future improvements or features for your system.',
  'Explain how the program can be updated when new needs arise.',
]);
bodyText('Potential improvements: pagination + search on DataTables, email notifications on leave status, role-based audit logs, attendance tracking, payroll export (CSV), refresh tokens + httpOnly cookies, rate limiting, unit/integration tests (Jest/Supertest), Dockerization, CI via .github/. Future updates: versioned /api/v2 routes, Mongoose schema migrations, feature flags in Settings (back-end/routes/Settings.js:1), and ThemeContext extension for more themes. Updates flow through Git → Vercel redeploy for both front-end/vercel.json and back-end/vercel.json.');

// --- Appendix ---
sectionTitle('04', 'Appendix — References & Setup', 'Quick setup + file map');

subHeading('Quick Setup (from README.md:59)');
bodyText('Prerequisites: Node.js v18+, MongoDB Atlas. Backend: cd back-end && npm install → create .env (MONGODB_URL, PORT=5000, JWT_KEY) → npm run dev (nodemon --env-file=.env index.mjs). Frontend: cd front-end && npm install → optionally set VITE_API_URL in .env.local → npm run dev (Vite). Open http://localhost:5173. Build: front-end npm run build, back-end npm start. Uploads persist in back-end/uploads/.');

subHeading('File Reference Map');
drawTable(
  ['Path', 'Role', 'Lines'],
  [
    ['front-end/package.json', 'Front manifest', '27 lines'],
    ['front-end/vite.config.js', 'Vite + React + Tailwind', '8 lines'],
    ['front-end/tailwind.config.js', 'Tailwind theme', '17 lines'],
    ['front-end/src/App.jsx', 'Routes & guards', '78 lines'],
    ['front-end/src/main.jsx', 'Entry + providers', '23 lines'],
    ['back-end/package.json', 'Back manifest', '25 lines'],
    ['back-end/index.mjs', 'Express app + routes', '37 lines'],
    ['back-end/db/db.mjs', 'Mongoose connect', '20 lines'],
    ['back-end/models/User.mjs', 'User schema + hash', '27 lines'],
    ['back-end/models/Employee.js', 'Employee schema', '18 lines'],
    ['back-end/vercel.json', 'Serverless config', '—'],
    ['README.md', 'Full documentation', '136 lines'],
  ],
  [150, 200, 145],
  { compact: true }
);

subHeading('Notes');
bulletList([
  'Supabase JS is installed (front-end/package.json:14) but Auth currently uses custom JWT (back-end/models/User.mjs, back-end/routes/auth.js); future migration path is open.',
  'Legacy server/ folder (server/package.json:1, CommonJS) is not the active API — primary is back-end/ (ESM).',
  'No secrets are embedded in this PDF; .env values are referenced by key name only (MONGODB_URL, JWT_KEY).',
  'Generated with pdfkit 0.20.2 (Option A) — Helvetica family, manual table grid, dashed placeholder per Step 3 gate.',
]);

// Final footer on last page
// Add footers to all pages via buffered pages
const range = doc.bufferedPageRange();
for (let i = 0; i < range.count; i++) {
  doc.switchToPage(i);
  drawFooter();
  // page number
  doc.font('Helvetica').fontSize(6).fillColor(C.gray500).text(`Page ${i + 1} of ${range.count}`, 50, doc.page.height - 42, { align: 'right', width: 495 });
}

doc.end();
console.log(`PDF generated at ${outPath}`);
