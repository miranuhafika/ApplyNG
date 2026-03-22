export function AdBanner({ slot }: { slot: string }) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID

  if (!adsenseId) {
    return (
      <div className="w-full h-24 bg-gray-100 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 text-sm">
        Ad Placeholder ({slot})
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden rounded-xl" data-ad-slot={slot}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adsenseId}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}
