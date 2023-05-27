'use client';
import './globals.css';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Jost } from 'next/font/google';
import { App, ConfigProvider } from 'antd';

const jost = Jost({ subsets: ['latin'], display: 'swap' });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={jost.className}>
      <body>
        <Header />
        <main>
          <ConfigProvider
            theme={{
              token: {
                fontFamily: jost.style.fontFamily,
              },
            }}
          >
            <App>{children}</App>
          </ConfigProvider>
        </main>
        <Footer />
      </body>
    </html>
  );
}
