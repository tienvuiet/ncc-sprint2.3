import React, { useEffect, useMemo, useState } from "react";
import styles from "./TicketPricing.module.scss";

type SeatKey = "standard" | "vip" | "sweetbox";

interface PriceData {
  standard: string;
  vip: string;
  sweetbox: string;
}

interface TimeSlot {
  key: string; // dùng để map dữ liệu
  time: string;
  description: string;
  weekday: PriceData;
  weekend: PriceData;
}

/** ✅ DB row từ json-server: /ticket_prices */
type TicketPriceRow = {
  id: number;
  type_seat: string; // STANDARD | VIP | SWEETBOX (hoặc COUPLE)
  type_movie: string; // 2D | 3D
  price: number;
  day_type: number; // 0: Mon-Thu, 1: Fri-Sun+Holiday
  start_time: string; // "08:00"
  end_time: string;   // "12:00"
};

const API_URL = "http://localhost:8080/ticket_prices";

const emptyPriceData = (): PriceData => ({
  standard: "-",
  vip: "-",
  sweetbox: "-",
});

const moneyVN = (n?: number) =>
  typeof n === "number" ? `${new Intl.NumberFormat("vi-VN").format(n)}đ` : "-";

const normalizeSeatKey = (raw: string): SeatKey | null => {
  const s = (raw || "").toUpperCase();
  if (s === "STANDARD" || s === "THUONG") return "standard";
  if (s === "VIP") return "vip";
  if (s === "SWEETBOX" || s === "COUPLE" || s === "DOUBLE") return "sweetbox";
  return null;
};

const slotKeyFromRange = (start: string, end: string) => `${start}-${end}`;

/** Label/desc giống UI bạn đang dùng */
const slotLabel = (start: string, end: string) => {
  if (end === "12:00") {
    return { time: "Trước 12h", description: "Before 12PM" };
  }
  if (start === "12:00" && end === "17:00") {
    return { time: "Từ 12h00 đến trước 17h00", description: "From 12PM to before 5PM" };
  }
  if (start === "17:00" && end === "23:00") {
    return { time: "Từ 17h00 đến trước 23h00", description: "From 5PM to before 11PM" };
  }
  if (start === "23:00") {
    return { time: "Từ 23h00", description: "From 11PM" };
  }
  return { time: `${start} - ${end}`, description: "" };
};

export default function TicketPricing() {
  const [rows, setRows] = useState<TicketPriceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(API_URL)
      .then((res) => res.json())
      .then((data: TicketPriceRow[]) => setRows(Array.isArray(data) ? data : []))
      .catch((e) => {
        console.error("Load ticket_prices error:", e);
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const { timeSlots2D, timeSlots3D } = useMemo(() => {
    // group slots by type_movie + time range
    const byMovie: Record<"2D" | "3D", Record<string, TimeSlot>> = {
      "2D": {},
      "3D": {},
    };

    // sort by start_time for stable display
    const sorted = [...rows].sort((a, b) => a.start_time.localeCompare(b.start_time));

    for (const r of sorted) {
      const movie = (r.type_movie || "").toUpperCase() as "2D" | "3D";
      if (movie !== "2D" && movie !== "3D") continue;

      const seatKey = normalizeSeatKey(r.type_seat);
      if (!seatKey) continue;

      const key = slotKeyFromRange(r.start_time, r.end_time);
      if (!byMovie[movie][key]) {
        const { time, description } = slotLabel(r.start_time, r.end_time);
        byMovie[movie][key] = {
          key,
          time,
          description,
          weekday: emptyPriceData(),
          weekend: emptyPriceData(),
        };
      }

      const target = r.day_type === 1 ? "weekend" : "weekday";
      byMovie[movie][key][target][seatKey] = moneyVN(r.price);
    }

    const toArr = (obj: Record<string, TimeSlot>) =>
      Object.values(obj).sort((a, b) => a.key.localeCompare(b.key));

    return {
      timeSlots2D: toArr(byMovie["2D"]),
      timeSlots3D: toArr(byMovie["3D"]),
    };
  }, [rows]);

  const notes = [
    "Giảm 20% giá vé theo qui định đối với: Trẻ em (người dưới 16 tuổi), người cao tuổi (công dân Việt Nam từ đủ 60 tuổi trở lên), người có công với cách mạng, người có hoàn cảnh đặc biệt khó khăn.",
    "Giảm 50% giá vé theo qui định đối với: Người khuyết tật nặng.",
    "Giảm giá vé 100% đối với: Người khuyết tật đặc biệt nặng, trẻ em dưới 0.7m đi kèm với người lớn.",
  ];

  return (
    <div className={styles["ticket-pricing"]}>
      <div className={styles["ticket-pricing__container"]}>
        <h1 className={styles["ticket-pricing__title"]}>Giá vé</h1>
        <p className={styles["ticket-pricing__subtitle"]}>(Áp dụng từ ngày 01/06/2023)</p>

        {loading && <p style={{ padding: 12 }}>Đang tải dữ liệu...</p>}

        {/* ================== 2D ================== */}
        <section className={styles["ticket-pricing__section"]}>
          <h2 className={styles["ticket-pricing__section-title"]}>1. GIÁ VÉ XEM PHIM 2D</h2>

          <div className={styles["ticket-pricing__table-wrapper"]}>
            <table className={styles["ticket-pricing__table"]}>
              <thead>
                <tr>
                  <th
                    rowSpan={2}
                    className={`${styles["ticket-pricing__th"]} ${styles["ticket-pricing__th--time"]}`}
                  >
                    Thời gian
                  </th>

                  <th
                    colSpan={3}
                    className={`${styles["ticket-pricing__th"]} ${styles["ticket-pricing__th--weekday"]}`}
                  >
                    Từ thứ 2 đến thứ 5 <br />
                    <span className={styles["ticket-pricing__th-sub"]}>From Monday to Thursday</span>
                  </th>

                  <th
                    colSpan={3}
                    className={`${styles["ticket-pricing__th"]} ${styles["ticket-pricing__th--weekend"]}`}
                  >
                    Thứ 6, 7, CN và ngày Lễ <br />
                    <span className={styles["ticket-pricing__th-sub"]}>
                      Friday, Saturday, Sunday & public holiday
                    </span>
                  </th>
                </tr>

                <tr>
                  <th className={styles["ticket-pricing__th"]}>
                    Ghế thường <br />
                    <span className={styles["ticket-pricing__th-sub"]}>Standard</span>
                  </th>
                  <th className={`${styles["ticket-pricing__th"]} ${styles["ticket-pricing__th--vip"]}`}>
                    Ghế VIP <br />
                    <span className={styles["ticket-pricing__th-sub"]}>VIP</span>
                  </th>
                  <th className={`${styles["ticket-pricing__th"]} ${styles["ticket-pricing__th--sweetbox"]}`}>
                    Ghế đôi <br />
                    <span className={styles["ticket-pricing__th-sub"]}>Sweetbox</span>
                  </th>

                  <th className={styles["ticket-pricing__th"]}>
                    Ghế thường <br />
                    <span className={styles["ticket-pricing__th-sub"]}>Standard</span>
                  </th>
                  <th className={`${styles["ticket-pricing__th"]} ${styles["ticket-pricing__th--vip"]}`}>
                    Ghế VIP <br />
                    <span className={styles["ticket-pricing__th-sub"]}>VIP</span>
                  </th>
                  <th className={`${styles["ticket-pricing__th"]} ${styles["ticket-pricing__th--sweetbox"]}`}>
                    Ghế đôi <br />
                    <span className={styles["ticket-pricing__th-sub"]}>Sweetbox</span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {timeSlots2D.map((slot) => (
                  <tr key={slot.key}>
                    <td className={`${styles["ticket-pricing__td"]} ${styles["ticket-pricing__td--time"]}`}>
                      <strong>{slot.time}</strong>
                      <br />
                      <span className={styles["ticket-pricing__td-sub"]}>{slot.description}</span>
                    </td>

                    <td className={styles["ticket-pricing__td"]}>{slot.weekday.standard}</td>
                    <td className={`${styles["ticket-pricing__td"]} ${styles["ticket-pricing__td--vip"]}`}>
                      {slot.weekday.vip}
                    </td>
                    <td className={`${styles["ticket-pricing__td"]} ${styles["ticket-pricing__td--sweetbox"]}`}>
                      {slot.weekday.sweetbox}
                    </td>

                    <td className={styles["ticket-pricing__td"]}>{slot.weekend.standard}</td>
                    <td className={`${styles["ticket-pricing__td"]} ${styles["ticket-pricing__td--vip"]}`}>
                      {slot.weekend.vip}
                    </td>
                    <td className={`${styles["ticket-pricing__td"]} ${styles["ticket-pricing__td--sweetbox"]}`}>
                      {slot.weekend.sweetbox}
                    </td>
                  </tr>
                ))}

                {!loading && timeSlots2D.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: 16, textAlign: "center", color: "#6b7280" }}>
                      Chưa có dữ liệu giá vé 2D.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className={styles["ticket-pricing__note"]}>
            * Đối với phim có thời lượng từ 150 phút trở lên: phụ thu 10.000 VNĐ / vé
          </p>
        </section>

        {/* ================== 3D ================== */}
        <section className={styles["ticket-pricing__section"]}>
          <h2 className={styles["ticket-pricing__section-title"]}>2. GIÁ VÉ XEM PHIM 3D</h2>

          <div className={styles["ticket-pricing__table-wrapper"]}>
            <table className={styles["ticket-pricing__table"]}>
              <thead>
                <tr>
                  <th
                    rowSpan={2}
                    className={`${styles["ticket-pricing__th"]} ${styles["ticket-pricing__th--time"]}`}
                  >
                    Thời gian
                  </th>

                  <th
                    colSpan={3}
                    className={`${styles["ticket-pricing__th"]} ${styles["ticket-pricing__th--weekday"]}`}
                  >
                    Từ thứ 2 đến thứ 5 <br />
                    <span className={styles["ticket-pricing__th-sub"]}>From Monday to Thursday</span>
                  </th>

                  <th
                    colSpan={3}
                    className={`${styles["ticket-pricing__th"]} ${styles["ticket-pricing__th--weekend"]}`}
                  >
                    Thứ 6, 7, CN và ngày Lễ <br />
                    <span className={styles["ticket-pricing__th-sub"]}>
                      Friday, Saturday, Sunday & public holiday
                    </span>
                  </th>
                </tr>

                <tr>
                  <th className={styles["ticket-pricing__th"]}>
                    Ghế thường <br />
                    <span className={styles["ticket-pricing__th-sub"]}>Standard</span>
                  </th>
                  <th className={`${styles["ticket-pricing__th"]} ${styles["ticket-pricing__th--vip"]}`}>
                    Ghế VIP <br />
                    <span className={styles["ticket-pricing__th-sub"]}>VIP</span>
                  </th>
                  <th className={`${styles["ticket-pricing__th"]} ${styles["ticket-pricing__th--sweetbox"]}`}>
                    Ghế đôi <br />
                    <span className={styles["ticket-pricing__th-sub"]}>Sweetbox</span>
                  </th>

                  <th className={styles["ticket-pricing__th"]}>
                    Ghế thường <br />
                    <span className={styles["ticket-pricing__th-sub"]}>Standard</span>
                  </th>
                  <th className={`${styles["ticket-pricing__th"]} ${styles["ticket-pricing__th--vip"]}`}>
                    Ghế VIP <br />
                    <span className={styles["ticket-pricing__th-sub"]}>VIP</span>
                  </th>
                  <th className={`${styles["ticket-pricing__th"]} ${styles["ticket-pricing__th--sweetbox"]}`}>
                    Ghế đôi <br />
                    <span className={styles["ticket-pricing__th-sub"]}>Sweetbox</span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {timeSlots3D.map((slot) => (
                  <tr key={slot.key}>
                    <td className={`${styles["ticket-pricing__td"]} ${styles["ticket-pricing__td--time"]}`}>
                      <strong>{slot.time}</strong>
                      <br />
                      <span className={styles["ticket-pricing__td-sub"]}>{slot.description}</span>
                    </td>

                    <td className={styles["ticket-pricing__td"]}>{slot.weekday.standard}</td>
                    <td className={`${styles["ticket-pricing__td"]} ${styles["ticket-pricing__td--vip"]}`}>
                      {slot.weekday.vip}
                    </td>
                    <td className={`${styles["ticket-pricing__td"]} ${styles["ticket-pricing__td--sweetbox"]}`}>
                      {slot.weekday.sweetbox}
                    </td>

                    <td className={styles["ticket-pricing__td"]}>{slot.weekend.standard}</td>
                    <td className={`${styles["ticket-pricing__td"]} ${styles["ticket-pricing__td--vip"]}`}>
                      {slot.weekend.vip}
                    </td>
                    <td className={`${styles["ticket-pricing__td"]} ${styles["ticket-pricing__td--sweetbox"]}`}>
                      {slot.weekend.sweetbox}
                    </td>
                  </tr>
                ))}

                {!loading && timeSlots3D.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: 16, textAlign: "center", color: "#6b7280" }}>
                      Chưa có dữ liệu giá vé 3D.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className={styles["ticket-pricing__note"]}>
            * Đối với phim có thời lượng từ 150 phút trở lên: phụ thu 10.000 VNĐ / vé
          </p>
        </section>

        {/* phần policy bạn giữ như cũ */}
        <section className={styles["ticket-pricing__policy"]}>
          <h3 className={styles["ticket-pricing__policy-title"]}>
            * Giá vé đối với các đối tượng khán giả ưu tiên
          </h3>

          <ul className={styles["ticket-pricing__list"]}>
            {notes.map((note, index) => (
              <li key={index} className={styles["ticket-pricing__list-item"]}>
                {note}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
