npm i

npm run dev trên môi trường dev
npm run build && npm run start trên môi trường production

NEXT_PUBLIC_TMDB_API_KEY= //lấy trên themoviedb

NEXT_PUBLIC_TMDB_BASE_URL= //url của themoviedb

//lấy của db trong zalo
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_NAME=
//set eamil
EMAIL=
EMAIL_APP_PASSWORD= //này lấy của App gg

NEXT_PUBLIC_NUMBER_PHONE= //sđt của m

Viết theo cấu trúc NextJS, API Router 
Sử dụng Tailwind, Radix ui 
I18n để translate trang
Sử dụng qrcode để xuất ra qr form thanh toán

    Sử dụng websocket để update trạng thái ghế ngồi
        nodemailer để gửi mail
        zod để validate form
        swiper để slider
        react-i18next để translate
        react-hot-toast để hiển thị thông báo
        react-icons để hiển thị icon

    🔄 Cấu hình Email cho tính năng Forgot Password

        ##  Quy trình hoạt động

        ```
        1. User nhập email → API tạo reset_token + expiry
        2. Lưu vào DB → Gửi email chứa link reset
        3. User click link → Kiểm tra token hợp lệ & chưa hết hạn  
        4. Đặt lại mật khẩu → Xóa token khỏi DB
        ```

        Cấu hình các Movie 
        Status : coming soon , now showing and expired
        + coming soon : release_date > now
        + now showing : release_date < now < end_date
        + expired : end_date < now