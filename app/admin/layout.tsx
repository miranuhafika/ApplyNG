import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin')
  }

  return (
    <div className="flex min-h-screen">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-gray-900 text-gray-300 flex-shrink-0 hidden lg:block">
        <div className="p-6">
          <Link href="/admin" className="text-xl font-bold text-white">
            Apply<span className="text-accent">NG</span> Admin
          </Link>
        </div>
        <nav className="px-4 pb-8">
          <div className="space-y-1">
            <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 text-sm font-medium">
              📊 Dashboard
            </Link>
            <Link href="/admin/posts" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 text-sm font-medium">
              📝 Posts
            </Link>
            <Link href="/admin/submissions" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 text-sm font-medium">
              📬 Submissions
            </Link>
            <Link href="/admin/subscribers" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 text-sm font-medium">
              📧 Subscribers
            </Link>
            <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 text-sm font-medium">
              ⚙️ Settings
            </Link>
          </div>
          <hr className="border-gray-700 my-4" />
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 text-sm">
            ← Back to Site
          </Link>
        </nav>
      </aside>

      {/* Admin Content */}
      <main className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-auto">
        {children}
      </main>
    </div>
  )
}
