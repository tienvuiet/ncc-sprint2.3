import { useEffect, useMemo, useState } from "react";
import {
  Gift,
  Plus,
  Search,
  Pencil,
  Trash2,
  Image as ImageIcon,
  CalendarClock,
} from "lucide-react";
import { toast } from "sonner";
import styles from "./FestivalManager.module.scss";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const API_URL = "http://localhost:8080/festival";
type FestivalEvent = {
  id?: string | number;
  name: string;
  image: string;
  description: string;
  content: string;
  date?: string;
  created_at: string;
};


const nowIso = () => new Date().toISOString();

const formatDateTimeVN = (s?: string) =>
  s ? new Date(s).toLocaleString("vi-VN", { hour12: false }) : "";

export default function FestivalManager() {
  const [events, setEvents] = useState<FestivalEvent[]>([]);
  const [total, setTotal] = useState(0);
  const a = new Date();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [modalData, setModalData] = useState<FestivalEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  console.log("modalData", a.getMonth());
  // LOAD
  useEffect(() => {
    const id = toast.loading("Đang tải dữ liệu...");
    fetch(API_URL)
      .then((res) => res.json())
      .then((data: any[]) => {
        const normalized: FestivalEvent[] = (Array.isArray(data) ? data : []).map((item) => {
          const created = item.created_at || item.date || nowIso();
          return {
            id: item.id,
            name: item.name ?? "",
            image: item.image ?? "",
            description: item.description ?? "",
            content: item.content ?? "",
            created_at: created,
            date: created,
          };
        });

        setEvents(normalized);
        setTotal(normalized.length);
        toast.success("Tải dữ liệu thành công", { id });
      })
      .catch(() => toast.error("Lỗi tải dữ liệu", { id }));
  }, []);

  // SEARCH + PAGINATION (client)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events.filter((ev) => ev.name.toLowerCase().includes(q));
  }, [events, search]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

  const paginated = useMemo(() => {
    return filtered.slice((page - 1) * pageSize, page * pageSize);
  }, [filtered, page]);

  // OPEN MODAL
  const openModal = (item: FestivalEvent | null = null) => {
    if (item) {
      const created = item.created_at || item.date || nowIso();
      setModalData({ ...item, created_at: created, content: item.content ?? "", date: created });
    } else {
      const created = nowIso();
      setModalData({
        id: Date.now(),
        name: "",
        image: "",
        description: "",
        content: "",
        created_at: created,
        date: created,
      });
    }
    setIsModalOpen(true);
  };

  // SAVE (ADD / EDIT)
  const saveEvent = async () => {
    if (!modalData) return;

    if (!modalData.name.trim()) return toast.error("Vui lòng nhập tên sự kiện");

    const exists = events.some((ev) => ev.id === modalData.id);
    const loadingId = toast.loading(exists ? "Đang cập nhật..." : "Đang thêm mới...");

    try {
      if (exists) {
        // EDIT: giữ nguyên created_at (ngày tạo bài)
        const current = events.find((ev) => ev.id === modalData.id);
        const created = current?.created_at || modalData.created_at || nowIso();

        const payload: FestivalEvent = {
          ...modalData,
          created_at: created,
          date: created,
        };

        const res = await fetch(`${API_URL}/${modalData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("PUT failed");

        const next = events.map((ev) => (ev.id === modalData.id ? payload : ev));
        setEvents(next);
        setTotal(next.length);
        toast.success("Cập nhật thành công");
      } else {
        const created = modalData.created_at || nowIso();
        const { id, ...newData } = modalData;

        const payload = {
          ...newData,
          created_at: created,
          date: created, // ✅ sync để DB cũ vẫn dùng được
        };

        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("POST failed");

        const createdItem: FestivalEvent = await res.json();
        const normalizedCreated: FestivalEvent = {
          ...createdItem,
          created_at: createdItem.created_at || createdItem.date || created,
          date: createdItem.created_at || createdItem.date || created,
        };

        // const next = [...events, normalizedCreated];
        const next = [normalizedCreated, ...events];
        setEvents(next);
        setTotal(next.length);
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

  // DELETE (Sonner confirm)
  const deleteEvent = (id: string) => {
    console.log("da nhan event");

    toast.custom(

      (t) => (
        <div className={styles.toastConfirm}>
          <div className={styles.toastTitle}>Xoá bài viết?</div>
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

                  const next = events.filter((ev) => ev.id !== id);
                  setEvents(next);
                  setTotal(next.length);

                  const q = search.trim().toLowerCase();
                  const nextFiltered = next.filter((ev) => ev.name.toLowerCase().includes(q));
                  const nextPages = Math.ceil(nextFiltered.length / pageSize) || 1;
                  if (page > nextPages) setPage(nextPages);

                  toast.success("Đã xoá");
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
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>
          <Gift className={styles.titleIcon} />
          Quản lý bài viết
        </h2>

        <button onClick={() => openModal()} className={styles.addBtn}>
          <Plus className={styles.btnIcon} /> Thêm bài
        </button>
      </div>

      {/* Search */}
      <div className={styles.searchWrap}>
        <Search className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Tìm theo tên..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className={styles.searchInput}
        />
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={`${styles.th} ${styles.thImage}`}>Ảnh</th>
              <th className={`${styles.th} ${styles.thName}`}>Tiêu đề</th>
              <th className={`${styles.th} ${styles.thDesc}`}>Mô tả</th>
              <th className={`${styles.th} ${styles.thCreated}`}>
                <span className={styles.thInline}>
                  <CalendarClock className={styles.thIcon} />
                  Ngày tạo bài
                </span>
              </th>
              <th className={`${styles.th} ${styles.thActions}`}>Thao tác</th>
            </tr>
          </thead>

          <tbody className={styles.tbody}>
            {paginated.map((ev) => (
              <tr key={ev.id} className={styles.tr}>
                <td className={`${styles.td} ${styles.tdImage}`}>
                  {ev.image ? (
                    <img
                      src={ev.image}
                      alt={ev.name}
                      className={styles.thumb}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className={styles.thumbPlaceholder} title="Chưa có ảnh">
                      <ImageIcon className={styles.placeholderIcon} />
                    </div>
                  )}
                </td>

                <td className={`${styles.td} ${styles.tdName}`} title={ev.name}>
                  {ev.name}
                </td>

                <td className={`${styles.td} ${styles.tdDesc}`} title={ev.description}>
                  {ev.description || "-"}
                </td>

                <td className={`${styles.td} ${styles.tdCreated}`}>
                  {formatDateTimeVN(ev.created_at || ev.date)}
                </td>

                <td className={`${styles.td} ${styles.tdActions}`}>
                  <div className={styles.actions}>
                    <button
                      onClick={() => openModal(ev)}
                      className={`${styles.iconBtn} ${styles.editBtn}`}
                      title="Sửa"
                    >
                      <Pencil className={styles.icon} />
                    </button>

                    <button
                      onClick={() => deleteEvent(ev.id)}
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
                <td colSpan={5} className={styles.empty}>
                  Không tìm thấy bài nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <p className={styles.pageInfo}>
          Hiển thị {paginated.length} / {filtered.length} (tổng: {total})
        </p>

        <div className={styles.pager}>
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className={styles.pagerBtn}
          >
            &lt;
          </button>

          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`${styles.pageBtn} ${page === p ? styles.active : ""}`}
              >
                {p}
              </button>
            );
          })}

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className={styles.pagerBtn}
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && modalData && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>
              {events.some((ev) => ev.id === modalData.id) ? "Sửa bài" : "Thêm bài"}
            </h3>

            <div className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Tiêu đề</label>
                <input
                  className={styles.input}
                  placeholder="Tên/tiêu đề..."
                  value={modalData.name}
                  onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Ảnh (dán link)</label>
                <input
                  className={styles.input}
                  placeholder=""
                  value={modalData.image}
                  onChange={(e) => setModalData({ ...modalData, image: e.target.value })}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Mô tả</label>
                <textarea
                  className={styles.textarea}
                  value={modalData.description}
                  onChange={(e) => {
                    setModalData({ ...modalData, description: e.target.value });

                    // auto height
                    e.currentTarget.style.height = "auto";
                    e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                  }}
                  rows={1}
                />

              </div>
              <div className={styles.field}>
                <label className={styles.label}>Nội dung bài viết</label>

                <div className={styles.editorWrap}>
                  <CKEditor
                    editor={ClassicEditor}
                    data={modalData.content}
                    onChange={(_, editor) => {
                      const data = editor.getData();
                      setModalData({ ...modalData, content: data });
                    }}
                  />
                </div>
              </div>


              {/* Ngày tạo bài: chỉ hiển thị, không cho sửa */}
              <div className={styles.field}>
                <label className={styles.label}>Ngày tạo bài</label>
                <input
                  className={styles.input}
                  value={formatDateTimeVN(modalData.created_at || modalData.date)}
                  disabled
                />
              </div>

              {modalData.image?.trim() ? (
                <img src={modalData.image} alt="Preview" className={styles.preview} />
              ) : null}
            </div>

            <div className={styles.modalActions}>
              <button onClick={() => setIsModalOpen(false)} className={styles.cancelBtn}>
                Hủy
              </button>
              <button onClick={saveEvent} className={styles.saveBtn}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
