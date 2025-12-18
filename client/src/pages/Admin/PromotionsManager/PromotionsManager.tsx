import React, { useEffect, useMemo, useState } from "react";
import styles from "./PromotionsManager.module.scss";
import {
  BadgePercent,
  Calendar,
  Plus,
  Search,
  Pencil,
  Trash2,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

type Promotion = {
  id: number;
  title: string;
  image: string;
  content?: string;
  created_at: string;
};

type PromotionDraft = {
  id?: number;
  title: string;
  image: string;
  content?: string;
};

const API_URL =
  (import.meta as any).env?.VITE_API_URL ?? "http://localhost:8080";

export default function PromotionManager() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const [promotionDraft, setPromotionDraft] = useState<PromotionDraft | null>(
    null
  );
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_URL}/promotions?_sort=created_at&_order=desc`
      );
      if (!res.ok) throw new Error("Không thể tải dữ liệu khuyến mãi.");
      const data: Promotion[] = await res.json();
      setPromotions(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const filteredPromotions = useMemo(() => {
    return promotions.filter((p) =>
      p.title.toLowerCase().includes(keyword.toLowerCase())
    );
  }, [promotions, keyword]);

  const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage) || 1;
  const paginatedPromotions = filteredPromotions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openPromotionModal = (item?: Promotion) => {
    if (item) {
      setPromotionDraft({
        id: item.id,
        title: item.title,
        image: item.image ?? "",
        content: item.content ?? "",
      });
    } else {
      setPromotionDraft({ title: "", image: "", content: "" });
    }
    setIsPromotionModalOpen(true);
  };

  const parseCreatedAt = (value: string) => {
    if (!value) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const d = new Date(value + "T00:00:00");
      return isNaN(d.getTime()) ? null : d;
    }

    const m = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) {
      const dd = Number(m[1]);
      const mm = Number(m[2]);
      const yyyy = Number(m[3]);
      const d = new Date(yyyy, mm - 1, dd);

      if (
        d.getFullYear() === yyyy &&
        d.getMonth() === mm - 1 &&
        d.getDate() === dd
      ) {
        return d;
      }
    }

    return null;
  };

  const formatCreatedAt = (value: string) => {
    const d = parseCreatedAt(value);
    return d ? d.toLocaleDateString("vi-VN") : value;
  };

  const closePromotionModal = () => {
    setIsPromotionModalOpen(false);
    setPromotionDraft(null);
  };

  const savePromotion = async () => {
    if (!promotionDraft) return;

    const title = promotionDraft.title.trim();
    const image = promotionDraft.image.trim();

    if (!title) return toast.warning("Vui lòng nhập tiêu đề.");
    if (!image) return toast.warning("Vui lòng nhập link ảnh.");

    const isEdit = Boolean(promotionDraft.id);
    const tId = toast.loading(isEdit ? "Đang cập nhật..." : "Đang thêm mới...");

    try {
      setLoading(true);

      if (isEdit) {
        const res = await fetch(`${API_URL}/promotions/${promotionDraft.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            image,
            content: promotionDraft.content, // 👈 LƯU CKEDITOR
          }),
        });

        if (!res.ok) throw new Error("Cập nhật khuyến mãi thất bại.");

        const updated: Promotion = await res.json();
        setPromotions((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );

        toast.success("Cập nhật khuyến mãi thành công!", { id: tId });
      } else {
        const today = new Date().toISOString().slice(0, 10);
        const res = await fetch(`${API_URL}/promotions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            image,
            content: promotionDraft.content,
            created_at: today,
          }),
        });

        if (!res.ok) throw new Error("Thêm khuyến mãi thất bại.");

        const created: Promotion = await res.json();
        setPromotions((prev) => [created, ...prev]);
        setCurrentPage(1);

        toast.success("Thêm khuyến mãi thành công!", { id: tId });
      }

      closePromotionModal();
    } catch (e: any) {
      toast.error(e?.message ?? "Có lỗi xảy ra.", { id: tId });
    } finally {
      setLoading(false);
    }
  };

  const deletePromotion = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xoá khuyến mãi này?")) return;

    const tId = toast.loading("Đang xoá khuyến mãi...");
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/promotions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Xoá khuyến mãi thất bại.");

      setPromotions((prev) => prev.filter((p) => p.id !== id));
      toast.success("Đã xoá khuyến mãi!", { id: tId });

      const newTotalPages =
        Math.ceil((filteredPromotions.length - 1) / itemsPerPage) || 1;
      setCurrentPage((p) => Math.min(p, newTotalPages));
    } catch (e: any) {
      toast.error(e?.message ?? "Có lỗi xảy ra.", { id: tId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Toaster richColors position="top-right" />

      <div className={styles.header}>
        <h2 className={styles.title}>
          <BadgePercent className={styles.iconBlue} /> Trang khuyến mãi
        </h2>

        <button onClick={() => openPromotionModal()} className={styles.addBtn}>
          <Plus className={styles.iconSm} /> Thêm khuyến mãi
        </button>
      </div>

      {/* Search */}
      <div className={styles.searchBox}>
        <Search className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Tìm theo tiêu đề khuyến mãi..."
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setCurrentPage(1);
          }}
          className={styles.searchInput}
        />
      </div>

      {/* List */}
      <div className={styles.grid}>
        {loading && promotions.length === 0 && (
          <div className={styles.empty}>Đang tải dữ liệu...</div>
        )}

        {paginatedPromotions.map((p) => (
          <div key={p.id} className={styles.card}>
            <div className={styles.cardTop}>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{p.title}</h3>
              </div>
            </div>

            <div className={styles.cardActions}>
              <p className={styles.cardDate}>
                <Calendar className={styles.iconBlue} />
                {formatCreatedAt(p.created_at)}
              </p>
              <div className={styles.cardBtns}>
                <button
                  onClick={() => openPromotionModal(p)}
                  className={styles.editBtn}
                >
                  <Pencil className={styles.iconSm} /> Sửa
                </button>
                <button
                  onClick={() => deletePromotion(p.id)}
                  className={styles.deleteBtn}
                  disabled={loading}
                >
                  <Trash2 className={styles.iconSm} /> Xoá
                </button>
              </div>
            </div>
          </div>
        ))}

        {!loading && paginatedPromotions.length === 0 && (
          <div className={styles.empty}>Không tìm thấy khuyến mãi nào.</div>
        )}
      </div>

      {/* Pagination */}
      <div className={styles.paginationRow}>
        <p className={styles.paginationInfo}>
          Hiển thị {paginatedPromotions.length} / {filteredPromotions.length}{" "}
          khuyến mãi
        </p>

        <div className={styles.paginationBtns}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className={styles.pageBtn}
          >
            &lt;
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`${styles.pageBtn} ${
                currentPage === i + 1 ? styles.pageActive : ""
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className={styles.pageBtn}
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Modal */}
      {isPromotionModalOpen && promotionDraft && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>
              {promotionDraft.id ? "Sửa khuyến mãi" : "Thêm khuyến mãi"}
            </h3>

            <div className={styles.modalBody}>
              <label>Tiêu đề</label>
              <input
                className={styles.modalInput}
                value={promotionDraft.title}
                onChange={(e) =>
                  setPromotionDraft({
                    ...promotionDraft,
                    title: e.target.value,
                  })
                }
              />

              <label>Link ảnh</label>
              <input
                className={styles.modalInput}
                value={promotionDraft.image}
                onChange={(e) =>
                  setPromotionDraft({
                    ...promotionDraft,
                    image: e.target.value,
                  })
                }
              />
              <label>Nội dung khuyến mãi</label>
              <CKEditor
                editor={ClassicEditor}
                data={promotionDraft.content || ""}
                onChange={(_, editor) => {
                  const data = editor.getData();
                  setPromotionDraft({
                    ...promotionDraft,
                    content: data,
                  });
                }}
              />
            </div>

            <div className={styles.modalActions}>
              <button
                onClick={closePromotionModal}
                className={styles.cancelBtn}
                disabled={loading}
              >
                Hủy
              </button>
              <button
                onClick={savePromotion}
                className={styles.saveBtn}
                disabled={loading}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
