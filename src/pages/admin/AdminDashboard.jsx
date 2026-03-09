import { useEffect, useState } from "react";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../api/userApi";

import "./Home.css";

export default function Home() {
  const [users, setUsers] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [editingId, setEditingId] = useState(null);

  /* =========================
     FETCH USERS
  ========================= */

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      console.error("Fetch users error:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* =========================
     HANDLE INPUT
  ========================= */

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  /* =========================
     SUBMIT FORM
  ========================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateUser(editingId, form);
        setEditingId(null);
      } else {
        await createUser(form);
      }

      setForm({
        name: "",
        email: "",
        phone: "",
      });

      fetchUsers();
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  /* =========================
     EDIT USER
  ========================= */

  const handleEdit = (user) => {
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
    });

    setEditingId(user._id);
  };

  /* =========================
     DELETE USER
  ========================= */

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  /* =========================
     UI
  ========================= */

  return (
    <div className="page">
      <div className="card">
        <h1>Dermify User Management</h1>

        {/* FORM */}

        <form onSubmit={handleSubmit} className="form">
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            required
          />

          <button type="submit">
            {editingId ? "Update User" : "Add User"}
          </button>
        </form>

        {/* TABLE */}

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>

                <td>
                  <button onClick={() => handleEdit(user)}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(user._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
