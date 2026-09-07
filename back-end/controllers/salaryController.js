import Salary from "../models/Salary.js";
import Employee from "../models/Employee.js";

const addSalary = async (req, res) => {
    try {
        const { employeeId, basicSalary, allowances, deductions, payDate } = req.body;
        if (!employeeId || basicSalary === undefined || !payDate) {
            return res.status(400).json({ success: false, error: "employeeId, basicSalary and payDate are required" });
        }
        const emp = await Employee.findById(employeeId);
        if (!emp) return res.status(404).json({ success: false, error: "Employee not found" });
        const basic = Number(basicSalary);
        const allow = allowances === undefined || allowances === "" ? 0 : Number(allowances);
        const deduct = deductions === undefined || deductions === "" ? 0 : Number(deductions);
        if (!Number.isFinite(basic) || basic < 0) return res.status(400).json({ success: false, error: "Invalid basicSalary" });
        if (!Number.isFinite(allow) || allow < 0) return res.status(400).json({ success: false, error: "Invalid allowances" });
        if (!Number.isFinite(deduct) || deduct < 0) return res.status(400).json({ success: false, error: "Invalid deductions" });
        const pay = new Date(payDate);
        if (isNaN(pay.getTime())) return res.status(400).json({ success: false, error: "Invalid payDate" });

        const totalSalary = basic + allow - deduct;

        const newSalary = new Salary({
            employeeId,
            basicSalary: basic,
            allowances: allow,
            deductions: deduct,
            netSalary: totalSalary,
            payDate: pay,
        });
        await newSalary.save();

        return res.status(201).json({
            success: true,
            salary: newSalary,
        });
    } catch (error) {
        console.log('ADD SALARY ERROR:', error);
        if (error.name === 'ValidationError' || error.name === 'CastError') return res.status(400).json({ success: false, error: error.message });
        return res.status(500).json({ success: false, error: "add salary server error" });
    }
};

const getSalaries = async (req, res) => {
    try {
        const { employeeId } = req.params;
        if (!employeeId || !/^[0-9a-fA-F]{24}$/.test(employeeId)) {
            const empByUser = await Employee.findOne({ userId: employeeId });
            if (empByUser) {
                const salaries = await Salary.find({ employeeId: empByUser._id })
                    .populate("employeeId", "employeeId")
                    .sort({ payDate: -1 });
                const data = salaries.map((s) => ({
                    _id: s._id,
                    employeeId: s.employeeId?.employeeId,
                    basicSalary: s.basicSalary,
                    allowances: s.allowances,
                    deductions: s.deductions,
                    netSalary: s.netSalary,
                    payDate: s.payDate,
                }));
                return res.status(200).json({ success: true, salaries: data });
            }
            return res.status(400).json({ success: false, error: "Invalid employee ID" });
        }
        let salaries = await Salary.find({ employeeId })
            .populate("employeeId", "employeeId")
            .sort({ payDate: -1 });
        if (salaries.length === 0) {
            const employee = await Employee.findOne({ userId: employeeId });
            if (employee) {
                salaries = await Salary.find({ employeeId: employee._id })
                    .populate("employeeId", "employeeId")
                    .sort({ payDate: -1 });
            }
        }
        const data = salaries.map((s) => ({
            _id: s._id,
            employeeId: s.employeeId?.employeeId,
            basicSalary: s.basicSalary,
            allowances: s.allowances,
            deductions: s.deductions,
            netSalary: s.netSalary,
            payDate: s.payDate,
        }));
        return res.status(200).json({ success: true, salaries: data });
    } catch (error) {
        console.log('GET SALARIES ERROR:', error);
        if (error.name === 'CastError') return res.status(400).json({ success: false, error: "Invalid employee ID" });
        return res.status(500).json({ success: false, error: "get salaries server error" });
    }
};

const getMySalaries = async (req, res) => {
    try {
        const employee = await Employee.findOne({ userId: req.user._id });
        if (!employee) {
            return res.status(404).json({ success: false, error: "No employee profile is linked to this account" });
        }
        const salaries = await Salary.find({ employeeId: employee._id })
            .populate("employeeId", "employeeId")
            .sort({ payDate: -1 });
        const data = salaries.map((s) => ({
            _id: s._id,
            employeeId: s.employeeId?.employeeId,
            basicSalary: s.basicSalary,
            allowances: s.allowances,
            deductions: s.deductions,
            netSalary: s.netSalary,
            payDate: s.payDate,
        }));
        return res.status(200).json({ success: true, salaries: data });
    } catch (error) {
        console.log('GET MY SALARIES ERROR:', error);
        return res.status(500).json({ success: false, error: "get my salaries server error" });
    }
};

export { addSalary, getSalaries, getMySalaries };