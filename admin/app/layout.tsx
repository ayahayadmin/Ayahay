'use client';
import './globals.css';
import AdminHeader from '@/components/AdminHeader';
import { Jost } from 'next/font/google';
import { App, ConfigProvider, Layout } from 'antd';
import AuthContextProvider from './contexts/AuthContext';
import AdminSider from '@/components/AdminSider';
import { Content } from 'antd/es/layout/layout';

const jost = Jost({ subsets: ['latin'], display: 'swap' });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={jost.className}>
      <head>
        <title>Ayahay Admin</title>
      </head>
      <body>
        <AuthContextProvider>
          <ConfigProvider
            theme={{
              token: {
                fontFamily: jost.style.fontFamily,
              },
            }}
          >
            <App>
              <Layout>
                <Layout className='body'>
                  <AdminHeader />
                  <Content style={{ backgroundColor: 'white' }}>
                    {children}
                  </Content>
                </Layout>
                <AdminSider />
              </Layout>
            </App>
          </ConfigProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}
