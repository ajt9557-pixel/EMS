import React from 'react'
import {useNavigate} from 'react-router-dom'


export const colums =  [
    {
        name: "SNo.",
        selector: row => row.sno,
        sortable: true,
        center: true
    },
    {
        name: "Emp Id",
        selector: row => row.employeeId,
        sortable: true,
        center: true
    },
    {
        name:"Name",
        selector: row => row.name,
        sortable: true,
        center: true
    },
    {
        name:"Leave Type",
        selector: row => row.leaveType,
        sortable: true,
        center: true
    },
    {
        name:"Department",
        selector: row => row.dep_name,
        sortable: true,
        center: true
    },
    {
        name:"days",
        selector: row => row.days,
        sortable: true,
        center: true
    },
    {
        name:"status",
        selector: row => row.status,
        sortable: true,
        center: true
    },
    {
        name:"Action",
        selector: row => row.action,
        sortable: true,
        center: true
    } 
];

export const LeaveHelper = ({Id}) => {
    const navigate = useNavigate();

    const handleView = (id) => {
        navigate(`/admin-dashboard/leave/${id}`);

    }

    return(
        <button className='text-blue-600' onClick={() => handleView(Id)}>View</button>
    )
};