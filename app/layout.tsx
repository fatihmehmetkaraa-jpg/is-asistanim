export const metadata = {
  title: 'İş Asistanım',
  description: 'Kişisel Verimlilik Uygulaması',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}
