import type { Metadata } from "next"
import Link from "next/link"
import "./globals.css"

export const metadata: Metadata = {
  title: "CardScope",
  description: "Scanne. Estime. Collectionne. Decide."
}

const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/scan", label: "Scan" },
  { href: "/collection", label: "Collection" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/strategy", label: "Strategie" },
  { href: "/vide-grenier", label: "Vide-grenier" },
  { href: "/multi-scan", label: "Scan lot" },
  { href: "/login", label: "Login" }
]

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-black text-white">
        <nav className="border-b border-gray-800 px-4 py-3 flex gap-4 overflow-x-auto text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-gray-300 hover:text-white whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {children}
      </body>
    </html>
  )
}
