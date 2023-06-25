'use client';
import './globals.css';
import Footer from '@/components/WebFooter';
import WebHeader from '@/components/WebHeader';
import { Jost } from 'next/font/google';
import { App, ConfigProvider, Layout, Menu } from 'antd';
import React from 'react';
import { Content } from 'antd/es/layout/layout';
import WebFooter from '@/components/WebFooter';
import WebSider from '@/components/WebSider';
const jost = Jost({ subsets: ['latin'], display: 'swap' });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={jost.className}>
      <body>
        <ConfigProvider
          theme={{
            token: {
              fontFamily: jost.style.fontFamily,
            },
          }}
        >
          <Layout>
            <Layout>
              <WebHeader />
              <Content style={{backgroundColor: 'white'}}>{children}</Content>
              <WebFooter />
            </Layout>
            <WebSider />
          </Layout>
        </ConfigProvider>
      </body>
    </html>
  );
}
