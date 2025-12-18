import { useState, useMemo, useEffect } from "react";
import { Film, Calendar, Clock, Search, User, CreditCard, Armchair, Loader } from "lucide-react";

// Types
interface Movie {
  id: number;
  title: string;
  image: string;
  type: string;
  duration?: number;
}

interface Showtime {
  id: number;
  movie_id: number;
  day: string;
  time: string;
}

interface Booking {
  id: number;
  user_id: number;
  showtime_id: number;
  total_seat: number;
  created_at: string;
}

interface BookingSeat {
  id: number;
  booking_id: number;
  showtime_id: number;
  seat_number: string;
}

interface Payment {
  id: number;
  booking_id: number;
  payment_method: string;
  payment_status: string;
  transaction_id: string;
  amount: number;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

interface SeatLayoutConfig {
  seats: number;
  type: 'normal' | 'vip' | 'double';
  start: number;
}

interface Seat {
  number: string;
  type: 'normal' | 'vip' | 'double';
  isBooked: boolean;
  bookingId?: number;
}

interface RowData {
  row: string;
  seats: Seat[];
}

interface BookingDetails {
  booking: Booking;
  payment: Payment | undefined;
  user: User | undefined;
  showtime: Showtime | undefined;
  movie: Movie | undefined;
  seats: BookingSeat[];
}

export default function CinemaBookingManager() {
  // State for API data
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingSeats, setBookingSeats] = useState<BookingSeat[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for UI
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const BASE_URL = 'http://localhost:8080'; 
        
        const [moviesRes, showtimesRes, bookingsRes, bookingSeatsRes, paymentsRes, usersRes] = await Promise.all([
          fetch(`${BASE_URL}/movies`),
          fetch(`${BASE_URL}/showtimes`),
          fetch(`${BASE_URL}/bookings`),
          fetch(`${BASE_URL}/booking_seat`),
          fetch(`${BASE_URL}/payments`),
          fetch(`${BASE_URL}/users`)
        ]);

        const [moviesData, showtimesData, bookingsData, bookingSeatsData, paymentsData, usersData] = await Promise.all([
          moviesRes.json(),
          showtimesRes.json(),
          bookingsRes.json(),
          bookingSeatsRes.json(),
          paymentsRes.json(),
          usersRes.json()
        ]);

        setMovies(moviesData);
        setShowtimes(showtimesData);
        setBookings(bookingsData);
        setBookingSeats(bookingSeatsData);
        setPayments(paymentsData);
        setUsers(usersData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Không thể tải dữ liệu. Vui lòng kiểm tra kết nối API.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter movies by search
  const filteredMovies = useMemo(() => {
    return movies.filter(movie => 
      movie.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [movies, searchQuery]);

  // Get showtimes for selected movie
  const movieShowtimes = useMemo(() => {
    if (!selectedMovie) return [];
    return showtimes.filter(st => st.movie_id === selectedMovie.id);
  }, [selectedMovie, showtimes]);

  // Get booked seats for selected showtime
  const bookedSeatsForShowtime = useMemo(() => {
    if (!selectedShowtime) return [];
    return bookingSeats.filter(bs => bs.showtime_id === selectedShowtime.id);
  }, [selectedShowtime, bookingSeats]);

  // Seat layout configuration matching SeatSelection
  const seatLayout: Record<string, SeatLayoutConfig> = {
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

  // Generate seat map with types
  const seatMap = useMemo((): RowData[] => {
    const seats: RowData[] = [];
    
    Object.entries(seatLayout).forEach(([row, config]) => {
      const rowSeats: Seat[] = [];
      for (let i = 0; i < config.seats; i++) {
        const seatNum = i + config.start;
        const seatNumber = `${row}${seatNum}`;
        const bookedSeat = bookedSeatsForShowtime.find(bs => bs.seat_number === seatNumber);
        rowSeats.push({
          number: seatNumber,
          type: config.type,
          isBooked: !!bookedSeat,
          bookingId: bookedSeat?.booking_id
        });
      }
      seats.push({ row, seats: rowSeats });
    });
    
    return seats;
  }, [bookedSeatsForShowtime]);

  // Get booking details for selected seat
  const seatBookingDetails = useMemo((): BookingDetails | null => {
    if (!selectedSeat || !selectedSeat.isBooked) return null;
    
    const booking = bookings.find(b => b.id === selectedSeat.bookingId);
    if (!booking) return null;
    
    const payment = payments.find(p => p.booking_id === booking.id);
    const user = users.find(u => u.id === booking.user_id);
    const showtime = showtimes.find(st => st.id === booking.showtime_id);
    const movie = movies.find(m => m.id === showtime?.movie_id);
    const seatsForBooking = bookingSeats.filter(bs => bs.booking_id === booking.id);
    
    return {
      booking,
      payment,
      user,
      showtime,
      movie,
      seats: seatsForBooking
    };
  }, [selectedSeat, bookings, payments, users, showtimes, movies, bookingSeats]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-700">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <div className="text-center">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Lỗi kết nối</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Film className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-800">Quản Lý Đặt Vé Cinema</h1>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm phim..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Movies List */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Danh Sách Phim</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredMovies.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Không tìm thấy phim nào</p>
              ) : (
                filteredMovies.map(movie => (
                  <div
                    key={movie.id}
                    onClick={() => {
                      setSelectedMovie(movie);
                      setSelectedShowtime(null);
                      setSelectedSeat(null);
                    }}
                    className={`p-4 rounded-xl cursor-pointer transition ${
                      selectedMovie?.id === movie.id
                        ? 'bg-purple-100 border-2 border-purple-500'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex gap-3">
                      <img src={movie.image} alt={movie.title} className="w-16 h-20 object-cover rounded-lg" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm text-gray-800 line-clamp-2">{movie.title}</h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">{movie.type}</span>
                          {movie.duration && <span>{movie.duration} phút</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Showtimes & Seats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Showtimes */}
            {selectedMovie && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Suất Chiếu - {selectedMovie.title}</h2>
                {movieShowtimes.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Chưa có suất chiếu nào</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {movieShowtimes.map(showtime => (
                      <button
                        key={showtime.id}
                        onClick={() => {
                          setSelectedShowtime(showtime);
                          setSelectedSeat(null);
                        }}
                        className={`p-4 rounded-xl transition ${
                          selectedShowtime?.id === showtime.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 justify-center mb-1">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm font-medium">{showtime.day}</span>
                        </div>
                        <div className="flex items-center gap-2 justify-center">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-bold">{showtime.time}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Seat Map */}
            {selectedShowtime && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Sơ Đồ Ghế</h2>
                
                {/* Screen */}
                <div className="bg-gradient-to-b from-gray-800 to-gray-700 text-white text-center py-2 rounded-t-3xl mb-6">
                  <span className="text-sm font-semibold">MÀN HÌNH</span>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mb-4 justify-center text-sm flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-600 text-white rounded-lg flex items-center justify-center text-xs font-bold">A1</div>
                    <span className="text-gray-600">Ghế thường</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">D1</div>
                    <span className="text-gray-600">Ghế VIP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-pink-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">K1</div>
                    <span className="text-gray-600">Ghế đôi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center text-[10px] font-bold">✕</div>
                    <span className="text-gray-600">Đã đặt</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-lg border-2 border-blue-700 flex items-center justify-center text-[10px] font-bold">✕</div>
                    <span className="text-gray-600">Đang xem</span>
                  </div>
                </div>

                {/* Seats Grid by Row */}
                <div className="space-y-2">
                  {seatMap.map((rowData) => (
                    <div key={rowData.row} className="flex items-center gap-2">
                      {/* Row label on left */}
                      <div className="w-8 text-center font-bold text-gray-700 text-base">
                        {rowData.row}
                      </div>
                      
                      {/* Seats */}
                      <div className="flex gap-1.5 flex-1 justify-center">
                        {rowData.seats.map((seat, idx) => {
                          const getSeatColor = (): string => {
                            if (seat.isBooked) {
                              return selectedSeat?.number === seat.number
                                ? 'bg-blue-500 text-white border-2 border-blue-700 scale-105'
                                : 'bg-red-500 text-white hover:bg-red-600';
                            }
                            // Empty seats by type
                            if (seat.type === 'normal') return 'bg-gray-600 text-white';
                            if (seat.type === 'vip') return 'bg-amber-500 text-white';
                            if (seat.type === 'double') return 'bg-pink-500 text-white';
                            return 'bg-gray-400 text-white';
                          };

                          return (
                            <button
                              key={idx}
                              onClick={() => seat.isBooked && setSelectedSeat(seat)}
                              disabled={!seat.isBooked}
                              className={`w-10 h-10 rounded-lg ${getSeatColor()} text-xs font-bold transition-all flex items-center justify-center ${
                                seat.isBooked ? 'cursor-pointer shadow-md' : 'cursor-not-allowed opacity-90'
                              }`}
                              title={`${seat.number} - ${seat.type === 'normal' ? 'Thường' : seat.type === 'vip' ? 'VIP' : 'Đôi'} ${seat.isBooked ? '(Đã đặt)' : '(Trống)'}`}
                            >
                              {seat.isBooked ? (
                                <span className="text-[10px]">✕</span>
                              ) : (
                                <span className="text-[11px]">{seat.number}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Row label on right */}
                      <div className="w-8 text-center font-bold text-gray-700 text-base">
                        {rowData.row}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Booking Details Modal */}
            {selectedSeat && seatBookingDetails && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-bold text-gray-800">Chi Tiết Đặt Vé</h2>
                </div>

                <div className="space-y-4">
                  {/* User Info */}
                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-5 h-5 text-purple-600" />
                      <h3 className="font-bold text-gray-800">Thông Tin Khách Hàng</h3>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-semibold">Họ tên:</span> {seatBookingDetails.user?.first_name} {seatBookingDetails.user?.last_name}</p>
                      <p><span className="font-semibold">Email:</span> {seatBookingDetails.user?.email}</p>
                      <p><span className="font-semibold">SĐT:</span> {seatBookingDetails.user?.phone}</p>
                    </div>
                  </div>

                  {/* Movie Info */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Film className="w-5 h-5 text-blue-600" />
                      <h3 className="font-bold text-gray-800">Thông Tin Phim</h3>
                    </div>
                    <div className="flex gap-3">
                      <img 
                        src={seatBookingDetails.movie?.image} 
                        alt={seatBookingDetails.movie?.title}
                        className="w-16 h-20 object-cover rounded-lg"
                      />
                      <div className="space-y-1 text-sm">
                        <p className="font-semibold text-gray-800">{seatBookingDetails.movie?.title}</p>
                        <p><span className="font-semibold">Ngày:</span> {seatBookingDetails.showtime?.day}</p>
                        <p><span className="font-semibold">Giờ:</span> {seatBookingDetails.showtime?.time}</p>
                        <p><span className="font-semibold">Thể loại:</span> {seatBookingDetails.movie?.type}</p>
                      </div>
                    </div>
                  </div>

                  {/* Seats Info */}
                  <div className="bg-orange-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Armchair className="w-5 h-5 text-orange-600" />
                      <h3 className="font-bold text-gray-800">Ghế Đã Đặt</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {seatBookingDetails.seats?.map(seat => (
                        <span 
                          key={seat.id}
                          className="bg-orange-200 text-orange-800 px-3 py-1 rounded-lg font-semibold text-sm"
                        >
                          {seat.seat_number}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 text-sm">
                      <span className="font-semibold">Tổng số ghế:</span> {seatBookingDetails.booking?.total_seat}
                    </p>
                  </div>

                  {/* Payment Info */}
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-5 h-5 text-green-600" />
                      <h3 className="font-bold text-gray-800">Thông Tin Thanh Toán</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-semibold">Phương thức:</span>
                        <span className="bg-green-200 text-green-800 px-3 py-1 rounded-lg font-semibold">
                          {seatBookingDetails.payment?.payment_method}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Trạng thái:</span>
                        <span className="bg-blue-200 text-blue-800 px-3 py-1 rounded-lg font-semibold">
                          {seatBookingDetails.payment?.payment_status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Mã GD:</span>
                        <span className="text-gray-700 font-mono text-xs">{seatBookingDetails.payment?.transaction_id}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t-2 border-green-200">
                        <span className="font-bold text-lg">Tổng tiền:</span>
                        <span className="text-xl font-bold text-green-600">
                          {seatBookingDetails.payment?.amount.toLocaleString()}đ
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Date */}
                  <div className="text-center text-sm text-gray-500 pt-2 border-t">
                    <p>Đặt vé lúc: {new Date(seatBookingDetails.booking?.created_at).toLocaleString('vi-VN')}</p>
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={() => setSelectedSeat(null)}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-xl transition"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Film className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{movies.length}</p>
                <p className="text-sm text-gray-500">Phim</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{showtimes.length}</p>
                <p className="text-sm text-gray-500">Suất chiếu</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <Armchair className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{bookingSeats.length}</p>
                <p className="text-sm text-gray-500">Ghế đã đặt</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-3 rounded-lg">
                <CreditCard className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{bookings.length}</p>
                <p className="text-sm text-gray-500">Đơn đặt</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}