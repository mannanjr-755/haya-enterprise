export const REPORT_TYPES = [
  'Machine Profit Report',
  'Expense Report',
  'Partnership Report',
  'Maintenance Report',
] as const

export type ReportType = (typeof REPORT_TYPES)[number]
