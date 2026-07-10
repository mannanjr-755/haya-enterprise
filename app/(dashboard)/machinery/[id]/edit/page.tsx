'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { machineSchema, type MachineFormData } from '@/lib/validations/schemas'
import { useMachinery } from '@/components/providers/machinery-provider'
import { PageHeader } from '@/components/dashboard/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/providers/toast-provider'
import type { Machine } from '@/types'

function toFormValues(machine: Machine): MachineFormData {
  return {
    name: machine.name,
    type: machine.type,
    brand: machine.brand,
    model: machine.model,
    serialNumber: machine.serialNumber,
    registrationNumber: machine.registrationNumber ?? '',
    purchaseDate: machine.purchaseDate,
    purchaseCost: machine.purchaseCost,
    currentValue: machine.currentValue,
    depreciationRate: machine.depreciationRate,
    workingHours: machine.workingHours,
    status: machine.status === 'SOLD' ? 'RETIRED' : machine.status,
    location: machine.location ?? '',
  }
}

export default function EditMachinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const { getMachine, updateMachine, loading: machinesLoading } = useMachinery()
  const [machine, setMachine] = useState<Machine | null | undefined>(undefined)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MachineFormData>({
    resolver: zodResolver(machineSchema),
  })

  useEffect(() => {
    const fromContext = getMachine(id)
    if (fromContext) {
      setMachine(fromContext)
      return
    }

    if (machinesLoading) return

    let cancelled = false
    fetch(`/api/machines/${id}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setMachine(data.machine ?? null)
      })
      .catch(() => {
        if (!cancelled) setMachine(null)
      })

    return () => {
      cancelled = true
    }
  }, [id, getMachine, machinesLoading])

  useEffect(() => {
    if (machine) reset(toFormValues(machine))
  }, [machine, reset])

  if (machine === undefined || (machinesLoading && !machine)) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading machine...
      </div>
    )
  }

  if (!machine) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Machine not found</p>
        <Button className="mt-4" variant="outline" onClick={() => router.push('/machinery')}>
          Back to Machinery
        </Button>
      </div>
    )
  }

  const onSubmit = async (data: MachineFormData) => {
    try {
      await updateMachine(id, data)
      toast('Machine updated successfully')
      router.push(`/machinery/${id}`)
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to update machine', 'error')
    }
  }

  const onInvalid = () => {
    toast('Please fix the highlighted fields before saving', 'error')
  }

  const fields: { name: keyof MachineFormData; label: string; type?: string }[] = [
    { name: 'name', label: 'Machine Name' },
    { name: 'type', label: 'Machine Type' },
    { name: 'brand', label: 'Brand' },
    { name: 'model', label: 'Model' },
    { name: 'serialNumber', label: 'Serial Number' },
    { name: 'registrationNumber', label: 'Registration Number' },
    { name: 'purchaseDate', label: 'Purchase Date', type: 'date' },
    { name: 'purchaseCost', label: 'Purchase Cost', type: 'number' },
    { name: 'currentValue', label: 'Current Value', type: 'number' },
    { name: 'depreciationRate', label: 'Depreciation Rate (%)', type: 'number' },
    { name: 'workingHours', label: 'Working Hours', type: 'number' },
    { name: 'location', label: 'Location' },
  ]

  const isSold = machine.status === 'SOLD'

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader title="Edit Machine" description={`Update details for ${machine.name}`} />
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="grid gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.name} className="space-y-2">
                <Label htmlFor={f.name}>{f.label}</Label>
                <Input id={f.name} type={f.type ?? 'text'} {...register(f.name)} />
                {errors[f.name] && <p className="text-xs text-destructive">{errors[f.name]?.message}</p>}
              </div>
            ))}
            <div className="space-y-2">
              <Label>Status</Label>
              {isSold ? (
                <Input value="SOLD" disabled />
              ) : (
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                      <SelectContent>
                        {['ACTIVE', 'IDLE', 'MAINTENANCE', 'PARTNERSHIP', 'RETIRED'].map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
              {errors.status && <p className="text-xs text-destructive">{errors.status.message}</p>}
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push(`/machinery/${id}`)}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
