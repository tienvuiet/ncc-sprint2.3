import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";

import "swiper/swiper-bundle.css";
import axiosClient from "../../apis/axiosClient";
import { useNavigate } from "react-router-dom";
import BookmarkButton from "../../components/bookMark/BookmarkButton";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
/* ======================================================
   TYPE
====================================================== */
type Movie = {
  id: number;
  title: string;
  rating: number;
  poster: string;
  genre?: string;
  release_date: string;
};

type EventItem = {
  id: number;
  title: string;
  image: string;
};

/* ======================================================
   PROMOS
====================================================== */
const promos = [
  {
    id: 1,
    title: "Đồng giá 25K trước 12h",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&h=600&fit=crop",
  },
  {
    id: 2,
    title: "Combo bắp nước siêu hời",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop",
  },
];

/* ======================================================
   HERO
====================================================== */
/* ======================================================
   HERO
====================================================== */
const Hero: React.FC = () => (
  <section className="pt-7">
    <div className="relative mx-4 lg:mx-8 rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
      <Slider
        dots
        infinite
        speed={800}
        slidesToShow={1}
        slidesToScroll={1}
        autoplay
        autoplaySpeed={4500}
        fade
        arrows={false}
        pauseOnHover
      >
        {[
          {
            id: 1,
            image: "https://res.cloudinary.com/diprwc5iy/image/upload/v1765361311/banner_ebzzbo.jpg",
          },
          {
            id: 2,
            image: "https://res.cloudinary.com/diprwc5iy/image/upload/v1765980099/banner1_zck4d5.webp",
          },
          {
            id: 3,
            image: "https://res.cloudinary.com/diprwc5iy/image/upload/v1765980099/banner4_bav4ju.webp",
          },
          {
            id: 4,
            image: "https://res.cloudinary.com/diprwc5iy/image/upload/v1765980099/banner3_g78lvq.webp",
          },
          {
            id: 5,
            image: "https://res.cloudinary.com/diprwc5iy/image/upload/v1765980100/banner2_tszojf.webp",
          },
        ].map((banner) => (
          <div key={banner.id}>
            <div className="relative h-[60vh] md:h-[70vh] lg:h-[80vh] max-h-[850px]">
              <img
                src={banner.image}
                alt="Movie banner"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </div>
          </div>
        ))}
      </Slider>
    </div>
  </section>
);

/* ======================================================
   SECTION TITLE
====================================================== */
const SectionHeading: React.FC<{ title: string; color?: string }> = ({
  title,
  color = "#e5e5e5",
}) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl md:text-2xl font-bold" style={{ color }}>
      {title}
    </h2>
  </div>
);

/* ======================================================
   MOVIE CARD
====================================================== */
const MovieCard: React.FC<{ movie: Movie }> = ({ movie }) => {
  const navigate = useNavigate();

  return (
    <div className="group relative overflow-hidden rounded-xl bg-[#1a1a1a] border border-white/5 shadow-lg shadow-black/40 transition hover:-translate-y-1 hover:shadow-[#dc2626]/20">
      <div className="relative h-[280px]">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover transition group-hover:scale-105"
        />

        <div className="absolute top-3 right-3 z-20">
          <BookmarkButton
            movieId={movie.id}
            className="bg-black/35 hover:bg-black/55 border border-white/15 backdrop-blur-sm"
          />
        </div>

        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-black/60 flex items-center justify-center">
          <button
            className="px-4 py-2 cursor-pointer bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg"
            onClick={() => navigate(`/movieDetail/${movie.id}`)}
          >
            Đặt vé
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black via-black/60 to-transparent">
          <div className="flex items-center gap-2 text-yellow-400 text-sm font-semibold">
            <Star className="w-4 h-4 fill-yellow-400" />
            {movie.rating.toFixed(1)}
          </div>
          <p className="mt-1 font-semibold text-white line-clamp-1">
            {movie.title}
          </p>
          <div className="mt-1 text-xs text-gray-300">
            {new Date(movie.release_date).toLocaleDateString("vi-VN")}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ======================================================
   SIDEBAR
====================================================== */
const Sidebar: React.FC<{
  topHot: Movie[];
  events: EventItem[];
}> = ({ topHot, events }) => {
  const navigate = useNavigate(); // ✅ BẮT BUỘC

  return (
    <aside className="w-[300px] shrink-0 sticky top-24 space-y-6">
      {/* PROMOS */}
      <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-4">
        <h3 className="text-lg font-semibold text-white mb-3">Khuyến mãi</h3>
        {promos.map((p, i) => (
          <img
            key={p.id}
            src={p.image}
            className={`rounded-lg ${i !== 0 ? "mt-3" : ""}`}
          />
        ))}
      </div>

      {/* EVENTS */}
      <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Sự kiện</h3>
          <button
            onClick={() => navigate("/festival")}
            className="text-sm cursor-pointer text-while-400 hover:underline"
          >
            Xem tất cả
          </button>
        </div>

        {events.length > 0 && (
          <Swiper
            key={events.length}
            modules={[Autoplay, Pagination]}
            slidesPerView={1}
            loop
            autoplay={{
              delay: 2000,
              disableOnInteraction: false,
            }}
            speed={200}
            pagination={{ clickable: true }}
          >
            {Array.from({ length: Math.ceil(events.length / 3) }).map((_, i) => (
              <SwiperSlide key={i}>
                <div className="space-y-3">
                  {events.slice(i * 3, i * 3 + 3).map((ev) => (
                    <div
                      key={ev.id}
                      className="group overflow-hidden rounded-lg"
                    >
                      <img
                        src={ev.image}
                        className="
                        w-full h-[110px] object-cover
                        transition-transform duration-200 ease-out
                        group-hover:scale-110
                      "
                      />
                    </div>

                  ))}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      {/* TOP HOT */}
      <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-4">
        <h3 className="text-lg font-semibold mb-3 text-white">Top phim hot</h3>
        <div className="space-y-3">
          {topHot.map((movie) => (
            <div key={movie.id} className="flex items-center gap-3">
              <img src={movie.poster} className="w-14 h-14 rounded-md" />
              <div>
                <p className="text-sm text-white font-semibold">
                  {movie.title}
                </p>
                <div className="text-xs text-yellow-400">
                  ⭐ {movie.rating.toFixed(1)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

/* ======================================================
   HOME PAGE
====================================================== */
export default function HomePage() {
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
  const [comingSoon, setComingSoon] = useState<Movie[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [movieRes, genreRes, eventRes] = await Promise.all([
        axiosClient.get("/movies"),
        axiosClient.get("/genres"),
        axiosClient.get("/festival"), // 👈 DB sự kiện
      ]);

      setEvents(eventRes.data);

      const genreMap = new Map<number, string>();
      genreRes.data.forEach((g: any) =>
        genreMap.set(g.id, g.genre_name)
      );

      const mapped: Movie[] = movieRes.data.map((m: any) => ({
        id: m.id,
        title: m.title,
        poster: m.image,
        genre: genreMap.get(m.genre_id),
        release_date: m.release_date,
        rating: +(Math.random() * (10 - 8) + 8).toFixed(1),
      }));

      const today = new Date();
      setNowPlaying(mapped.filter((m) => new Date(m.release_date) <= today));
      setComingSoon(mapped.filter((m) => new Date(m.release_date) > today));
    };

    fetchData();
  }, []);

  const topHot = nowPlaying.slice(0, 3);

  return (
    <div className="bg-[#0a0a0a] text-[#e5e5e5] min-h-screen">
      <Hero />

      <div className="container mx-auto px-4 lg:px-6 xl:px-8 mt-12 flex gap-8">
        <div className="flex-1 space-y-12">
          <MovieGrid
            title="🔴 PHIM ĐANG CHIẾU"
            movies={nowPlaying}
            colorTitle="#f97316"
          />
          <MovieGrid
            title="⏳ PHIM SẮP CHIẾU"
            movies={comingSoon}
            colorTitle="#60a5fa"
          />
        </div>

        <div className="hidden xl:block">
          <Sidebar topHot={topHot} events={events} />
        </div>
      </div>
    </div>
  );
}

/* ======================================================
   MOVIE GRID
====================================================== */
const MovieGrid: React.FC<{
  title: string;
  movies: Movie[];
  colorTitle?: string;
}> = ({ title, movies, colorTitle }) => (
  <section className="space-y-4">
    <SectionHeading title={title} color={colorTitle} />
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  </section>
);
