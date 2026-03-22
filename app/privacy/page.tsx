import type { Metadata } from 'next'
import { SITE_NAME } from '@/lib/constants'

export const metadata: Metadata = { title: `Privacy Policy - ${SITE_NAME}` }

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Privacy Policy</h1>
      <p className="text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <div className="prose-content text-gray-700 dark:text-gray-300 space-y-6">
        <h2>1. Information We Collect</h2>
        <p>We collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, or submit an opportunity. This includes your name, email address, and any other information you choose to provide.</p>

        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve our services</li>
          <li>Send you newsletters and opportunity alerts (with your consent)</li>
          <li>Respond to your comments and questions</li>
          <li>Monitor and analyze trends and usage</li>
        </ul>

        <h2>3. Information Sharing</h2>
        <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy or as required by law.</p>

        <h2>4. Data Security</h2>
        <p>We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

        <h2>5. Cookies</h2>
        <p>We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>

        <h2>6. Third-Party Services</h2>
        <p>Our service may contain links to third-party websites. We are not responsible for the privacy practices of those sites and encourage you to review their privacy policies.</p>

        <h2>7. Contact Us</h2>
        <p>If you have questions about this Privacy Policy, please contact us at <a href="mailto:privacy@applyng.com">privacy@applyng.com</a>.</p>
      </div>
    </div>
  )
}
