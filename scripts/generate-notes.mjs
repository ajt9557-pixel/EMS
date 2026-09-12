import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outPath = path.resolve(__dirname, '../EMS_How_It_Works_Notes.pdf');

const C = {
  primary: '#0f172a', accent: '#2563eb', accentLight: '#eff6ff',
  gray900: '#0f172a', gray700: '#334155', gray500: '#64748b', gray200: '#e2e8f0', gray100: '#f1f5f9',
  amberBg: '#fffbeb', amberBorder: '#f59e0b', amberText: '#92400e',
};

const doc = new PDFDocument({ size: 'A4', bufferPages: true, margins: { top: 48, bottom: 48, left: 48, right: 48 },
  info: { Title: 'EMS - How It Works - Review Notes', Author: 'EMS Project', CreationDate: new Date('2026-09-11') }});
doc.pipe(fs.createWriteStream(outPath));

function drawHeader() { doc.save().rect(0,0,595,6).fill(C.accent).restore(); }
function drawFooter() {
  const b = doc.page.height - 30;
  doc.save().fontSize(7).fillColor(C.gray500).text('EMS — How It Works  •  front-end/src/App.jsx | back-end/index.mjs | back-end/models/  •  2026-09-11', 48, b, { align:'center', width: 499 }).restore();
  doc.save().rect(0,836,595,6).fill(C.accent).restore();
}
drawHeader();

doc.save().rect(48, 28, 499, 82).fill(C.primary).restore();
doc.fillColor('#fff').font('Helvetica-Bold').fontSize(18).text('EMS — How It Works', 48, 38, { align:'center', width: 499 });
doc.font('Helvetica').fontSize(9).fillColor('#cbd5e1').text('Review Notes  •  Employee Management System  •  End-to-End Flow Explained', 48, 62, { align:'center', width: 499 });
doc.fontSize(7).fillColor('#94a3b8').text('React 19 + Vite + Tailwind + Router 7  •  Node + Express 5 + Mongoose 9 + JWT  •  Vercel  •  file_path:line_number refs', 48, 82, { align:'center', width: 499 });
doc.fillColor(C.gray900);
doc.moveDown(1);
doc.font('Helvetica').fontSize(7).fillColor(C.gray500).text('Use these notes to present in 5–7 minutes. Read top-to-bottom: Overview → Front → Back → Data Flow → Demo Script → Q&A.', { align:'center' });
doc.fillColor(C.gray900);

function ensureSpace(n){ if(doc.y+n>788){ doc.addPage(); drawHeader(); } }
function section(num,title,sub){
  ensureSpace(44);
  doc.moveDown(0.7);
  const y=doc.y;
  doc.save().roundedRect(48,y,499,26,4).fill(C.accent).restore();
  doc.fillColor('#fff').font('Helvetica-Bold').fontSize(10).text(`${num}  ${title}`, 58, y+8, { width: 479 });
  if(sub) doc.font('Helvetica').fontSize(6).fillColor('#dbeafe').text(sub,58,y+17,{ width:479 });
  doc.fillColor(C.gray900);
  doc.y=y+32;
}
function subHeading(t){
  ensureSpace(20);
  doc.font('Helvetica-Bold').fontSize(8).fillColor(C.accent).text(t.toUpperCase(),{ characterSpacing:0.4 });
  doc.moveDown(0.25);
  doc.save().moveTo(48,doc.y).lineTo(547,doc.y).strokeColor(C.gray200).lineWidth(0.5).stroke().restore();
  doc.moveDown(0.45);
  doc.fillColor(C.gray700);
}
function body(t, opts={}){
  doc.font('Helvetica').fontSize(7.5).fillColor(C.gray700).text(t,{ align:'justify', lineGap:2, ...opts });
  doc.moveDown(0.35);
}
function bullets(items){
  items.forEach(it=>{
    ensureSpace(14);
    const x=56;
    doc.save().circle(x,doc.y+4,1.7).fill(C.accent).restore();
    doc.font('Helvetica').fontSize(7.5).fillColor(C.gray700).text(it,63,doc.y-1,{ width:478, lineGap:1.5 });
    doc.moveDown(0.15);
  });
  doc.moveDown(0.2);
}
function codeBox(lines){
  const h = lines.length*9 + 10;
  ensureSpace(h+6);
  const y=doc.y;
  doc.save().roundedRect(48,y,499,h,4).fill('#f8fafc').strokeColor(C.gray200).stroke().restore();
  doc.font('Courier').fontSize(6).fillColor(C.gray700);
  lines.forEach((l,i)=> doc.text(l,58,y+5+i*9,{ width:479, lineBreak:false }));
  doc.y=y+h+4;
}
function table(headers, rows, widths, compact=false){
  const startX=48, tableW=widths.reduce((a,b)=>a+b,0), headerH=18, rowH=compact?13:15;
  const needed=headerH+rows.length*rowH+8;
  ensureSpace(needed>380?100:needed);
  let y=doc.y;
  doc.save().roundedRect(startX,y,tableW,headerH,3).fill(C.primary).restore();
  let x=startX;
  headers.forEach((h,i)=>{ doc.font('Helvetica-Bold').fontSize(6.3).fillColor('#fff').text(h,x+4,y+6,{ width:widths[i]-8 }); x+=widths[i]; });
  y+=headerH;
  rows.forEach((row,ri)=>{
    if(y+rowH>785){ doc.addPage(); drawHeader(); y=48; doc.save().roundedRect(startX,y,tableW,headerH,3).fill(C.primary).restore(); x=startX; headers.forEach((h,i)=>{ doc.font('Helvetica-Bold').fontSize(6.3).fillColor('#fff').text(h,x+4,y+6,{ width:widths[i]-8 }); x+=widths[i]; }); y+=headerH; }
    const alt=ri%2===1;
    doc.save().rect(startX,y,tableW,rowH).fill(alt?C.gray100:'#fff').restore();
    doc.save().moveTo(startX,y+rowH).lineTo(startX+tableW,y+rowH).strokeColor(C.gray200).lineWidth(0.3).stroke().restore();
    x=startX;
    row.forEach((cell,ci)=>{
      doc.font(ci===0?'Helvetica-Bold':'Helvetica').fontSize(6.3).fillColor(C.gray700).text(cell,x+4,y+4,{ width:widths[ci]-8, lineBreak:false, ellipsis:true });
      if(ci<row.length-1) doc.save().moveTo(x+widths[ci],y).lineTo(x+widths[ci],y+rowH).strokeColor(C.gray200).lineWidth(0.3).stroke().restore();
      x+=widths[ci];
    });
    y+=rowH;
  });
  doc.y=y+6;
}

// ================= CONTENT =================
section('01','Project Snapshot','README.md:1 • front-end/package.json • back-end/package.json • 1-page for quick recall');
subHeading('What It Is');
body('EMS is a full-stack employee management web app with two dashboards. Admin manages departments, employees (with profile photos), salaries and all leave requests. Employee applies for leave, views leave history, own salary and profile. Deployed on Vercel; data in MongoDB Atlas.');
subHeading('Tech At A Glance');
table(['Layer','Stack','Version','Where'],
[
 ['Front','React + Vite + Tailwind','19.2.8 / 8.2.0 / 4.3.3','front-end/package.json:16, vite.config.js:1'],
 ['Routing','React Router DOM','7.18.2','front-end/src/App.jsx:1'],
 ['HTTP','Axios','1.19.0','front-end/src/utils/api.js:1'],
 ['Table','react-data-table','8.8.0','front-end/package.json:18'],
 ['Back','Node (ESM) + Express','24 / 5.2.1','back-end/package.json:12, index.mjs:3'],
 ['DB','MongoDB + Mongoose','Atlas / 9.9.1','back-end/db/db.mjs:1'],
 ['Auth','JWT + bcryptjs','9.0.3 / 3.0.2','back-end/models/User.mjs:17'],
 ['Upload','Multer','2.2.0','back-end/index.mjs:21'],
 ['Host','Vercel','—','front-end/vercel.json, back-end/vercel.json'],
], [70,175,75,179], true);
body('Legacy folder server/package.json:1 (CommonJS Express+Mongoose) is not the active API — primary is back-end/ (ESM). Supabase JS 2.112.0 is installed (front-end/package.json:14) but Auth uses custom JWT; mention as future option.');

section('02','How Front-End Works','front-end/src/main.jsx:1 → App.jsx:27 → context/authcontext.jsx → components/');
subHeading('Boot Up');
bullets([
 'index.html:16 loads src/main.jsx:1 → ReactDOM.createRoot → BrowserRouter basename / (or /EMS on github.io:9) → AuthProvider (context/authcontext.jsx:13 verifyUser reads localStorage|sessionStorage token:15, GET /api/auth/verify:22) → ThemeContextProvider (ThemeContext.jsx:8 localStorage theme) → App.jsx:27.',
 'AuthProvider exposes useAuth():64 {user, login:46, logout:50, loading}. Login.jsx:25 POST /api/auth/login {email,password} stores token as tokken+token:36 and calls login(user:33) then navigates by role admin→/admin-dashboard, user→/employee-dashboard:40.',
]);
subHeading('Routing & Guards');
bullets([
 'App.jsx:30 public: / → /login, /unauthorized. /admin-dashboard:34 wrapped PrivateRoutes:5 (if loading→Loading...:9, if !user→/login:12) + RoleBaseRoutes:16 (if !requiredRole.includes(user.role)→/unauthorized:16). Nested 9 routes: employee List:42, department List:43, add-department:44, edit:45, salary:46, salary/:id:47, add-employee:50, view:51, edit:52, Leaves Table:53, leave/:id:54, Profile:56, Settings:57.',
 '/employee-dashboard:60 same guards with requiredRole [admin,user]:62. Nested 6 routes: Summary:67, Profile:68, Leaves:69, salary selfService:70, add-leave:71, Settings:72.',
 'Layouts: AdminDashboard.jsx:12 and EmployeeDashboard.jsx:12 use DashboardLayout.jsx:18 (w-64 drawer, mobile hamburger:53) + Adminsidebar.jsx:42 / EmployeeDashboard/Dashboard.jsx:42 + Navbar.jsx:9 logout clears storage.',
]);
subHeading('Data Fetch Pattern');
codeBox([
 'const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000" // utils/api.js:1',
 'const token = localStorage.getItem("token")||sessionStorage.getItem("token")',
 'await axios.get(`${API_URL}/api/employee`, { headers: { authorization: `Bearer ${token}` } })',
 ' // same pattern: AdminSummary.jsx:13, List.jsx:18, DepartmentList.jsx:18, SalaryList.jsx:63',
]);
bullets([
 'Examples: GET /api/employee (List.jsx:23), POST /api/employee/add FormData with image (Add.jsx:37), GET/PUT/DELETE /api/employee/:id (view.jsx:22, edit.jsx:71), GET /api/department (DepartmentList.jsx:23), POST /api/department/add (addDepartment.jsx:20), POST /api/salary/add (salar/Add.jsx:39) via helper fetchDepartments/getEmployees (utils/EmployeeHelper.jsx:9), POST /api/leave (Table.jsx:70 admin all, POST not GET), POST /api/leave/add (AddLeave.jsx:21 with userId:23), GET /api/leave/my-leaves (Leavelist.jsx:40), PUT /api/leave/:id {status} (LeaveDetails.jsx:41) for approve/reject.',
]);

section('03','How Back-End Works','back-end/index.mjs:1 • db/db.mjs:5 • routes/ • controllers/ • models/');
subHeading('Express Setup');
codeBox([
 'import "dotenv/config" // index.mjs:1  — warns if MONGODB_URL/JWT_KEY missing:14',
 'await connectDB() // db.mjs:10 mongoose.connect(MONGODB_URL,{serverSelectionTimeoutMS:15000}) singleton:3',
 'app.use(cors({ origin: FRONTEND_URL?.split(",")||"*", credentials:true })) // index.mjs:19',
 'app.use(express.json({limit:"1mb"})) // :20',
 'app.use("/uploads", express.static(uploadDir,{dotfiles:"deny",maxAge:"1d"})) // :21 uploadDir from employeeController.js:16',
 'app.use("/api/auth", authRoutes)  // :22 — plus /api/department, /employee, /salary, /leave, /settings :23-27',
 'export default app; if(import.meta.url===pathToFileURL(process.argv[1]).href) app.listen(PORT) // :31-36 for Vercel vs node',
]);
subHeading('Auth Flow');
bullets([
 'Model User.mjs:4 {name, email unique lowercase, password, role enum user|admin:8, profilePicture} + pre("save"):14 hash if isModified with bcrypt.genSalt(10):17.',
 'Login controllers/authcontroller.js:6 validates email lower:13, User.findOne:14, bcrypt.compare:19, checks JWT_KEY:23, jwt.sign({id,role},JWT_KEY,{expiresIn:"1d"}):26 returns {tokken,token,user}:28.',
 'Middleware authmiddleware.mjs:7 await connectDB, reads authorization:8, split(" ")[1]:13, jwt.verify:20, User.findById.select("-password"):25 → req.user:30 else 401/404/500.',
 'Routes: POST /api/auth/login (rate limit 10/15min Map: routes/auth.js:7) and GET /api/auth/verify:22.',
]);
subHeading('Models & CRUD');
table(['Model','Key Fields','File'],
[
 ['User','name, email*, password, role user|admin','models/User.mjs:4'],
 ['Department','dep_name* unique, description*','models/Department.js:3'],
 ['Employee','userId→User*, employeeId*, department→Dept*, salary*','models/Employee.js:4'],
 ['Leave','employeeId→Employee, type sick/casual/maternity/paternity, status pending/approved/rejected','models/Leave.js:4'],
 ['Salary','employeeId→Employee, basic, allowances, deductions, net(=basic+allow-deduct)','models/Salary.js:4'],
], [90,285,124], true);
bullets([
 'Department: POST /add dup check regex ^dep$ case-insensitive: departmentController.js:12, GET / sorted createAt:-1:29, DELETE blocks if Employee.countDocuments({department:id})>0:77.',
 'Employee: POST /add (routes/employee.js:9 upload.single("image"), controller:60) validates salaryNum, ObjectId, deptExists:73, dup email/id:80, creates User:92 then Employee:102 rollback User on fail:114; GET / populates userId/department:135; PUT /:id handles partial + deletes old pic:293; DELETE cascades User+Salary+Leave+file:325.',
 'Salary: POST /add computes net basic+allow-deduct:21; GET /my via Employee.findOne({userId:req.user._id}):96; GET /:employeeId handles Employee _id fallback userId:47.',
 'Leave: POST /add validates dates:18, RBAC if userId!=req.user && !admin→403:27, overlap check pending/approved:37; PUT /:id admin only:156, only if pending:167, sets approvedAt/rejectedAt:171; POST / fetches all with populate:86 (POST not GET).',
]);
subHeading('Uploads');
body('uploadDir = path.join(__dirname,"..","uploads"):16 mkdirSync recursive:18. multer.diskStorage:23 destination uploadDir, filename randomUUID||Date.now+ext:28, limit 2MB:36, fileFilter jpeg/png/jpg/webp:37. Served at /uploads. Cleanup unlinkSync on validation/DB errors throughout controller (e.g., :61,122).');

section('04','End-to-End Data Flow','One path to memorize for presentation');
subHeading('Login → Authenticated Request');
codeBox([
 '1. User submits Login.jsx:25 POST /api/auth/login {email,password}',
 '2. authcontroller.js:14 findOne → compare → jwt.sign → {tokken, user:{role}}',
 '3. Client stores token → AuthProvider verifyUser:22 GET /api/auth/verify Bearer',
 '4. Next: axios.get("/api/employee", {headers:{authorization:`Bearer ${token}`}}) → authmiddleware:20 verify → req.user → controller',
]);
body('Example add leave: Employee → AddLeave.jsx:21 POST /api/leave/add {userId, leaveType, startDate, endDate, reason} Bearer → LeaveController:31 finds Employee by userId → 37 overlap check → save status pending → Admin Table.jsx:70 POST /api/leave sees it → LeaveDetails.jsx:41 PUT /api/leave/:id {status:approved} → Employee Leavelist.jsx:40 GET /my-leaves now shows approved. Avatar via /uploads URL fallback to ui-avatars.');
doc.save().roundedRect(48,doc.y,499,24,4).fill(C.accentLight).strokeColor(C.accent).stroke().restore();
doc.font('Helvetica').fontSize(6.5).fillColor(C.accent).text('Flow to narrate: Browser React form → Axios + JWT → Express Router (cors/json/auth) → Controller → Mongoose Model → Mongo Atlas → Response → React Context → UI update.',58,doc.y+5,{ width:479, align:'center' });
doc.y+=28;

section('05','5-Minute Presentation Script','Step 1 → Step 2 → Stack → Demo → Close + Q&A');
subHeading('Talk Track (45s each)');
bullets([
 '(0:00) Problem: "HR tracked employees, departments, salaries, leaves in sheets — duplicates, lost applications, slow approvals. We built a centralized role-based EMS. Admin manages all; Employee self-serves. See README.md:3 and Step 1 in notes."',
 '(0:45) Design: "We declared JWT+bcrypt auth, Mongoose ODM with 5 schemas, REST CRUD, Multer uploads. Class diagram: User 1— Employee — Department, Leave refs Employee. Pseudocode for login and overlap check shown. Flow: React→Axios→Express→Mongoose→Atlas — awaiting instructor approval before coding Step 3."',
 '(1:30) Stack: "Front React 19 Vite Tailwind Router 7 Axios DataTable — vercel.json. Back Node Express 5 Mongoose 9 JWT bcrypt Multer — index.mjs mounts 6 route groups, exports app for Vercel serverless. Cite package.json versions."',
 '(2:15) Demo (live or screenshots): "Login as admin (admin@example.com) → AdminSummary shows totals monthlySalary:38 → Departments list/add/edit → Employees Add FormData with image → Salary Add by dept→employee → Switch to employee → Apply leave sick 2 days → Admin Leaves Table → Approve → Employee history updates. Point to App.jsx routes and Table.jsx:70."',
 '(3:45) Close: "Test plan via userSeed.mjs, middleware guards, CORS split. Docs in PDF+README. Future: pagination, email notify, refresh tokens, tests, Docker. Request approval to implement Step 3 OOP."',
]);
subHeading('Demo Checklist');
bullets([
 'Have .env with MONGODB_URL, JWT_KEY, FRONTEND_URL; run back-end npm run dev and front-end npm run dev (README.md:89).',
 'Seed admin via back-end/userSeed.mjs:4 if DB empty. Prepare two browsers: admin and user.',
 'Prepare Leave overlap test (try same dates) to show controller guard LeaveController.js:37.',
]);

section('06','Q&A Cheat Sheet','Anticipate — answer with file refs');
table(['Question','Short Answer','File Ref'],
[
 ['Why JWT not sessions?','Stateless, Vercel serverless friendly, 1d expiry','authcontroller.js:26, authmiddleware:20'],
 ['Why Mongoose?','Schema validation, refs, unique indexes, timestamps','User.mjs:4, Employee.js:4'],
 ['How file upload?','Multer disk 2MB, uuid name, static /uploads deny dotfiles','employeeController.js:34, index.mjs:21'],
 ['CORS config?','FRONTEND_URL split by comma else * with credentials','index.mjs:19'],
 ['Delete dept with employees?','Blocked, countDocuments check','departmentController.js:77'],
 ['Leave overlap?','Query pending|approved where start<=end && end>=start','LeaveController.js:37'],
 ['Supabase why?','Installed future BaaS, current custom JWT','front-end/package.json:14'],
 ['server/ folder?','Legacy CommonJS prototype, active is back-end/ ESM','server/package.json:1'],
], [135,215,149], true);
bullets([
 'If asked about settings bug: "Known — settingsController.js:18 missed await user.save(), we use working PUT /api/employee/settings/change-password:32 instead."',
 'If asked about POST /api/leave for fetch: "Semantic quirk in routes/Leave.js:11, should be GET; returns populated orphan-filtered:100."',
 'If asked about tests: "Step 4 pending approval — plan Jest/Supertest, seed data, role-guard and invalid ObjectId handling (controllers handle CastError:191)."',
]);

section('07','Appendix — Where to Point','Keep open for live code walk');
table(['What','Path','Lines'],
[
 ['Routes map','front-end/src/App.jsx','27-75'],
 ['Auth context','front-end/src/context/authcontext.jsx','13-44'],
 ['Express app','back-end/index.mjs','14-36'],
 ['DB connect','back-end/db/db.mjs','5-18'],
 ['User hash','back-end/models/User.mjs','14-23'],
 ['Employee schema','back-end/models/Employee.js','4-15'],
 ['Uploads','back-end/controllers/employeeController.js','13-41'],
 ['Leave overlap','back-end/controllers/LeaveController.js','37-42'],
 ['README setup','README.md','59-101'],
], [130,250,119], true);
body('Tip: Show Project_Documentation.pdf page 1 tables for stack proof, then this notes file for flow. Keep both on screen. No secrets in PDFs — .env keys only. Good luck!');

// footers
const range = doc.bufferedPageRange();
for(let i=0;i<range.count;i++){
  doc.switchToPage(i);
  drawFooter();
  doc.font('Helvetica').fontSize(6).fillColor(C.gray500).text(`Page ${i+1} of ${range.count}`,48,doc.page.height-42,{ align:'right', width:499 });
}
doc.end();
console.log(`Notes PDF at ${outPath}`);
