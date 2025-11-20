import React, {useState, useEffect, useRef} from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import { Loader2, Edit, Printer, AlertCircle, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import CreateInvoice from './CreateInvoice'
import Button from '../../components/ui/Button'
import ReminderModal from '../../components/invoices/ReminderModal'

const InvoiceDetail = () => {

    const {id} = useParams()
    const navigate = useNavigate()
    const [invoice, setInvoice] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [isEditMode, setIsEditMode] = useState(false)
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false) 
    const invoiceRef = useRef()

    useEffect(() => {
        const fetchInvoice = async () => {
            setIsLoading(true)
            try {
                const response = await axiosInstance.get(API_PATHS.INVOICE.GET_INVOICE_BY_ID(id))
                setInvoice(response.data)
            } catch (error) {
                toast.error("Failed to fetch invoice details.")
                setError("Failed to fetch invoice details.")
                console.error(error)
            }
            setIsLoading(false)
        }

        fetchInvoice()
    }, [id])

    const handleUpdate = async (updatedData) => {
        try {
            const response = await axiosInstance.put(API_PATHS.INVOICE.UPDATE_INVOICE(id), updatedData)
            setInvoice(response.data)
            setIsEditMode(false)
            toast.success("Invoice updated successfully.")
        } catch (error) {
            toast.error("Failed to update invoice.")
            console.error(error)
        }
    }

    const handlePrint = () => {
        if (printRef.current) {
            const printContents = printRef.current.innerHTML;
            const originalContents = document.body.innerHTML;
            document.body.innerHTML = printContents;
            window.print();
            document.body.innerHTML = originalContents;
            window.location.reload();
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        )
    }

    if (!invoice) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-lg">
                <div className="w-16 h-16 flex items-center justify-center mb-4 bg-red-100 rounded-full">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">Invoice not found.</h3>
                <p className="text-slate-500 mb-6 max-w-md">The invoice you are looking for does not exist or could not be found.</p>
                <Button onClick={() => navigate("/invoices")}>Back to All Invoices</Button>
            </div>
        )
    }

    if (isEditMode) {
        return (
            <CreateInvoice 
                existingInvoice={invoice}
                onCancel={() => setIsEditMode(false)}
                onSave={handleUpdate}
            />
        )
    }

    return (
        <>
            {/* <ReminderModal 
                isOpen={isReminderModalOpen}
                onClose={() => setIsReminderModalOpen(false)}
            /> */}

            {/* <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-sm" ref={printRef}>
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Invoice Details</h1>
                    <div className="space-x-3">
                        <Button 
                            variant="secondary" 
                            size="medium"
                            onClick={() => setIsReminderModalOpen(true)}
                            icon={Mail}
                        >
                            Send Reminder
                        </Button>
                        <Button
                            variant="primary"
                            size="medium"
                            onClick={() => setIsEditMode(true)}
                            icon={Edit}
                        >
                            Edit Invoice
                        </Button>
                        <Button
                            variant="ghost"
                            size="medium"
                            onClick={handlePrint}
                            icon={Printer}
                        >
                            Print Invoice
                        </Button>
                    </div>
                </div>
                <div>
                    <pre>{JSON.stringify(invoice, null, 2)}</pre>
                </div>
            </div> */}

            <div className="flex flex-col md:flex-row items-start sm:items-center justify-between mb-6 print:hidden">
                <h1 className="text-2xl font-semibold text-slate-900 mb-4 sm:mb-0">
                    <span className='text-slate-500'>{invoice.invoiceNumber}</span>
                </h1>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    {
                        invoice.status !== "Paid" && (
                            <Button
                                variant="secondary"
                                size="medium"
                                onClick={() => setIsReminderModalOpen(true)}
                                icon={Mail}
                            >
                                Send Reminder
                            </Button>
                        )
                    }
                    <Button 
                        variant="secondary"
                        size="medium"
                        onClick={() => setIsEditMode(true)}
                        icon={Edit}
                    >
                        Edit Invoice
                    </Button>
                    <Button
                        variant="primary"
                        size="medium"
                        onClick={handlePrint}
                        icon={Printer}
                    >
                        Print/Download Invoice
                    </Button>
                </div>
            </div>

            <div id='invoice-content-wrapper'>
                <div ref={invoiceRef} id='invoice-preview' className="bg-white p-6 sm:p-8 md:p-12 rounded-lg shadow-md border border-slate-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start pb-8 border-b border-slate-200 mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900">INVOICE</h2>
                            <p className="text-sm text-slate-500 mt-2"># {invoice.invoiceNumber}</p>
                        </div>
                        <div className="text-left sm:text-right mt-4 sm:mt-0 space-y-1">
                            <p className="text-sm text-slate-500">Status</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                invoice.status === "Paid" ? "bg-emerald-100 text-emerald-800" :
                                invoice.status === "Pending" ? "bg-amber-100 text-amber-800" :
                                "bg-red-100 text-red-800"
                            }`}>
                                {invoice.status}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Bill From</h3>
                            <p className="font-semibold text-slate-800">{invoice.billFrom.businessName}</p>
                            <p className="text-slate-600">{invoice.billFrom.address}</p>
                            <p className="text-slate-600">{invoice.billFrom.email}</p>
                            <p className="text-slate-600">{invoice.billFrom.phone}</p>
                        </div>

                        <div className="sm:text-right">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Bill To</h3>
                            <p className="font-semibold text-slate-800">{invoice.billTo.clientName}</p>
                            <p className="text-slate-600">{invoice.billTo.address}</p>
                            <p className="text-slate-600">{invoice.billTo.email}</p>
                            <p className="text-slate-600">{invoice.billTo.phone}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 justify-between gap-8 mt-8 mb-12">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Invoice Date</h3>
                            <p className="font-medium text-slate-600">{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                        </div>
                        <div className='sm:text-center'>
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Due Date</h3>
                            <p className="font-medium text-slate-600">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                        </div>
                        <div className="sm:text-right">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Payment Terms</h3>
                            <p className="font-medium text-slate-600">{invoice.paymentTerms}</p>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Item</th>
                                    <th className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Qty</th>
                                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {
                                    invoice.items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-4 sm:px-6 py-4 text-sm font-medium text-slate-900">{item.name}</td>
                                            <td className="px-4 sm:px-6 py-4 text-center text-sm font-medium text-slate-900">{item.quantity}</td>
                                            <td className="px-4 sm:px-6 py-4 text-right text-sm font-medium text-slate-900">{item.unitPrice.toFixed(2)}</td>
                                            <td className="px-4 sm:px-6 py-4 text-right text-sm font-medium text-slate-900">{item.total.toFixed(2)}</td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end mt-8">
                        <div className="w-full max-w-sm space-y-3">
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>SubTotal</span>
                                <span>${invoice.subTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Tax</span>
                                <span>${invoice.taxTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-semibold text-slate-900 border-t border-slate-200 pt-3 mt-3">
                                <span>Total</span>
                                <span>${invoice.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {
                        invoice.notes && (
                            <div className="mt-8 pt-8 border-t border-slate-200">
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Notes</h3>
                                <p className="text-sm text-slate-600">{invoice.notes}</p>
                            </div>
                        )
                    }
                </div>
            </div>
        </>
    )
}

export default InvoiceDetail