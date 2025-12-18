import { useState, useEffect } from "react";
import styles from "./ModalShowtime.module.scss";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store/stores";
import { addShowtime } from "../../store/slices/calendar";

interface ModalShowtimeProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

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

export default function ModalShowtime({ open, onClose, onSuccess }: ModalShowtimeProps) {
  const dispatch = useDispatch<AppDispatch>();

  const [movieId, setMovieId] = useState<number|null>(null);
  const [movieName, setMovieName] = useState("");
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
      .then((data) => setMovies(data))
      .catch(() => toast.error("Không tải được danh sách phim"));
  }, []);

  /* ================= FETCH SHOWTIMES ================= */
  useEffect(() => {
    if (!open) return;

    fetch("http://localhost:8080/showtimes")
      .then((res) => res.json())
      .then((data) => setShowtimes(data))
      .catch(() => toast.error("Không tải được lịch chiếu"));
  }, [open]);

  /* ================= SUGGEST MOVIE ================= */
  useEffect(() => {
    const keyword = movieName.toLowerCase();

    if (!keyword) {
      setSuggest([]);
      setMovieId(null);
      return;
    }

    const suggestList = movies.filter((m) => m.title.toLowerCase().includes(keyword));

    setSuggest(suggestList);

    const exactMovie = movies.find((m) => m.title.toLowerCase() === keyword);

    setMovieId(exactMovie ? exactMovie.id : null);
  }, [movieName, movies]);

  if (!open) return null;

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!movieId) {
      toast.warning("Vui lòng nhập đúng tên phim");
      return;
    }

    if (!day) {
      toast.warning("Vui lòng chọn ngày chiếu");
      return;
    }

    if (!time) {
      toast.warning("Vui lòng chọn giờ chiếu");
      return;
    }

    /* ===== CHECK TRÙNG GIỜ ===== */
    const isDuplicate = showtimes.some((st) => st.movie_id === movieId && st.day === day && st.time === time);

    if (isDuplicate) {
      toast.warning("Giờ chiếu đã tồn tại cho phim này trong ngày này");
      return;
    }

    /* ===== OPTIONAL: KHÔNG CHO GIỜ QUÁ KHỨ ===== */
    const selectedDateTime = new Date(`${day}T${time}`);
    if (selectedDateTime < new Date()) {
      toast.warning("Không thể chọn giờ trong quá khứ");
      return;
    }

    const payload = {
      movie_id: movieId,
      day,
      time,
      created_at: new Date().toISOString().split("T")[0],
    };

    try {
      await dispatch(addShowtime(payload)).unwrap();
      toast.success("Thêm lịch chiếu thành công");

      onSuccess();
      onClose();

      setMovieId(null);
      setMovieName("");
      setDay("");
      setTime("");
    } catch (err) {
      console.error(err);
      toast.error("Thêm lịch chiếu thất bại");
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.title}>Thêm lịch chiếu</h3>

        {/* ===== MOVIE ===== */}
        <div className={styles.formGroup}>
          <label>Tên phim {movieId && `#${movieId}`}</label>
          <input
            value={movieName}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            onChange={(e) => setMovieName(e.target.value)}
          />

          {movieName && !movieId && focused && (
            <ul className={styles.suggestBox}>
              {suggest.map((m) => (
                <li
                  key={m.id}
                  onClick={() => {
                    setMovieName(m.title);
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
            Thêm
          </button>
        </div>
      </div>
    </div>
  );
}
