'use client'

import { PageHeader } from '@/components/dashboard/page-header'
import {
  RevenueExpensesChart, ProfitTrendChart, ExpenseBreakdownChart,
  UtilizationChart, PartnershipChart, CashFlowChart,
} from '@/components/dashboard/charts'
import {
  mockMonthlyCashFlow, mockExpenseBreakdown, mockMachineUtilization,
  mockPartnerships,
} from '@/lib/data/mock-data'

export default function AnalyticsPage() {
  const partnership = mockPartnerships[0]

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Interactive charts and business intelligence" />

      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueExpensesChart data={mockMonthlyCashFlow} />
        <ProfitTrendChart data={mockMonthlyCashFlow} />
        <CashFlowChart data={mockMonthlyCashFlow} />
        <ExpenseBreakdownChart data={mockExpenseBreakdown} />
        <UtilizationChart data={mockMachineUtilization} />
        <PartnershipChart data={partnership.partners.map((p) => ({ name: p.name, value: p.netProfit }))} />
      </div>
    </div>
  )
}
