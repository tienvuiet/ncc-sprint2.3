import React, { useState } from "react";
import { toast } from "sonner";
import axiosClient from "../../apis/axiosClient";
import { useNavigate } from "react-router-dom";

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  onLoginSuccess: (userData: any) => void;
};

const LoginModal: React.FC<LoginModalProps> = ({
  open,
  onClose,
  onSwitchToRegister,
  onLoginSuccess,
}) => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<any>({});
  const navigate = useNavigate();

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors: any = {};

    if (!form.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!form.password.trim()) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (form.password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      // Lấy user theo email
      const res = await axiosClient.get(`/users?email=${form.email}`);
      const user = res.data[0];

      if (!user) {
        setErrors({ email: "Email không tồn tại" });
        toast.error("Email không tồn tại!");
        return;
      }

      if (user.password !== form.password) {
        setErrors({ password: "Mật khẩu không đúng" });
        toast.error("Mật khẩu không đúng!");
        return;
      }

      // Thành công
      toast.success("Đăng nhập thành công!");

      // luu vào local
      localStorage.setItem("currentUser", JSON.stringify(user));

      // Gửi user lên Header
      onLoginSuccess(user);

      if (user.role_name === "admin") {
        navigate("/admin");
      }
      onClose();
    } catch (error) {
      toast.error("Không thể đăng nhập!");
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center 
                 bg-black/70 backdrop-blur-md animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl p-8 
                   bg-[#0e101a] border border-[#1a1c25] shadow-xl 
                   animate-scaleIn"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 
                     hover:text-red-400 transition text-xl"
        >
          ×
        </button>

        <h2 className="text-3xl font-semibold text-white text-center mb-8">
          Đăng nhập
        </h2>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label className="text-gray-300 text-sm">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className={`mt-1 w-full rounded-xl px-4 py-3 bg-[#1a1d27] text-gray-200
                border ${
                  errors.email ? "border-red-500" : "border-[#2d3040]"
                } `}
              placeholder="example@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-gray-300 text-sm">Mật khẩu</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className={`mt-1 w-full rounded-xl px-4 py-3 bg-[#1a1d27] text-gray-200
                border ${
                  errors.password ? "border-red-500" : "border-[#2d3040]"
                } `}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full font-semibold text-white
                       bg-gradient-to-r from-red-500 to-red-400
                       hover:scale-[1.02] transition-transform duration-200"
          >
            Đăng nhập
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6 text-sm">
          Bạn chưa có tài khoản?{" "}
          <button
            onClick={onSwitchToRegister}
            className="text-red-400 hover:text-red-300 font-medium transition"
          >
            Đăng ký
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
