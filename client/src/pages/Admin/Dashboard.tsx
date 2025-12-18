export default function Dashboard() {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          📊 Tổng quan hệ thống
        </h2>
        <p className="text-gray-500 mt-1">
          Thống kê nhanh về hoạt động của hệ thống quản lý rạp phim.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Card 1 */}
        <div className="p-6 rounded-xl shadow bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <p className="text-sm text-gray-600">Tổng số phim</p>
          <h3 className="text-3xl font-bold text-blue-700 mt-1">128</h3>
        </div>

        {/* Card 2 */}
        <div className="p-6 rounded-xl shadow bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
          <p className="text-sm text-gray-600">Tổng lượt đặt vé</p>
          <h3 className="text-3xl font-bold text-green-700 mt-1">4,392</h3>
        </div>

        {/* Card 3 */}
        <div className="p-6 rounded-xl shadow bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
          <p className="text-sm text-gray-600">Doanh thu tháng</p>
          <h3 className="text-3xl font-bold text-purple-700 mt-1">12.5M</h3>
        </div>

        {/* Card 4 */}
        <div className="p-6 rounded-xl shadow bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200">
          <p className="text-sm text-gray-600">Sự kiện đang diễn ra</p>
          <h3 className="text-3xl font-bold text-yellow-700 mt-1">3</h3>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="mt-6 bg-white border border-gray-200 rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">📈 Biểu đồ doanh thu</h3>
        <div className="h-40 flex items-center justify-center text-gray-400 border rounded-lg">
          (Biểu đồ sẽ hiển thị ở đây)
        </div>
      </div>

    </div>
  );
}
