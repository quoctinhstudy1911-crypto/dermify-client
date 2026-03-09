import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import "./Home.css";

function Home() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axiosClient.get("/users")
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="page">
      <div className="card">
        <h1>Thông tin người dùng</h1>
      </div>
    </div>
  );
}

export default Home;