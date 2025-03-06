import { Geist } from "next/font/google";
import "./globals.css";
import type { Metadata } from 'next';
import ClientWrapper from '@/app/client-wrapper';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Auth with Supabase and Google',
  description: 'Next.js app with Supabase Auth and Google Drive integration',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
} 