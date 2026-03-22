import { z } from 'zod'

export const postSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must be under 200 characters'),
  category: z.enum(['JOBS', 'SCHOLARSHIPS', 'FELLOWSHIPS', 'INTERNSHIPS', 'GRANTS']),
  organization: z.string().min(2, 'Organization name required').max(200),
  location: z.string().max(200).optional(),
  isRemote: z.boolean().default(false),
  fundingType: z.enum(['FULLY_FUNDED', 'PARTIAL', 'SELF_FUNDED', 'NOT_APPLICABLE']).default('NOT_APPLICABLE'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(50000),
  eligibility: z.string().max(20000).optional(),
  applyUrl: z.string().url('Must be a valid URL'),
  deadline: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'EXPIRED', 'REJECTED']).default('DRAFT'),
  featured: z.boolean().default(false),
  sponsored: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
})

export const submissionSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  organization: z.string().min(2, 'Organization name required').max(200),
  category: z.enum(['JOBS', 'SCHOLARSHIPS', 'FELLOWSHIPS', 'INTERNSHIPS', 'GRANTS']),
  location: z.string().max(200).optional(),
  isRemote: z.boolean().default(false),
  fundingType: z.enum(['FULLY_FUNDED', 'PARTIAL', 'SELF_FUNDED', 'NOT_APPLICABLE']).default('NOT_APPLICABLE'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(10000),
  eligibility: z.string().max(5000).optional(),
  applyUrl: z.string().url('Must be a valid URL'),
  deadline: z.string().optional(),
  contactEmail: z.string().email('Must be a valid email address'),
})

export const subscribeSchema = z.object({
  email: z.string().email('Must be a valid email address'),
  name: z.string().max(100).optional(),
})

export const alertSchema = z.object({
  category: z.enum(['JOBS', 'SCHOLARSHIPS', 'FELLOWSHIPS', 'INTERNSHIPS', 'GRANTS']).optional(),
  location: z.string().max(200).optional(),
  keyword: z.string().max(100).optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'NEVER']).default('DAILY'),
})

export const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Must be a valid email address'),
})

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const signUpSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Must be a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const signInSchema = z.object({
  email: z.string().email('Must be a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type PostFormData = z.infer<typeof postSchema>
export type SubmissionFormData = z.infer<typeof submissionSchema>
export type SubscribeFormData = z.infer<typeof subscribeSchema>
export type AlertFormData = z.infer<typeof alertSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>
export type SignInFormData = z.infer<typeof signInSchema>
