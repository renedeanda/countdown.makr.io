
import './globals.css'
import { Inter } from 'next/font/google'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Event Countdown',
  description: 'Countdown to your special events and milestones',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="description" content="Countdown to your special events and milestones. Track birthdays, holidays, weddings, and more!" />
        <meta name="keywords" content="countdown, events, milestones, birthday, wedding, holiday, graduation" />
        <meta property="og:title" content="Event Countdown" />
        <meta property="og:description" content="Countdown to your special events and milestones. Track birthdays, holidays, weddings, and more!" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://countdown.makr.io" />
        <meta property="og:image" content="https://countdown.makr.io/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Event Countdown" />
        <meta name="twitter:description" content="Countdown to your special events and milestones. Track birthdays, holidays, weddings, and more!" />
        <meta name="twitter:image" content="https://countdown.makr.io/twitter-image.jpg" />
      </head>
      <body className={inter.className}>
        {children}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
          `}
        </Script>
      </body>
    </html>
  )
}
