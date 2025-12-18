/* ===== COMMON ===== */
export type Status = "ACTIVE" | "INACTIVE";
export type SeatType = "STANDARD" | "VIP";
export type MovieType = "2D" | "3D";
export type PaymentMethod = "VNPAY" | "MOMO" | "CASH";
export type PaymentStatus = "COMPLETED" | "PENDING" | "FAILED";

/* ===== USER ===== */
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  avatar: string;
  phone: string;
  address: string;
  status: Status;
  role_name: string;
  created_at: string;
  updated_at: string;
  bookings: Booking[];
}

/* ===== ROLE ===== */
export interface Role {
  id: number;
  role_name: "admin" | "user";
}

/* ===== MOVIE ===== */
export interface Movie {
  id: number;
  title: string;
  description: string;
  author: string;
  image: string;
  trailer: string;
  type: MovieType;
  duration: number;
  release_date: string;
  created_at: string;
  updated_at: string;
  genre_id: number;
}

/* ===== GENRE ===== */
export interface Genre {
  id: number;
  genre_name: string;
}

/* ===== SHOWTIME ===== */
export interface Date {
  day: string;
  hours: string[];
}

export interface Showtime {
  id: number;
  movie_id: number;
  day: string;
  time: string;
  created_at?: string;
}


/* ===== THEATER ===== */
export interface Theater {
  id: number;
  name: string;
  location: string;
  phone: string;
  created_at: string;
  updated_at: string;
  screens: Screen[];
}

/* ===== SCREEN ===== */
export interface Screen {
  id: number;
  name: string;
  seat_capacity: number;
  created_at: string;
  updated_at: string;
  seats: Seat[];
}

/* ===== SEAT ===== */
export interface Seat {
  id: number;
  seat_number: string;
  is_variable: boolean;
  type: SeatType;
  created_at: string;
  updated_at: string;
}

/* ===== BOOKING ===== */
export interface Booking {
  id: number;
  showtime_id: number;
  total_seat: number;
  total_price_movie: number;
  created_at: string;
  seats: BookingSeatDetail[];
  payment: Payment;
}

/* ===== BOOKING SEAT (DETAIL) ===== */
export interface BookingSeatDetail {
  id: number;
  seat_number: string;
  is_variable: boolean;
  type: SeatType;
  created_at: string;
  updated_at: string;
}

/* ===== BOOKING SEAT (TABLE) ===== */
export interface BookingSeat {
  id: number;
  booking_id: number;
  seat_id: number;
  quantity: number;
  created_at: string;
  updated_at: string;
}

/* ===== PAYMENT ===== */
export interface Payment {
  id: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_time: string;
  amount: number;
  transaction_id: string;
}

/* ===== NEWS ===== */
export interface News {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

/* ===== TICKET PRICE ===== */
export interface TicketPrice {
  id: number;
  type_seat: SeatType;
  type_movie: MovieType;
  price: number;
  day_type: number;
  start_time: string;
  end_time: string;
}

/* ===== ROOT DB TYPE ===== */
export interface Database {
  users: User[];
  roles: Role[];
  movies: Movie[];
  showtimes: Showtime[];
  genres: Genre[];
  theaters: Theater[];
  bookings: Booking[];
  booking_seat: BookingSeat[];
  news: News[];
  ticket_prices: TicketPrice[];
  payments: Payment[];
}
