'use client'

import { useState, useEffect } from 'react'

interface Submission {
  id: string
  title: string
  organization: string
  category: string
  contactEmail: string
  status: string
  createdAt: string
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('PENDING')

  useEffect(() => {
    fetchSubmissions()
  }, [statusFilter])

  const fetchSubmissions = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/submissions?status=${statusFilter}`)
      const data = await res.json()
      setSubmissions(data)
    } catch (error) {
      console.error('Failed to fetch submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED', notes?: string) => {
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes: notes }),
      })
      if (res.ok) {
        fetchSubmissions()
      }
    } catch (error) {
      console.error('Failed to update submission:', error)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Submissions</h1>

      <div className="flex gap-2 mb-6">
        {['PENDING', 'APPROVED', 'REJECTED'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              statusFilter === s
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : submissions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No {statusFilter.toLowerCase()} submissions</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th className="p-4 text-gray-500 font-medium">Title</th>
                  <th className="p-4 text-gray-500 font-medium">Category</th>
                  <th className="p-4 text-gray-500 font-medium">Contact</th>
                  <th className="p-4 text-gray-500 font-medium">Date</th>
                  <th className="p-4 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="p-4">
                      <div className="font-medium text-gray-900 dark:text-white truncate max-w-xs">{sub.title}</div>
                      <div className="text-gray-500 text-xs">{sub.organization}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">{sub.category}</span>
                    </td>
                    <td className="p-4 text-gray-500 dark:text-gray-400 text-xs">{sub.contactEmail}</td>
                    <td className="p-4 text-gray-500 dark:text-gray-400 text-xs">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {sub.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(sub.id, 'APPROVED')}
                            className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              const notes = prompt('Rejection reason (optional):')
                              handleAction(sub.id, 'REJECTED', notes || undefined)
                            }}
                            className="text-xs bg-red-600 text-white px-3 py-1 rounded-lg"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
