import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'EIT AI Assistant',
  description: 'RAG-powered learning assistant for MEST students',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} antialiased h-full`}
      >
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
