import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Payment.module.scss";
import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import emailjs from "emailjs-com"

export default function Payment() {
  const [paymentMethod, setPaymentMethod] = useState<"VietQR" | "VNPay" | "Viettel Money" | "Payoo">("VietQR");
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as any;
  const [showQR, setShowQR] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [user, setUser] = useState<any>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);


  const qrValueRef = useRef<string>("");

  useEffect(() => {
    const fetchUser = async () => {
      const res = await axios.get("http://localhost:8080/users/4");
      setUser(res.data);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!state) {
      navigate("/");
    }
  }, [state, navigate]);


  useEffect(() => {
    if (showQR && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showQR, timeLeft]);

  if (!state) return null;
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const { movie, day, time, seats, total } = state;
  const totalSeat = seats.length;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePayment = async () => {
    if (isSendingEmail) return;
    setIsSendingEmail(true);
    try {
      // 1️ BOOKING
      const bookingRes = await axios.post("http://localhost:8080/bookings", {
        user_id: user.id,
        showtime_id: state.showtimeId,
        total_seat: seats.length,
        total_price_movie: total,
        created_at: new Date().toISOString()
      });

      const bookingId = bookingRes.data.id;

      // 2️ BOOKING SEAT
      for (const seat of seats) {
        await axios.post("http://localhost:8080/booking_seat", {
          booking_id: bookingId,
          showtime_id: state.showtimeId,
          seat_number: seat,
          created_at: new Date().toISOString()
        });
      }

      // 3️ PAYMENT
      await axios.post("http://localhost:8080/payments", {
        booking_id: bookingId,
        payment_method: paymentMethod.toUpperCase(),
        payment_status: "COMPLETED",
        payment_time: new Date().toISOString(),
        amount: total,
        transaction_id: "TXN_" + Date.now()
      });

      await sendPaymentEmail();
      setShowQR(false);
      navigate("/payment-success");
    } catch (e) {
      console.error(e);
      alert("Lỗi khi lưu thanh toán");
    }
  };

  const sendPaymentEmail = async () => {
    if (!qrCanvasRef.current) return;

   
    const qrImageBase64 = qrCanvasRef.current.toDataURL("image/png");

    const templateParams = {
      to_email: user.email,   
      amount: total.toLocaleString("vi-VN"),
      qr_image: qrImageBase64,
   
    };

    await emailjs.send(
      "service_h7me6oh",
      "template_y7owq5k",
      templateParams,
      "57nZWcg4L0Se2UhUy"
    );
  };


  return (
    <div>
      <div className={styles.paymentContainer}>
        <div className={styles.leftSide}>
          <div className={styles.box}>
            <h4 className={styles.boxTitle}>Thông tin phim</h4>
            <div className={styles.rowItem}>
              <p>Phim</p>
              <p className={styles.bold}>{movie.title}</p>
            </div>
            <div className={styles.row2col}>
              <div className={styles.colItem}>
                <p>Ngày giờ chiếu</p>
                <p>
                  <span className={styles.time}>{time}</span> -{" "}
                  <span className={styles.bold}>{day}</span>
                </p>
              </div>
              <div className={styles.colItem}>
                <p>Ghế</p>
                <p className={styles.bold}>{seats.join(", ")}</p>
              </div>
            </div>
            <div className={styles.row2col}>
              <div className={styles.colItem}>
                <p>Định dạng</p>
                <p className={styles.bold}>2D</p>
              </div>
              <div className={styles.colItem}>
                <p>Phòng chiếu</p>
                <p className={styles.bold}>7</p>
              </div>
            </div>
          </div>
          <div className={styles.box}>
            <h4 className={styles.boxTitle}>Thông tin thanh toán</h4>
            <table className={styles.billTable}>
              <thead>
                <tr>
                  <th>Danh mục</th>
                  <th>Số lượng</th>
                  <th>Tổng tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Ghế {seats.join(", ")}</td>
                  <td>{totalSeat}</td>
                  <td>{total.toLocaleString("vi-VN")}đ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {!showQR ? (
          <div className={styles.rightSide}>
            <div className={styles.box}>
              <h4 className={styles.boxTitle}>Phương thức thanh toán </h4>
              <div className={styles.payMethods}>
                <label
                  className={`${styles.method} ${paymentMethod === "VietQR" ? styles.active : ""}`}
                  onClick={() => setPaymentMethod("VietQR")}
                >
                  <span className={styles.circle}>
                    {paymentMethod === "VietQR" && (
                      <Check size={14} color="white" strokeWidth={3} />
                    )}
                  </span>
                  <span className={styles.methodLabel}>
                    <img
                      src="https://res.cloudinary.com/dfzpwkldb/image/upload/v1765460017/vietqr_fzncnu.svg"
                      alt="VietQR"
                      className={styles.methodIcon}
                    />
                    VietQR
                  </span>
                </label>

                <label
                  className={`${styles.method} ${paymentMethod === "VNPay" ? styles.active : ""}`}
                  onClick={() => setPaymentMethod("VNPay")}
                >
                  <span className={styles.circle}>
                    {paymentMethod === "VNPay" && (
                      <Check size={14} color="white" strokeWidth={3} />
                    )}
                  </span>
                  <span className={styles.methodLabel}>
                    <img
                      src="https://res.cloudinary.com/dfzpwkldb/image/upload/v1765459826/vnpay2_ywohnt.svg"
                      alt="VNPAY"
                      className={styles.methodIcon}
                    />
                    VNPAY
                  </span>
                </label>

                <label
                  className={`${styles.method} ${paymentMethod === "Viettel Money" ? styles.active : ""}`}
                  onClick={() => setPaymentMethod("Viettel Money")}
                >
                  <span className={styles.circle}>
                    {paymentMethod === "Viettel Money" && (
                      <Check size={14} color="white" strokeWidth={3} />
                    )}
                  </span>
                  <span className={styles.methodLabel}>
                    <img
                      src="https://res.cloudinary.com/dfzpwkldb/image/upload/v1765459994/viettel1_sf5lch.svg"
                      alt="Viettel Money"
                      className={styles.methodIcon}
                    />
                    Viettel Money
                  </span>
                </label>

                <label
                  className={`${styles.method} ${paymentMethod === "Payoo" ? styles.active : ""}`}
                  onClick={() => setPaymentMethod("Payoo")}
                >
                  <span className={styles.circle}>
                    {paymentMethod === "Payoo" && (
                      <Check size={14} color="white" strokeWidth={3} />
                    )}
                  </span>
                  <span className={styles.methodLabel}>
                    <img
                      src="https://res.cloudinary.com/dfzpwkldb/image/upload/v1765460250/payoo_1_pvsgxl.svg"
                      alt="Payoo"
                      className={styles.methodIcon}
                    />
                    Payoo
                  </span>
                </label>
              </div>

              <h4 className={styles.boxTitle}>Chi phí</h4>
              <div className={styles.costRow}>
                <p>Thanh toán</p>
                <p className={styles.bold}>{total.toLocaleString("vi-VN")}đ</p>
              </div>
              <div className={styles.costRow}>
                <p>Phí</p>
                <p className={styles.bold}>0đ</p>
              </div>
              <div className={styles.costRow}>
                <p>Tổng cộng</p>
                <p className={styles.bold}>{total.toLocaleString("vi-VN")}đ</p>
              </div>

              <button
                className={styles.payBtn}
                onClick={() => {
                  qrValueRef.current = `
                  Ngân hàng: ${paymentMethod}
                  Tên tài khoản: TRUNG TÂM CHIÊU PHIM QUỐC GIA
                  Số tiền: ${total}
                  Tên phim: ${movie.title} 
                  Ghế: ${seats.join(", ")}
                  Thời gian đặt: ${new Date().toISOString()}
    `;
                  setShowQR(true);
                  setTimeLeft(30);
                }}
              >
                Thanh toán
              </button>


              <button
                className={styles.backBtn}
                onClick={() => navigate(-1)}
              >
                Quay lại
              </button>

              <div className={styles.LuuY}>
                Lưu ý: Không mua vé cho trẻ em dưới 13 tuổi đối với các suất
                chiếu phim kết thúc sau 22h00 và không mua vé cho trẻ em dưới 16
                tuổi đối với các suất chiếu phim kết thúc sau 23h00.
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.rightSide}>
            <div className={styles.qrBox}>
              <h3 className={styles.qrTitle}>Quét mã thanh toán: {paymentMethod} </h3>

              <div className={styles.qrCodeContainer}>
                <QRCodeCanvas
                  value={qrValueRef.current}
                  size={160}
                  level="L"
                  ref={qrCanvasRef}
                />


              </div>


              <div className={styles.qrTimer}>
                Thời gian thanh toán {formatTime(timeLeft)}
              </div>



              <div className={styles.qrInfo}>
                <h4 className={styles.qrInfoTitle}>Thông tin đơn hàng</h4>

                <div className={styles.qrInfoRow}>
                  <span>Số tiền thanh toán</span>
                  <span className={styles.qrInfoValue}>{total.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className={styles.qrInfoRow}>
                  <span>Tên tài khoản</span>
                  <span className={styles.qrInfoValue}>TRUNG TAM CHIEU PHIM QUOC GIA</span>
                </div>
                <div className={styles.qrInfoRow}>
                  <span>Tên đơn vị thanh toán</span>
                  <span className={styles.qrInfoValue}>{paymentMethod}</span>
                </div>
              </div>

              <div className={styles.btnQR}>
                <button
                  className={styles.backBtn}
                  onClick={() => setShowQR(false)}
                >
                  Quay lại
                </button>
                <button
                  className={styles.payBtn}
                  onClick={handlePayment}
                  disabled={isSendingEmail}
                >
                  {isSendingEmail ? "Đang gửi Email..." : "Đã thanh toán"}
                </button>


              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}