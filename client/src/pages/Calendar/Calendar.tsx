import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import CardCalendar from "../../components/CardCalendar/CardCalendar";
import styles from "./Calendar.module.scss";

import { getAllShowtime } from "../../store/slices/calendar";
import { getAllMovie } from "../../store/slices/movieDetail";
import type { AppDispatch, RootState } from "../../store/stores";
import type { Genre } from "../../types";


export default function Calendar() {
  const dispatch = useDispatch<AppDispatch>();

  const { showtime } = useSelector((state: RootState) => state.calendar);
  const { movie } = useSelector((state: RootState) => state.movie);

  const [listDate, setListDate] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string >("");

  const [category, setCategory] = useState<Genre[]>([]);

  const today = new Date();
  const getYMD = (date: Date): string => {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  };

  useEffect(() => {
    fetch("http://localhost:8080/genres")
      .then((res) => res.json())
      .then((listMovie) => setCategory(listMovie));
  }, []);

  useEffect(() => {
    dispatch(getAllShowtime());
    dispatch(getAllMovie());
  }, [dispatch]);

  useEffect(() => {
    if (!showtime || showtime.length === 0) return;

    const dates = showtime.map((st) => st.day);

    const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    setListDate(uniqueDates.filter((d) => d >= getYMD(today)));
  }, [showtime]);

  useEffect(() => {
    if (listDate.length > 0 && !selectedDate) {
      setSelectedDate(listDate[0]);
    }
  }, [listDate, selectedDate]);

  const filteredShowtime = selectedDate ? showtime.filter((st) => st.day === selectedDate) : [];

  const movieShowtimeMap = filteredShowtime.reduce<Record<number, string[]>>((acc, st) => {
    if (!acc[st.movie_id]) {
      acc[st.movie_id] = [];
    }
    acc[st.movie_id].push(st.time);
    return acc;
  }, {});

  const formatDate = (date: string) => {
    const [year, month, day] = date.split("-");
    return `${day}-${month}-${year}`;
  };

  const getCategoryName = (idGenre: number) => {
    return category.find((c) => c.id === idGenre)?.genre_name || "";
  };

  return (
    <div style={{ backgroundColor: "#10141b" }} className={styles.container}>
      <div className={styles.flex}>
        <div className={styles.rectangle}></div>
        <h1>Phim đang chiếu</h1>
      </div>

      <div className={styles.flex}>
        {listDate.length > 0 ? (
          listDate.map((date) => (
            <span
              key={date}
              className={`${styles.dateBox} ${selectedDate === date ? styles.activeDay : ""}`}
              onClick={() => setSelectedDate(date)}
            >
              {formatDate(date)}
            </span>
          ))
        ) : (
          <div style={{ color: "#fff" }}>---- Không có ngày chiếu ----</div>
        )}
      </div>

      <p className={styles.note}>
        Lưu ý: Khán giả dưới 13 tuổi chỉ chọn suất chiếu kết thúc trước 22h và Khán giả dưới 16 tuổi chỉ chọn suất chiếu
        kết thúc trước 23h.
      </p>
      <div className={styles.containerMovie}>
        {Object.entries(movieShowtimeMap).map(([movieId, times]) => {
          const movieDetail = movie.find((m) => m.id === Number(movieId));
          if (!movieDetail) return null;

          return (
            <CardCalendar
              key={movieId}
              id={movieDetail.id}
              image={movieDetail.image}
              category={getCategoryName(movieDetail.genre_id)}
              time={movieDetail.duration}
              title={movieDetail.title}
              origin={movieDetail.author}
              releaseDate={formatDate(movieDetail.release_date)}
              ageRating={movieDetail.description}
              showtime={times}
              typeMovie={movieDetail.type}
               day={selectedDate}
            />
          );
        })}
      </div>
    </div>
  );
}