import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Customer,
  DailySummaryData,
  Expense,
  Payment,
  PaymentMethod,
  PaymentStatus,
  Sale,
  SpendType,
} from '@/src/types';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const STORAGE_KEYS = {
  SALES: 'libreta_sales_store',
  PAYMENTS: 'libreta_payments_store',
  CUSTOMERS: 'libreta_customers_store',
  EXPENSES: 'libreta_expenses_store',
};

// Initial default seed data for immediate testing and pilot demonstration
const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    business_id: 'biz-default',
    name: 'Mama Bisi',
    phone: '0802 345 6789',
    notes: 'Provision wholesaler customer. Settles weekly.',
    total_purchases: 65000,
    total_paid: 50000,
    outstanding_balance: 15000,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cust-2',
    business_id: 'biz-default',
    name: 'Ibrahim Carpenter',
    phone: '0813 987 6543',
    notes: 'Hardware & nails buyer in the market.',
    total_purchases: 25000,
    total_paid: 18500,
    outstanding_balance: 6500,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cust-3',
    business_id: 'biz-default',
    name: 'Sister Grace',
    phone: '0803 777 8899',
    notes: 'Fashion fabrics regular buyer.',
    total_purchases: 92000,
    total_paid: 92000,
    outstanding_balance: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cust-4',
    business_id: 'biz-default',
    name: 'Uncle Jude',
    phone: '0905 111 2233',
    notes: 'Neighbor at Shop 14.',
    total_purchases: 54000,
    total_paid: 42000,
    outstanding_balance: 12000,
    created_at: new Date().toISOString(),
  },
];

const INITIAL_SALES: Sale[] = [
  {
    id: 'sale-1',
    business_id: 'biz-default',
    customer_id: 'cust-1',
    customer_name: 'Mama Bisi',
    total_amount: 45000,
    amount_paid: 30000,
    status: 'part_paid',
    date: new Date().toISOString(),
    note: '2 Bags of Rice (50kg)',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sale-2',
    business_id: 'biz-default',
    customer_name: 'Walk-in Cash Customer',
    total_amount: 14000,
    amount_paid: 14000,
    status: 'paid',
    date: new Date().toISOString(),
    note: 'Cooking Oil (5L) + 2 Salt',
    created_at: new Date().toISOString(),
  },
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    business_id: 'biz-default',
    category: 'Generator Fuel',
    spend_type: 'running_cost',
    amount: 8500,
    method: 'cash',
    date: new Date().toISOString(),
    note: '10L Petrol for shop generator',
    created_at: new Date().toISOString(),
  },
];

interface TransactionContextType {
  customers: Customer[];
  sales: Sale[];
  payments: Payment[];
  expenses: Expense[];
  summary: DailySummaryData;
  totalDebtOwed: number;
  addSale: (data: {
    customerId?: string;
    customerName?: string;
    itemName?: string;
    quantity?: number;
    unitPrice: number;
    amountPaid?: number;
    paymentMethod?: PaymentMethod;
    note?: string;
  }) => { success: boolean; error?: string };
  addDebt: (data: {
    customerId?: string;
    newCustomerName?: string;
    customerPhone?: string;
    amount: number;
    note?: string;
  }) => { success: boolean; error?: string };
  recordPayment: (data: {
    customerId: string;
    amount: number;
    method: PaymentMethod;
    note?: string;
  }) => { success: boolean; error?: string };
  addExpense: (data: {
    category: string;
    spendType: SpendType;
    amount: number;
    method: PaymentMethod;
    note?: string;
  }) => { success: boolean; error?: string };
  addCustomer: (data: {
    name: string;
    phone?: string;
    notes?: string;
  }) => Customer;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

async function saveStore(key: string, data: any) {
  const json = JSON.stringify(data);
  if (Platform.OS === 'web') {
    try { localStorage.setItem(key, json); } catch {}
  } else {
    await SecureStore.setItemAsync(key, json);
  }
}

async function loadStore(key: string, fallback: any) {
  if (Platform.OS === 'web') {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  } else {
    const data = await SecureStore.getItemAsync(key);
    return data ? JSON.parse(data) : fallback;
  }
}

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);

  // Load from persistent local storage
  useEffect(() => {
    async function loadAll() {
      const c = await loadStore(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
      const s = await loadStore(STORAGE_KEYS.SALES, INITIAL_SALES);
      const p = await loadStore(STORAGE_KEYS.PAYMENTS, []);
      const e = await loadStore(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
      setCustomers(c);
      setSales(s);
      setPayments(p);
      setExpenses(e);
    }
    loadAll();
  }, []);

  const persistCustomers = (newC: Customer[]) => {
    setCustomers(newC);
    saveStore(STORAGE_KEYS.CUSTOMERS, newC);
  };

  const persistSales = (newS: Sale[]) => {
    setSales(newS);
    saveStore(STORAGE_KEYS.SALES, newS);
  };

  const persistPayments = (newP: Payment[]) => {
    setPayments(newP);
    saveStore(STORAGE_KEYS.PAYMENTS, newP);
  };

  const persistExpenses = (newE: Expense[]) => {
    setExpenses(newE);
    saveStore(STORAGE_KEYS.EXPENSES, newE);
  };

  // Add Customer helper
  const addCustomer = (data: { name: string; phone?: string; notes?: string }): Customer => {
    const newCust: Customer = {
      id: 'cust-' + Math.random().toString(36).substring(2, 9),
      business_id: 'biz-current',
      name: data.name.trim(),
      phone: data.phone?.trim() || '',
      notes: data.notes?.trim() || '',
      total_purchases: 0,
      total_paid: 0,
      outstanding_balance: 0,
      created_at: new Date().toISOString(),
    };
    persistCustomers([newCust, ...customers]);
    return newCust;
  };

  // PRD §8.4: Record Sale
  const addSale = (data: {
    customerId?: string;
    customerName?: string;
    itemName?: string;
    quantity?: number;
    unitPrice: number;
    amountPaid?: number;
    paymentMethod?: PaymentMethod;
    note?: string;
  }): { success: boolean; error?: string } => {
    const qty = data.quantity && data.quantity > 0 ? data.quantity : 1;
    const totalAmount = qty * data.unitPrice;
    if (totalAmount <= 0) {
      return { success: false, error: 'Sale total must be greater than zero' };
    }
    const paid = data.amountPaid !== undefined ? data.amountPaid : totalAmount;
    if (paid < 0 || paid > totalAmount) {
      return { success: false, error: 'Amount paid cannot exceed sale total' };
    }

    const method = data.paymentMethod || 'cash';
    const resolvedItem = data.itemName?.trim() || 'General Sale';

    // Derive status automatically (PRD §8.4)
    let status: PaymentStatus = 'paid';
    if (paid === 0) {
      status = 'unpaid';
    } else if (paid < totalAmount) {
      status = 'part_paid';
    }

    const unpaidPortion = totalAmount - paid;

    // Customer validation: If credit/unpaid, require a customer identity
    let custId = data.customerId;
    let custName = data.customerName;

    if (unpaidPortion > 0 && !custId && !custName) {
      return { success: false, error: 'A customer name is required for credit / unpaid sales' };
    }

    // Default to Walk-in Cash Customer if no customer specified
    if (!custName) {
      custName = 'Walk-in Cash Customer';
    }

    const newSale: Sale = {
      id: 'sale-' + Math.random().toString(36).substring(2, 9),
      business_id: 'biz-current',
      customer_id: custId,
      customer_name: custName,
      total_amount: totalAmount,
      amount_paid: paid,
      status,
      date: new Date().toISOString(),
      note: `${qty}x ${resolvedItem}${data.note ? ' - ' + data.note : ''}`,
      created_at: new Date().toISOString(),
    };

    persistSales([newSale, ...sales]);

    // Update customer balances if associated
    if (custId) {
      const updatedCustomers = customers.map((c) => {
        if (c.id === custId) {
          return {
            ...c,
            total_purchases: (c.total_purchases || 0) + totalAmount,
            total_paid: (c.total_paid || 0) + paid,
            outstanding_balance: (c.outstanding_balance || 0) + unpaidPortion,
          };
        }
        return c;
      });
      persistCustomers(updatedCustomers);
    }

    return { success: true };
  };

  // PRD §8.16: Debt-Only Mode ("Just track who owes me")
  const addDebt = (data: {
    customerId?: string;
    newCustomerName?: string;
    customerPhone?: string;
    amount: number;
    note?: string;
  }): { success: boolean; error?: string } => {
    if (data.amount <= 0) {
      return { success: false, error: 'Debt amount must be greater than zero' };
    }

    let targetCustomerId = data.customerId;
    let targetCustomerName = '';

    if (!targetCustomerId) {
      if (!data.newCustomerName?.trim()) {
        return { success: false, error: 'Please enter a customer name' };
      }
      const newCust = addCustomer({
        name: data.newCustomerName,
        phone: data.customerPhone,
        notes: data.note,
      });
      targetCustomerId = newCust.id;
      targetCustomerName = newCust.name;
    } else {
      const existing = customers.find((c) => c.id === targetCustomerId);
      targetCustomerName = existing?.name || 'Customer';
    }

    // Write into the same Sale data model as an unpaid transaction (PRD §8.16)
    const newDebtSale: Sale = {
      id: 'debt-' + Math.random().toString(36).substring(2, 9),
      business_id: 'biz-current',
      customer_id: targetCustomerId,
      customer_name: targetCustomerName,
      total_amount: data.amount,
      amount_paid: 0,
      status: 'unpaid',
      date: new Date().toISOString(),
      note: data.note || 'Unpaid goods credit',
      created_at: new Date().toISOString(),
    };

    persistSales([newDebtSale, ...sales]);

    // Update customer debt balance
    const updated = customers.map((c) => {
      if (c.id === targetCustomerId) {
        return {
          ...c,
          total_purchases: (c.total_purchases || 0) + data.amount,
          outstanding_balance: (c.outstanding_balance || 0) + data.amount,
        };
      }
      return c;
    });
    persistCustomers(updated);

    return { success: true };
  };

  // PRD §8.7: Record Payment against Customer Debt
  const recordPayment = (data: {
    customerId: string;
    amount: number;
    method: PaymentMethod;
    note?: string;
  }): { success: boolean; error?: string } => {
    const customer = customers.find((c) => c.id === data.customerId);
    if (!customer) {
      return { success: false, error: 'Customer not found' };
    }

    const currentBalance = customer.outstanding_balance || 0;
    if (data.amount <= 0) {
      return { success: false, error: 'Payment amount must be greater than zero' };
    }

    // Business rule: payment must NOT exceed outstanding balance (PRD §8.7)
    if (data.amount > currentBalance) {
      return {
        success: false,
        error: `Payment cannot exceed customer's outstanding balance of ₦${currentBalance.toLocaleString('en-NG')}`,
      };
    }

    const newPayment: Payment = {
      id: 'pay-' + Math.random().toString(36).substring(2, 9),
      business_id: 'biz-current',
      customer_id: data.customerId,
      customer_name: customer.name,
      amount: data.amount,
      method: data.method,
      date: new Date().toISOString(),
      note: data.note || 'Debt payment',
      created_at: new Date().toISOString(),
    };

    persistPayments([newPayment, ...payments]);

    // Deduct from customer's debt balance
    const updatedCustomers = customers.map((c) => {
      if (c.id === data.customerId) {
        return {
          ...c,
          total_paid: (c.total_paid || 0) + data.amount,
          outstanding_balance: Math.max(0, (c.outstanding_balance || 0) - data.amount),
        };
      }
      return c;
    });
    persistCustomers(updatedCustomers);

    return { success: true };
  };

  // PRD §8.9: Record Expense
  const addExpense = (data: {
    category: string;
    spendType: SpendType;
    amount: number;
    method: PaymentMethod;
    note?: string;
  }): { success: boolean; error?: string } => {
    if (data.amount <= 0) {
      return { success: false, error: 'Expense amount must be greater than zero' };
    }

    const newExpense: Expense = {
      id: 'exp-' + Math.random().toString(36).substring(2, 9),
      business_id: 'biz-current',
      category: data.category,
      spend_type: data.spendType,
      amount: data.amount,
      method: data.method,
      date: new Date().toISOString(),
      note: data.note,
      created_at: new Date().toISOString(),
    };

    persistExpenses([newExpense, ...expenses]);
    return { success: true };
  };

  // Compute Daily Summary (PRD §8.10)
  const totalSalesAmount = sales.reduce((acc, s) => acc + s.total_amount, 0);
  const totalCashFromSales = sales.reduce((acc, s) => acc + s.amount_paid, 0);
  const totalDebtPayments = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalCashCollected = totalCashFromSales + totalDebtPayments;

  const totalNewCredit = sales.reduce((acc, s) => acc + (s.total_amount - s.amount_paid), 0);
  const totalExpensesAmount = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netMovement = totalCashCollected - totalExpensesAmount;

  const customersOwing = customers.filter((c) => (c.outstanding_balance || 0) > 0);
  const totalDebtOwed = customers.reduce((acc, c) => acc + (c.outstanding_balance || 0), 0);

  const summary: DailySummaryData = {
    sales: totalSalesAmount,
    collected: totalCashCollected,
    new_credit: totalNewCredit,
    expenses: totalExpensesAmount,
    net_movement: netMovement,
    customers_owing_count: customersOwing.length,
  };

  return (
    <TransactionContext.Provider
      value={{
        customers,
        sales,
        payments,
        expenses,
        summary,
        totalDebtOwed,
        addSale,
        addDebt,
        recordPayment,
        addExpense,
        addCustomer,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
