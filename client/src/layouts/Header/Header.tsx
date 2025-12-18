import React, { useEffect, useState } from "react";
import styles from "./Header.module.scss";
import { Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";

import RegisterModal from "../../pages/Auth/RegisterModal";
import LoginModal from "../../pages/Auth/LoginModal";
import OtpModal from "../../pages/Auth/OtpModal";
import { useNavigate } from "react-router-dom";


import { toast } from "sonner";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [serverOtp, setServerOtp] = useState<number | null>(null);
  const [pendingForm, setPendingForm] = useState<any>(null);

  const [user, setUser] = useState<any>(() => {
    const storedUser = localStorage.getItem("currentUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navigate = useNavigate();


  /* LOAD USER */
  useEffect(() => {
    const syncUser = () => {
      const storedUser = localStorage.getItem("currentUser");
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };

    // Lắng nghe event custom
    window.addEventListener("user-updated", syncUser);

    return () => {
      window.removeEventListener("user-updated", syncUser);
    };
  }, []);


  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? `${styles["ncc-header__nav-link"]} ${styles["ncc-header__nav-link--active"]}`
      : styles["ncc-header__nav-link"];

  /* LOGOUT */
  const handleLogout = () => {
    toast.custom((t) => (
      <div className="bg-[#0e101a] border border-[#1a1c25] rounded-xl p-6 w-[320px] text-center shadow-xl">
        <p className="text-white text-lg mb-4">
          Bạn có chắc muốn đăng xuất không?
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => toast.dismiss(t)}
            className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-500"
          >
            Hủy
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("currentUser");
              window.dispatchEvent(new Event("user-updated"));
              setUser(null);
              setIsDropdownOpen(false);
              toast.dismiss(t);
              toast.success("Đã đăng xuất!");
            }}
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-400"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    ));
  };

  return (
    <>
      {/* HEADER */}
      <header className={styles["ncc-header"]}>
        <div className={styles["ncc-header__container"]}>
          {/* LEFT */}
          <div className={styles["ncc-header__left"]}>
            <div className={styles["ncc-header__logo"]}>
              <img
                src="https://res.cloudinary.com/diprwc5iy/image/upload/v1766039841/NCC_fzsres.svg"
                alt="NCC Logo"
                className={styles["ncc-header__logo-img"]}
              />

              <div className={styles["ncc-header__logo-text"]}>
                <div className={styles["ncc-header__logo-title"]}>
                  TRUNG TÂM CHIẾU PHIM QUỐC GIA
                </div>
                <div className={styles["ncc-header__logo-subtitle"]}>
                  National Cinema Center
                </div>
              </div>
            </div>

            {/* NAV */}
            <nav className={styles["ncc-header__nav"]}>
              <NavLink to="/" className={navLinkClass}>
                Trang chủ
              </NavLink>
              <NavLink to="/calendar" className={navLinkClass}>
                Lịch chiếu
              </NavLink>
              <NavLink to="/newpage" className={navLinkClass}>
                Tin tức
              </NavLink>
              <NavLink to="/promotion" className={navLinkClass}>
                Khuyến mãi
              </NavLink>
              <NavLink to="/pricing" className={navLinkClass}>
                Giá vé
              </NavLink>
              <NavLink to="/festival" className={navLinkClass}>
                Liên hoan phim
              </NavLink>
            </nav>
          </div>

          {/* AUTH DESKTOP */}
          <div className={styles["ncc-header__auth"]}>
            {!user ? (
              <>
                <button
                  className={`${styles["ncc-header__btn"]} ${styles["ncc-header__btn--login"]}`}
                  onClick={() => setIsRegisterOpen(true)}
                >
                  Đăng ký
                </button>

                <button
                  className={`${styles["ncc-header__btn"]} ${styles["ncc-header__btn--signup"]}`}
                  onClick={() => setIsLoginOpen(true)}
                >
                  Đăng nhập
                </button>
              </>
            ) : (
              <div
                className={styles["ncc-header__user"]}
                style={{ position: "relative" }}
              >
                <span className={styles["ncc-header__welcome"]}>
                  Xin chào, {user.first_name}
                </span>

                <img
                  src={user.avatar}
                  alt="avatar"
                  className={styles["ncc-header__avatar"]}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                />

                {/* DROPDOWN */}
                {isDropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "48px",
                      right: 0,
                      background: "#0e101a",
                      border: "1px solid #1a1c25",
                      borderRadius: "12px",
                      width: "200px",
                      padding: "8px",
                      zIndex: 999,
                    }}
                  >
                    <div
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/profile");
                      }}
                      style={{
                        padding: "10px",
                        color: "#fff",
                        borderBottom: "1px solid #1a1c25",
                        cursor: "pointer",
                      }}
                    >
                      Thông tin tài khoản
                    </div>

                    <div
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setTimeout(handleLogout, 50);
                      }}
                      style={{
                        padding: "10px",
                        color: "#ff6b6b",
                        cursor: "pointer",
                      }}
                    >
                      Đăng xuất
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* MOBILE BTN */}
          <button
            className={styles["ncc-header__menu-btn"]}
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* MOBILE MENU */}
        {isMenuOpen && (
          <div className={styles["ncc-header__mobile-menu"]}>
            <nav className={styles["ncc-header__mobile-nav"]}>
              <NavLink to="/" className={navLinkClass}>
                Trang chủ
              </NavLink>
              <NavLink to="/calendar" className={navLinkClass}>
                Lịch chiếu
              </NavLink>
              <NavLink to="/newpage" className={navLinkClass}>
                Tin tức
              </NavLink>
              <NavLink to="/promotion" className={navLinkClass}>
                Khuyến mãi
              </NavLink>
              <NavLink to="/pricing" className={navLinkClass}>
                Giá vé
              </NavLink>
              <NavLink to="/festival" className={navLinkClass}>
                Liên hoan phim
              </NavLink>
            </nav>

            {/* AUTH MOBILE */}
            <div className={styles["ncc-header__mobile-auth"]}>
              {!user ? (
                <>
                  <button
                    onClick={() => setIsRegisterOpen(true)}
                    className={`${styles["ncc-header__btn"]} ${styles["ncc-header__btn--login"]}`}
                  >
                    Đăng ký
                  </button>

                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className={`${styles["ncc-header__btn"]} ${styles["ncc-header__btn--signup"]}`}
                  >
                    Đăng nhập
                  </button>
                </>
              ) : (
                <>
                  <div className={styles["ncc-header__user"]}>
                    <span className={styles["ncc-header__welcome"]}>
                      Xin chào, {user.first_name}
                    </span>

                    <img
                      src={user.avatar}
                      alt="avatar"
                      className={styles["ncc-header__avatar"]}
                    />
                  </div>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className={`${styles["ncc-header__btn"]} ${styles["ncc-header__btn--login"]}`}
                    style={{ marginTop: 12 }}
                  >
                    Đăng xuất
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* MODALS */}
      <RegisterModal
        open={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onOtpSent={(otp, formData) => {
          setServerOtp(otp);
          setPendingForm(formData);
          setIsRegisterOpen(false);
          setIsOtpOpen(true);
          toast.success("OTP đã gửi!");
        }}
        onSwitchToLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
      />

      <LoginModal
        open={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
        onLoginSuccess={(userData) => setUser(userData)}
      />

      <OtpModal
        open={isOtpOpen}
        onClose={() => setIsOtpOpen(false)}
        serverOtp={serverOtp}
        pendingForm={pendingForm}
        onOpenLogin={() => setIsLoginOpen(true)}
      />


    </>
  );
};

export default Header;