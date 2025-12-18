import { useEffect, useState } from "react";
import { CalendarPlus, Pencil, Trash2, Calendar } from "lucide-react";
import styles from "./ShowtimeManager.module.scss";

import ModalShowtime from "../../../components/ModalShowtime/ModalShowtime";
import ModalEditShowtime from "../../../components/ModalShowtime/ModalEditShowtime";

import { toast, Toaster } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store/stores";
import { getAllShowtime, deleteShowtime } from "../../../store/slices/calendar";
import Confirm from "../../../components/Confirm/Confirm";

interface Showtime {
  id: number;
  movie_id: number;
  day: string;
  time: string;
  created_at: string;
}

interface Movie {
  id: number;
  title: string;
}

export default function ShowtimeManager() {
  const dispatch = useDispatch<AppDispatch>();
  const { showtime, loading } = useSelector((state: RootState) => state.calendar);

  const [selectedDate, setSelectedDate] = useState("");
  const [search, setSearch] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editData, setEditData] = useState<Showtime | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [movies, setMovies] = useState<Movie[]>([]);

  /* ================= PAGINATION ================= */
  const [page, setPage] = useState(1);
  const pageSize = 5;

  /* ================= FETCH ================= */
  useEffect(() => {
    fetch("http://localhost:8080/movies")
      .then((res) => res.json())
      .then((listMovie) => setMovies(listMovie));
  }, []);

  useEffect(() => {
    dispatch(getAllShowtime());
  }, [dispatch]);

  /* ================= RESET PAGE ================= */
  useEffect(() => {
    setPage(1);
  }, [selectedDate, search, showtime]);

  /* ================= DELETE ================= */
  const handelDelete = async () => {
    if (!deleteId) return;

    try {
      await dispatch(deleteShowtime(deleteId)).unwrap();
      toast.success("Xoá lịch chiếu thành công");
    } catch {
      toast.error("Xoá lịch chiếu thất bại");
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  const getMovieName = (movieId: number) => movies.find((m) => m.id == movieId)?.title || "Không rõ";

  const filtered = showtime.filter((s) => {
    const matchDate = !selectedDate || s.day === selectedDate;
    const movieName = getMovieName(s.movie_id).toLowerCase();
    const matchSearch = movieName.includes(search.toLowerCase());
    return matchDate && matchSearch;
  });

  /* ================= PAGINATED DATA ================= */
  const totalPage = Math.ceil(filtered.length / pageSize);

  const paginatedData = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className={styles.container}>
      {/* ===== HEADER ===== */}
      <div className={styles.header}>
        <h2 className={styles.title}>
          <Calendar className={styles.icon} />
          Quản lý lịch chiếu
        </h2>

        <button className={styles.createBtn} onClick={() => setOpenModal(true)}>
          <CalendarPlus size={16} />
          Tạo lịch chiếu
        </button>
      </div>

      {/* ===== FILTER ===== */}
      <div className={styles.filterRow}>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className={styles.dateInput}
        />

        <input
          type="text"
          placeholder="Tìm theo tên phim..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* ===== TABLE ===== */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>ID phim</th>
              <th className={styles.th}>Tên phim</th>
              <th className={styles.th}>Giờ chiếu</th>
              <th className={styles.th}>Ngày</th>
              <th className={`${styles.th} ${styles.tdCenter}`}>Thao tác</th>
            </tr>
          </thead>

          <tbody className={styles.tbody}>
            {paginatedData.map((st) => (
              <tr key={st.id}>
                <td className={styles.td}>{st.movie_id}</td>
                <td className={styles.td}>{getMovieName(st.movie_id)}</td>
                <td className={styles.td}>{st.time}</td>
                <td className={styles.td}>{new Date(st.day).toLocaleDateString("vi-VN")}</td>

                <td className={`${styles.td} ${styles.tdCenter}`}>
                  <div className={styles.buttonGroup}>
                    <button
                      className={styles.editBtn}
                      onClick={() => {
                        setEditData(st);
                        setOpenEdit(true);
                      }}
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      className={styles.deleteBtn}
                      onClick={() => {
                        setDeleteId(st.id);
                        setConfirmOpen(true);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!loading && paginatedData.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.center}>
                  Không có lịch chiếu nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPage > 1 && (
        <div className={styles.pagination}>
          <p className={styles.pageInfo}>
            Hiển thị {paginatedData.length} / {filtered.length} lịch chiếu
          </p>

          <div className={styles.pageButtons}>
            {/* Prev */}
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className={styles.pageBtn}>
              &lt;
            </button>

            {/* Page numbers */}
            {Array.from({ length: totalPage }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`${styles.pageBtn} ${p === page ? styles.activePage : ""}`}
              >
                {p}
              </button>
            ))}

            {/* Next */}
            <button disabled={page === totalPage} onClick={() => setPage(page + 1)} className={styles.pageBtn}>
              &gt;
            </button>
          </div>
        </div>
      )}

      {/* ===== MODAL ===== */}
      <ModalShowtime open={openModal} onClose={() => setOpenModal(false)} onSuccess={() => setOpenModal(false)} />

      <ModalEditShowtime
        open={openEdit}
        data={editData}
        onClose={() => setOpenEdit(false)}
        onSuccess={() => setOpenEdit(false)}
      />

      <Confirm
        open={confirmOpen}
        title="Xoá lịch chiếu"
        message="Bạn có chắc chắn muốn xoá lịch chiếu này không?"
        onCancel={() => {
          setConfirmOpen(false);
          setDeleteId(null);
        }}
        onConfirm={handelDelete}
      />

      <Toaster richColors position="top-right" />
    </div>
  );
}
