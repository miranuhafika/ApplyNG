import type { Metadata } from 'next'
import { SITE_NAME } from '@/lib/constants'

export const metadata: Metadata = {
  title: `Contact ${SITE_NAME}`,
}

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-10 text-lg">
        Have questions, feedback, or partnership inquiries? We&apos;d love to hear from you.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <span className="text-2xl">📧</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">General Inquiries</h3>
                <a href="mailto:info@applyng.com" className="text-primary hover:underline">info@applyng.com</a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-2xl">📝</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Submit an Opportunity</h3>
                <a href="/submit" className="text-primary hover:underline">Submit free listing</a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-2xl">⭐</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Sponsorship & Advertising</h3>
                <a href="mailto:ads@applyng.com" className="text-primary hover:underline">ads@applyng.com</a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-2xl">🐦</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Social Media</h3>
                <div className="space-y-1">
                  <a href="https://twitter.com/applyng" target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline">@ApplyNG on Twitter</a>
                  <a href="https://facebook.com/applyng" target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline">ApplyNG on Facebook</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Send a Message</h2>
          <form className="space-y-4" action="mailto:info@applyng.com" method="post" encType="text/plain">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
              <textarea
                name="message"
                rows={5}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
            <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl hover:bg-primary-600 font-medium">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
