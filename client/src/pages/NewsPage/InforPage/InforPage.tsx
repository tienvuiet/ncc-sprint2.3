import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./InforPage.module.scss";

const API_URL = "http://localhost:8080/news";

interface NewsItem {
    id: number;
    title: string;
    content: string; // HTML từ CKEditor
    image: string;
    created_at: string;
}

const InforPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [news, setNews] = useState<NewsItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        fetch(`${API_URL}/${id}`)
            .then((res) => {
                if (!res.ok) throw new Error("Not found");
                return res.json();
            })
            .then((data) => {
                setNews(data);
                setLoading(false);
            })
            .catch(() => {
                setNews(null);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <p>Đang tải bài viết...</p>;
    if (!news) return <h2>Bài viết không tồn tại</h2>;

    return (
        <div className={styles["infor-page"]}>
            <div className={styles["info-content"]}>
                <h1>{news.title}</h1>

                <p>
                    <strong>Ngày đăng:</strong>{" "}
                    {new Date(news.created_at).toLocaleDateString("vi-VN")}
                </p>

                {/* ✅ RENDER HTML + ẢNH TỪ CKEDITOR */}
                <div
                    className={styles["info-text"]}
                    dangerouslySetInnerHTML={{ __html: news.content }}
                />

                {/* Ảnh đại diện (nếu có) */}
                {news.image && (
                    <div className={styles["info-image"]}>
                        <img src={news.image} alt={news.title} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default InforPage;
