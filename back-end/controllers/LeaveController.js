import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';

const addLeave = async (req, res) => {
    try {
        const { userId, employeeId, leaveType, startDate, endDate, reason } = req.body;
        const employee = await Employee.findOne({ userId });

        const newLeave = new Leave({
            employeeId: employee._id,
            leaveType,
            startDate,
            endDate,
            reason,
        });

        await newLeave.save();

        res.status(200).json({
            success: true,
            leave: newLeave,
        });
    } catch (error) {
        console.log('ADD LEAVE ERROR:', error);
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

const getLeave = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id).populate({
            path: "employeeId",
            populate: [
                { path: 'department', select: 'dep_name' },
                { path: 'userId', select: 'name email profilePicture' }
            ]
        });
        if (!leave) {
            return res.status(404).json({ success: false, error: "Leave not found" });
        }
        return res.status(200).json({ success: true, leave });
    } catch (error) {
        console.log('GET LEAVE ERROR:', error);
        return res.status(500).json({ success: false, error: "get leave server error" });
    }
};

const updateLeave = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);
        if(!leave) {
            return res.status(404).json({ success: false, error: "Leave not found" });
        }
        const valid = ['pending', 'approved', 'rejected'];
        if (!valid.includes(req.body.status)) {
            return res.status(400).json({ success: false, error: "Invalid status" });
        }
        leave.status = req.body.status;
        if(req.body.status === 'approved') leave.approvedAt = Date.now();
        if(req.body.status === 'rejected') leave.rejectedAt = Date.now();
        leave.updatedAt = Date.now();
        await leave.save();
        return res.status(200).json({ success: true, leave });
    }
    catch (error) {
        console.log('UPDATE LEAVE ERROR:', error);
        return res.status(500).json({ success: false, error: "update leave server error" });
    }
}

export { addLeave, getMyLeaves , getLeaves, getLeave, updateLeave };