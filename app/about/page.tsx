import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_NAME } from '@/lib/constants'

export const metadata: Metadata = {
  title: `About ${SITE_NAME}`,
  description: `Learn about ${SITE_NAME}, Nigeria's #1 opportunity platform.`,
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">About {SITE_NAME}</h1>

      <div className="prose-content text-gray-700 dark:text-gray-300 space-y-6">
        <p className="text-xl leading-relaxed">
          {SITE_NAME} (OpportunityHub Nigeria) is Nigeria&apos;s premier platform for discovering scholarships, 
          jobs, fellowships, internships, and grants. We curate and aggregate the best opportunities 
          from around the world, making them accessible to every Nigerian.
        </p>

        <h2>Our Mission</h2>
        <p>
          Our mission is to democratize access to opportunities for Nigeria&apos;s youth. We believe every 
          Nigerian deserves access to quality information about scholarships, career opportunities, and 
          funding programs — regardless of their location or background.
        </p>

        <h2>What We Offer</h2>
        <ul>
          <li>💼 <strong>Jobs</strong> — Verified job listings from top companies in Nigeria and globally</li>
          <li>🎓 <strong>Scholarships</strong> — Fully funded and partial scholarships for Nigerian students</li>
          <li>🌟 <strong>Fellowships</strong> — Leadership and professional development programs</li>
          <li>🏢 <strong>Internships</strong> — Hands-on experience opportunities</li>
          <li>💰 <strong>Grants</strong> — Funding for businesses, projects, and innovations</li>
        </ul>

        <h2>Why Choose {SITE_NAME}?</h2>
        <ul>
          <li>✅ Daily updates with fresh opportunities</li>
          <li>✅ Deadline reminders and alerts</li>
          <li>✅ Free to use — no subscription required</li>
          <li>✅ Mobile-friendly interface</li>
          <li>✅ Verified listings only</li>
        </ul>

        <h2>Contact Us</h2>
        <p>
          Have questions or want to submit an opportunity? 
          Visit our <Link href="/contact" className="text-green-700 hover:underline">contact page</Link> or email us at 
          <a href="mailto:info@applyng.com"> info@applyng.com</a>.
        </p>
      </div>
    </div>
  )
}
