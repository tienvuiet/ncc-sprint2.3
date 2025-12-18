import React, { useEffect, useState } from "react";
import emailjs from "emailjs-com";
import axiosClient from "../../apis/axiosClient";

type RegisterModalProps = {
  open: boolean;
  onClose: () => void;
  onOtpSent: (otp: number, formData: any) => void;
  onSwitchToLogin: () => void;
};

const initialForm = {
  firstName: "", // TÊN
  lastName: "",  // HỌ
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

const RegisterModal: React.FC<RegisterModalProps> = ({
  open,
  onClose,
  onOtpSent,
  onSwitchToLogin,
}) => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    emailjs.init("zcP10O8bCPNvQ-Bud");
  }, []);

  // Reset khi mở modal
  useEffect(() => {
    if (open) {
      setForm(initialForm);
      setErrors({});
      setSubmitting(false);
    }
  }, [open]);

  const handleClose = () => {
    setForm(initialForm);
    setErrors({});
    setSubmitting(false);
    onClose();
  };

  const handleSwitchToLogin = () => {
    setForm(initialForm);
    setErrors({});
    setSubmitting(false);
    onSwitchToLogin();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // reset lỗi field đang nhập
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateLocal = () => {
    const newErrors: Record<string, string> = {};

    // HỌ / TÊN
    if (!form.lastName.trim()) newErrors.lastName = "Họ không được để trống";
    if (!form.firstName.trim()) newErrors.firstName = "Tên không được để trống";

    // EMAIL format
    if (!form.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // PHONE
    if (!form.phone || !/^[0-9]{9,11}$/.test(form.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    // PASSWORD
    if (!form.password) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (form.password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    }

    // CONFIRM PASSWORD
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng nhập lại mật khẩu";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không trùng khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateOTP = () => Math.floor(100000 + Math.random() * 900000);

  const checkEmailExists = async (email: string) => {
  const res = await axiosClient.get(`/users?email=${encodeURIComponent(email)}`);
  return Array.isArray(res.data) && res.data.length > 0;
};


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const ok = validateLocal();
    if (!ok) return;

    setSubmitting(true);

    try {
      const exists = await checkEmailExists(form.email);

      if (exists) {
        setErrors((prev) => ({
          ...prev,
          email: "Email này đã được đăng ký",
        }));
        setSubmitting(false);
        return;
      }

      const otp = generateOTP();
      await emailjs.send("service_lzexez3", "template_ghc9qw6", {
        to_email: form.email,
        name: `${form.lastName} ${form.firstName}`,
        message: `Mã OTP của bạn là: ${otp}`,
      });

      onOtpSent(otp, form);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        email: "Không thể gửi OTP, vui lòng thử lại",
      }));
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center 
                 bg-black/70 backdrop-blur-md animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl 
                   bg-[#0d0f18] shadow-2xl border border-[#1e2130]
                   p-8 animate-scaleIn"
      >
        <button
          onClick={handleClose}
          className="absolute right-5 top-5 text-gray-400 hover:text-white text-2xl transition"
        >
          ×
        </button>

        <h2 className="text-3xl font-semibold text-white mb-6 text-center">
          Đăng ký
        </h2>

        <form className="space-y-5" onSubmit={handleRegister}>
          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-300 text-sm">Họ</label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className={`mt-1 w-full rounded-lg px-3 py-2 bg-[#1a1d29] 
                  border ${errors.lastName ? "border-red-500" : "border-[#2e3241]"} 
                  text-gray-200`}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>

            <div>
              <label className="text-gray-300 text-sm">Tên</label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                className={`mt-1 w-full rounded-lg px-3 py-2 bg-[#1a1d29] 
                  border ${errors.firstName ? "border-red-500" : "border-[#2e3241]"} 
                  text-gray-200`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-gray-300 text-sm">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={`mt-1 w-full rounded-lg px-3 py-2 bg-[#1a1d29] 
                border ${errors.email ? "border-red-500" : "border-[#2e3241]"} 
                text-gray-200`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="text-gray-300 text-sm">Số điện thoại</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className={`mt-1 w-full rounded-lg px-3 py-2 bg-[#1a1d29] 
                border ${errors.phone ? "border-red-500" : "border-[#2e3241]"} 
                text-gray-200`}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Password */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-300 text-sm">Mật khẩu</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className={`mt-1 w-full rounded-lg px-3 py-2 bg-[#1a1d29] 
                  border ${errors.password ? "border-red-500" : "border-[#2e3241]"} 
                  text-gray-200`}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="text-gray-300 text-sm">Xác nhận mật khẩu</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className={`mt-1 w-full rounded-lg px-3 py-2 bg-[#1a1d29] 
                  border ${
                    errors.confirmPassword ? "border-red-500" : "border-[#2e3241]"
                  } 
                  text-gray-200`}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3 rounded-full font-semibold text-white
                       bg-gradient-to-r from-[#ff4d4f] to-[#ff6161]
                       hover:scale-[1.02] transition
                       ${submitting ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {submitting ? "Đang kiểm tra..." : "Gửi OTP"}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6 text-sm">
          Bạn đã có tài khoản?{" "}
          <button
            onClick={handleSwitchToLogin}
            className="text-red-400 hover:text-red-300 font-medium transition"
          >
            Đăng nhập
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterModal;
