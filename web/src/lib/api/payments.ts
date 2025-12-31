import { Payment } from '../../types/loan';

const API_URL = 'http://localhost:2024/api';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    payment?: T;
}

export const paymentService = {
    addPayment: async (payment: Omit<Payment, 'id' | 'status'>): Promise<Payment> => {
        try {
            const response = await fetch(`${API_URL}/payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    loanId: payment.loanId,
                    paymentDate: payment.paymentDate,
                    amount: payment.amount,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add payment');
            }

            const data: ApiResponse<Payment> = await response.json();
            
            if (!data.success || !data.payment) {
                throw new Error(data.message || 'Failed to add payment');
            }

            return data.payment;
        } catch (error) {
            console.error('Error adding payment:', error);
            throw error;
        }
    },
}; 