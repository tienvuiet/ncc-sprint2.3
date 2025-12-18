import React, { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import axiosClient from "../../apis/axiosClient";

type Props = {
  onUpdateSuccess?: (user: any) => void;
};

const DEFAULT_AVATAR =
  "https://i.pinimg.com/736x/c3/91/3d/c3913dc52d35241596ade71e69d29ab0.jpg";

export default function ProfileUpdate({ onUpdateSuccess }: Props) {
  /* =======================
        USER STATE (CORE)
  ======================= */
  const storedUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  const [userState, setUserState] = useState(storedUser);

  const [openChangePassword, setOpenChangePassword] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  if (!userState) {
    return (
      <div className="text-center text-white/60 py-20">
        Vui lòng đăng nhập để xem thông tin tài khoản
      </div>
    );
  }

  /* =======================
        FORM STATE
  ======================= */
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
  };

  /* =======================
        AVATAR STATE
  ======================= */
  const [avatarUrl, setAvatarUrl] = useState(""); // lưu DB
  const [avatarPreview, setAvatarPreview] = useState(""); // hiển thị
  const [loading, setLoading] = useState(false);

  /* =======================
        INIT FROM USER
  ======================= */
  useEffect(() => {
    setFormData({
      firstName: userState.first_name || "",
      lastName: userState.last_name || "",
      email: userState.email || "",
      phone: userState.phone || "",
      address: userState.address || "",
    });

    const avatar = userState.avatar || DEFAULT_AVATAR;
    setAvatarUrl(avatar);
    setAvatarPreview(avatar);
  }, [userState]);

  /* =======================
        HANDLERS
  ======================= */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* =======================
        CLOUDINARY
  ======================= */
  const uploadToCloudinary = async (file: File) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "upload_image");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/diprwc5iy/image/upload",
      {
        method: "POST",
        body: data,
      }
    );

    const json = await res.json();
    return json.secure_url as string;
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.loading("Đang tải ảnh lên...", { id: "upload-avatar" });

      const imageUrl = await uploadToCloudinary(file);

      setAvatarUrl(imageUrl); // dùng để lưu DB
      setAvatarPreview(imageUrl + "?t=" + Date.now()); // tránh cache

      toast.success("Tải ảnh thành công", { id: "upload-avatar" });
    } catch (err) {
      console.error(err);
      toast.error("Upload ảnh thất bại", { id: "upload-avatar" });
    }
  };

  /* =======================
        SUBMIT
  ======================= */
  const handleSubmit = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const res = await axiosClient.patch(`/users/${userState.id}`, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        avatar: avatarUrl,
      });

      const updatedUser = res.data;

      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("user-updated"));
      setUserState(updatedUser);

      onUpdateSuccess?.(updatedUser);

      toast.success("Cập nhật thông tin thành công");
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật thất bại, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  /* =======================
        RENDER
  ======================= */
  return (
    <div className="max-w-5xl mx-auto">
      {/* AVATAR */}
      <div className="flex justify-center mb-10">
        <div className="relative group">
          <img
            src={avatarPreview}
            alt="avatar"
            className="w-24 h-24 rounded-full object-cover
                       ring-2 ring-red-500/40
                       transition group-hover:scale-105"
          />
          <label
            className="absolute inset-0 bg-black/60 rounded-full
                            flex items-center justify-center
                            opacity-0 group-hover:opacity-100
                            cursor-pointer transition"
          >
            <Upload className="text-white" size={20} />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* FORM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Field
          label="Họ"
          required
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
        />
        <Field
          label="Tên"
          required
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
        />
        <Field
          label="Số điện thoại"
          required
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />
        <Field
          label="Địa chỉ"
          name="address"
          value={formData.address}
          onChange={handleChange}
        />
        <Field label="Tên đăng nhập" disabled placeholder="Tên đăng nhập" />
        <Field label="Email" disabled value={formData.email} />
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-4 mt-12">
        <button
          onClick={() => setOpenChangePassword(true)}
          className="px-6 py-2 rounded-lg border border-white/20 text-white hover:border-red-500 transition"
        >
          Đổi mật khẩu
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
        >
          Lưu thông tin
        </button>
      </div>
      {openChangePassword && (
  <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
    <div className="w-full max-w-md bg-[#0b1220] rounded-xl p-6 relative">
      {/* CLOSE */}
      <button
        onClick={() => setOpenChangePassword(false)}
        className="absolute top-4 right-4 text-white/60 hover:text-white"
      >
        ✕
      </button>

      <h3 className="text-lg font-semibold text-white mb-6">
        Đổi mật khẩu
      </h3>

      <div className="space-y-4">
        <input
          type="password"
          name="currentPassword"
          placeholder="Mật khẩu hiện tại"
          value={passwordForm.currentPassword}
          onChange={handlePasswordChange}
          className="w-full px-4 py-3 rounded-lg bg-[#0f1623] text-white border border-white/10 outline-none"
        />

        <input
          type="password"
          name="newPassword"
          placeholder="Mật khẩu mới"
          value={passwordForm.newPassword}
          onChange={handlePasswordChange}
          className="w-full px-4 py-3 rounded-lg bg-[#0f1623] text-white border border-white/10 outline-none"
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Xác nhận mật khẩu mới"
          value={passwordForm.confirmPassword}
          onChange={handlePasswordChange}
          className="w-full px-4 py-3 rounded-lg bg-[#0f1623] text-white border border-white/10 outline-none"
        />
      </div>

      <button
        onClick={async () => {
          // ===== VALIDATE =====
          if (
            !passwordForm.currentPassword ||
            !passwordForm.newPassword ||
            !passwordForm.confirmPassword
          ) {
            toast.error("Vui lòng nhập đầy đủ thông tin");
            return;
          }

          if (passwordForm.currentPassword !== userState.password) {
            toast.error("Mật khẩu hiện tại không đúng");
            return;
          }

          if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("Xác nhận mật khẩu không khớp");
            return;
          }

          try {
            const res = await axiosClient.patch(`/users/${userState.id}`, {
              password: passwordForm.newPassword,
            });

            localStorage.setItem(
              "currentUser",
              JSON.stringify(res.data)
            );
            setUserState(res.data);

            toast.success("Đổi mật khẩu thành công");
            setOpenChangePassword(false);

            setPasswordForm({
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            });
          } catch {
            toast.error("Đổi mật khẩu thất bại");
          }
        }}
        className="mt-6 w-full py-3 rounded-full bg-gradient-to-r from-red-600 to-red-500 text-white font-medium"
      >
        Xác nhận
      </button>
    </div>
  </div>
)}

    </div>
  );
}

/* =======================
      FIELD
======================= */
const Field = ({ label, required, disabled, ...props }: any) => (
  <div>
    <label className="block mb-2 text-sm text-white/80">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      {...props}
      disabled={disabled}
      className={`w-full rounded-lg px-4 py-3 outline-none
        ${
          disabled
            ? "bg-[#0f1623] text-white/40 cursor-not-allowed"
            : "bg-[#0f1623] text-white border border-white/10 focus:border-red-500"
        }`}
    />
  </div>
);
