import axios from "axios";
import { Task } from "../models/Task";

const API_URL = "http://localhost:3000/api/tasks";

export const taskService = {
  async update(id: string, data: Partial<Task>) {
    const token = localStorage.getItem("token");
    const res = await axios.put(`${API_URL}/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },
};
