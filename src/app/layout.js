import './globals.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import Script from 'next/script'

import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'ระบบชำระเงิน',
  description: 'ระบบบัญชีและใบเสร็จนักเรียน',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
      </head>
      <body>
        <Navbar />
        {children}
        <Script src="https://code.jquery.com/jquery-3.5.1.min.js" strategy="beforeInteractive" />
        <Script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js" strategy="lazyOnload" />
        <Script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js" strategy="lazyOnload" />
      </body>
    </html>
  )
}
