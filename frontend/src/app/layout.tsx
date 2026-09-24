import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RAKSHKAVACH — AI-Powered MPLADS Verification & Trust Platform',
  description: 'Detect anomalies, verify evidence, explain risk signals and preserve an auditable project history.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
