import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import "./Home.css";

export default function Home() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const fetchUsers = async () => {
    const res = await axiosClient.get("/users");
    setUsers(res.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axiosClient.post("/users", form);
    setForm({ name: "", email: "", phone: "" });
    fetchUsers();
  };

  return (
    <div className="page">
      <div className="card">
        <h1>Thông tin người dùng</h1>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}