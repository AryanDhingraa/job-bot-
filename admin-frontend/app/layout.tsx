'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { ApolloProvider } from '@apollo/client';
import client from '../lib/apolloClient';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground`}>
        <ApolloProvider client={client}>{children}</ApolloProvider>
        {/* Main Website Footer */}
      </body>
    </html>
  );
}
