import { NavLink, Outlet } from "react-router-dom";

const tabs = [
  { label: "Tài khoản của tôi", path: "" },
  { label: "Lịch sử mua vé", path: "historyPayment" },
  { label: "Phim yêu thích", path: "points" },
];

const ProfileLayout = () => {
  return (
    <div className="min-h-screen bg-[#0b0f16] text-white">
      <div className="max-w-7xl mx-auto px-7 py-16">
        {/* Title */}
        <h1 className="text-6xl font-semibold text-center mb-12">
          Thông tin cá nhân
        </h1>

        {/* Tabs */}
        <div className="flex justify-center gap-5 mb-10 flex-wrap">
          {tabs.map((tab) => (
            <NavLink
              key={tab.label}
              to={tab.path}
              end
              className={({ isActive }) =>
                `
                px-8 py-3 rounded-full text-base transition
                ${
                  isActive
                    ? "bg-red-600 text-white shadow-md"
                    : "border border-white/25 text-white/80 hover:border-white/40"
                }
              `
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>

        {/* Outlet */}
        <Outlet />
      </div>
    </div>
  );
};

export default ProfileLayout;
