// components/receipts/GenerateReceiptModal.jsx

import React, { useState } from 'react';
import { X, Loader2, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';
import TextareaField from '../ui/TextareaField';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import toast from 'react-hot-toast';

const GenerateReceiptModal = ({ isOpen, onClose, invoice, onSuccess }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [formData, setFormData] = useState({
        paymentMethod: 'Bank Transfer',
        transactionId: '',
        paymentDate: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        setIsGenerating(true);

        try {
            const response = await axiosInstance.post(
                API_PATHS.RECEIPT.GENERATE(invoice._id),
                formData
            );
            toast.success('Receipt generated successfully!');
            onSuccess(response.data.receipt);
            onClose();
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to generate receipt';
            toast.error(message);
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Backdrop */}
                {/* <div 
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    onClick={onClose}
                /> */}

                {/* Modal */}
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    {/* Header */}
                    <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Generate Receipt</h3>
                                <p className="text-sm text-gray-500">Invoice #{invoice?.invoiceNumber}</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleGenerate}>
                        <div className="bg-white px-6 py-4 space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    <strong>Amount Paid:</strong> ${invoice?.total?.toFixed(2)}
                                </p>
                            </div>

                            <SelectField
                                label="Payment Method"
                                name="paymentMethod"
                                value={formData.paymentMethod}
                                onChange={handleChange}
                                options={['Cash', 'Bank Transfer', 'Credit Card', 'Debit Card', 'Check', 'PayPal', 'Other']}
                                required
                            />

                            <InputField
                                label="Transaction ID / Reference"
                                name="transactionId"
                                type="text"
                                value={formData.transactionId}
                                onChange={handleChange}
                                placeholder="Optional transaction reference"
                            />

                            <InputField
                                label="Payment Date"
                                name="paymentDate"
                                type="date"
                                value={formData.paymentDate}
                                onChange={handleChange}
                                required
                            />

                            <TextareaField
                                label="Notes (Optional)"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Add any additional notes..."
                            />
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                                disabled={isGenerating}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={isGenerating}
                                disabled={isGenerating}
                            >
                                {isGenerating ? 'Generating...' : 'Generate Receipt'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default GenerateReceiptModal;