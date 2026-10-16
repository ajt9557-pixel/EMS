import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import { createNotificationForUser } from "./notificationController.js";

// Parse a day input as LOCAL midnight. Plain `new Date("YYYY-MM-DD")` is
// UTC midnight, so setHours(0,0,0,0) shifts it a day back in UTC+ zones.
// "YYYY-MM-DD" strings are built directly as local midnight instead.
const parseLocalDay = (input) => {
  if (typeof input === "string") {
    const m = input.slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) {
      const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
      d.setHours(0, 0, 0, 0);
      return d;
    }
  }
  const d = new Date(input);
  d.setHours(0, 0, 0, 0);
  return d;
};

const normalizeDate = (d) => parseLocalDay(d);

const endOfDay = (d) => {
  const nd = new Date(d);
  nd.setHours(23, 59, 59, 999);
  return nd;
};

const calcStatus = (checkInDate) => {
  const lateThreshold = 9 * 60 + 15; // 09:15 in minutes
  const mins = checkInDate.getHours() * 60 + checkInDate.getMinutes();
  return mins > lateThreshold ? "late" : "present";
};

const checkIn = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) return res.status(404).json({ success: false, error: "No employee profile linked to this account" });

    const today = normalizeDate(new Date());
    let record = await Attendance.findOne({ employeeId: employee._id, date: today });

    if (record && record.checkIn) {
      return res.status(400).json({ success: false, error: "Already checked in today" });
    }

    const now = new Date();
    const status = calcStatus(now);

    if (!record) {
      record = new Attendance({
        employeeId: employee._id,
        userId: req.user._id,
        date: today,
        checkIn: now,
        status,
      });
    } else {
      record.checkIn = now;
      record.status = status;
    }

    await record.save();
    const populated = await record.populate([
      { path: "employeeId", select: "employeeId department", populate: { path: "department", select: "dep_name" } },
      { path: "userId", select: "name email profilePicture" },
    ]);

    return res.status(201).json({ success: true, attendance: populated });
  } catch (error) {
    console.log("CHECKIN ERROR:", error);
    if (error.code === 11000) return res.status(400).json({ success: false, error: "Already checked in today" });
    return res.status(500).json({ success: false, error: "check-in server error" });
  }
};

const checkOut = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) return res.status(404).json({ success: false, error: "No employee profile linked" });

    const today = normalizeDate(new Date());
    const record = await Attendance.findOne({ employeeId: employee._id, date: today });

    if (!record || !record.checkIn) return res.status(400).json({ success: false, error: "You have not checked in today" });
    if (record.checkOut) return res.status(400).json({ success: false, error: "Already checked out today" });

    const now = new Date();
    record.checkOut = now;
    const diffMs = now - new Date(record.checkIn);
    record.workHours = Math.max(0, +(diffMs / (1000 * 60 * 60)).toFixed(2));

    await record.save();
    const populated = await record.populate([
      { path: "employeeId", select: "employeeId department", populate: { path: "department", select: "dep_name" } },
      { path: "userId", select: "name email profilePicture" },
    ]);

    return res.status(200).json({ success: true, attendance: populated });
  } catch (error) {
    console.log("CHECKOUT ERROR:", error);
    return res.status(500).json({ success: false, error: "check-out server error" });
  }
};

const getMyAttendance = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) return res.status(404).json({ success: false, error: "No employee profile" });

    const limit = Math.min(parseInt(req.query.limit) || 31, 100);
    const month = req.query.month; // YYYY-MM
    let filter = { employeeId: employee._id };
    if (month) {
      const [y, m] = month.split("-").map(Number);
      const start = parseLocalDay(new Date(y, m - 1, 1));
      const end = endOfDay(new Date(y, m, 0));
      filter.date = { $gte: start, $lte: end };
    }

    const records = await Attendance.find(filter).sort({ date: -1 }).limit(limit);
    const today = normalizeDate(new Date());
    const todayRecord = await Attendance.findOne({ employeeId: employee._id, date: today });

    return res.status(200).json({ success: true, records, todayRecord });
  } catch (error) {
    console.log("GET MY ATTENDANCE ERROR:", error);
    return res.status(500).json({ success: false, error: "get my attendance server error" });
  }
};

const getAllAttendance = async (req, res) => {
  try {
    if (req.user?.role !== "admin") return res.status(403).json({ success: false, error: "Only admin can view all attendance" });

    const { date, department, employeeId, month } = req.query;
    let filter = {};
    if (date) {
      // day range (not exact instant) so TZ-shifted midnights still match
      const dayStart = parseLocalDay(date);
      filter.date = { $gte: dayStart, $lte: endOfDay(dayStart) };
    } else if (month) {
      const [y, m] = month.split("-").map(Number);
      const start = parseLocalDay(new Date(y, m - 1, 1));
      const end = endOfDay(new Date(y, m, 0));
      filter.date = { $gte: start, $lte: end };
    }

    if (employeeId) filter.employeeId = employeeId;

    let query = Attendance.find(filter)
      .populate({
        path: "employeeId",
        select: "employeeId department",
        populate: [
          { path: "department", select: "dep_name" },
          { path: "userId", select: "name email profilePicture" },
        ],
      })
      .populate("userId", "name email profilePicture")
      .sort({ date: -1, checkIn: -1 });

    let records = await query;

    if (department) {
      records = records.filter(r => String(r.employeeId?.department?._id || r.employeeId?.department) === String(department));
    }

    // summary
    const total = records.length;
    const present = records.filter(r => r.status === "present").length;
    const late = records.filter(r => r.status === "late").length;
    const absent = records.filter(r => r.status === "absent").length;
    const excused = records.filter(r => r.status === "excused").length;

    return res.status(200).json({ success: true, records, summary: { total, present, late, absent, excused } });
  } catch (error) {
    console.log("GET ALL ATTENDANCE ERROR:", error);
    return res.status(500).json({ success: false, error: "get all attendance server error" });
  }
};

const getAttendanceByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const records = await Attendance.find({ employeeId })
      .populate({
        path: "employeeId",
        populate: [
          { path: "department", select: "dep_name" },
          { path: "userId", select: "name email profilePicture" },
        ],
      })
      .sort({ date: -1 });
    return res.status(200).json({ success: true, records });
  } catch (error) {
    console.log("GET BY EMPLOYEE ERROR:", error);
    return res.status(500).json({ success: false, error: "get employee attendance server error" });
  }
};

const markAttendanceAdmin = async (req, res) => {
  try {
    if (req.user?.role !== "admin") return res.status(403).json({ success: false, error: "Only admin" });
    const { employeeId, date, status = "present", checkIn, checkOut, note = "" } = req.body;
    if (!employeeId || !date) return res.status(400).json({ success: false, error: "employeeId and date required" });

    const emp = await Employee.findById(employeeId);
    if (!emp) return res.status(404).json({ success: false, error: "Employee not found" });

    const normDate = parseLocalDay(date);
    if (isNaN(normDate.getTime())) return res.status(400).json({ success: false, error: "Invalid date" });
    const dayEnd = endOfDay(normDate);
    let rec = await Attendance.findOne({ employeeId, date: { $gte: normDate, $lte: dayEnd } });
    if (rec) {
      rec.status = status;
      if (checkIn) rec.checkIn = new Date(checkIn);
      if (checkOut) rec.checkOut = new Date(checkOut);
      if (note !== undefined) rec.note = note;
      if (rec.checkIn && rec.checkOut) {
        const diff = new Date(rec.checkOut) - new Date(rec.checkIn);
        rec.workHours = Math.max(0, +(diff / 3600000).toFixed(2));
      }
      await rec.save();
    } else {
      rec = await Attendance.create({
        employeeId,
        userId: emp.userId,
        date: normDate,
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        status,
        note,
      });
    }

    try {
      await createNotificationForUser({
        userId: emp.userId,
        title: "Attendance updated",
        message: `Your attendance for ${normDate.toDateString()} marked as ${status}`,
        variant: status === "late" ? "warning" : status === "absent" ? "error" : status === "excused" || status === "on-leave" ? "info" : "success",
        link: "/employee-dashboard/attendance",
        relatedId: rec._id,
      });
    } catch (e) {}

    return res.status(201).json({ success: true, attendance: rec });
  } catch (error) {
    console.log("MARK ATTENDANCE ADMIN ERROR:", error);
    if (error?.name === "ValidationError" && error?.message) {
      return res.status(400).json({ success: false, error: error.message });
    }
    if (error?.name === "CastError") {
      return res.status(400).json({ success: false, error: `Invalid value for ${error.path}` });
    }
    return res.status(500).json({ success: false, error: error?.message || "mark attendance server error" });
  }
};

const deleteAttendance = async (req, res) => {
  try {
    if (req.user?.role !== "admin") return res.status(403).json({ success: false, error: "Only admin" });
    const { id } = req.params;
    const rec = await Attendance.findByIdAndDelete(id);
    if (!rec) return res.status(404).json({ success: false, error: "Not found" });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.log("DELETE ATTENDANCE ERROR:", error);
    return res.status(500).json({ success: false, error: "delete attendance server error" });
  }
};

export { checkIn, checkOut, getMyAttendance, getAllAttendance, getAttendanceByEmployee, markAttendanceAdmin, deleteAttendance };
