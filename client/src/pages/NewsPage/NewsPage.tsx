import React, { useEffect, useState } from "react";
import styles from "../NewsPage/NewsPage.module.scss";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:8080/news";

interface NewsItem {
    id: number;
    title: string;
    image: string;
    created_at: string;
}

const PAGE_SIZE = 8;

const NewsPage: React.FC = () => {
    const [newsData, setNewsData] = useState<NewsItem[]>([]);
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetch(API_URL)
            .then((res) => res.json())
            .then((data) => setNewsData(data));
    }, []);

    const totalPages = Math.ceil(newsData.length / PAGE_SIZE);

    const paginatedNews = newsData.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    return (
        <div className={styles["news-page"]}>
            <div className={styles["page-title"]}>
                <h1>Tin tức</h1>
            </div>

            <div className={styles.container}>
                <div className={styles["news-grid"]}>
                    {paginatedNews.map((news) => (
                        <Link
                            to={`/news/${news.id}`}
                            key={news.id}
                            className={styles["news-card"]}
                        >
                            <div className={styles.thumb}>
                                <img src={news.image} alt={news.title} />
                            </div>

                            <div className={styles.content}>
                                <span className={styles.date}>
                                    {new Date(news.created_at).toLocaleDateString("vi-VN")}
                                </span>
                                <h3 className={styles.title}>{news.title}</h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        Quay lại
                    </button>

                    <span>
                        {page} / {totalPages}
                    </span>

                    <button
                        className={styles.next}
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Tiếp theo
                    </button>
                </div>
            )}
        </div>
    );
};

export default NewsPage;
