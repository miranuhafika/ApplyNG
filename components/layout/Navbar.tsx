'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { CATEGORIES } from '@/lib/constants'

export function Navbar() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/jobs?search=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <nav
      className={`sticky top-0 z-50 glass border-b transition-shadow duration-300 ${
        scrolled
          ? 'border-gray-200 dark:border-gray-800 shadow-nav'
          : 'border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Apply<span className="text-primary-600">NG</span>
            </span>
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm mx-8">
            <div className="relative w-full">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search opportunities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-surface-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
              />
            </div>
          </form>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {/* Categories dropdown */}
            <div className="relative group">
              <button className="btn-ghost text-sm flex items-center gap-1">
                Browse
                <svg className="w-3.5 h-3.5 opacity-60 group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-2 w-52 card shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 animate-fade-in py-1.5">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.value}
                    href={`/${cat.value.toLowerCase()}`}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-surface-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-base">{cat.emoji}</span>
                    <span className="font-medium">{cat.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <Link href="/submit" className="btn-ghost text-sm">
              Submit
            </Link>

            {/* Divider */}
            <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="btn-ghost p-2"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            )}

            {session ? (
              <div className="relative group ml-1">
                <button className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {session.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </button>
                <div className="absolute right-0 top-full mt-2 w-52 card shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1.5">
                  <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{session.user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{session.user?.email}</p>
                  </div>
                  <Link href="/dashboard" className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-surface-50 dark:hover:bg-gray-800 transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/dashboard/profile" className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-surface-50 dark:hover:bg-gray-800 transition-colors">
                    Profile
                  </Link>
                  {session.user?.role === 'ADMIN' && (
                    <Link href="/admin" className="block px-4 py-2.5 text-sm text-primary-600 font-medium hover:bg-surface-50 dark:hover:bg-gray-800 transition-colors">
                      Admin Panel
                    </Link>
                  )}
                  <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link href="/auth/signin" className="btn-ghost text-sm">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="btn-primary text-sm">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden btn-ghost p-2"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="md:hidden py-4 border-t border-gray-100 dark:border-gray-800 animate-fade-in">
            <form onSubmit={handleSearch} className="mb-4 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search opportunities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-9"
              />
            </form>

            <div className="space-y-0.5">
              <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Categories</p>
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.value}
                  href={`/${cat.value.toLowerCase()}`}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-surface-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <span>{cat.emoji}</span>
                  <span className="font-medium">{cat.label}</span>
                </Link>
              ))}
              <div className="border-t border-gray-100 dark:border-gray-800 my-2" />
              <Link
                href="/submit"
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-surface-50 dark:hover:bg-gray-800 rounded-xl transition-colors font-medium"
                onClick={() => setMenuOpen(false)}
              >
                Submit Opportunity
              </Link>
              {session ? (
                <>
                  <Link href="/dashboard" className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-surface-50 dark:hover:bg-gray-800 rounded-xl transition-colors" onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full text-left px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2 pt-2 px-3">
                  <Link href="/auth/signin" className="btn-secondary flex-1 text-sm text-center" onClick={() => setMenuOpen(false)}>
                    Sign In
                  </Link>
                  <Link href="/auth/signup" className="btn-primary flex-1 text-sm text-center" onClick={() => setMenuOpen(false)}>
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
