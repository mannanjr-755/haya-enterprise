import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required').refine((v) => !/\s/.test(v), 'Username cannot contain spaces'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
})

export const machineSchema = z.object({
  name: z.string().min(1, 'Machine name is required'),
  type: z.string().min(1, 'Machine type is required'),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  registrationNumber: z.string().optional(),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  purchaseCost: z.coerce.number().min(0, 'Purchase cost must be positive'),
  currentValue: z.coerce.number().min(0, 'Current value must be positive'),
  depreciationRate: z.coerce.number().min(0).max(100),
  workingHours: z.coerce.number().min(0),
  status: z.enum(['ACTIVE', 'IDLE', 'MAINTENANCE', 'PARTNERSHIP', 'RETIRED']),
  location: z.string().optional(),
})

export const expenseSchema = z.object({
  category: z.enum([
    'GENERAL', 'YARD', 'MACHINERY', 'FUEL', 'MAINTENANCE',
    'STAFF_SALARIES', 'TRANSPORTATION', 'SPARE_PARTS', 'UTILITIES', 'OTHER',
  ]),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required'),
  machineId: z.string().optional(),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8, 'Current password must be at least 8 characters'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export type LoginFormData = z.infer<typeof loginSchema>
export type MachineFormData = z.infer<typeof machineSchema>
export type ExpenseFormData = z.infer<typeof expenseSchema>
