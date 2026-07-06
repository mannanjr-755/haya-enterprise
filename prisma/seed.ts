import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { calculateSalesProfit } from '../lib/sales/calculations'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  await prisma.sale.deleteMany()
  await prisma.expenseCategoryConfig.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.machine.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.partner.deleteMany()
  await prisma.partnership.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.bankAccount.deleteMany()
  await prisma.payable.deleteMany()
  await prisma.receivable.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await bcrypt.hash(
    process.env.DEMO_PASSWORD ?? 'hayaenterprise123',
    10,
  )

  const admin = await prisma.user.create({
    data: {
      username: process.env.DEMO_USERNAME ?? 'adminhayaenterprise',
      email: 'admin@hayaenterprises.com',
      password: passwordHash,
      name: 'Admin',
      role: 'ADMIN',
    },
  })

  await prisma.user.createMany({
    data: [
      { username: 'manager_ops', email: 'manager@hayaenterprises.com', password: passwordHash, name: 'Operations Manager', role: 'MANAGER' },
      { username: 'accountant_main', email: 'accounts@hayaenterprises.com', password: passwordHash, name: 'Chief Accountant', role: 'ACCOUNTANT' },
      { username: 'yard_mgr', email: 'yard@hayaenterprises.com', password: passwordHash, name: 'Yard Supervisor', role: 'YARD_MANAGER' },
      { username: 'operator_01', email: 'op1@hayaenterprises.com', password: passwordHash, name: 'Machine Operator', role: 'OPERATOR' },
      { username: 'partner_ahmed', email: 'ahmed@email.com', password: passwordHash, name: 'Ahmed Khan', role: 'PARTNER' },
    ],
  })

  const categories = [
    { key: 'GENERAL', label: 'General Expenses' },
    { key: 'YARD', label: 'Yard Expenses' },
    { key: 'MACHINERY', label: 'Machinery Expenses' },
    { key: 'FUEL', label: 'Fuel Expenses' },
    { key: 'MAINTENANCE', label: 'Maintenance Expenses' },
    { key: 'STAFF_SALARIES', label: 'Staff Salaries' },
    { key: 'TRANSPORTATION', label: 'Transportation' },
    { key: 'SPARE_PARTS', label: 'Spare Parts' },
    { key: 'UTILITIES', label: 'Utilities' },
    { key: 'OTHER', label: 'Other Expenses' },
  ]
  await prisma.expenseCategoryConfig.createMany({ data: categories })

  const m1 = await prisma.machine.create({
    data: {
      name: 'CAT 320 Excavator',
      type: 'Excavator',
      brand: 'Caterpillar',
      model: '320 GC',
      serialNumber: 'CAT320-2021-001',
      registrationNumber: 'REG-EX-4521',
      purchaseDate: new Date('2021-03-15'),
      purchaseCost: 18500000,
      currentValue: 14200000,
      depreciationRate: 12,
      workingHours: 4820,
      status: 'ACTIVE',
      location: 'Site A - Islamabad',
    },
  })

  const m2 = await prisma.machine.create({
    data: {
      name: 'Komatsu D85 Bulldozer',
      type: 'Bulldozer',
      brand: 'Komatsu',
      model: 'D85EX-18',
      serialNumber: 'KOM-D85-2019-002',
      registrationNumber: 'REG-BD-7832',
      purchaseDate: new Date('2019-08-22'),
      purchaseCost: 22000000,
      currentValue: 15800000,
      depreciationRate: 10,
      workingHours: 6100,
      status: 'ACTIVE',
      location: 'Site B - Lahore',
    },
  })

  await prisma.machine.createMany({
    data: [
      {
        name: 'Volvo A40G Dumper',
        type: 'Dumper',
        brand: 'Volvo',
        model: 'A40G',
        serialNumber: 'VOL-A40-2020-003',
        registrationNumber: 'REG-DP-3344',
        purchaseDate: new Date('2020-11-10'),
        purchaseCost: 16800000,
        currentValue: 12100000,
        depreciationRate: 11,
        workingHours: 3950,
        status: 'MAINTENANCE',
        location: 'Main Yard',
      },
      {
        name: 'JCB 3DX Loader',
        type: 'Loader',
        brand: 'JCB',
        model: '3DX Super',
        serialNumber: 'JCB-3DX-2022-004',
        purchaseDate: new Date('2022-06-01'),
        purchaseCost: 8500000,
        currentValue: 7200000,
        depreciationRate: 15,
        workingHours: 2100,
        status: 'IDLE',
        location: 'Main Yard',
      },
      {
        name: 'Hitachi ZX470 Excavator',
        type: 'Excavator',
        brand: 'Hitachi',
        model: 'ZX470H-5G',
        serialNumber: 'HIT-ZX470-2018-005',
        registrationNumber: 'REG-EX-9012',
        purchaseDate: new Date('2018-04-18'),
        purchaseCost: 24500000,
        currentValue: 13200000,
        depreciationRate: 9,
        workingHours: 7800,
        status: 'PARTNERSHIP',
        location: 'Site C - Karachi',
      },
      {
        name: 'SANY SY215 Excavator',
        type: 'Excavator',
        brand: 'SANY',
        model: 'SY215C',
        serialNumber: 'SAN-SY215-2023-006',
        purchaseDate: new Date('2023-01-20'),
        purchaseCost: 12000000,
        currentValue: 10500000,
        depreciationRate: 14,
        workingHours: 980,
        status: 'ACTIVE',
        location: 'Site A - Islamabad',
      },
    ],
  })

  await prisma.sale.createMany({
    data: [
      {
        itemName: 'CAT 320 Excavator',
        purchaseCost: 18500000,
        machineCost: 5200000,
        sellingPrice: 25000000,
        profit: calculateSalesProfit(25000000, 18500000, 5200000),
      },
      {
        itemName: 'Komatsu D85 Bulldozer',
        purchaseCost: 22000000,
        machineCost: 6800000,
        sellingPrice: 31000000,
        profit: calculateSalesProfit(31000000, 22000000, 6800000),
      },
      {
        itemName: 'Hitachi ZX470 Excavator',
        purchaseCost: 24500000,
        machineCost: 8100000,
        sellingPrice: 35000000,
        profit: calculateSalesProfit(35000000, 24500000, 8100000),
      },
    ],
  })

  await prisma.expense.createMany({
    data: [
      { category: 'FUEL', amount: 185000, date: new Date('2026-03-01'), description: 'Diesel refill - Site A fleet', machineId: m1.id },
      { category: 'MAINTENANCE', amount: 420000, date: new Date('2026-03-02'), description: 'Hydraulic pump replacement' },
      { category: 'STAFF_SALARIES', amount: 850000, date: new Date('2026-03-01'), description: 'March operator salaries' },
      { category: 'SPARE_PARTS', amount: 95000, date: new Date('2026-02-28'), description: 'Track pads and filters', machineId: m2.id },
      { category: 'TRANSPORTATION', amount: 65000, date: new Date('2026-02-27'), description: 'Machine relocation to Site B' },
      { category: 'YARD', amount: 45000, date: new Date('2026-02-26'), description: 'Yard fencing repair' },
      { category: 'UTILITIES', amount: 28000, date: new Date('2026-02-25'), description: 'Electricity bill - Main Yard' },
      { category: 'FUEL', amount: 142000, date: new Date('2026-02-24'), description: 'Fuel for Komatsu D85', machineId: m2.id },
    ],
  })

  await prisma.bankAccount.createMany({
    data: [
      { name: 'HBL Business Account', bankName: 'Habib Bank Limited', accountNumber: '****4521', balance: 5200000 },
      { name: 'MCB Operations', bankName: 'MCB Bank', accountNumber: '****7832', balance: 2100000 },
      { name: 'UBL Reserve', bankName: 'United Bank Limited', accountNumber: '****9012', balance: 1200000 },
    ],
  })

  await prisma.transaction.createMany({
    data: [
      { type: 'INCOME', amount: 2500000, date: new Date('2026-03-04'), description: 'Project payment - Site A', category: 'Rental' },
      { type: 'EXPENSE', amount: 185000, date: new Date('2026-03-03'), description: 'Fuel purchase - Main Yard', category: 'Fuel' },
      { type: 'INCOME', amount: 850000, date: new Date('2026-03-02'), description: 'Monthly rental - Komatsu D85', category: 'Rental' },
      { type: 'EXPENSE', amount: 850000, date: new Date('2026-03-01'), description: 'Operator salaries', category: 'Salaries' },
      { type: 'EXPENSE', amount: 95000, date: new Date('2026-02-28'), description: 'Spare parts order', category: 'Spare Parts' },
    ],
  })

  await prisma.payable.createMany({
    data: [
      { vendor: 'Total Parco Fuel', invoice: 'BILL-8821', amount: 185000, dueDate: new Date('2026-03-08'), status: 'Pending' },
      { vendor: 'Auto Parts Ltd', invoice: 'BILL-8799', amount: 95000, dueDate: new Date('2026-03-05'), status: 'Overdue' },
      { vendor: 'Insurance Co.', invoice: 'BILL-8850', amount: 420000, dueDate: new Date('2026-03-18'), status: 'Pending' },
    ],
  })

  await prisma.receivable.createMany({
    data: [
      { client: 'ABC Construction', invoice: 'INV-2026-042', amount: 1200000, dueDate: new Date('2026-03-15'), status: 'Pending' },
      { client: 'Metro Developers', invoice: 'INV-2026-038', amount: 850000, dueDate: new Date('2026-03-10'), status: 'Overdue' },
      { client: 'City Infrastructure', invoice: 'INV-2026-045', amount: 1150000, dueDate: new Date('2026-03-20'), status: 'Pending' },
    ],
  })

  const partnership = await prisma.partnership.create({
    data: {
      name: 'Hitachi ZX470 Partnership',
      machineName: 'Hitachi ZX470 Excavator',
      agreementDate: new Date('2018-04-18'),
      totalInvestment: 24500000,
      totalRevenue: 14200000,
      totalExpenses: 8100000,
      netProfit: 6100000,
      partners: {
        create: [
          {
            name: 'Ahmed Khan',
            ownershipPercentage: 60,
            investmentAmount: 14700000,
            expenseShare: 4860000,
            revenueShare: 8520000,
            netProfit: 3660000,
            outstandingPayment: 0,
          },
          {
            name: 'Haya Enterprises',
            ownershipPercentage: 40,
            investmentAmount: 9800000,
            expenseShare: 3240000,
            revenueShare: 5680000,
            netProfit: 2440000,
            outstandingPayment: 150000,
          },
        ],
      },
    },
  })

  console.log(`Seed complete. Partnership id: ${partnership.id}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
