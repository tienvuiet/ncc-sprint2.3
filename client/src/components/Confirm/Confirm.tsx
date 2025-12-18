import React from "react";
import styles from "./Confirm.module.scss";

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function Confirm({ open, title = "Xác nhận", message, onConfirm, onCancel }: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.title}>{title}</h3>

        <p className={styles.message}>{message}</p>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>
            Huỷ
          </button>
          <button className={styles.confirmBtn} onClick={onConfirm}>
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
}
