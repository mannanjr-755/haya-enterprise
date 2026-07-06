import type { NavItem } from '@/types'

export const NAV_ITEMS: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  {
    title: 'Expenses',
    href: '/expenses',
    icon: 'Receipt',
    permission: 'expenses.view',
    children: [
      { title: 'All Expenses', href: '/expenses' },
      { title: 'Categories', href: '/expenses/categories' },
      { title: 'Monthly Reports', href: '/expenses/reports' },
    ],
  },
  {
    title: 'Machinery',
    href: '/machinery',
    icon: 'Truck',
    permission: 'machinery.view',
    children: [
      { title: 'All Machines', href: '/machinery' },
      { title: 'Add Machine', href: '/machinery/new' },
    ],
  },
  { title: 'Machine Costs', href: '/machine-costs', icon: 'Calculator', permission: 'machine-costs.view' },
  { title: 'Machine Profit', href: '/machine-profit', icon: 'TrendingUp', permission: 'machine-profit.view' },
  { title: 'Sales', href: '/sales', icon: 'ShoppingCart', permission: 'sales.view' },
  { title: 'Partnerships', href: '/partnerships', icon: 'Handshake', permission: 'partnerships.view' },
  {
    title: 'Financial',
    href: '/financial',
    icon: 'Landmark',
    permission: 'financial.view',
    children: [
      { title: 'Overview', href: '/financial' },
      { title: 'Transactions', href: '/financial/transactions' },
      { title: 'Bank Accounts', href: '/financial/bank-accounts' },
      { title: 'Receivables', href: '/financial/receivables' },
      { title: 'Payables', href: '/financial/payables' },
    ],
  },
  { title: 'Reports', href: '/reports', icon: 'FileText', permission: 'reports.view' },
  { title: 'Analytics', href: '/analytics', icon: 'BarChart3', permission: 'analytics.view' },
  { title: 'Notifications', href: '/notifications', icon: 'Bell', permission: 'notifications.view' },
  { title: 'Users & Roles', href: '/users', icon: 'Users', permission: 'users.view' },
]

export const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  IDLE: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  MAINTENANCE: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
  PARTNERSHIP: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  RETIRED: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  SOLD: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400',
}
