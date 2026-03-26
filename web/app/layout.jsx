import './globals.css'

export const metadata = {
  title: 'Biz For You — Find Your Business',
  description: 'An adaptive AI interview that finds business opportunities tailored to your unique situation, skills, and unfair advantages.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
