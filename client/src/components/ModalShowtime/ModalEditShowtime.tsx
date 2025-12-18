import { useEffect, useState } from "react";
import styles from "./ModalShowtime.module.scss";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store/stores";
import { updateShowtime } from "../../store/slices/calendar";

interface Movie {
  id: number;
  title: string;
  image: string;
}

interface Showtime {
  id: number;
  movie_id: number;
  day: string;
  time: string;
}

interface ModalEditShowtimeProps {
  open: boolean;
  data: Showtime | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalEditShowtime({ open, data, onClose, onSuccess }: ModalEditShowtimeProps) {
  const dispatch = useDispatch<AppDispatch>();

  const [movieId, setMovieId] = useState<number|null>(null);
  const [movieName, setMovieName] = useState<string>("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [suggest, setSuggest] = useState<Movie[]>([]);
  const [focused, setFocused] = useState(false);

  const [day, setDay] = useState("");
  const [time, setTime] = useState("");

  const [showtimes, setShowtimes] = useState<Showtime[]>([]);

  /* ================= FETCH MOVIES ================= */
  useEffect(() => {
    fetch("http://localhost:8080/movies")
      .then((res) => res.json())
      .then(setMovies)
      .catch(() => toast.error("Không tải được danh sách phim"));
  }, []);

  /* ================= FETCH SHOWTIMES ================= */
  useEffect(() => {
    if (!open) return;

    fetch("http://localhost:8080/showtimes")
      .then((res) => res.json())
      .then(setShowtimes)
      .catch(() => toast.error("Không tải được lịch chiếu"));
  }, [open]);

  /* ================= SET DATA BAN ĐẦU ================= */
  useEffect(() => {
    if (!data || movies.length === 0) return;

    setDay(data.day);
    setTime(data.time);
    setMovieId(data.movie_id);

    const movie = movies.find((m) => m.id === data.movie_id);
    setMovieName(movie ? movie.title : "");
  }, [data, movies]);

  /* ================= SUGGEST MOVIE ================= */
  useEffect(() => {
    const keyword = movieName.toLowerCase();

    if (!keyword) {
      setSuggest([]);
      setMovieId(null);
      return;
    }

    const list = movies.filter((m) => m.title.toLowerCase().includes(keyword));
    setSuggest(list);

    const exact = movies.find((m) => m.title.toLowerCase() === keyword);
    setMovieId(exact ? exact.id : null);
  }, [movieName, movies]);

  if (!open || !data) return null;

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!movieId) {
      toast.warning("Vui lòng nhập đúng tên phim");
      return;
    }

    if (!day || !time) {
      toast.warning("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    /* ===== CHECK TRÙNG (EDIT) ===== */
    const isDuplicate = showtimes.some(
      (st) =>
        st.id !== data.id && // ❗ khác chính nó
        st.movie_id === movieId &&
        st.day === day &&
        st.time === time
    );

    if (isDuplicate) {
      toast.warning("Giờ chiếu đã tồn tại cho phim này trong ngày này");
      return;
    }

    /* ===== OPTIONAL: CHẶN GIỜ QUÁ KHỨ ===== */
    const selectedDateTime = new Date(`${day}T${time}`);
    if (selectedDateTime < new Date()) {
      toast.warning("Không thể chọn giờ trong quá khứ");
      return;
    }

    try {
      await dispatch(
        updateShowtime({
          id: data.id,
          movie_id: movieId,
          day,
          time,
          created_at: new Date().toISOString().split("T")[0],
        })
      ).unwrap();

      toast.success("Cập nhật lịch chiếu thành công");
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật thất bại");
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.title}>Sửa lịch chiếu</h3>

        {/* ===== MOVIE ===== */}
        <div className={styles.formGroup}>
          <label>Tên phim {movieId && `#${movieId}`}</label>
          <input
            value={movieName}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            onChange={(e) => setMovieName(e.target.value)}
          />

          {focused && movieName && !movieId && (
            <ul className={styles.suggestBox}>
              {suggest.map((m) => (
                <li
                  key={m.id}
                  onMouseDown={() => {
                    setMovieName(m.title);
                    setMovieId(m.id);
                    setFocused(false);
                  }}
                >
                  <p>{m.title}</p>
                  <img src={m.image} alt={m.title} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ===== DAY ===== */}
        <div className={styles.formGroup}>
          <label>Ngày chiếu</label>
          <input type="date" value={day} onChange={(e) => setDay(e.target.value)} />
        </div>

        {/* ===== TIME ===== */}
        <div className={styles.formGroup}>
          <label>Giờ chiếu</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>

        {/* ===== ACTION ===== */}
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Huỷ
          </button>
          <button className={styles.submitBtn} onClick={handleSubmit}>
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
