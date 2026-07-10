'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Download, Pencil } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { DataTable } from '@/components/dashboard/data-table'
import { DeleteItemButton } from '@/components/dashboard/delete-item-button'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useMachinery } from '@/components/providers/machinery-provider'
import { useToast } from '@/components/providers/toast-provider'
import { STATUS_COLORS } from '@/lib/constants/navigation'
import { formatCurrency, cn } from '@/lib/utils'
import { exportToExcel } from '@/lib/export'
import type { Machine } from '@/types'

export default function MachineryPage() {
  const { machines, deleteMachine } = useMachinery()
  const { toast } = useToast()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (machine: Machine) => {
    setDeletingId(machine.id)
    try {
      await deleteMachine(machine.id)
      toast('Machine deleted')
    } catch {
      toast('Failed to delete machine', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Machine',
      sortable: true,
      render: (item: Machine) => (
        <Link href={`/machinery/${item.id}`} className="font-medium text-primary hover:underline">
          {item.name}
        </Link>
      ),
    },
    { key: 'type', header: 'Type', sortable: true },
    { key: 'brand', header: 'Brand', sortable: true },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item: Machine) => (
        <Badge className={cn('border-0', STATUS_COLORS[item.status])}>{item.status}</Badge>
      ),
    },
    { key: 'location', header: 'Location', sortable: true },
    {
      key: 'currentValue',
      header: 'Value',
      sortable: true,
      render: (item: Machine) =>
        item.status === 'SOLD' ? (
          <span className="text-muted-foreground">Sold</span>
        ) : (
          formatCurrency(item.currentValue)
        ),
    },
    {
      key: 'saleProfit',
      header: 'Profit',
      sortable: true,
      render: (item: Machine) =>
        item.saleProfit != null ? (
          <span className={item.saleProfit >= 0 ? 'font-medium text-emerald-400' : 'font-medium text-rose-400'}>
            {formatCurrency(item.saleProfit)}
          </span>
        ) : (
          '—'
        ),
    },
    {
      key: 'actions',
      header: '',
      render: (item: Machine) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href={`/machinery/${item.id}/edit`} aria-label={`Edit ${item.name}`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <DeleteItemButton
            label={item.name}
            loading={deletingId === item.id}
            onDelete={() => handleDelete(item)}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        title="Machinery Management"
        description="Manage earth-moving equipment fleet"
        actions={
          <>
            <Button variant="outline" onClick={() => exportToExcel(machines, 'machinery-fleet')}>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Link href="/machinery/new">
              <Button><Plus className="mr-2 h-4 w-4" /> Add Machine</Button>
            </Link>
          </>
        }
      />
      <DataTable data={machines} columns={columns} searchKey="name" searchPlaceholder="Search machines..." />
    </div>
  )
}
