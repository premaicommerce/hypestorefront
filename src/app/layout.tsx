import "../styles/globals.css"

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
