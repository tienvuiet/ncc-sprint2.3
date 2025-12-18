import React, { useEffect, useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import styles from "./UserManager.module.scss";
import { Toaster, toast } from "sonner";

type DbUser = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: "ACTIVE" | "BLOCKED";
};

const API_URL =
  (import.meta as any).env?.VITE_API_URL ?? "http://localhost:8080";

export default function UserManager() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [users, setUsers] = useState<DbUser[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    const tId = toast.loading("Đang tải danh sách người dùng...");
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/users`);
      if (!res.ok) throw new Error("Không thể tải danh sách người dùng.");
      const data: DbUser[] = await res.json();
      setUsers(data);
      toast.success("Tải người dùng thành công!", { id: tId });
    } catch (e: any) {
      toast.error(e?.message ?? "Có lỗi xảy ra.", { id: tId });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return users;

    return users.filter((u) => {
      const fullName = `${u.first_name} ${u.last_name}`.toLowerCase();
      return (
        fullName.includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone ?? "").toLowerCase().includes(q)
      );
    });
  }, [users, search]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleStatus = async (user: DbUser) => {
    const nextStatus: DbUser["status"] =
      user.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    const tId = toast.loading("Đang cập nhật trạng thái...");

    // optimistic UI
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
    );

    try {
      const res = await fetch(`${API_URL}/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) throw new Error("Cập nhật trạng thái thất bại.");

      toast.success(`Đã đổi trạng thái: ${user.status} → ${nextStatus}`, {
        id: tId,
      });
    } catch (e: any) {
      // rollback nếu lỗi
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: user.status } : u))
      );
      toast.error(e?.message ?? "Có lỗi xảy ra.", { id: tId });
    }
  };

  return (
    <div className={styles.container}>
      <Toaster richColors position="top-right" />

      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>
          <Users className={styles.icon} />
          Quản lý người dùng
        </h2>

        {/* thay nút thêm bằng tổng số người */}
        <div className={styles.createButton}>Tổng số người: {users.length}</div>
      </div>

      {/* Search */}
      <div className={styles.searchWrapper}>
        <Search className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Tìm người dùng..."
          className={styles.searchInput}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>ID</th>
              <th className={styles.th}>Tên</th>
              <th className={styles.th}>Email</th>
              <th className={styles.th}>Số điện thoại</th>
              <th className={styles.th}>Trạng thái</th>
            </tr>
          </thead>

          <tbody className={styles.tbody}>
            {loading && paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.noData}>
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : (
              paginated.map((user) => {
                const fullName = `${user.first_name} ${user.last_name}`;
                return (
                  <tr key={user.id} className={styles.tr}>
                    <td className={styles.td}>{user.id}</td>
                    <td className={`${styles.td} ${styles.fontMedium}`}>
                      {fullName}
                    </td>
                    <td className={styles.td}>{user.email}</td>
                    <td className={styles.td}>{user.phone}</td>

                    <td className={styles.td}>
                      {/* bấm để đổi trạng thái */}
                      <button
                        type="button"
                        onClick={() => toggleStatus(user)}
                        className={`${styles.badge} ${
                          user.status === "ACTIVE"
                            ? styles.active
                            : styles.blocked
                        }`}
                        style={{ cursor: "pointer", border: "none" }}
                        title="Nhấn để đổi trạng thái"
                      >
                        {user.status}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}

            {!loading && paginated.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.noData}>
                  Không tìm thấy người dùng.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <p className={styles.pageInfo}>
          Hiển thị {paginated.length} / {filtered.length} người dùng
        </p>

        <div className={styles.pageButtons}>
          <button
            className={styles.pageButton}
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            &lt;
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`${styles.pageButton} ${
                page === i + 1 ? styles.active : ""
              }`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            className={styles.pageButton}
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
