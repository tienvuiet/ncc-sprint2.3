import { Navigate, Outlet } from "react-router-dom";

type User = {
  role_name: "admin" | "user";
};

const AdminGuard = () => {
  const rawUser = localStorage.getItem("currentUser");
  const currentUser: User | null = rawUser ? JSON.parse(rawUser) : null;

  if (!currentUser || currentUser.role_name !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminGuard;
