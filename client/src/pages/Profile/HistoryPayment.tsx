import React, { useState } from 'react';

export default function HistoryPayment() {
  const [transactions, setTransactions] = useState([]);
  
  return (
    <div className="w-full bg-gray-900 rounded-lg border border-gray-700 p-6">
      <div className="grid grid-cols-4 gap-4 pb-4 border-b border-gray-700">
        <div className="text-gray-300 font-medium">Ngày giao dịch</div>
        <div className="text-gray-300 font-medium">Tên phim</div>
        <div className="text-gray-300 font-medium">Số vé</div>
        <div className="text-gray-300 font-medium">Số tiền</div>
      </div>
      
      {transactions.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-gray-500 text-center">Không có dữ liệu</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-700">
          {transactions.map((transaction, index) => (
            <div key={index} className="grid grid-cols-4 gap-4 py-4">
              <div className="text-gray-300">{transaction.date}</div>
              <div className="text-gray-300">{transaction.movieName}</div>
              <div className="text-gray-300">{transaction.ticketCount}</div>
              <div className="text-gray-300">{transaction.amount}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}