import React, { useMemo } from "react";
import styles from "./CardCalendar.module.scss";
import { useNavigate } from "react-router-dom";

interface CardCalendarProps {
  image: string;
  category: string;
  title: string;
  origin: string;
  releaseDate: string;
  ageRating: string;
  showtime: string[];
  time: number;
  typeMovie: string;
  id: number;
  day: string;
}

/* ===================== HELPER ===================== */
function sortTimes(times: string[]) {
  return [...times].sort((a, b) => {
    const [ah, am] = a.split(":").map(Number);
    const [bh, bm] = b.split(":").map(Number);
    return ah * 60 + am - (bh * 60 + bm);
  });
}

const CardCalendar: React.FC<CardCalendarProps> = ({
  image,
  category,
  title,
  origin,
  releaseDate,
  ageRating,
  showtime,
  time,
  typeMovie,
  id,
  day,
}) => {
  const navigate = useNavigate();

  /* ===================== SORT SHOWTIME ===================== */
  const sortedShowtime = useMemo(() => sortTimes(showtime), [showtime]);

  return (
    <div className={styles.card}>
      {/* ===================== IMAGE ===================== */}
      <div className={styles.cardImage} onClick={() => navigate(`/movieDetail/${id}`)}>
        <img src={image} alt={title} />
      </div>

      {/* ===================== CONTENT ===================== */}
      <div className={styles.cardContent}>
        <div className={styles.info}>
          <div className={styles.flex}>
            <div className={styles.category}>
              <span>{category}</span>
              <span>{time} phút</span>
            </div>
            <div className={styles.type}>{typeMovie}</div>
          </div>

          <div className={styles.title} onClick={() => navigate(`/movieDetail/${id}`)}>
            {title}
          </div>

          <div className={styles.origin}>Xuất xứ: {origin}</div>
          <div className={styles.releaseDate}>Khởi chiếu: {releaseDate}</div>
          <div className={styles.rating}>{ageRating}</div>
        </div>

        {/* ===================== SHOWTIME ===================== */}
        <div className={styles.scheduleTitle}>Lịch chiếu</div>

        <div className={styles.showTimeBox}>
          {sortedShowtime.map((t) => (
            <button
              key={t}
              className={styles.showtimeButton}
              onClick={() => {
                navigate(`/movieDetail/${id}?day=${day}&time=${t}`);
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardCalendar;