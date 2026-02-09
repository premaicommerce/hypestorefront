import "../styles/globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://vividlook.co.uk"),
}

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
    <body className="font-sans bg-paper text-ink">
    {children}
    </body>
    </html>
  )
}
