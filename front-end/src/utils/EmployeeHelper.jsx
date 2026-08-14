import axios from "axios";
import { API_URL } from "./api";

export const fetchDepartments = async () => {
  let departments = [];
  try {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const response = await axios.get(`${API_URL}/api/department`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    if (response.data.success) {
      departments = response.data.departments;
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      alert(error.response.data.error);
    }
  }
  return departments;
};