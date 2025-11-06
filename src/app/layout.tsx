import type { Metadata } from "next";
import "@/styles/globals.css";
import { Inter } from "next/font/google";
import ClientBody from "./ClientBody";
import I18nProvider from "./i18n/Provider";
import LanguageProvider from "@/components/providers/LanguageProvider";
import { GlobalTimerProvider } from "@/contexts/GlobalTimerContext";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  icons: {
    icon: "/images/logo-meta.png",
  },
  title: "Cinestar - Hệ thống rạp chiếu phim giá rẻ, hiện đại bậc nhất",
  description: "Hệ thống rạp chiếu phim Cinestar phục vụ khán giả với những thước phim điện ảnh chất lượng, dịch vụ tốt nhất với giá vé chỉ từ 45.000đ. Đặt vé ngay hôm nay để nhận được những ưu đãi bất ngờ từ Cinestar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <ClientBody className={inter.className}>
        <I18nProvider>
          <LanguageProvider>
            <GlobalTimerProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </GlobalTimerProvider>
          </LanguageProvider>
        </I18nProvider>
      </ClientBody>
    </html>
  );
}
