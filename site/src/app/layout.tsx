import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: {
    default: '100kdo - 十万个干什么',
    template: '%s | 100kdo',
  },
  description:
    '给普通人的 AI 领域专家一键切换平台。搜索你的问题，找到专家工具包，复制粘贴到 AI，秒变专家。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
