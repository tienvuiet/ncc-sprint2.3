import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import styles from "./promotion-detail.module.scss";

type Promotion = {
  id: number | string;
  title: string;
  image: string;
  content: string;
  created_at: string;
};

const API_URL =
  (import.meta as any).env?.VITE_API_URL ?? "http://localhost:8080";

export default function PromotionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/promotions/${id}`);
        if (!res.ok) throw new Error("Không thể tải chi tiết khuyến mãi");
        const data: Promotion = await res.json();
        setPromotion(data);
      } catch (err) {
        console.error(err);
        setPromotion(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) {
    return <p>Đang tải chi tiết khuyến mãi...</p>;
  }

  if (!promotion) {
    return <p>Không tìm thấy khuyến mãi</p>;
  }

  return (
    <main className={styles.detail}>
      <Link to="/promotion" className={styles.back}>
        ← Quay lại danh sách
      </Link>

      <h1 className={styles.title}>{promotion.title}</h1>
      <p className={styles.date}>{promotion.created_at}</p>

      {/* <div className={styles.imageWrap}>
        <img src={promotion.image} alt={promotion.title} />
      </div> */}

      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: promotion.content }}
      />
    </main>
  );
}
