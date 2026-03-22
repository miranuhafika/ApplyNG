import { Resend } from 'resend'
import { SITE_NAME, SITE_URL } from './constants'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || 'placeholder')
}

const FROM_EMAIL = `${SITE_NAME} <noreply@applyng.com>`

export async function sendWelcomeEmail(to: string, name: string) {
  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Welcome to ${SITE_NAME}!`,
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Inter, sans-serif; background-color: #f5f5f5; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
              <div style="background: #006400; padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">${SITE_NAME}</h1>
                <p style="color: #ccebcc; margin: 8px 0 0;">Nigeria's #1 Opportunity Platform</p>
              </div>
              <div style="padding: 30px;">
                <h2>Welcome, ${name}! 🎉</h2>
                <p>Thank you for joining ${SITE_NAME}. We're excited to help you discover amazing opportunities in Nigeria and beyond.</p>
                <p>Here's what you can do:</p>
                <ul>
                  <li>Browse thousands of scholarships, jobs, fellowships, and more</li>
                  <li>Save opportunities you're interested in</li>
                  <li>Set up alerts for new opportunities matching your interests</li>
                </ul>
                <a href="${SITE_URL}/dashboard" style="display: inline-block; background: #006400; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">
                  Go to Dashboard
                </a>
              </div>
              <div style="padding: 20px; background: #f5f5f5; text-align: center;">
                <p style="color: #666; font-size: 12px;">
                  © ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.<br>
                  <a href="${SITE_URL}" style="color: #006400;">${SITE_URL}</a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    })
  } catch (error) {
    console.error('Failed to send welcome email:', error)
  }
}

export async function sendAlertNotification(
  to: string,
  name: string,
  posts: Array<{ title: string; organization: string; category: string; slug: string; category_slug: string }>
) {
  try {
    const postHtml = posts
      .map(
        (post) => `
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
            <span style="background: #006400; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
              ${post.category}
            </span>
            <h3 style="margin: 8px 0 4px;">${post.title}</h3>
            <p style="color: #666; margin: 0 0 8px;">${post.organization}</p>
            <a href="${SITE_URL}/${post.category_slug}/${post.slug}" style="color: #006400;">View Details →</a>
          </div>
        `
      )
      .join('')

    await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: `New Opportunities Matching Your Alerts - ${SITE_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Inter, sans-serif; background-color: #f5f5f5; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
              <div style="background: #006400; padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">${SITE_NAME}</h1>
              </div>
              <div style="padding: 30px;">
                <h2>Hi ${name}, new opportunities await! 🚀</h2>
                <p>Here are the latest opportunities matching your alerts:</p>
                ${postHtml}
                <a href="${SITE_URL}/dashboard" style="display: inline-block; background: #006400; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">
                  Manage Alerts
                </a>
              </div>
              <div style="padding: 20px; background: #f5f5f5; text-align: center;">
                <p style="color: #666; font-size: 12px;">
                  You received this because you set up alerts on ${SITE_NAME}.<br>
                  <a href="${SITE_URL}/dashboard" style="color: #006400;">Manage preferences</a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    })
  } catch (error) {
    console.error('Failed to send alert notification:', error)
  }
}

export async function sendNewsletterDigest(
  subscribers: Array<{ email: string; name: string | null; unsubToken: string }>,
  posts: Array<{ title: string; organization: string; category: string; slug: string; category_slug: string }>
) {
  const postHtml = posts
    .slice(0, 10)
    .map(
      (post) => `
        <div style="border-bottom: 1px solid #e5e7eb; padding: 16px 0;">
          <span style="background: #006400; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
            ${post.category}
          </span>
          <h3 style="margin: 8px 0 4px;">${post.title}</h3>
          <p style="color: #666; margin: 0 0 8px;">${post.organization}</p>
          <a href="${SITE_URL}/${post.category_slug}/${post.slug}" style="color: #006400;">View →</a>
        </div>
      `
    )
    .join('')

  for (const subscriber of subscribers) {
    try {
      await getResend().emails.send({
        from: FROM_EMAIL,
        to: subscriber.email,
        subject: `This Week's Top Opportunities - ${SITE_NAME}`,
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: Inter, sans-serif; background-color: #f5f5f5; padding: 20px;">
              <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
                <div style="background: #006400; padding: 30px; text-align: center;">
                  <h1 style="color: white; margin: 0;">${SITE_NAME}</h1>
                  <p style="color: #ccebcc; margin: 8px 0 0;">Weekly Digest</p>
                </div>
                <div style="padding: 30px;">
                  <h2>Hi ${subscriber.name || 'there'}! This week's top opportunities:</h2>
                  ${postHtml}
                  <a href="${SITE_URL}" style="display: inline-block; background: #006400; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">
                    Browse All Opportunities
                  </a>
                </div>
                <div style="padding: 20px; background: #f5f5f5; text-align: center;">
                  <p style="color: #666; font-size: 12px;">
                    <a href="${SITE_URL}/api/unsubscribe?token=${subscriber.unsubToken}" style="color: #006400;">
                      Unsubscribe
                    </a>
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      })
    } catch (error) {
      console.error(`Failed to send digest to ${subscriber.email}:`, error)
    }
  }
}

export async function sendSubmissionConfirmation(to: string, title: string) {
  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Submission Received: ${title} - ${SITE_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Inter, sans-serif; background-color: #f5f5f5; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
              <div style="background: #006400; padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">${SITE_NAME}</h1>
              </div>
              <div style="padding: 30px;">
                <h2>Submission Received! ✅</h2>
                <p>Thank you for submitting <strong>${title}</strong> to ${SITE_NAME}.</p>
                <p>Our team will review your submission within 24-48 hours. You'll receive an email once it's approved and published.</p>
                <p>Want to get featured? <a href="${SITE_URL}/submit#featured" style="color: #006400;">Learn about our featured listings</a>.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })
  } catch (error) {
    console.error('Failed to send submission confirmation:', error)
  }
}

export async function sendAdminNotification(submission: { title: string; organization: string; contactEmail: string; id: string }) {
  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: process.env.ADMIN_EMAIL!,
      subject: `New Submission: ${submission.title} - ${SITE_NAME}`,
      html: `
        <h2>New Opportunity Submission</h2>
        <p><strong>Title:</strong> ${submission.title}</p>
        <p><strong>Organization:</strong> ${submission.organization}</p>
        <p><strong>Contact:</strong> ${submission.contactEmail}</p>
        <a href="${SITE_URL}/admin/submissions">Review Submission</a>
      `,
    })
  } catch (error) {
    console.error('Failed to send admin notification:', error)
  }
}
