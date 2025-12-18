
import { useNavigate } from 'react-router-dom';
import styles from './PaymentSuccess.module.scss';

export default function PaymentSuccess() {
    const navigate = useNavigate()
    return (
        <div className={styles["boder"]}>
     

            <div className={styles["successWrapper"]}>
                <div className={styles["successBox"]}>
                    
                    <div className={styles["starIcon"]}></div>

                    <h2 className={styles["successTitle"]}>Đặt vé thành công!</h2>

                    <p className={styles["successNote"]}>
                        <span className={styles["highlight"]}>Lưu ý: </span>
                        Thông tin thanh toán đã gửi về gmail của bạn. Hãy đến đúng giờ của suất chiếu và tận hưởng bộ phim
                    </p>

                    <button className={styles["homeBtn"]} onClick={() => navigate("/")}>Về trang chủ</button>
                </div>
            </div>

    
        </div>
    );
}
