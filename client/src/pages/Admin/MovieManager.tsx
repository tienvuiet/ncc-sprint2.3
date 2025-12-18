import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, Edit, Trash2, Film } from "lucide-react";
import axiosClient from "../../apis/axiosClient";

/* ================= TYPES ================= */

interface Movie {
  id: number;
  title: string;
  description: string | null;
  author: string | null;
  image: string | null;
  trailer: string | null;
  type: "2D" | "3D";
  duration: number | null;
  release_date: string;
  created_at: string;
  updated_at: string;
  genre_id?: number;
}

interface Genre {
  id: number;
  genre_name: string;
}

/* ================= CONSTANT ================= */

const PAGE_SIZE = 5;
const DURATION_OPTIONS = [90, 120, 150, 180];

/* ================= COMPONENT ================= */

const MovieManager: React.FC = () => {
  const [search, setSearch] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    author: "",
    image: "",
    trailer: "",
    type: "2D" as "2D" | "3D",
    genre_name: "",
    duration: "",
    release_date: "",
  });

  /* ================= FETCH ================= */

  const fetchMovies = async () => {
    const res = await axiosClient.get("/movies");
    setMovies(Array.isArray(res.data) ? res.data : []);
  };

  const fetchGenres = async () => {
    const res = await axiosClient.get("/genres");
    setGenres(Array.isArray(res.data) ? res.data : []);
  };

  useEffect(() => {
    fetchMovies();
    fetchGenres();
  }, []);

  /* ================= HELPERS ================= */

  const genreNameById = useMemo(() => {
    const map = new Map<number, string>();
    genres.forEach((g) => map.set(g.id, g.genre_name));
    return map;
  }, [genres]);

  const getMovieGenreName = (m: Movie) => {
    if (typeof m.genre_id === "number") {
      return genreNameById.get(m.genre_id) || "—";
    }
    return "—";
  };

  const getGenreIdFromForm = () => {
    const found = genres.find((g) => g.genre_name === formData.genre_name);
    return found?.id;
  };

  /* ================= SEARCH & PAGINATION ================= */

  const filtered = movies.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedMovies = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  /* ================= HANDLERS ================= */

  const resetModal = () => {
    setIsModalOpen(false);
    setEditingMovie(null);
    setFormData({
      title: "",
      description: "",
      author: "",
      image: "",
      trailer: "",
      type: "2D",
      genre_name: "",
      duration: "",
      release_date: "",
    });
  };

  const handleAddNew = () => {
    resetModal();
    setIsModalOpen(true);
  };

  const handleEdit = (movie: Movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title,
      description: movie.description || "",
      author: movie.author || "",
      image: movie.image || "",
      trailer: movie.trailer || "",
      type: movie.type,
      genre_name:
        typeof movie.genre_id === "number"
          ? genreNameById.get(movie.genre_id) || ""
          : "",
      duration: movie.duration?.toString() || "",
      release_date: movie.release_date,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa phim này?")) return;
    await axiosClient.delete(`/movies/${id}`);
    await fetchMovies();
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.genre_name || !formData.release_date) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    const genre_id = getGenreIdFromForm();
    if (!genre_id) {
      alert("Thể loại không hợp lệ!");
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description || null,
      author: formData.author || null,
      image: formData.image || null,
      trailer: formData.trailer || null,
      type: formData.type,
      duration: formData.duration ? Number(formData.duration) : null,
      release_date: formData.release_date,
      genre_id,
      updated_at: new Date().toISOString(),
    };

    if (editingMovie) {
      await axiosClient.patch(`/movies/${editingMovie.id}`, payload);
    } else {
      await axiosClient.post("/movies", {
        ...payload,
        created_at: new Date().toISOString(),
      });
    }

    await fetchMovies();
    resetModal();
  };

  /* ================= RENDER ================= */

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
          <Film className="w-6 h-6 text-blue-600" />
          Quản lý phim
        </h2>

        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Thêm phim
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Tìm theo tên phim..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-6 py-3 text-left">STT</th>
              <th className="px-6 py-3 text-left">Tên phim</th>
              <th className="px-6 py-3 text-left">Thể loại</th>
              <th className="px-6 py-3 text-left">Thời lượng</th>
              <th className="px-6 py-3 text-left">Ngày phát hành</th>
              <th className="px-6 py-3 text-center">Thao tác</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {paginatedMovies.map((m, i) => (
              <tr key={m.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">{startIndex + i + 1}</td>

                <td className="px-6 py-4 font-medium break-words">
                  {m.title}
                </td>

                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700">
                    {getMovieGenreName(m)}
                  </span>
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {m.duration ? `${m.duration} phút` : "—"}
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {new Date(m.release_date).toLocaleDateString("vi-VN")}
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEdit(m)}
                      className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 text-yellow-700 transition"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {paginatedMovies.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  Không có phim nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-sm text-gray-500">
          Hiển thị {paginatedMovies.length} / {filtered.length}
        </p>

        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 rounded-lg border hover:bg-gray-100 disabled:opacity-40"
          >
            {"<"}
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded-lg border transition ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white border-blue-600"
                  : "hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 rounded-lg border hover:bg-gray-100 disabled:opacity-40"
          >
            {">"}
          </button>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-[800px] max-h-[85vh] overflow-y-auto p-6 space-y-4">
            <h3 className="text-xl font-bold text-gray-800">
              {editingMovie ? "Chỉnh sửa phim" : "Thêm phim mới"}
            </h3>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <input
                  className="w-full border border-gray-300 p-2 rounded-lg"
                  placeholder="Tên phim *"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />

                <textarea
                  rows={4}
                  className="w-full border border-gray-300 p-2 rounded-lg"
                  placeholder="Mô tả"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                />

                <input
                  className="w-full border border-gray-300 p-2 rounded-lg"
                  placeholder="Đạo diễn"
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                />

                <input
                  type="url"
                  className="w-full border border-gray-300 p-2 rounded-lg"
                  placeholder="URL Trailer"
                  value={formData.trailer}
                  onChange={(e) =>
                    setFormData({ ...formData, trailer: e.target.value })
                  }
                />
              </div>

              <div className="space-y-3">
                <select
                  className="w-full border border-gray-300 p-2 rounded-lg"
                  value={formData.genre_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      genre_name: e.target.value,
                    })
                  }
                >
                  <option value="">-- Chọn thể loại --</option>
                  {genres.map((g) => (
                    <option key={g.id} value={g.genre_name}>
                      {g.genre_name}
                    </option>
                  ))}
                </select>

                <select
                  className="w-full border border-gray-300 p-2 rounded-lg"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as "2D" | "3D",
                    })
                  }
                >
                  <option value="2D">2D</option>
                  <option value="3D">3D</option>
                </select>

                <select
                  className="w-full border border-gray-300 p-2 rounded-lg"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: e.target.value,
                    })
                  }
                >
                  <option value="">-- Thời lượng --</option>
                  {DURATION_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d} phút
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  className="w-full border border-gray-300 p-2 rounded-lg"
                  value={formData.release_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      release_date: e.target.value,
                    })
                  }
                />

                <input
                  type="url"
                  className="w-full border border-gray-300 p-2 rounded-lg"
                  placeholder="URL hình ảnh"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                />

                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="h-40 object-contain rounded-lg border"
                  />
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
              >
                Lưu
              </button>
              <button
                onClick={resetModal}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieManager;