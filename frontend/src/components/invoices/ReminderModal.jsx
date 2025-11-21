import React, { useEffect, useState } from 'react';
// import api from '../../services/api';
import toast from 'react-hot-toast';
import { API_PATHS } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosInstance';

const ReminderModal = ({ isOpen, onClose, invoice }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (invoice) {
      setMessage(
        `Hello ${invoice.billTo?.clientName || ''},\n\nThis is a friendly reminder about invoice ${invoice.invoiceNumber || ''} for $${(invoice.total || 0).toFixed(2)}.\n\nThanks,\n${invoice.billFrom?.businessName || ''}`
      );
    }
  }, [invoice]);

  if (!isOpen || !invoice) return null;

  const handleSend = async () => {
    setLoading(true);
    try {
      await axiosInstance.post(API_PATHS.INVOICE.SEND_INVOICE_EMAIL(invoice._id), { message });
      toast.success('Email sent via your connected Gmail.');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to send email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded-lg w-[640px] max-w-full">
        <h3 className="text-lg font-medium mb-2">Send Reminder — Invoice {invoice.invoiceNumber}</h3>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full h-36 p-3 border rounded mb-3"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 border rounded">Cancel</button>
          <button onClick={handleSend} className="px-3 py-2 bg-blue-600 text-white rounded" disabled={loading}>
            {loading ? 'Sending...' : 'Send Email'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReminderModal