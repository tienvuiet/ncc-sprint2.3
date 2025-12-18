import { useEffect, useState } from 'react';
import styles from '../../pages/MovieDetail/MovieDetail.module.scss';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
interface Props {
    time: string;
    movie: any;
    day: string | null,
    showtimeId: number;
    onBack: () => void;
}

export default function SeatSelection({ time, movie, day, showtimeId, onBack }: Props) {
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [soldSeats, setSoldSeats] = useState<string[]>([]);
    const [timeLeft, setTimeLeft] = useState(30);
    const navigate = useNavigate()

    const seatLayout = {
        A: { seats: 14, type: 'normal', start: 1 },
        B: { seats: 14, type: 'normal', start: 1 },
        C: { seats: 14, type: 'normal', start: 1 },
        D: { seats: 14, type: 'vip', start: 1 },
        E: { seats: 14, type: 'vip', start: 1 },
        F: { seats: 14, type: 'vip', start: 1 },
        G: { seats: 14, type: 'vip', start: 1 },
        H: { seats: 14, type: 'vip', start: 1 },
        I: { seats: 14, type: 'vip', start: 1 },
        J: { seats: 14, type: 'normal', start: 1 },
        K: { seats: 12, type: 'double', start: 1 }
    };

    const seatPrices: Record<string, number> = {
        normal: 45000,
        vip: 55000,
        double: 130000
    };

    useEffect(() => {
        const fetchSoldSeats = async () => {
            const res = await axios.get(
                `http://localhost:8080/booking_seat?showtime_id=${showtimeId}`
            );

            setSoldSeats(res.data.map((s: any) => s.seat_number));
        };

        fetchSoldSeats();
    }, [showtimeId]);

    useEffect(() => {
        if (timeLeft <= 0) {
            navigate('/');
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, navigate]);
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s
            .toString()
            .padStart(2, '0')}`;
    };

    const toggleSeat = (seatId: string, seatType: string, isSold: boolean) => {
        if (isSold) return;

        setSelectedSeats(prev => {
            if (prev.includes(seatId)) {
                return prev.filter(id => id !== seatId);
            } else {
                return [...prev, seatId];
            }
        });
    };

    const calculateTotal = () => {
        let total = 0;
        selectedSeats.forEach(seatId => {
            const row = seatId[0];
            const rowConfig = seatLayout[row as keyof typeof seatLayout];
            //no de xac dinh row la cac key trong seatLayout
            if (rowConfig) {
                total += seatPrices[rowConfig.type];
            }
        });
        return total;
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('vi-VN') + 'đ';
    };
    return (
        <div className={styles.seatWrapper}>
            <div className={styles.topBar}>
                <div className={styles.showtime}>
                    Giờ chiếu: <span>{time}</span>
                </div>
                <div className={`${styles.countdown} ${styles.desktop}`}>
                    Thời gian chọn ghế: <span>{formatTime(timeLeft)}</span>
                </div>


                <p className={`${styles.countdown} ${styles.mobile}`}>
                    {formatTime(timeLeft)}
                </p>

            </div>

            <div className={styles.screenBox}>
                <img
                    src="https://chieuphimquocgia.com.vn/_next/image?url=%2Fimages%2Fscreen.png&w=1920&q=75"
                    alt="screen"
                />
            </div>

            {/* ROOM TITLE */}
            <div className={styles.roomTitle}>Phòng chiếu số 7</div>

            {/* SEATS */}
            <div className={styles.seatContainer}>
                {Object.entries(seatLayout).map(([letter, config]) => (
                    //object.entries là lấy toàn bộ key, value
                    <div key={letter} className={styles.seatRow}>
                        <div className={styles.rowLabel}>{letter}</div>

                        <div
                            className={styles.seats}
                            style={{ gridTemplateColumns: `repeat(${config.seats}, 1fr)` }}
                        >
                            {[...Array(config.seats)].map((_, i) => {
                                const seatNum = i + config.start;
                                const seatId = `${letter}${seatNum}`;
                                const isSold = soldSeats.includes(seatId);

                                const isSelected = selectedSeats.includes(seatId);

                                return (
                                    <div
                                        key={i}
                                        className={`${styles.seat} ${styles[config.type]} ${isSold ? styles.sold : ''
                                            } ${isSelected ? styles.chosen : ''}`}
                                        onClick={() => toggleSeat(seatId, config.type, isSold)}
                                    >
                                        {isSold ? (
                                            <X size={16} strokeWidth={3} className={styles.soldIcon} />
                                        ) : (
                                            <span>{seatId}</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className={styles.rowLabel}>{letter}</div>
                    </div>
                ))}
            </div>

            {/* LEGEND */}
            <div className={styles.legend}>
                <div className={styles.legendItem}>
                    <div className={`${styles.box} ${styles.sold}`}></div> Đã đặt
                </div>
                <div className={styles.legendItem}>
                    <div className={`${styles.box} ${styles.chosen}`}></div> Ghế bạn chọn
                </div>
                <div className={styles.legendItem}>
                    <div className={`${styles.box} ${styles.normal}`}></div> Ghế thường
                </div>
                <div className={styles.legendItem}>
                    <div className={`${styles.box} ${styles.vip}`}></div> Ghế VIP
                </div>
                <div className={styles.legendItem}>
                    <div className={`${styles.box} ${styles.double}`}></div> Ghế đôi
                </div>
            </div>
            <div className={styles.summaryBar}>
                <div>
                    <p>
                        Ghế đã chọn: <span className={styles.bold}>{selectedSeats.join(', ') || 'Chưa chọn'}</span>
                    </p>
                    <p>
                        Tổng tiền: <span className={styles.bold}>{formatCurrency(calculateTotal())}</span>
                    </p>
                </div>

                <div className={styles.actions}>
                    <button
                        className={styles.backBtn}
                        onClick={onBack}
                    >
                        Quay lại
                    </button>
                    <button
                        className={styles.payBtn}
                        disabled={selectedSeats.length === 0}
                        onClick={() => {
                            navigate("/payment", {
                                state: {
                                    movie,
                                    day,
                                    time,
                                    seats: selectedSeats,
                                    total: calculateTotal(),
                                    showtimeId
                                },
                            });
                        }}


                    >
                        Thanh toán
                    </button>
                </div>
            </div>
        </div>
    );
}


