import { useEffect, useState } from "react";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../api/userApi";

import "./Home.css";

export default function Home() {

  /* =========================
     STATE
  ========================= */

  const [users, setUsers] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [editingId, setEditingId] = useState(null);

  const [toast, setToast] = useState(null);

  /* =========================
     TOAST FUNCTION
  ========================= */

  const showToast = (type, message) => {

    setToast({ type, message });

    setTimeout(() => {
      setToast(null);
    }, 3000);

  };

  /* =========================
     FETCH USERS
  ========================= */

  const fetchUsers = async () => {
    try {

      const res = await getUsers();
      setUsers(res.data);

    } catch (err) {

      showToast("error", "Failed to fetch users");

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
        showToast("success", "User updated successfully");

      } else {

        await createUser(form);
        showToast("success", "User created successfully");

      }

      resetForm();
      fetchUsers();

    } catch (err) {

      showToast(
        "error",
        err.response?.data?.message || "Something went wrong"
      );

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

    if (!window.confirm("Delete this user?")) return;

    try {

      const res = await deleteUser(id);

      showToast("success", res.data.message);

      fetchUsers();

    } catch (err) {

      showToast(
        "error",
        err.response?.data?.message || "Delete failed"
      );

    }
  };

  /* =========================
     RESET FORM
  ========================= */

  const resetForm = () => {

    setForm({
      name: "",
      email: "",
      phone: "",
    });

    setEditingId(null);
  };

  /* =========================
     UI
  ========================= */

  return (
    <div className="page">

      <div className="card">

        <h1>Dermify User Management</h1>

        {toast && (
          <div className={`toast ${toast.type}`}>
            {toast.message}
          </div>
        )}

        <form className="form" onSubmit={handleSubmit}>

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
          />

          <button type="submit">
            {editingId ? "Update User" : "Create User"}
          </button>

        </form>

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

                  <button
                    className="edit"
                    onClick={() => handleEdit(user)}
                  >
                    Edit
                  </button>

                  <button
                    className="delete"
                    onClick={() => handleDelete(user._id)}
                  >
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