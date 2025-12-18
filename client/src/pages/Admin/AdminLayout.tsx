import { useEffect, useState } from "react";
import {
  Home,
  Film,
  Users,
  Calendar,
  Ticket,
  DollarSign,
  Newspaper,
  Gift,
  Menu,
  X,
  Settings,
  LogOut,
  BadgePercent,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function AdminLayout() {
  const [open, setOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate = useNavigate();

  // ===== GET CURRENT USER =====
  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
  }, []);

  // ===== SIDEBAR MENU =====
  const menu = [
    { id: "dashboard", label: "Tổng quan", icon: Home, path: "/admin/dashboard" },
    { id: "movies", label: "Phim", icon: Film, path: "/admin/movies" },
    { id: "users", label: "Người dùng", icon: Users, path: "/admin/users" },
    { id: "showtimes", label: "Lịch chiếu", icon: Calendar, path: "/admin/showtimes" },
    { id: "bookings", label: "Đặt vé", icon: Ticket, path: "/admin/bookings" },
    { id: "prices", label: "Giá vé", icon: DollarSign, path: "/admin/prices" },
    { id: "news", label: "Tin tức", icon: Newspaper, path: "/admin/news" },
   
    {
      id: "promotions",
      label: "Khuyến mãi",
      icon: BadgePercent,
      path: "/admin/promotions",
    },
     { id: "festival", label: "Sự kiện", icon: Gift, path: "/admin/festival" },
  ];

  // ===== LOGOUT HANDLER =====
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setShowLogoutModal(false);
    toast.success("Đã đăng xuất thành công");
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* ================= SIDEBAR ================= */}
      <aside
        className={`${
          open ? "w-64" : "w-20"
        } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-gray-700">
          {open && <h2 className="text-xl font-bold">🎬 Manager Cinema</h2>}
          <button
            onClick={() => setOpen(!open)}
            className="p-2 hover:bg-gray-700 rounded"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 py-4 space-y-2">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-3 rounded-lg text-sm transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800"
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {open && <span className="ml-3">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <img
              src={currentUser?.avatar || "https://i.pinimg.com/736x/ee/fd/74/eefd7473905f877d4fe9a2c2a8a61fbe.jpg"}
              alt="avatar"
              className="w-10 h-10 rounded-full border border-white object-cover"
              onError={(e) => {
                e.currentTarget.src = "https://i.pinimg.com/736x/ee/fd/74/eefd7473905f877d4fe9a2c2a8a61fbe.jpg";
              }}
            />

            {open && (
              <div>
                <p className="font-semibold">
                  {currentUser?.last_name || "Admin"}
                </p>
                <p className="text-xs text-gray-400">
                  {currentUser?.email || "administrator"}
                </p>
              </div>
            )}
          </div>

          {open && (
            <div className="mt-4 space-y-2">
              <button className="w-full flex cursor-pointer items-center gap-2 text-gray-300 hover:text-white">
                <Settings className="w-4 h-4" />
                Cài đặt
              </button>
            
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full flex cursor-pointer items-center gap-2 text-red-400 hover:text-red-300"
              >
                <LogOut className="w-4 h-4 " />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 border-b bg-white shadow-sm">
          <h1 className="text-2xl font-bold">
            Hệ thống quản lý National Cinema Center
          </h1>
        </div>

        <div className="p-6">
          <Outlet />
        </div>
      </main>

      {/* ================= LOGOUT MODAL ================= */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-[320px] text-center shadow-xl">
            <p className="text-lg font-semibold mb-4">
              Bạn có chắc muốn đăng xuất không?
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 cursor-pointer rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Hủy
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg cursor-pointer bg-red-500 text-white hover:bg-red-400"
                
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}