import type { Metadata } from 'next'
import { SITE_NAME } from '@/lib/constants'

export const metadata: Metadata = { title: `Terms of Service - ${SITE_NAME}` }

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Terms of Service</h1>
      <p className="text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <div className="prose-content text-gray-700 dark:text-gray-300 space-y-6">
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using {SITE_NAME}, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</p>

        <h2>2. Use of Service</h2>
        <p>You may use {SITE_NAME} for lawful purposes only. You agree not to:</p>
        <ul>
          <li>Submit false, misleading, or fraudulent opportunity listings</li>
          <li>Violate any applicable laws or regulations</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Use the service for spam or unsolicited communications</li>
        </ul>

        <h2>3. Opportunity Listings</h2>
        <p>We strive to verify all listings, but we cannot guarantee the accuracy of submissions from third parties. We reserve the right to remove any listing that violates our guidelines or terms.</p>

        <h2>4. Intellectual Property</h2>
        <p>The content on {SITE_NAME}, including text, graphics, and code, is owned by or licensed to us. You may not reproduce or distribute our content without permission.</p>

        <h2>5. Disclaimer of Warranties</h2>
        <p>Our service is provided &quot;as is&quot; without warranties of any kind. We do not guarantee the accuracy, completeness, or timeliness of any information on the platform.</p>

        <h2>6. Limitation of Liability</h2>
        <p>To the maximum extent permitted by law, {SITE_NAME} shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>

        <h2>7. Changes to Terms</h2>
        <p>We reserve the right to update these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.</p>

        <h2>8. Contact</h2>
        <p>Questions about these terms? Contact us at <a href="mailto:legal@applyng.com">legal@applyng.com</a>.</p>
      </div>
    </div>
  )
}
