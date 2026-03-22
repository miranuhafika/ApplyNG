import Link from 'next/link'
import { SITE_NAME, CATEGORIES } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-2xl font-bold text-white">
              Apply<span className="text-accent">NG</span>
            </Link>
            <p className="mt-3 text-gray-400 max-w-md">
              Nigeria&apos;s #1 platform for discovering scholarships, jobs, fellowships, internships, and grants.
              Your next opportunity is just a click away.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="https://twitter.com/applyng" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Twitter
              </a>
              <a href="https://facebook.com/applyng" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Facebook
              </a>
              <a href="https://linkedin.com/company/applyng" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                LinkedIn
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              {CATEGORIES.map((cat) => (
                <li key={cat.value}>
                  <Link href={`/${cat.value.toLowerCase()}`} className="hover:text-white transition-colors text-sm">
                    {cat.emoji} {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/submit" className="hover:text-white transition-colors">Submit Opportunity</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <p className="text-sm text-gray-500">
            Built with ❤️ for Nigeria&apos;s youth
          </p>
        </div>
      </div>
    </footer>
  )
}
