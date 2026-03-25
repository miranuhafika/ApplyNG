export interface Setting {
  id: string
  key: string
  value: string
  description?: string | null
  category: string
  isSecret: boolean
  createdAt: string
  updatedAt: string
}

export interface SettingAuditLog {
  id: string
  settingId: string
  key: string
  oldValue?: string | null
  newValue: string
  changedBy: string
  changedAt: string
}

export interface SettingWithAuditLogs extends Setting {
  auditLogs: SettingAuditLog[]
}

export type SettingCategory =
  | 'oauth'
  | 'payment'
  | 'email'
  | 'site'
  | 'pricing'
  | 'features'
  | 'contact'
  | 'general'

export interface SettingCategoryInfo {
  key: SettingCategory
  label: string
  description: string
  icon: string
}

export const SETTING_CATEGORIES: SettingCategoryInfo[] = [
  { key: 'oauth', label: 'OAuth & Authentication', description: 'Google OAuth credentials', icon: '🔐' },
  { key: 'payment', label: 'Payment Gateway', description: 'Paystack API keys', icon: '💳' },
  { key: 'email', label: 'Email Service', description: 'Resend API configuration', icon: '📧' },
  { key: 'site', label: 'Site Configuration', description: 'General site settings', icon: '🌐' },
  { key: 'pricing', label: 'Pricing', description: 'Post pricing configuration', icon: '💰' },
  { key: 'features', label: 'Features', description: 'Feature toggles', icon: '⚙️' },
  { key: 'contact', label: 'Contact Information', description: 'Contact details', icon: '📞' },
]

export interface UpdateSettingRequest {
  value: string
  description?: string
}

export interface BulkUpdateRequest {
  settings: { key: string; value: string }[]
}

export interface SettingsApiResponse {
  settings: Setting[]
}

export interface SettingApiResponse {
  setting: Setting
}
