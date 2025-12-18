// Lưu vào localStorage - cách dùng:
// saveToStorage("user", data);
// user: tên biến lưu local | data: biến dữ liệu
export const saveToStorage = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Lấy từ localStorage - cách dùng:
// const data = getFromStorage<Type>("user");
// Type: kiểu dữ liệu | user: tên biến trong local
export const getFromStorage = <T>(key: string): T | null => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};

// Xoá khỏi localStorage - cách dùng:
// removeFromStorage("user");
// user: tên biến trong local

export const removeFromStorage = (key: string): void => {
  localStorage.removeItem(key);
};