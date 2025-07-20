GreenCard 7 Node

Ứng dụng Node.js phân tán gồm nhiều module nhỏ: orders, products, payment, users. Mỗi service có thể khởi chạy riêng biệt, giao tiếp với nhau qua API

```
7_node_2/
├── orders/           # Service quản lý đơn hàng
├── products/         # Service quản lý sản phẩm
├── payment/          # Service thanh toán
├── users/            # Service quản lý người dùng
├── my-app/           # Giao diện người dùng
├── my-app-admin/     # Giao diện admin
├── docker-compose.yml# (nếu dùng Docker)
├── README.md         # Tệp hướng dẫn sử dụng
```

## 🌐 Giao diện Web

- 🧑 Người dùng (Frontend):
  - http://103.178.234.70:5000/

- 🛒 Quản trị viên (Seller/Admin):
  - http://103.178.234.70:5001/seller
  - admin@gmail.com
  - admin123

> Bạn có thể truy cập trực tiếp trên trình duyệt
