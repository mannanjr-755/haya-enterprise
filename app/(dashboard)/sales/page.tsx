'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, Pencil, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { DataTable } from '@/components/dashboard/data-table'
import { DeleteItemButton } from '@/components/dashboard/delete-item-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/providers/toast-provider'
import { useMachinery } from '@/components/providers/machinery-provider'
import { calculateSalesProfit } from '@/lib/sales/calculations'
import { formatCurrency, cn } from '@/lib/utils'
import type { SalesRecord } from '@/lib/services/sales-service'

type DialogMode = 'add' | 'edit' | null

export default function SalesPage() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const { machines, refreshMachines } = useMachinery()
  const [sales, setSales] = useState<SalesRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [editingSale, setEditingSale] = useState<SalesRecord | null>(null)
  const [selectedMachineId, setSelectedMachineId] = useState('')
  const [itemName, setItemName] = useState('')
  const [purchaseCost, setPurchaseCost] = useState('')
  const [machineCost, setMachineCost] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [formError, setFormError] = useState('')
  const handledEditParam = useRef(false)

  const fetchSales = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/sales', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load sales')
      setSales(data.sales)
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to load sales', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchSales()
  }, [fetchSales])

  const availableMachines = useMemo(
    () => machines.filter((m) => m.status !== 'SOLD'),
    [machines],
  )

  const applyMachineSelection = (machineId: string) => {
    const machine = machines.find((m) => m.id === machineId)
    if (!machine) return
    setSelectedMachineId(machineId)
    setItemName(machine.name)
    setPurchaseCost(String(machine.purchaseCost))
    setMachineCost(String((machine.operatingCosts ?? 0) + (machine.salesExpenses ?? 0)))
  }

  const openAddDialog = async () => {
    await refreshMachines()
    setEditingSale(null)
    setSelectedMachineId('')
    setItemName('')
    setPurchaseCost('')
    setMachineCost('')
    setSellingPrice('')
    setFormError('')
    setDialogMode('add')
  }

  const openEditDialog = async (sale: SalesRecord) => {
    const latestMachines = await refreshMachines()
    setEditingSale(sale)
    const matched = latestMachines.find((m) => m.name === sale.itemName)
    setSelectedMachineId(matched?.id ?? '')
    setItemName(sale.itemName)
    setPurchaseCost(String(sale.purchaseCost))
    setMachineCost(String(sale.machineCost))
    setSellingPrice(String(sale.sellingPrice))
    setFormError('')
    setDialogMode('edit')
  }

  useEffect(() => {
    const editId = searchParams.get('edit')
    if (!editId || loading || handledEditParam.current) return
    const sale = sales.find((s) => s.id === editId)
    if (!sale) return
    handledEditParam.current = true
    void openEditDialog(sale)
  }, [searchParams, sales, loading])

  const closeDialog = () => {
    setDialogMode(null)
    setEditingSale(null)
    setSelectedMachineId('')
    setFormError('')
  }

  const previewProfit = useMemo(() => {
    const sell = parseFloat(sellingPrice) || 0
    const purchase = parseFloat(purchaseCost) || 0
    const machine = parseFloat(machineCost) || 0
    if (!itemName.trim() && sell === 0) return null
    return calculateSalesProfit(sell, purchase, machine)
  }, [sellingPrice, purchaseCost, machineCost, itemName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMachineId && !itemName.trim()) {
      setFormError('Please select a machine from Machinery Management')
      return
    }
    if (!itemName.trim()) {
      setFormError('Product/Item name is required')
      return
    }

    const payload = {
      itemName: itemName.trim(),
      purchaseCost: parseFloat(purchaseCost) || 0,
      machineCost: parseFloat(machineCost) || 0,
      sellingPrice: parseFloat(sellingPrice) || 0,
    }

    setSubmitting(true)
    setFormError('')

    try {
      if (dialogMode === 'add') {
        const res = await fetch('/api/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Failed to add sale')
        setSales((prev) => [data.sale, ...prev])
        toast('Sale added successfully')
        closeDialog()
      } else if (dialogMode === 'edit' && editingSale) {
        const saleId = editingSale.id
        const res = await fetch(`/api/sales/${saleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Failed to update sale')
        setSales((prev) => prev.map((s) => (s.id === saleId ? data.sale : s)))
        toast('Sale updated successfully')
        closeDialog()
      } else {
        setFormError('Unable to save changes. Please close and reopen the form.')
        return
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong'
      setFormError(message)
      toast(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (sale: SalesRecord) => {
    setDeletingId(sale.id)
    try {
      const res = await fetch(`/api/sales/${sale.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to delete sale')
      setSales((prev) => prev.filter((s) => s.id !== sale.id))
      toast('Sale deleted successfully')
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to delete sale', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const columns = [
    { key: 'itemName', header: 'Product / Item', sortable: true },
    {
      key: 'purchaseCost',
      header: 'Purchase Cost',
      sortable: true,
      render: (s: SalesRecord) => formatCurrency(s.purchaseCost),
    },
    {
      key: 'machineCost',
      header: 'Machine Cost',
      sortable: true,
      render: (s: SalesRecord) => formatCurrency(s.machineCost),
    },
    {
      key: 'sellingPrice',
      header: 'Selling Price',
      sortable: true,
      render: (s: SalesRecord) => formatCurrency(s.sellingPrice),
    },
    {
      key: 'profit',
      header: 'Profit',
      sortable: true,
      render: (s: SalesRecord) => (
        <span className={cn('font-bold', s.profit >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
          {formatCurrency(s.profit)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (s: SalesRecord) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(s)} aria-label={`Edit ${s.itemName}`}>
            <Pencil className="h-4 w-4" />
          </Button>
          <DeleteItemButton
            label={s.itemName}
            loading={deletingId === s.id}
            onDelete={() => handleDelete(s)}
          />
        </div>
      ),
    },
  ]

  const totalProfit = sales.reduce((sum, s) => sum + s.profit, 0)

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        title="Sales"
        description="Track sales, machine costs, and profit per item"
        actions={
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Sales
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Total Sales Records</p><p className="text-2xl font-bold">{sales.length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Total Profit</p><p className={cn('text-2xl font-bold', totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400')}>{formatCurrency(totalProfit)}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Formula</p><p className="text-sm font-medium mt-1">Profit = Selling Price − (Purchase + Machine Cost)</p></CardContent></Card>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading sales...
        </div>
      ) : (
        <DataTable data={sales} columns={columns} searchKey="itemName" searchPlaceholder="Search sales..." emptyMessage="No sales records yet. Click Add Sales to create one." />
      )}

      <Dialog open={dialogMode !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{dialogMode === 'add' ? 'Add Sales Record' : 'Edit Sales Record'}</DialogTitle>
              <DialogDescription>
                Profit is calculated automatically: Selling Price − (Purchase Cost + Machine Cost)
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {formError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</div>
              )}
              <div className="space-y-2">
                <Label htmlFor="itemName">Product / Item Name *</Label>
                {availableMachines.length === 0 ? (
                  <p className="rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground">
                    No machines available. Add a machine in Machinery Management first.
                  </p>
                ) : (
                  <Select
                    value={selectedMachineId}
                    onValueChange={applyMachineSelection}
                  >
                    <SelectTrigger id="itemName">
                      <SelectValue placeholder="Select a machine" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMachines.map((machine) => (
                        <SelectItem key={machine.id} value={machine.id}>
                          {machine.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {itemName && (
                  <p className="text-xs text-muted-foreground">
                    Selected: <span className="font-medium text-foreground">{itemName}</span>
                  </p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="purchaseCost">Purchase Cost (PKR)</Label>
                  <Input id="purchaseCost" type="number" min="0" value={purchaseCost} onChange={(e) => setPurchaseCost(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="machineCost">Machine Cost (PKR)</Label>
                  <Input id="machineCost" type="number" min="0" value={machineCost} onChange={(e) => setMachineCost(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sellingPrice">Selling Price (PKR)</Label>
                  <Input id="sellingPrice" type="number" min="0" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} />
                </div>
              </div>
              {previewProfit !== null && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
                  <span className="text-muted-foreground">Calculated Profit: </span>
                  <span className={cn('font-bold', previewProfit >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                    {formatCurrency(previewProfit)}
                  </span>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog} disabled={submitting}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : dialogMode === 'add' ? 'Add Sales' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
