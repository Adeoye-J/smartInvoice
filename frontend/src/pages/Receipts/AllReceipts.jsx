// import React, { useEffect, useState, useMemo} from 'react'
// import axiosInstance from '../../utils/axiosInstance'
// import { API_PATHS } from '../../utils/apiPaths'
// import { Loader2, Trash2, Edit, Search, FileText, Plus, AlertCircle, Sparkles, Mail } from 'lucide-react'
// import moment from "moment"
// import { useNavigate } from 'react-router-dom'
// import Button from '../../components/ui/Button'
// import Tooltip from '../../utils/Tooltip'

// const AllReceipts = () => {

//     const [invoices, setInvoices] = useState([])
//     const [loading, setLoading] = useState(true)
//     const [error, setError] = useState(null)
//     const [statusChangeLoading, setStatusChangeLoading] = useState(null)
//     const [searchTerm, setSearchTerm] = useState("")
//     const [statusFilter, setStatusFilter] = useState("All")
//     const [isAiModalOpen, setIsAiModalOpen] = useState(false)
//     const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
//     const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
//     const navigate = useNavigate();

//     useEffect(() => {
//         const fetchInvoices = async () => {
//             try {
//                 const response = await axiosInstance.get(API_PATHS.INVOICE.GET_ALL_INVOICES)
//                 setInvoices(response.data.sort((a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate)))
//             } catch (error) {
//                 setError("Failed to fetch invoices.")
//                 console.error(error)
//             } finally {
//                 setLoading(false)
//             }
//         };

//         fetchInvoices();
//     }, []);

//     const handleDelete = async (id) => {
//         if (window.confirm("Are you sure you want to delete this invoice?")) {
//             try {
//                 await axiosInstance.delete(API_PATHS.INVOICE.DELETE_INVOICE(id))
//                 setInvoices(prevInvoices => prevInvoices.filter(invoice => invoice._id !== id))
//             } catch (error) {
//                 setError("Failed to delete invoice.")
//                 console.error(error)
//             }
//         }
//     };

//     const handleStatusChange = async (invoice) => {
//         setStatusChangeLoading(invoice._id);
//         try {
//             const newStatus = invoice.status === "Paid" ? "Unpaid" : "Paid";
//             const updatedInvoice = { ...invoice, status: newStatus };

//             // await axiosInstance.put(API_PATHS.INVOICE.UPDATE_INVOICE(invoice._id), updatedInvoice);

//             // setInvoices(prevInvoices =>
//             //     prevInvoices.map(inv =>
//             //         inv._id === invoice._id ? { ...inv, status: newStatus } : inv
//             //     )
//             // );

//             // The above code differs from the one below by using the response data to ensure all fields are updated as per backend logic
//             // The above code optimistically updates only the status field, which may lead to inconsistencies if other fields are modified by the backend.
//             // The below code ensures the frontend state matches the backend response entirely.

//             const response = await axiosInstance.put(API_PATHS.INVOICE.UPDATE_INVOICE(invoice._id), updatedInvoice);

//             setInvoices(invoices.map(inv =>
//                     inv._id === invoice._id ? response.data : inv
//                 )
//             );
//         } catch (error) {
//             setError("Failed to update invoice status.");
//             console.error(error);
//         } finally {
//             setStatusChangeLoading(null);
//         }
//     };

//     const handleOpenReminderModal = (invoiceId) => {
//         setSelectedInvoiceId(invoiceId)
//         setIsReminderModalOpen(true)
//     }

//     const filteredInvoices = useMemo(() => {
//         return invoices
//             .filter(invoice => statusFilter === "All" || invoice.status === statusFilter)
//             .filter(invoice =>
//                 invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 invoice.billTo.clientName.toLowerCase().includes(searchTerm.toLowerCase())
//             );
//     }, [invoices, searchTerm, statusFilter]);

//     if (loading) {
//         return (
//             <div className="flex justify-center items-center w-8 h-8 animate-spin text-blue-600">
//                 <Loader2 className='' />
//             </div>
//         )
//     }

//     return (
//         <div className="space-y-6">
//             {/* <ReminderModal isOpen={isReminderModalOpen} onClose={() => setIsReminderModalOpen(false)} invoiceId={selectedInvoiceId} /> */}
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//                 <div className="">
//                     <h1 className="text-2xl font-semibold text-slate-900">All Invoices</h1>
//                     <p className="text-sm text-slate-600 mt-1">Manage all your invoices in one place.</p>
//                 </div>
//                 <div className="flex items-center gap-2">
//                     <Button onClick={() => navigate("/invoices/new")} icon={Plus}>
//                         Create Invoice
//                     </Button>
//                 </div>
//             </div>

//             {
//                 error && (
//                     <div className="p-4 rounded-lg bg-red-50 border border-red-200">
//                         <div className="flex items-start">
//                             <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
//                             <div className="flex-1">
//                                 <h3 className="text-sm font-medium text-red-800 mb-1">Error</h3>
//                                 <p className="text-sm text-red-700">{error}</p>
//                             </div>
//                         </div>
//                     </div>
//                 )
//             }

//             <div className="bg-white border border-slate-200 rounded-lg shadow-sm shadow-gray-100">
//                 <div className="p-4 sm:p-6 border-b border-slate-200">
//                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//                         <div className="relative grow">
//                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                 <Search className="w-5 h-5 text-slate-400" />
//                             </div>
//                             <input 
//                                 type="text" 
//                                 placeholder="Search by invoice number or client name"
//                                 value={searchTerm}
//                                 onChange={(e) => setSearchTerm(e.target.value)}
//                                 className='w-full h-10 pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
//                             />
//                         </div>
//                         <div className="shrink-0">
//                             <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className='w-full sm:w-auto h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500'>
//                                 <option value="All">All Statuses</option>
//                                 <option value="Paid">Paid</option>
//                                 {/* <option value="Pending">Pending</option> */}
//                                 <option value="Unpaid">Unpaid</option>
//                             </select>
//                         </div>
//                     </div>
//                 </div>

//                 {
//                     filteredInvoices.length === 0 ? (
//                         <div className="flex flex-col items-center justify-center py-12 text-center">
//                             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
//                                 <FileText className="w-8 h-8 text-slate-400" />
//                             </div>
//                             <h3 className="text-lg font-medium text-slate-900 mb-2">No invoices yet</h3>
//                             <p className="text-slate-500 mb-6 max-w-md">Your search or filter criteria did not match any invoices.</p>
//                             {
//                                 invoices.length === 0 && (
//                                     <Button onClick={() => navigate("/invoices/new")} icon={Plus}>
//                                         Create First Invoice
//                                     </Button>
//                                 )
//                             }
//                         </div>
//                     ) : (
//                         <div className="w-[90vw] md:w-auto overflow-x-auto">
//                             <table className="w-full min-w-[600px] divide-y divide-slate-200">
//                                 <thead className="bg-slate-50">
//                                     <tr>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Invoice #</th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Client</th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Due Date</th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
//                                         <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="bg-white divide-y divide-slate-200">
//                                     {
//                                         filteredInvoices.map((invoice) => (
//                                             <tr 
//                                                 className="hover:bg-slate-50"
//                                                 key={invoice._id}
//                                             >
//                                                 <td onClick={() => navigate(`/invoices/${invoice._id}`)} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 cursor-pointer">
//                                                     {invoice.invoiceNumber}
//                                                 </td>
//                                                 <td onClick={() => navigate(`/invoices/${invoice._id}`)} className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 cursor-pointer">
//                                                     {invoice.billTo.clientName}
//                                                 </td>
//                                                 <td onClick={() => navigate(`/invoices/${invoice._id}`)} className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 cursor-pointer">
//                                                     ${invoice.total.toFixed(2)}
//                                                 </td>
//                                                 <td onClick={() => navigate(`/invoices/${invoice._id}`)} className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 cursor-pointer">
//                                                     {moment(invoice.dueDate).format("MMM D, YYYY")}
//                                                 </td>
//                                                 <td className="px-6 py-4 whitespace-nowrap text-sm">
//                                                     <span 
//                                                         className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                                                             invoice.status === "Paid"
//                                                             ? "bg-emerald-100 text-emerald-800"
//                                                             : invoice.status === "Pending"
//                                                             ? "bg-amber-100 text-amber-800"
//                                                             : "bg-red-100 text-red-800"
//                                                         }`}
//                                                     >
//                                                         {invoice.status}
//                                                     </span>
//                                                 </td>
//                                                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                                                     <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
//                                                         <Button
//                                                             size='small'
//                                                             variant='secondary'
//                                                             onClick={() => handleStatusChange(invoice)}
//                                                             isLoading={statusChangeLoading === invoice._id}
//                                                         >
//                                                             {invoice.status === "Paid" ? "Mark Unpaid" : "Mark Paid"}
//                                                         </Button>
//                                                         <Tooltip content={"Edit"} placement="top">
//                                                             <Button
//                                                                 size='small'
//                                                                 variant='ghost'
//                                                                 onClick={() => navigate(`/invoices/${invoice._id}`)}
//                                                             >
//                                                                 <Edit className="w-4 h-4" />
//                                                             </Button>
//                                                         </Tooltip>
//                                                         <Tooltip content={"Delete"} placement="top">
//                                                             <Button
//                                                                 size='small'
//                                                                 variant='ghost'
//                                                                 onClick={() => handleDelete(invoice._id)}
//                                                             >
//                                                                 <Trash2 className="w-4 h-4 text-red-500" />
//                                                             </Button>
//                                                         </Tooltip>
//                                                         {
//                                                             invoice.status !== "Paid" && (
//                                                                 <Button
//                                                                     size='small'
//                                                                     variant='ghost'
//                                                                     onClick={() => handleOpenReminderModal(invoice._id)}
//                                                                     title="Generate Payment Reminder"
//                                                                 >
//                                                                     <Mail className="w-4 h-4 text-blue-500" />
//                                                                 </Button>
//                                                             )
//                                                         }
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         ))
//                                     }
//                                 </tbody>
//                             </table>
//                         </div>
//                     )
//                 }
//             </div>
//         </div>
//     )
// }

// export default AllReceipts

// import React, { useEffect, useState, useMemo} from 'react'
// import axiosInstance from '../../utils/axiosInstance'
// import { API_PATHS } from '../../utils/apiPaths'
// import { Loader2, Trash2, Edit, Search, FileText, Plus, AlertCircle, Sparkles, Mail } from 'lucide-react'
// import moment from "moment"
// import { useNavigate } from 'react-router-dom'
// import Button from '../../components/ui/Button'
// import Tooltip from '../../utils/Tooltip'

// const AllReceipts = () => {

//     return (
//         <div className="space-y-6">
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//                 <div className="">
//                     <h1 className="text-2xl font-semibold text-slate-900">All Receipts</h1>
//                     <p className="text-sm text-slate-600 mt-1">Manage all your receipts in one place.</p>
//                 </div>

//                 <div className="flex items-center gap-2">
//                     <Button onClick={() => navigate("/receipts/new")} icon={Plus}>
//                         Create Receipt
//                     </Button>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default AllReceipts



// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Loader2, Receipt, Eye, Download, Trash2 } from 'lucide-react';
// import axiosInstance from '../../utils/axiosInstance';
// import { API_PATHS } from '../../utils/apiPaths';
// import toast from 'react-hot-toast';
// import Button from '../../components/ui/Button';

// const AllReceipts = () => {
//     const navigate = useNavigate();
//     const [receipts, setReceipts] = useState([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [stats, setStats] = useState(null);

//     useEffect(() => {
//         fetchReceipts();
//         fetchStats();
//     }, []);

//     const fetchReceipts = async () => {
//         setIsLoading(true);
//         try {
//             const response = await axiosInstance.get(API_PATHS.RECEIPT.GET_ALL);
//             setReceipts(response.data.receipts);
//         } catch (error) {
//             toast.error('Failed to fetch receipts');
//             console.error(error);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const fetchStats = async () => {
//         try {
//             const response = await axiosInstance.get(API_PATHS.RECEIPT.GET_STATS);
//             setStats(response.data.summary);
//         } catch (error) {
//             console.error('Failed to fetch stats:', error);
//         }
//     };

//     const handleDownload = async (receiptId, receiptNumber) => {
//         try {
//             const res = await axiosInstance.get(API_PATHS.RECEIPT.GENERATE_PDF(receiptId), { 
//                 responseType: 'blob' 
//             });
//             const blob = new Blob([res.data], { type: 'application/pdf' });
//             const url = window.URL.createObjectURL(blob);
//             const a = document.createElement('a');
//             a.href = url;
//             a.download = `receipt-${receiptNumber}.pdf`;
//             a.click();
//             window.URL.revokeObjectURL(url);
//             toast.success('Receipt downloaded!');
//         } catch (error) {
//             toast.error('Failed to download receipt');
//             console.error(error);
//         }
//     };

//     const handleDelete = async (id) => {
//         if (!window.confirm('Are you sure you want to delete this receipt?')) return;

//         try {
//             await axiosInstance.delete(API_PATHS.RECEIPT.DELETE(id));
//             toast.success('Receipt deleted successfully');
//             fetchReceipts();
//             fetchStats();
//         } catch (error) {
//             toast.error('Failed to delete receipt');
//             console.error(error);
//         }
//     };

//     if (isLoading) {
//         return (
//             <div className="flex items-center justify-center h-96">
//                 <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-6">
//             {/* Header */}
//             <div className="flex justify-between items-center">
//                 <h1 className="text-2xl font-bold text-slate-900">Receipts</h1>
//             </div>

//             {/* Stats Cards */}
//             {stats && (
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                     <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm text-slate-500">Total Receipts</p>
//                                 <p className="text-2xl font-bold text-slate-900">{stats.totalReceipts || 0}</p>
//                             </div>
//                             <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
//                                 <Receipt className="w-6 h-6 text-blue-600" />
//                             </div>
//                         </div>
//                     </div>

//                     <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm text-slate-500">Total Amount</p>
//                                 <p className="text-2xl font-bold text-green-600">
//                                     ${(stats.totalAmount || 0).toFixed(2)}
//                                 </p>
//                             </div>
//                             <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
//                                 <Receipt className="w-6 h-6 text-green-600" />
//                             </div>
//                         </div>
//                     </div>

//                     <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm text-slate-500">Average Amount</p>
//                                 <p className="text-2xl font-bold text-slate-900">
//                                     ${(stats.avgAmount || 0).toFixed(2)}
//                                 </p>
//                             </div>
//                             <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
//                                 <Receipt className="w-6 h-6 text-purple-600" />
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Receipts Table */}
//             <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
//                 <div className="overflow-x-auto">
//                     <table className="w-full divide-y divide-slate-200">
//                         <thead className="bg-slate-50">
//                             <tr>
//                                 <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Receipt #</th>
//                                 <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Client</th>
//                                 <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
//                                 <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Payment Method</th>
//                                 <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Amount</th>
//                                 <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-200">
//                             {receipts.length === 0 ? (
//                                 <tr>
//                                     <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
//                                         <Receipt className="w-12 h-12 mx-auto mb-4 text-slate-300" />
//                                         <p className="text-lg font-medium">No receipts found</p>
//                                         <p className="text-sm mt-1">Receipts will appear here once generated</p>
//                                     </td>
//                                 </tr>
//                             ) : (
//                                 receipts.map((receipt) => (
//                                     <tr key={receipt._id} className="hover:bg-slate-50">
//                                         <td className="px-6 py-4 text-sm font-medium text-slate-900">
//                                             {receipt.receiptNumber}
//                                         </td>
//                                         <td className="px-6 py-4 text-sm text-slate-600">
//                                             {receipt.billTo?.clientName || 'N/A'}
//                                         </td>
//                                         <td className="px-6 py-4 text-sm text-slate-600">
//                                             {new Date(receipt.receiptDate).toLocaleDateString()}
//                                         </td>
//                                         <td className="px-6 py-4 text-sm">
//                                             <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
//                                                 {receipt.paymentMethod}
//                                             </span>
//                                         </td>
//                                         <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">
//                                             ${receipt.amountPaid.toFixed(2)}
//                                         </td>
//                                         <td className="px-6 py-4 text-right text-sm space-x-2">
//                                             <button
//                                                 onClick={() => navigate(`/receipts/${receipt._id}`)}
//                                                 className="text-blue-600 hover:text-blue-800"
//                                                 title="View"
//                                             >
//                                                 <Eye className="w-4 h-4 inline" />
//                                             </button>
//                                             <button
//                                                 onClick={() => handleDownload(receipt._id, receipt.receiptNumber)}
//                                                 className="text-green-600 hover:text-green-800"
//                                                 title="Download"
//                                             >
//                                                 <Download className="w-4 h-4 inline" />
//                                             </button>
//                                             <button
//                                                 onClick={() => handleDelete(receipt._id)}
//                                                 className="text-red-600 hover:text-red-800"
//                                                 title="Delete"
//                                             >
//                                                 <Trash2 className="w-4 h-4 inline" />
//                                             </button>
//                                         </td>
//                                     </tr>
//                                 ))
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default AllReceipts;

// pages/receipts/Receipts.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Loader2, 
    Receipt, 
    Eye, 
    Download, 
    Trash2, 
    Search, 
    Filter 
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import moment from 'moment';

const AllReceipts = () => {
    const navigate = useNavigate();
    const [receipts, setReceipts] = useState([]);
    const [filteredReceipts, setFilteredReceipts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('All');

    useEffect(() => {
        fetchReceipts();
        fetchStats();
    }, []);

    useEffect(() => {
        filterReceipts();
    }, [searchTerm, paymentMethodFilter, receipts]);

    const fetchReceipts = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get(API_PATHS.RECEIPT.GET_ALL);
            setReceipts(response.data.receipts);
        } catch (error) {
            toast.error('Failed to fetch receipts');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.RECEIPT.GET_STATS);
            setStats(response.data.summary);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const filterReceipts = () => {
        let filtered = [...receipts];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(
                (receipt) =>
                    receipt.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    receipt.billTo?.clientName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Payment method filter
        if (paymentMethodFilter !== 'All') {
            filtered = filtered.filter((receipt) => receipt.paymentMethod === paymentMethodFilter);
        }

        setFilteredReceipts(filtered);
    };

    const handleDownload = async (receiptId, receiptNumber) => {
        try {
            const res = await axiosInstance.get(API_PATHS.RECEIPT.GENERATE_PDF(receiptId), { 
                responseType: 'blob' 
            });
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `receipt-${receiptNumber}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success('Receipt downloaded!');
        } catch (error) {
            toast.error('Failed to download receipt');
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this receipt?')) return;

        try {
            await axiosInstance.delete(API_PATHS.RECEIPT.DELETE(id));
            toast.success('Receipt deleted successfully');
            fetchReceipts();
            fetchStats();
        } catch (error) {
            toast.error('Failed to delete receipt');
            console.error(error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Receipts</h1>
                    <p className="text-sm text-slate-600 mt-1">View and manage payment receipts</p>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Total Receipts</p>
                                <p className="text-2xl font-bold text-slate-900">{stats.totalReceipts || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Receipt className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Total Amount</p>
                                <p className="text-2xl font-bold text-green-600">
                                    ${(stats.totalAmount || 0).toFixed(2)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <Receipt className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Average Amount</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    ${(stats.avgAmount || 0).toFixed(2)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Receipt className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search and Filter */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by receipt # or client name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Payment Method Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <select
                            value={paymentMethodFilter}
                            onChange={(e) => setPaymentMethodFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                        >
                            <option value="All">All Payment Methods</option>
                            <option value="Cash">Cash</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Credit Card">Credit Card</option>
                            <option value="Debit Card">Debit Card</option>
                            <option value="Check">Check</option>
                            <option value="PayPal">PayPal</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Receipts Table */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Receipt #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Client</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Payment Method</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredReceipts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        <Receipt className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                        <p className="text-lg font-medium">No receipts found</p>
                                        <p className="text-sm mt-1">
                                            {searchTerm || paymentMethodFilter !== 'All'
                                                ? 'Try adjusting your search or filters'
                                                : 'Receipts will appear here once generated'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredReceipts.map((receipt) => (
                                    <tr key={receipt._id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                            {receipt.receiptNumber}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {receipt.billTo?.clientName || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {moment(receipt.receiptDate).format('MMM D, YYYY')}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                                {receipt.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">
                                            ${receipt.amountPaid.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm space-x-2">
                                            <button
                                                onClick={() => navigate(`/receipts/${receipt._id}`)}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="View"
                                            >
                                                <Eye className="w-4 h-4 inline" />
                                            </button>
                                            <button
                                                onClick={() => handleDownload(receipt._id, receipt.receiptNumber)}
                                                className="text-green-600 hover:text-green-800"
                                                title="Download"
                                            >
                                                <Download className="w-4 h-4 inline" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(receipt._id)}
                                                className="text-red-600 hover:text-red-800"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AllReceipts;