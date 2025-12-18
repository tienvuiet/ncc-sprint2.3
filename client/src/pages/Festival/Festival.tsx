import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import styles from "./Festival.module.scss";

const API_URL = "http://localhost:8080/festival";

type FestivalEvent = {
  id: number;
  name: string;
  date?: string;
  created_at?: string;
  image: string;
  description: string;
};

const formatTimeVN = (dateStr?: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);

  const time = d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const date = d.toLocaleDateString("vi-VN"); // dd/mm/yyyy

  return `${time} ${date}`;
};


export default function Festival() {
  const [events, setEvents] = useState<FestivalEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    setLoading(true);
    fetch(API_URL)
      .then((res) => res.json())
      .then((data: FestivalEvent[]) => {
        const arr = Array.isArray(data) ? data : [];

        const sorted = [...arr].sort((a, b) => {
          const ta = new Date(a.created_at || a.date || 0).getTime();
          const tb = new Date(b.created_at || b.date || 0).getTime();
          return tb - ta;
        });

        setEvents(sorted);
        setPage(1);
      })
      .catch((err) => {
        console.error("Lỗi tải festival:", err);
        setEvents([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const featuredEvent = events.find((e) => e.image?.trim());
  const featuredImage = featuredEvent?.image;


  const totalPages = Math.ceil(events.length / pageSize) || 1;

  const paginated = useMemo(() => {
    return events.slice((page - 1) * pageSize, page * pageSize);
  }, [events, page]);

  const goPrev = () => {
    setPage((p) => Math.max(1, p - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goNext = () => {
    setPage((p) => Math.min(totalPages, p + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <img
        src={featuredImage}
        alt="Festival Banner"
        className={styles["festival-banner"]}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src =
            "https://res.cloudinary.com/dfzpwkldb/image/upload/v1765356837/Festival_1_opwyz5.png";
        }}
      />

      <div className={styles["film-list"]}>
        {loading && <p style={{ padding: 12 }}>Đang tải dữ liệu...</p>}

        {!loading &&
          paginated.map((f) => (
            <div className={styles["film-item"]} key={f.id}>
              <h3 className={styles["film-title-mobile"]}>
                <Link to={`/festivalDetail/${f.id}`}>{f.name}</Link>
              </h3>
              
              <div className={styles["film-row"]}>
                <Link to={`/festivalDetail/${f.id}`}>
                  <img className={styles["film-thumb"]} src={f.image} alt={f.name} />
                </Link>

                <div className={styles["film-content"]}>
                  <div className={styles["film-header"]}>
                    <Link to={`/festivalDetail/${f.id}`}>
                      <h3 className={styles["film-title-pc"]}>{f.name}</h3>
                    </Link>

                    <span className={styles["film-time"]}>
                      {formatTimeVN(f.created_at || f.date)}
                    </span>

                  </div>

                  <p className={styles["film-desc"]}>{f.description}</p>
                </div>
              </div>
            </div>
          ))}

        {!loading && paginated.length === 0 && (
          <p style={{ padding: 12 }}>Chưa có sự kiện nào.</p>
        )}
        {!loading && (
          <div className={styles["pagination"]}>
            <button
              className={styles["btn-outline"]}
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Quay lại
            </button>

            <button
              className={styles["btn-primary"]}
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Tiếp theo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
