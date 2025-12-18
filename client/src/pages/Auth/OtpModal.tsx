import React, { useState } from "react";
import { toast } from "sonner";
import axiosClient from "../../apis/axiosClient";

type OtpModalProps = {
  open: boolean;
  onClose: () => void;
  serverOtp: number | null;
  pendingForm: any;
  onOpenLogin: () => void;
};

const OtpModal: React.FC<OtpModalProps> = ({
  open,
  onClose,
  serverOtp,
  pendingForm,
  onOpenLogin,
}) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const handleVerify = async () => {
    setError("");

    // VALIDATE
    if (!otp.trim()) {
      setError("Vui lòng nhập mã OTP");
      toast.error("Bạn chưa nhập mã OTP!");
      return;
    }

    if (!/^[0-9]{6}$/.test(otp)) {
      setError("OTP phải gồm 6 chữ số");
      toast.error("OTP phải gồm 6 chữ số");
      return;
    }

    if (String(serverOtp) !== otp) {
      setError("OTP không đúng, vui lòng kiểm tra lại");
      toast.error("OTP không chính xác!");
      return;
    }

    // OTP đúng
    toast.success("Xác thực thành công!");

    // 🔥 TẠO USER TRONG DB.JSON
    try {
      const newUser = {
        first_name: pendingForm.firstName,
        last_name: pendingForm.lastName,
        email: pendingForm.email,
        phone: pendingForm.phone,
        password: pendingForm.password,
        avatar: "https://i.pinimg.com/736x/c3/91/3d/c3913dc52d35241596ade71e69d29ab0.jpg",
        role_name: "user",
        status: "ACTIVE",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await axiosClient.post("/users", newUser);

      toast.success("Tài khoản đã được tạo thành công!");

      onClose();

      // Mở modal đăng nhập sau 300ms
      setTimeout(() => {
        onOpenLogin();
      }, 300);
    } catch (error) {
      toast.error("Lỗi khi lưu tài khoản!");
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
        className="relative w-full max-w-sm rounded-2xl 
                   bg-[#0d0f18] shadow-2xl border border-[#1e2130]
                   p-6 animate-scaleIn"
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-400 hover:text-white text-2xl transition"
        >
          ×
        </button>

        <h2 className="text-2xl font-semibold text-white mb-6 text-center">
          Xác thực OTP
        </h2>

        <p className="text-gray-400 text-sm text-center mb-4 px-3">
          Mã OTP đã gửi đến email của bạn. Vui lòng nhập 6 chữ số để tiếp tục.
        </p>

        <input
          className={`w-full px-3 py-3 rounded-lg bg-[#1a1d29] 
              border ${error ? "border-red-500" : "border-[#2e3241]"} 
              text-white text-center tracking-[0.4em] text-xl`}
          placeholder="••••••"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        {error && (
          <p className="text-red-500 text-xs mt-2 text-center">{error}</p>
        )}

        <button
          onClick={handleVerify}
          className="w-full mt-6 py-3 rounded-full font-semibold text-white
                     bg-gradient-to-r from-green-500 to-green-600
                     hover:scale-[1.02] transition"
        >
          Xác nhận
        </button>
      </div>
    </div>
  );
};

export default OtpModal;
