import React, { useEffect, useMemo, useState } from "react";
import styles from "./promotions.module.scss";

type PromotionFromDb = {
  id: number | string;
  title: string;
  image: string;
  created_at: string; // DD/MM/YYYY
};

type PromotionUI = {
  id: number | string;
  title: string;
  date: string;
  imageUrl: string;
  href?: string;
};

const API_URL =
  (import.meta as any).env?.VITE_API_URL ?? "http://localhost:8080";
const PAGE_SIZE = 8;

export default function PromotionsPage() {
  const [rawPromotions, setRawPromotions] = useState<PromotionFromDb[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/promotions`);
        if (!res.ok) throw new Error("Không thể tải khuyến mãi");
        const data: PromotionFromDb[] = await res.json();
        setRawPromotions(data);
        setPage(1);
      } catch (e) {
        console.error(e);
        setRawPromotions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  const promotions: PromotionUI[] = useMemo(() => {
    return rawPromotions.map((p) => ({
      id: p.id,
      title: p.title,
      date: p.created_at,
      imageUrl: p.image,
      href: `/promotions/${p.id}`,
    }));
  }, [rawPromotions]);

  const totalPages = Math.max(1, Math.ceil(promotions.length / PAGE_SIZE));

  const paginatedPromotions = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return promotions.slice(start, start + PAGE_SIZE);
  }, [promotions, page]);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className={styles.ncc}>
      <main className={styles["ncc__content"]}>
        <div className={styles["ncc__container"]}>
          <h3 className={styles["ncc__title"]}>Khuyến mãi</h3>

          <div className={styles["ncc__grid"]}>
            {loading && paginatedPromotions.length === 0 ? (
              <div
                className={styles["ncc__card"]}
                role="article"
                aria-label="loading"
              >
                <div className={styles["ncc__meta"]}>
                  <p className={styles["ncc__date"]}>Đang tải...</p>
                  <h3 className={styles["ncc__cardTitle"]}>Vui lòng chờ</h3>
                </div>
              </div>
            ) : (
              paginatedPromotions.map((p) =>
                p.href ? (
                  <a
                    key={p.id}
                    className={styles["ncc__card"]}
                    href={p.href}
                    aria-label={p.title}
                  >
                    <div className={styles["ncc__thumb"]}>
                      <img src={p.imageUrl} alt="promotion" loading="lazy" />
                    </div>

                    <div className={styles["ncc__meta"]}>
                      <p className={styles["ncc__date"]}>{p.date}</p>
                      <h3 className={styles["ncc__cardTitle"]}>{p.title}</h3>
                    </div>
                  </a>
                ) : (
                  <div
                    key={p.id}
                    className={styles["ncc__card"]}
                    role="article"
                    aria-label={p.title}
                  >
                    <div className={styles["ncc__thumb"]}>
                      <img src={p.imageUrl} alt="promotion" loading="lazy" />
                    </div>

                    <div className={styles["ncc__meta"]}>
                      <p className={styles["ncc__date"]}>{p.date}</p>
                      <h3 className={styles["ncc__cardTitle"]}>{p.title}</h3>
                    </div>
                  </div>
                )
              )
            )}
          </div>

          {/* Giữ UI 2 nút */}
          <div className={styles["ncc__pager"]}>
            <button
              className={styles["ncc__pagerBtn"]}
              type="button"
              onClick={handlePrev}
              disabled={page === 1}
            >
              Quay lại
            </button>

            <button
              className={styles["ncc__pagerBtn"]}
              type="button"
              onClick={handleNext}
              disabled={page === totalPages}
            >
              Tiếp theo
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
