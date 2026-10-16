import Meeting from "../models/Meeting.js";
import User from "../models/User.mjs";
import { createNotificationForUser } from "./notificationController.js";

// Parse "YYYY-MM-DD" (or any date input) as LOCAL midnight to avoid
// UTC-shift bugs: new Date("2026-10-16") is UTC midnight, then
// setHours(0,0,0,0) shifts it to the previous day in UTC+ timezones.
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
  if (isNaN(d.getTime())) return d;
  // input had a time component — normalize to local midnight
  d.setHours(0, 0, 0, 0);
  return d;
};

const createMeeting = async (req, res) => {
  try {
    if (req.user?.role !== "admin") return res.status(403).json({ success: false, error: "Only admin can create meetings" });
    const { title, description = "", date, startTime, endTime, type = "business_meeting", location = "", department = null, participants = [] } = req.body;
    if (!title || !date || !startTime || !endTime) return res.status(400).json({ success: false, error: "title, date, startTime, endTime required" });

    const d = parseLocalDay(date);
    if (isNaN(d.getTime())) return res.status(400).json({ success: false, error: "Invalid date" });

    const meeting = await Meeting.create({
      title: String(title).trim(),
      description: String(description ?? "").trim(),
      date: d,
      startTime,
      endTime,
      type,
      location: String(location ?? "").trim(),
      department: department || null,
      createdBy: req.user._id,
      participants: participants || [],
    });

    // notify participants (or all users if no participants specified)
    try {
      let targets = participants;
      if (!targets || targets.length === 0) {
        const all = await User.find({}).select("_id");
        targets = all.map(u => u._id);
      }
      await Promise.all(
        targets.slice(0, 100).map(uid =>
          createNotificationForUser({
            userId: uid,
            title: `New ${type.replace("_", " ")}: ${title}`,
            message: `${title} on ${d.toDateString()} ${startTime}-${endTime}${location ? " @ " + location : ""}`,
            variant: "info",
            link: req.user.role === "admin" ? "/admin-dashboard/calendar" : "/employee-dashboard/calendar",
            relatedId: meeting._id,
          })
        )
      );
    } catch (e) {}

    return res.status(201).json({ success: true, meeting });
  } catch (error) {
    console.log("CREATE MEETING ERROR:", error);
    if (error?.name === "ValidationError" && error?.message) {
      return res.status(400).json({ success: false, error: error.message });
    }
    if (error?.name === "CastError") {
      return res.status(400).json({ success: false, error: `Invalid value for ${error.path}` });
    }
    return res.status(500).json({ success: false, error: error?.message || "create meeting server error" });
  }
};

const getMeetings = async (req, res) => {
  try {
    const { month, date, type, department } = req.query;
    let filter = {};
    if (month) {
      const [y, m] = month.split("-").map(Number);
      const start = new Date(y, m - 1, 1); start.setHours(0, 0, 0, 0);
      const end = new Date(y, m, 0, 23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    } else if (date) {
      const dayStart = parseLocalDay(date);
      const dayEnd = new Date(dayStart); dayEnd.setHours(23, 59, 59, 999);
      filter.date = { $gte: dayStart, $lte: dayEnd };
    }
    if (type) filter.type = type;
    if (department) filter.department = department;

    const meetings = await Meeting.find(filter)
      .populate("department", "dep_name")
      .populate("createdBy", "name email")
      .sort({ date: 1, startTime: 1 });

    return res.status(200).json({ success: true, meetings });
  } catch (error) {
    console.log("GET MEETINGS ERROR:", error);
    return res.status(500).json({ success: false, error: "get meetings server error" });
  }
};

const getMeeting = async (req, res) => {
  try {
    const m = await Meeting.findById(req.params.id).populate("department", "dep_name").populate("createdBy", "name email");
    if (!m) return res.status(404).json({ success: false, error: "Meeting not found" });
    return res.status(200).json({ success: true, meeting: m });
  } catch (error) {
    console.log("GET MEETING ERROR:", error);
    return res.status(500).json({ success: false, error: "get meeting server error" });
  }
};

const updateMeeting = async (req, res) => {
  try {
    if (req.user?.role !== "admin") return res.status(403).json({ success: false, error: "Only admin" });
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ success: false, error: "Not found" });

    const fields = ["title", "description", "date", "startTime", "endTime", "type", "location", "department", "participants", "color"];
    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        if (f === "date") {
          const d = parseLocalDay(req.body[f]);
          if (isNaN(d.getTime())) throw new Error("Invalid date");
          meeting[f] = d;
        } else if (f === "department" && (req.body[f] === "" || req.body[f] === undefined)) {
          meeting[f] = null;
        } else meeting[f] = req.body[f];
      }
    });
    await meeting.save();
    return res.status(200).json({ success: true, meeting });
  } catch (error) {
    console.log("UPDATE MEETING ERROR:", error);
    if (error?.message === "Invalid date") return res.status(400).json({ success: false, error: "Invalid date" });
    if (error?.name === "ValidationError" && error?.message) {
      return res.status(400).json({ success: false, error: error.message });
    }
    if (error?.name === "CastError") {
      return res.status(400).json({ success: false, error: `Invalid value for ${error.path}` });
    }
    return res.status(500).json({ success: false, error: error?.message || "update meeting server error" });
  }
};

const deleteMeeting = async (req, res) => {
  try {
    if (req.user?.role !== "admin") return res.status(403).json({ success: false, error: "Only admin" });
    const m = await Meeting.findByIdAndDelete(req.params.id);
    if (!m) return res.status(404).json({ success: false, error: "Not found" });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.log("DELETE MEETING ERROR:", error);
    return res.status(500).json({ success: false, error: "delete meeting server error" });
  }
};

export { createMeeting, getMeetings, getMeeting, updateMeeting, deleteMeeting };
