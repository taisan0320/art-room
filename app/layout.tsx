import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "アートルーム - みんなで絵を鑑賞しよう",
  description: "絵を見て、感じたことをシェアしよう",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
