import { NextResponse } from 'next/server'
import { expenseService } from '@/lib/services/expense-service'
import { expenseSchema } from '@/lib/validations/schemas'
import { getDbErrorMessage } from '@/lib/db/errors'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = expenseSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid data' }, { status: 400 })
    }
    const expense = await expenseService.update(id, parsed.data)
    return NextResponse.json({ expense })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update expense'
    return NextResponse.json(
      { error: message === 'Expense not found' ? message : getDbErrorMessage(error) },
      { status: message === 'Expense not found' ? 404 : 400 },
    )
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await expenseService.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete expense'
    return NextResponse.json({ error: message }, { status: message === 'Expense not found' ? 404 : 400 })
  }
}
