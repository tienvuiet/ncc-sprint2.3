import React, { useState } from "react";
import styles from "./CalendarDN.module.scss";

export default function CalendarDN() {
  const [visible, setVisible] = useState(true);
  const [openInputModal, setOpenInputModal] = useState(false);
  const [openQRModal, setOpenQRModal] = useState(false);

  const [amount, setAmount] = useState<number | "">("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const bankCode = "BIDV";
  const accountNumber = "8823717129";

  const qrUrl =
    amount && content
      ? `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact.png?amount=${amount}&addInfo=${encodeURIComponent(
          content
        )}`
      : "";

  const handleCreateQR = () => {
    if (!amount || !content) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (amount < 3000) {
      setError("Số tiền tối thiểu là 3.000đ");
      return;
    }

    setError("");
    setOpenInputModal(false);
    setOpenQRModal(true);
  };

  // 👉 Đã đóng donate → không render gì
  if (!visible) return null;

  return (
    <div className={styles["dn-wrapper"]}>
      {/* FLOAT BUTTON + CLOSE */}
      <div className={styles["dn-float-wrapper"]}>
        <button className={styles["dn-float-close"]} onClick={() => setVisible(false)} aria-label="Đóng donate">
          ✕
        </button>

        <button className={styles["dn-float-btn"]} onClick={() => setOpenInputModal(true)}>
          ₫
        </button>
      </div>

      {/* INPUT MODAL */}
      {openInputModal && (
        <div className={styles["dn-overlay"]}>
          <div className={styles["dn-modal"]}>
            <h3 className={styles["dn-title"]}>Thằng nào có tiền, nạp tiền vào donate cho t 💸</h3>

            <input
              className={styles["dn-input"]}
              type="number"
              placeholder="Số tiền (>= 3000)"
              value={amount}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
            />

            <input
              className={styles["dn-input"]}
              type="text"
              placeholder="Nội dung chuyển khoản"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            {error && <p className={styles["dn-error"]}>{error}</p>}

            <div className={styles["dn-actions"]}>
              <button
                className={styles["dn-btn-cancel"]}
                onClick={() => {
                  setError("");
                  setOpenInputModal(false);
                }}
              >
                Hủy
              </button>

              <button className={styles["dn-btn-primary"]} onClick={handleCreateQR}>
                Tạo QR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR MODAL */}
      {openQRModal && (
        <div className={styles["dn-overlay"]}>
          <div className={styles["dn-modal"]}>
            <button className={styles["dn-modal-close"]} onClick={() => setOpenQRModal(false)}>
              ✕
            </button>

            <h3 className={styles["dn-title"]}>Quét đê!!!!!</h3>

            <img className={styles["dn-qr"]} src={qrUrl} alt="QR BIDV" />

            <p>
              <b>Số tiền:</b> {Number(amount).toLocaleString()} đ
            </p>
            <p>
              <b>Nội dung:</b> {content}
            </p>

            <button
              className={`${styles["dn-btn-primary"]} ${styles["dn-btn-full"]}`}
              onClick={() => setOpenQRModal(false)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}