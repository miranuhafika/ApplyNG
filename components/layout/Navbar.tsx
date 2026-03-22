'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { SITE_NAME, CATEGORIES } from '@/lib/constants'

export function Navbar() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/jobs?search=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">
              Apply<span className="text-accent">NG</span>
            </span>
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search opportunities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-gray-400 hover:text-primary">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            <div className="relative group">
              <button className="text-gray-600 dark:text-gray-300 hover:text-primary font-medium">
                Categories ▾
              </button>
              <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.value}
                    href={`/${cat.value.toLowerCase()}`}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <span>{cat.emoji}</span>
                    {cat.label}
                  </Link>
                ))}
              </div>
            </div>

            <Link href="/submit" className="text-gray-600 dark:text-gray-300 hover:text-primary font-medium">
              Submit
            </Link>

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            )}

            {session ? (
              <div className="relative group">
                <button className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {session.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                  <span className="hidden lg:block">{session.user?.name?.split(' ')[0]}</span>
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    Dashboard
                  </Link>
                  <Link href="/dashboard/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    Profile
                  </Link>
                  {session.user?.role === 'ADMIN' && (
                    <Link href="/admin" className="block px-4 py-2 text-sm text-primary font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
                      Admin Panel
                    </Link>
                  )}
                  <hr className="border-gray-200 dark:border-gray-700" />
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/signin" className="text-gray-600 dark:text-gray-300 hover:text-primary font-medium">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSearch} className="mb-4">
              <input
                type="text"
                placeholder="Search opportunities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </form>
            <div className="space-y-2">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.value}
                  href={`/${cat.value.toLowerCase()}`}
                  className="flex items-center gap-2 py-2 text-gray-700 dark:text-gray-300"
                  onClick={() => setMenuOpen(false)}
                >
                  <span>{cat.emoji}</span>
                  {cat.label}
                </Link>
              ))}
              <hr className="border-gray-200 dark:border-gray-700" />
              <Link href="/submit" className="block py-2 text-gray-700 dark:text-gray-300" onClick={() => setMenuOpen(false)}>
                Submit Opportunity
              </Link>
              {session ? (
                <>
                  <Link href="/dashboard" className="block py-2 text-gray-700 dark:text-gray-300" onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <button onClick={() => signOut({ callbackUrl: '/' })} className="block py-2 text-red-600">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" className="block py-2 text-gray-700 dark:text-gray-300" onClick={() => setMenuOpen(false)}>
                    Sign In
                  </Link>
                  <Link href="/auth/signup" className="block py-2 text-primary font-medium" onClick={() => setMenuOpen(false)}>
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
