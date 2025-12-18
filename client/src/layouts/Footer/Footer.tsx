import React from 'react';
import styles from './Footer.module.scss';

const Footer: React.FC = () => {
    const navLinks = [
        { label: 'Chính sách', href: '#' },
        { label: 'Lịch chiếu', href: '#' },
        { label: 'Tin tức', href: '#' },
        { label: 'Giá vé', href: '#' },
        { label: 'Hỏi đáp', href: '#' },
        { label: 'Liên hệ', href: '#' },
    ];

    const socialLinks = [
        {
            icon: 'https://res.cloudinary.com/dgdtw2vlj/image/upload/v1765333887/Facebook_elng4a.svg',
            alt: 'Facebook',
            href: '#',
        },
        {
            icon: 'https://res.cloudinary.com/dgdtw2vlj/image/upload/v1765333952/Zalo_awohak.svg',
            alt: 'Zalo',
            href: '#',
        },
        {
            icon: 'https://res.cloudinary.com/dgdtw2vlj/image/upload/v1765333958/Youtube_fepqf5.svg',
            alt: 'YouTube',
            href: '#',
        },
    ];

    const appLinks = [
        {
            image: 'https://res.cloudinary.com/dgdtw2vlj/image/upload/v1765333965/GG_Play_sc6acs.svg',
            alt: 'Google Play',
            href: '#',
        },
        {
            image: 'https://res.cloudinary.com/dgdtw2vlj/image/upload/v1765333971/App_store_lupsr3.svg',
            alt: 'App Store',
            href: '#',
        },
    ];

    return (
        <footer className={styles.footer}>
            {/* ============== DESKTOP FOOTER ============== */}
            <div className={styles["footer__desktop"]}>
                <div className={styles["footer__container"]}>
                    
                    {/* Navigation */}
                    <nav className={styles["footer__nav"]}>
                        {navLinks.map((link, index) => (
                            <a key={index} href={link.href} className={styles["footer__nav-link"]}>
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    {/* Social & App Links */}
                    <div className={styles["footer__links"]}>
                        
                        {/* Social */}
                        {socialLinks.map((s, i) => (
                            <a key={i} href={s.href} className={styles["footer__social-link"]}>
                                <img src={s.icon} alt={s.alt} className={styles["footer__social-icon"]} />
                            </a>
                        ))}

                        {/* App Stores */}
                        {appLinks.map((app, i) => (
                            <a key={i} href={app.href} className={styles["footer__app-link"]}>
                                <img src={app.image} alt={app.alt} className={styles["footer__app-image"]} />
                            </a>
                        ))}

                        {/* Certificate */}
                        <a href="#" className={styles["footer__certificate-link"]}>
                            <img
                                src="https://res.cloudinary.com/dgdtw2vlj/image/upload/v1765333976/Copyright_uev3pc.svg"
                                alt="Bộ Công Thương"
                                className={styles["footer__certificate-image"]}
                            />
                        </a>
                    </div>

                    {/* Info */}
                    <div className={styles["footer__info"]}>
                        <p className={styles["footer__text"]}>
                            Cơ quan chủ quản: BỘ VĂN HÓA, THỂ THAO VÀ DU LỊCH
                        </p>
                        <p className={styles["footer__text"]}>
                            Bản quyền thuộc Trung tâm Chiếu phim Quốc gia.
                        </p>
                        <p className={styles["footer__text"]}>
                            Giấy phép số 224/GP- TTĐT ngày 31/8/2010 - Chịu trách nhiệm: Vũ Đức Tùng.
                        </p>
                        <p className={styles["footer__text"]}>
                            Địa chỉ: 87 Láng Hạ, Quận Ba Đình, Hà Nội - 024.35141791
                        </p>
                        <p className={styles["footer__copyright"]}>
                            © 2023 By NCC - All rights reserved.
                        </p>
                    </div>
                </div>
            </div>

            {/* ============== MOBILE FOOTER ============== */}
            <div className={styles["footer__mobile"]}>
                <div className={styles["footer__mobile-container"]}>

                    <nav className={styles["footer__mobile-nav"]}>
                        {navLinks.map((link, i) => (
                            <a key={i} href={link.href} className={styles["footer__mobile-nav-link"]}>
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    <div className={styles["footer__mobile-social"]}>
                        {socialLinks.map((s, i) => (
                            <a key={i} href={s.href} className={styles["footer__mobile-social-link"]}>
                                <img src={s.icon} alt={s.alt} className={styles["footer__mobile-social-icon"]} />
                            </a>
                        ))}
                    </div>

                    <div className={styles["footer__mobile-apps"]}>
                        {appLinks.map((app, i) => (
                            <a key={i} href={app.href} className={styles["footer__mobile-app-link"]}>
                                <img src={app.image} alt={app.alt} className={styles["footer__mobile-app-image"]} />
                            </a>
                        ))}
                    </div>

                    <div className={styles["footer__mobile-certificate"]}>
                        <a href="#" className={styles["footer__mobile-certificate-link"]}>
                            <img
                                src="https://res.cloudinary.com/dgdtw2vlj/image/upload/v1765333976/Copyright_uev3pc.svg"
                                alt="Bộ Công Thương"
                                className={styles["footer__mobile-certificate-image"]}
                            />
                        </a>
                    </div>

                    <div className={styles["footer__mobile-info"]}>
                        <p className={styles["footer__mobile-text"]}>
                            Cơ quan chủ quản: BỘ VĂN HÓA,<br /> THỂ THAO VÀ DU LỊCH
                        </p>
                        <p className={styles["footer__mobile-text"]}>
                            Bản quyền thuộc Trung tâm<br /> Chiếu phim Quốc gia.
                        </p>
                        <p className={styles["footer__mobile-text"]}>
                            Giấy phép số: 224/GP-TTĐT ngày 31/8/2010<br />
                            Chịu trách nhiệm: Vũ Đức Tùng
                        </p>
                        <p className={styles["footer__mobile-text"]}>
                            Địa chỉ: 87 Láng Hạ, Ba Đình, Hà Nội<br />
                            024.35141791
                        </p>
                        <p className={styles["footer__mobile-copyright"]}>
                            © 2023 By NCC - All rights reserved.
                        </p>
                    </div>

                </div>
            </div>
        </footer>
    );
};

export default Footer;
