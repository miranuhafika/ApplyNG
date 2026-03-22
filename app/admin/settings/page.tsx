export default function AdminSettingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Platform Settings</h2>
        <div className="space-y-4 text-gray-500 dark:text-gray-400">
          <p>Configure platform settings here. This section includes:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Featured posts management</li>
            <li>Sponsored ad configuration</li>
            <li>Email template customization</li>
            <li>Newsletter sponsor banner</li>
            <li>Site-wide announcements</li>
          </ul>
          <p className="text-sm">Full settings panel coming soon. Contact your developer to configure these settings via environment variables.</p>
        </div>
      </div>
    </div>
  )
}
