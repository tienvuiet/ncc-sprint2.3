import { useEffect, useState, useMemo } from "react";
import styles from "./MovieDetail.module.scss";
import { useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/stores";
import { getAllMovie } from "../../store/slices/movieDetail";
import { getAllShowtime } from "../../store/slices/calendar";
import SeatSelection from "../../components/SeatSelection/SeatSelection";
import TrailerModal from "../../components/Trailer/TrailerModal";

export default function MovieDetail() {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const { id } = useParams();
  const movieId = Number(id);

  const [searchParams] = useSearchParams();
  const dayFromQuery = searchParams.get("day");
  const timeFromQuery = searchParams.get("time");

  const [open, setOpen] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const { movie, loading: movieLoading } = useSelector((state: RootState) => state.movie);

  const { showtime, loading: showtimeLoading } = useSelector((state: RootState) => state.calendar);

  useEffect(() => {
    dispatch(getAllMovie());
    dispatch(getAllShowtime());
  }, [dispatch]);

  const movieDetail = useMemo(() => movie.find((m) => m.id === movieId) || null, [movie, movieId]);

  const showtimeMovie = useMemo(() => {
    if (!movieDetail) return [];
    return showtime.filter((st) => st.movie_id === movieDetail.id);
  }, [showtime, movieDetail]);

  const days = useMemo(() => Array.from(new Set(showtimeMovie.map((st) => st.day))), [showtimeMovie]);

  const hours = useMemo(
    () => showtimeMovie.filter((st) => st.day === selectedDay).map((st) => st.time),
    [showtimeMovie, selectedDay]
  );

  const selectedShowtime = useMemo(
    () => showtimeMovie.find((st) => st.day === selectedDay && st.time === selectedTime),
    [showtimeMovie, selectedDay, selectedTime]
  );

  useEffect(() => {
    if (!movieDetail || showtimeMovie.length === 0) return;

    if (dayFromQuery && days.includes(dayFromQuery)) {
      setSelectedDay(dayFromQuery);
    } else if (!selectedDay && days.length > 0) {
      setSelectedDay(days[0]);
    }
  }, [dayFromQuery, days, movieDetail, showtimeMovie, selectedDay]);

  useEffect(() => {
    if (!selectedDay || !timeFromQuery) return;

    if (hours.includes(timeFromQuery)) {
      setSelectedTime(timeFromQuery);
    }
  }, [selectedDay, timeFromQuery, hours]);

  if (movieLoading || showtimeLoading) return <p>Loading...</p>;
  if (!movieDetail) return <p>Không có dữ liệu phim</p>;

  return (
    <div>
      <div className={styles["movie-page"]}>
        <div className={styles.banner}>
          <img src={movieDetail.image} className={styles["banner-img"]} alt={movieDetail.title} />
          <div className={styles["banner-overlay"]} />

          <div className={`${styles["detail-container"]} ${styles.desktop}`}>
            <div className={styles.poster}>
              <img src={movieDetail.image} alt="Poster" />
            </div>

            <div className={styles["movie-info"]}>
              <div className={styles["title-row"]}>
                <h3 className={styles.title}>{movieDetail.title}</h3>
                <span className={styles.tag}>{movieDetail.type}</span>
              </div>

              <div className={styles.meta}>
                <p>{movieDetail.duration} phút</p>
                <p>Đạo diễn: {movieDetail.author}</p>
              </div>

              <p>Khởi chiếu: {movieDetail.release_date}</p>
              <p className={styles.description}>{movieDetail.description}</p>

              <p className={styles.rating}>Kiểm duyệt: T16 - dành cho người từ 16+</p>
              <div className={styles.actions}>
                <button className={styles["detail-btn"]}>Chi tiết nội dung</button>

                <button className={styles["trailer-btn"]} onClick={() => setOpen(true)}>
                  Xem trailer
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.schedule}>
          {/* DAY */}
          <div className={styles["date-tabs"]}>
            {days.map((day) => (
              <button
                key={day}
                className={`${styles.tab} ${selectedDay === day ? styles.tabActive : ""}`}
                onClick={() => {
                  setSelectedDay(day);
                  setSelectedTime(null);
                }}
              >
                {day}
              </button>
            ))}
          </div>

          {/* TIME */}
          <div className={styles["time-list"]}>
            {hours.map((time) => (
              <button
                key={time}
                className={`${styles["time-item"]} ${selectedTime === time ? styles.timeActive : ""}`}
                onClick={() => setSelectedTime(time)}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      </div>

      <TrailerModal open={open} onClose={() => setOpen(false)} trailerUrl={movieDetail.trailer} />

      {/* ===================== SEAT SELECTION ===================== */}
      {selectedDay && selectedTime && selectedShowtime && (
        <SeatSelection
          movie={movieDetail}
          day={selectedDay}
          time={selectedTime}
          showtimeId={selectedShowtime.id}
          onBack={() => setSelectedTime(null)}
        />
      )}
    </div>
  );
}