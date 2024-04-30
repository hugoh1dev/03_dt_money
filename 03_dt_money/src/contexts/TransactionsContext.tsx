import { ReactNode, useEffect, useState, useCallback } from "react";
import { createContext } from "use-context-selector";
import { api } from "../lib/axios";

interface Transaction {
    id: number;
    description: string;
    type: 'income' | 'outcome';
    price: number;
    category: string;
    createdAt: string;
}

interface CreateTransactionInput {
    description: string;
    type: 'income' | 'outcome';
    price: number;
    category: string;
}

interface TransactionContextType {
    transactions: Transaction[];
    fetchTransactions: (query?: string) => Promise<void>;
    createTransaction: (data: CreateTransactionInput) => Promise<void>;
}

interface TransactionsProviderProps {
    children: ReactNode;
}

export const TransactionsContext = createContext({} as TransactionContextType);

export function TransactionsProvider({ children }: TransactionsProviderProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([])

    const fetchTransactions = useCallback(async (query?: string ) => {
        const response = await api.get('transactions', {
            params: {
                _sort: 'createdAt',
                _order: 'desc',
                q: query,
            },  
        })

        setTransactions(response.data)
    },
    [])

    const createTransaction = useCallback(
        async (data: CreateTransactionInput) => {
            const { description, type, category, price } = data;

            const response = await api.post('transactions', {
                description,
                type,
                category,
                price,
                createdAt: new Date(),
            })

            setTransactions((state) => [response.data, ...state]);
        },
        [],
    )

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions])

    return (
        <TransactionsContext.Provider 
            value={{
                transactions,
                fetchTransactions,
                createTransaction
            }}
        >
            {children}
        </TransactionsContext.Provider>
    )
}