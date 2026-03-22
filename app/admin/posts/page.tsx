'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CATEGORIES, FUNDING_TYPES } from '@/lib/constants'
import { RichTextEditor } from '@/components/admin/RichTextEditor'

interface Post {
  id: string
  title: string
  category: string
  organization: string
  location?: string | null
  isRemote: boolean
  fundingType: string
  description: string
  eligibility?: string | null
  applyUrl: string
  deadline?: string | null
  status: string
  featured: boolean
  sponsored: boolean
  views: number
  tags: { id: string; name: string }[]
}

export default function AdminPostsPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editPost, setEditPost] = useState<Post | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: '',
    category: 'JOBS',
    organization: '',
    location: '',
    isRemote: false,
    fundingType: 'NOT_APPLICABLE',
    description: '',
    eligibility: '',
    applyUrl: '',
    deadline: '',
    status: 'PUBLISHED',
    featured: false,
    sponsored: false,
    tags: '',
  })

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/posts?page=1')
      const data = await res.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        deadline: formData.deadline || null,
      }
      const res = await fetch(editPost ? `/api/posts/${editPost.id}` : '/api/posts', {
        method: editPost ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setShowForm(false)
        setEditPost(null)
        fetchPosts()
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to save post')
      }
    } catch (error) {
      console.error('Failed to save post:', error)
    }
  }

  const handleEdit = (post: Post) => {
    setEditPost(post)
    setFormData({
      title: post.title,
      category: post.category,
      organization: post.organization,
      location: post.location || '',
      isRemote: post.isRemote,
      fundingType: post.fundingType,
      description: post.description,
      eligibility: post.eligibility || '',
      applyUrl: post.applyUrl,
      deadline: post.deadline ? post.deadline.split('T')[0] : '',
      status: post.status,
      featured: post.featured,
      sponsored: post.sponsored,
      tags: post.tags.map((t) => t.name).join(', '),
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' })
      if (res.ok) fetchPosts()
    } catch (error) {
      console.error('Failed to delete post:', error)
    }
  }

  const handleBulkAction = async (action: 'publish' | 'unpublish' | 'delete') => {
    if (selectedIds.length === 0) return
    if (action === 'delete' && !confirm(`Delete ${selectedIds.length} posts?`)) return
    
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/posts/${id}`, {
            method: action === 'delete' ? 'DELETE' : 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: action !== 'delete' ? JSON.stringify({ status: action === 'publish' ? 'PUBLISHED' : 'DRAFT' }) : undefined,
          })
        )
      )
      setSelectedIds([])
      fetchPosts()
    } catch (error) {
      console.error('Bulk action failed:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '', category: 'JOBS', organization: '', location: '',
      isRemote: false, fundingType: 'NOT_APPLICABLE', description: '',
      eligibility: '', applyUrl: '', deadline: '', status: 'PUBLISHED',
      featured: false, sponsored: false, tags: '',
    })
    setEditPost(null)
    setShowForm(false)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Post Management</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600"
        >
          + New Post
        </button>
      </div>

      {/* Post Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
          <div className="min-h-screen p-4 flex items-start justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl my-8 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editPost ? 'Edit Post' : 'Create New Post'}
                </h2>
                <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organization *</label>
                    <input
                      type="text"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Funding Type</label>
                    <select
                      value={formData.fundingType}
                      onChange={(e) => setFormData({ ...formData, fundingType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {FUNDING_TYPES.map((ft) => (
                        <option key={ft.value} value={ft.value}>{ft.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apply URL *</label>
                    <input
                      type="url"
                      value={formData.applyUrl}
                      onChange={(e) => setFormData({ ...formData, applyUrl: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="remote, fully-funded, stem"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isRemote}
                        onChange={(e) => setFormData({ ...formData, isRemote: e.target.checked })}
                        className="rounded text-primary"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Remote</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="rounded text-primary"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Featured</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.sponsored}
                        onChange={(e) => setFormData({ ...formData, sponsored: e.target.checked })}
                        className="rounded text-primary"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Sponsored</span>
                    </label>
                  </div>
                </div>

                {/* Rich Text Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                  <RichTextEditor
                    content={formData.description}
                    onChange={(html) => setFormData({ ...formData, description: html })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Eligibility</label>
                  <RichTextEditor
                    content={formData.eligibility}
                    onChange={(html) => setFormData({ ...formData, eligibility: html })}
                  />
                </div>

                <div className="flex gap-3">
                  <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-600">
                    {editPost ? 'Update Post' : 'Create Post'}
                  </button>
                  <button type="button" onClick={resetForm} className="border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 px-6 py-2 rounded-lg">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="mb-4 flex items-center gap-3 p-4 bg-primary/10 rounded-xl">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{selectedIds.length} selected</span>
          <button onClick={() => handleBulkAction('publish')} className="text-sm bg-green-600 text-white px-3 py-1 rounded-lg">Publish</button>
          <button onClick={() => handleBulkAction('unpublish')} className="text-sm bg-gray-600 text-white px-3 py-1 rounded-lg">Unpublish</button>
          <button onClick={() => handleBulkAction('delete')} className="text-sm bg-red-600 text-white px-3 py-1 rounded-lg">Delete</button>
        </div>
      )}

      {/* Posts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th className="p-4">
                    <input
                      type="checkbox"
                      onChange={(e) => setSelectedIds(e.target.checked ? posts.map((p) => p.id) : [])}
                    />
                  </th>
                  <th className="p-4 text-gray-500 dark:text-gray-400 font-medium">Title</th>
                  <th className="p-4 text-gray-500 dark:text-gray-400 font-medium">Category</th>
                  <th className="p-4 text-gray-500 dark:text-gray-400 font-medium">Status</th>
                  <th className="p-4 text-gray-500 dark:text-gray-400 font-medium">Views</th>
                  <th className="p-4 text-gray-500 dark:text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(post.id)}
                        onChange={(e) =>
                          setSelectedIds(
                            e.target.checked ? [...selectedIds, post.id] : selectedIds.filter((id) => id !== post.id)
                          )
                        }
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900 dark:text-white truncate max-w-xs">{post.title}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">{post.organization}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">{post.category}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        post.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                        post.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 dark:text-gray-400">{post.views.toLocaleString()}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(post)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="text-red-600 hover:text-red-800 text-xs font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {posts.length === 0 && (
              <div className="p-8 text-center text-gray-500">No posts yet.</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
