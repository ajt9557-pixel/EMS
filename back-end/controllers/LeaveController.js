import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';

const addLeave = async (req, res) => {
    try {
        const { userId, employeeId, leaveType, startDate, endDate, reason } = req.body;
        const targetUserId = userId || req.user?._id;
        if (!targetUserId) {
            return res.status(400).json({ success: false, error: "User ID is required" });
        }
        if (!leaveType || !startDate || !endDate || !reason) {
            return res.status(400).json({ success: false, error: "leaveType, startDate, endDate and reason are required" });
        }
        const validTypes = ['sick', 'casual', 'maternity', 'paternity'];
        if (!validTypes.includes(leaveType)) {
            return res.status(400).json({ success: false, error: "Invalid leaveType" });
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ success: false, error: "Invalid startDate or endDate" });
        }
        if (end < start) {
            return res.status(400).json({ success: false, error: "endDate must be on or after startDate" });
        }

        if (String(targetUserId) !== String(req.user?._id) && req.user?.role !== 'admin') {
            return res.status(403).json({ success: false, error: "Not authorized to create leave for another user" });
        }

        const employee = await Employee.findOne({ userId: targetUserId });
        if (!employee) {
            return res.status(404).json({ success: false, error: "No employee profile is linked to this user" });
        }
        if (!reason.trim()) return res.status(400).json({ success: false, error: "Reason cannot be empty" });

        const overlapping = await Leave.findOne({
            employeeId: employee._id,
            status: { $in: ['pending', 'approved'] },
            startDate: { $lte: end },
            endDate: { $gte: start }
        });
        if (overlapping) {
            return res.status(400).json({ success: false, error: "You already have a pending/approved leave overlapping these dates" });
        }

        const newLeave = new Leave({
            employeeId: employee._id,
            leaveType,
            startDate: start,
            endDate: end,
            reason: reason.trim(),
        });

        await newLeave.save();

        return res.status(201).json({
            success: true,
            leave: newLeave,
        });
    } catch (error) {
        console.log('ADD LEAVE ERROR:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, error: error.message });
        }
        return res.status(500).json({ success: false, error: "add leave server error" });
    }
}

const getMyLeaves = async (req, res) => {
    try {
        const employee = await Employee.findOne({ userId: req.user._id });
        if (!employee) {
            return res.status(404).json({ success: false, error: "No employee profile is linked to this account" });
        }
        const leaves = await Leave.find({ employeeId: employee._id })
            .populate("employeeId", "employeeId")
            .sort({ appliedAt: -1 });
        return res.status(200).json({ success: true, leaves });
    } catch (error) {
        console.log('GET MY LEAVES ERROR:', error);
        return res.status(500).json({ success: false, error: "get leaves server error" });
    }
    
};
const getLeaves = async (req, res) => {
        try {
            const leaves = await Leave.find().populate({
                path: "employeeId",
                populate: 
                [{ path: 'department',
                    select: 'dep_name',
                },
                {
                    path: 'userId',
                    select: 'name profilePicture'
                }
            ]
            })
            const validLeaves = leaves.filter(leave => leave.employeeId && leave.employeeId.userId);
            return res.status(200).json({ success: true, leaves: validLeaves });
        } catch (error) {
            console.log('GET LEAVES ERROR:', error);
            return res.status(500).json({ success: false, error: "get leaves server error" });
        }
    }

const getLeavesByEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const leaves = await Leave.find({ employeeId })
            .populate({
                path: "employeeId",
                populate: [
                    { path: 'department', select: 'dep_name' },
                    { path: 'userId', select: 'name email profilePicture' },
                ],
            })
            .sort({ appliedAt: -1 });
        const validLeaves = leaves.filter(l => l.employeeId && l.employeeId.userId);
        return res.status(200).json({ success: true, leaves: validLeaves });
    } catch (error) {
        console.log('GET LEAVES BY EMPLOYEE ERROR:', error);
        return res.status(500).json({ success: false, error: "get employee leaves server error" });
    }
}

const getLeave = async (req, res) => {
    try {
        const { id } = req.params;
        const leave = await Leave.findById(id).populate({
            path: "employeeId",
            populate: [
                { path: 'department', select: 'dep_name' },
                { path: 'userId', select: 'name email profilePicture' },
            ],
        });
        if (!leave) {
            return res.status(404).json({ success: false, error: "Leave not found" });
        }
        if (!leave.employeeId || !leave.employeeId.userId) {
            return res.status(404).json({ success: false, error: "Leave's employee no longer exists" });
        }
        return res.status(200).json({ success: true, leave });
    } catch (error) {
        console.log('GET LEAVE ERROR:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, error: "Invalid leave ID" });
        }
        return res.status(500).json({ success: false, error: "get leave server error" });
    }
};

const updateLeave = async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ success: false, error: "Only admin can update leave status" });
        }
        const leave = await Leave.findById(req.params.id);
        if(!leave) {
            return res.status(404).json({ success: false, error: "Leave not found" });
        }
        const valid = ['pending', 'approved', 'rejected'];
        if (!valid.includes(req.body.status)) {
            return res.status(400).json({ success: false, error: "Invalid status" });
        }
        if (leave.status !== 'pending') {
            return res.status(400).json({ success: false, error: `Leave already ${leave.status}` });
        }
        leave.status = req.body.status;
        if(req.body.status === 'approved') {
            leave.approvedAt = Date.now();
            leave.rejectedAt = undefined;
        }
        if(req.body.status === 'rejected') {
            leave.rejectedAt = Date.now();
            leave.approvedAt = undefined;
        }
        leave.updatedAt = Date.now();
        await leave.save();
        return res.status(200).json({ success: true, leave });
    }
    catch (error) {
        console.log('UPDATE LEAVE ERROR:', error);
        return res.status(500).json({ success: false, error: "update leave server error" });
    }
}

export { addLeave, getMyLeaves , getLeaves, getLeave, updateLeave, getLeavesByEmployee };
