import React, { useState, useEffect } from 'react'
import { Loader2, Mail, Copy, Check } from 'lucide-react'
import Button from '../ui/Button'
import TextareaField from '../ui/TextareaField'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import toast from 'react-hot-toast'

const ReminderModal = ({isOpen, onClose}) => {

    const [reminderText, setReminderText] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [hasCopied, setHasCopied] = useState(false)

    useEffect(() => {
        if (isOpen && invoiceId) {
            const generateReminder = async () => {
                setIsLoading(true)
                setReminderText("")

                try {
                    const response = await axiosInstance.post(API_PATHS.INVOICE.GENERATE_REMINDER, )
                } catch (error) {
                    
                }
            }
        }
    })

    return (
        <div>ReminderModal</div>
    )
}

export default ReminderModal