import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <header>
      <div>
        <h3>{user.fullName || "User"}</h3>
        <span>{user.role || ""}</span>
      </div>

      <button onClick={handleLogout}>
        Logout
      </button>
    </header>
  );
}