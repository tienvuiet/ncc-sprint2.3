import React, { useEffect, useMemo, useState } from "react";
import { DollarSign, Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import styles from "./TicketPriceManager.module.scss";

const API_URL = "http://localhost:8080/ticket_prices";

type TicketPriceDB = {
  id: number;
  type_seat: "STANDARD" | "VIP" | "SWEETBOX" | string;
  type_movie: "2D" | "3D" | string;
  price: number;
  day_type: 0 | 1; // 0: T2-T5 | 1: T6,CN,Lễ
  start_time: string; // "08:00"
  end_time: string;   // "12:00"
};

const seatLabel = (v: string) => {
  switch (v) {
    case "STANDARD":
      return "Ghế thường";
    case "VIP":
      return "Ghế VIP";
    case "SWEETBOX":
      return "Ghế đôi (Sweetbox)";
    default:
      return v;
  }
};

const dayTypeLabel = (v: number) => (v === 0 ? "T2 → T5" : "T6, T7, CN & Lễ");
const timeRangeLabel = (start: string, end: string) => `${start} - ${end}`;

export default function TicketPriceManager() {
  const [prices, setPrices] = useState<TicketPriceDB[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [modalData, setModalData] = useState<TicketPriceDB | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // LOAD
  useEffect(() => {
    const id = toast.loading("Đang tải dữ liệu giá vé...");
    fetch(API_URL)
      .then((res) => res.json())
      .then((data: TicketPriceDB[]) => {
        setPrices(Array.isArray(data) ? data : []);
        toast.success("Tải dữ liệu thành công", { id });
      })
      .catch((e) => {
        console.error("Load ticket_prices error:", e);
        toast.error("Lỗi tải dữ liệu", { id });
      });
  }, []);

  // SEARCH + SORT
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return prices
      .filter((p) => {
        const s1 = (p.type_seat || "").toLowerCase();
        const s2 = (p.type_movie || "").toLowerCase();
        return (
          s1.includes(q) ||
          s2.includes(q) ||
          seatLabel(p.type_seat).toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const am = String(a.type_movie);
        const bm = String(b.type_movie);
        if (am !== bm) return am.localeCompare(bm);
        if (a.day_type !== b.day_type) return a.day_type - b.day_type;
        return String(a.start_time).localeCompare(String(b.start_time));
      });
  }, [prices, search]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

  const paginated = useMemo(() => {
    return filtered.slice((page - 1) * pageSize, page * pageSize);
  }, [filtered, page]);

  // OPEN MODAL
  const openModal = (item?: TicketPriceDB) => {
    if (item) {
      setModalData({ ...item });
    } else {
      setModalData({
        id: Date.now(), // id tạm
        type_seat: "STANDARD",
        type_movie: "2D",
        day_type: 0,
        start_time: "08:00",
        end_time: "12:00",
        price: 0, // ✅ UI sẽ hiển thị rỗng (nhờ value bên dưới)
      });
    }
    setIsModalOpen(true);
  };

  // SAVE (ADD / EDIT)
  const savePrice = async () => {
    if (!modalData) return;

    if (!modalData.type_seat?.trim()) return toast.error("Vui lòng chọn loại ghế");
    if (!modalData.type_movie?.trim()) return toast.error("Vui lòng chọn định dạng");
    if (!modalData.start_time || !modalData.end_time) return toast.error("Vui lòng nhập khung giờ");

    // ✅ bắt buộc > 0 (vì input có thể đang trống => price=0)
    if (modalData.price <= 0) return toast.error("Vui lòng nhập giá > 0");

    const exists = prices.some((p) => p.id === modalData.id);
    const loadingId = toast.loading(exists ? "Đang cập nhật..." : "Đang thêm mới...");

    try {
      if (exists) {
        const res = await fetch(`${API_URL}/${modalData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(modalData),
        });
        if (!res.ok) throw new Error("PUT failed");

        setPrices((prev) => prev.map((p) => (p.id === modalData.id ? modalData : p)));
        toast.success("Cập nhật thành công");
      } else {
        const { id, ...payload } = modalData;

        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("POST failed");

        const created: TicketPriceDB = await res.json();
        setPrices((prev) => [...prev, created]);
        toast.success("Thêm mới thành công");
      }

      setIsModalOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      toast.dismiss(loadingId);
    }
  };

  // DELETE (confirm bằng sonner)
  const deletePrice = (id: number) => {
    toast.custom(
      (t) => (
        <div className={styles.toastConfirm}>
          <div className={styles.toastTitle}>Xoá giá vé?</div>
          <div className={styles.toastDesc}>Hành động này không thể hoàn tác.</div>

          <div className={styles.toastActions}>
            <button className={styles.toastCancel} onClick={() => toast.dismiss(t.id)}>
              Hủy
            </button>

            <button
              className={styles.toastDelete}
              onClick={async () => {
                toast.dismiss(t.id);
                const loadingId = toast.loading("Đang xoá...");

                try {
                  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
                  if (!res.ok) throw new Error("DELETE failed");

                  setPrices((prev) => {
                    const next = prev.filter((p) => p.id !== id);

                    // ✅ tự chỉnh page nếu bị vượt
                    const q = search.trim().toLowerCase();
                    const nextFilteredCount = next.filter((p) => {
                      const s1 = (p.type_seat || "").toLowerCase();
                      const s2 = (p.type_movie || "").toLowerCase();
                      return (
                        s1.includes(q) ||
                        s2.includes(q) ||
                        seatLabel(p.type_seat).toLowerCase().includes(q)
                      );
                    }).length;

                    const nextPages = Math.ceil(nextFilteredCount / pageSize) || 1;
                    setPage((cur) => Math.min(cur, nextPages));

                    return next;
                  });

                  toast.success("Đã xoá giá vé");
                } catch (e) {
                  console.error(e);
                  toast.error("Xoá thất bại");
                } finally {
                  toast.dismiss(loadingId);
                }
              }}
            >
              Xóa
            </button>
          </div>
        </div>
      ),
      { duration: 8000 }
    );
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <DollarSign className={styles.titleIcon} />
          Quản lý giá vé
        </h2>

        <button onClick={() => openModal()} className={styles.addBtn}>
          <Plus className={styles.btnIcon} />
          Thêm giá vé
        </button>
      </div>

      <div className={styles.searchWrap}>
        <Search className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Tìm theo loại ghế hoặc định dạng..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={`${styles.th} ${styles.thSeat}`}>Loại ghế</th>
              <th className={`${styles.th} ${styles.thMovie}`}>Định dạng</th>
              <th className={`${styles.th} ${styles.thDay}`}>Ngày áp dụng</th>
              <th className={`${styles.th} ${styles.thTime}`}>Khung giờ</th>
              <th className={`${styles.th} ${styles.thPrice}`}>Giá</th>
              <th className={`${styles.th} ${styles.thActions}`}>Thao tác</th>
            </tr>
          </thead>

          <tbody className={styles.tbody}>
            {paginated.map((p) => (
              <tr key={p.id} className={styles.tr}>
                <td className={`${styles.td} ${styles.tdSeat}`}>{seatLabel(p.type_seat)}</td>

                <td className={`${styles.td} ${styles.tdMovie}`}>
                  <span
                    className={`${styles.badge} ${
                      p.type_movie === "3D" ? styles.badge3d : styles.badge2d
                    }`}
                  >
                    {p.type_movie}
                  </span>
                </td>

                <td className={`${styles.td} ${styles.tdDay}`}>{dayTypeLabel(p.day_type)}</td>
                <td className={`${styles.td} ${styles.tdTime}`}>{timeRangeLabel(p.start_time, p.end_time)}</td>
                <td className={`${styles.td} ${styles.tdPrice}`}>{p.price.toLocaleString()}đ</td>

                <td className={`${styles.td} ${styles.tdActions}`}>
                  <div className={styles.actions}>
                    <button
                      onClick={() => openModal(p)}
                      className={`${styles.iconBtn} ${styles.editBtn}`}
                      title="Sửa"
                    >
                      <Pencil className={styles.icon} />
                    </button>

                    <button
                      onClick={() => deletePrice(p.id)}
                      className={`${styles.iconBtn} ${styles.deleteBtn}`}
                      title="Xóa"
                    >
                      <Trash2 className={styles.icon} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {paginated.length === 0 && (
              <tr>
                <td colSpan={6} className={styles.empty}>
                  Không tìm thấy giá vé nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <p className={styles.pageInfo}>
          Hiển thị {paginated.length} / {filtered.length} giá vé
        </p>

        <div className={styles.pager}>
          <button className={styles.pagerBtn} disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            &lt;
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={`${styles.pageBtn} ${page === i + 1 ? styles.active : ""}`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button className={styles.pagerBtn} disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
            &gt;
          </button>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && modalData && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>
              {prices.some((p) => p.id === modalData.id) ? "Sửa giá vé" : "Thêm giá vé"}
            </h3>

            <div className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Loại ghế</label>
                <select
                  className={styles.input}
                  value={modalData.type_seat}
                  onChange={(e) => setModalData({ ...modalData, type_seat: e.target.value })}
                >
                  <option value="STANDARD">Ghế thường</option>
                  <option value="VIP">Ghế VIP</option>
                  <option value="SWEETBOX">Ghế đôi (Sweetbox)</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Định dạng</label>
                <select
                  className={styles.input}
                  value={modalData.type_movie}
                  onChange={(e) => setModalData({ ...modalData, type_movie: e.target.value })}
                >
                  <option value="2D">2D</option>
                  <option value="3D">3D</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Ngày áp dụng</label>
                <select
                  className={styles.input}
                  value={modalData.day_type}
                  onChange={(e) =>
                    setModalData({ ...modalData, day_type: Number(e.target.value) as 0 | 1 })
                  }
                >
                  <option value={0}>T2 → T5</option>
                  <option value={1}>T6, T7, CN & Lễ</option>
                </select>
              </div>

              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label className={styles.label}>Giờ bắt đầu</label>
                  <input
                    type="time"
                    className={styles.input}
                    value={modalData.start_time}
                    onChange={(e) => setModalData({ ...modalData, start_time: e.target.value })}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Giờ kết thúc</label>
                  <input
                    type="time"
                    className={styles.input}
                    value={modalData.end_time}
                    onChange={(e) => setModalData({ ...modalData, end_time: e.target.value })}
                  />
                </div>
              </div>

              {/* ✅ FIX: giá không hiện 0 + xóa được */}
              <div className={styles.field}>
                <label className={styles.label}>Giá (VNĐ)</label>
                <input
                  type="number"
                  className={styles.input}
                  placeholder="Nhập giá..."
                  value={modalData.price === 0 ? "" : String(modalData.price)}
                  onChange={(e) => {
                    const v = e.target.value; // string
                    setModalData({
                      ...modalData,
                      price: v === "" ? 0 : Number(v),
                    });
                  }}
                  min={0}
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <button onClick={() => setIsModalOpen(false)} className={styles.cancelBtn}>
                Hủy
              </button>
              <button onClick={savePrice} className={styles.saveBtn}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
