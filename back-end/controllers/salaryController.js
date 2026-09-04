import Salary from "../models/Salary.js";
import Employee from "../models/Employee.js";

const addSalary = async (req, res) => {
    try {
        const { employeeId, basicSalary, allowances, deductions, payDate } = req.body;

        const totalSalary = parseInt(basicSalary) + parseInt(allowances) - parseInt(deductions);

        const newSalary = new Salary({
            employeeId,
            basicSalary,
            allowances,
            deductions,
            netSalary: totalSalary,
            payDate,
        });
        await newSalary.save();

        res.status(200).json({
            success: true,
            salary: newSalary,
        });
    } catch (error) {
        console.log('ADD SALARY ERROR:', error);
        return res.status(500).json({ success: false, error: "add salary server error" });
    }
};

const getSalaries = async (req, res) => {
    try {
        const { employeeId } = req.params;
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