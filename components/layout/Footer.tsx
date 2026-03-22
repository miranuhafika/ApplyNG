import Link from 'next/link'
import { SITE_NAME, CATEGORIES } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="bg-gray-950 dark:bg-black text-gray-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block">
              <span className="text-xl font-bold text-white tracking-tight">
                Apply<span className="text-primary-400">NG</span>
              </span>
            </Link>
            <p className="mt-3 text-gray-500 max-w-xs text-sm leading-relaxed">
              Nigeria&apos;s leading platform for discovering scholarships, jobs, fellowships, internships, and grants.
            </p>
            <div className="flex gap-5 mt-5">
              {[
                { label: 'Twitter', href: 'https://twitter.com/applyng' },
                { label: 'Facebook', href: 'https://facebook.com/applyng' },
                { label: 'LinkedIn', href: 'https://linkedin.com/company/applyng' },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-white transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4 tracking-wide">Opportunities</h3>
            <ul className="space-y-2.5">
              {CATEGORIES.map((cat) => (
                <li key={cat.value}>
                  <Link
                    href={`/${cat.value.toLowerCase()}`}
                    className="text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <span>{cat.emoji}</span>
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4 tracking-wide">Company</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Contact', href: '/contact' },
                { label: 'Submit Opportunity', href: '/submit' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-500 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-900 mt-10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            Built with ❤️ for Nigeria&apos;s youth
          </p>
        </div>
      </div>
    </footer>
  )
}
