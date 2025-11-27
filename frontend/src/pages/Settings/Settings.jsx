// pages/settings/Settings.jsx

import React, { useState, useEffect } from 'react';
import {
    Loader2,
    Save,
    FileText,
    DollarSign,
    Hash,
    Mail,
    Bell,
    Palette,
    CreditCard
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import InputField from '../../components/ui/InputField';
import SelectField from '../../components/ui/SelectField';
import TextareaField from '../../components/ui/TextareaField';

const Settings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('invoice-defaults');
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(API_PATHS.SETTINGS.GET);
            setSettings(response.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axiosInstance.put(API_PATHS.SETTINGS.UPDATE, settings);
            toast.success('Settings saved successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const updateSettings = (section, field, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const tabs = [
        { id: 'invoice-defaults', label: 'Invoice Defaults', icon: FileText },
        { id: 'branding', label: 'Branding', icon: Palette },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'email-templates', label: 'Email Templates', icon: Mail }
    ];

    if (loading) {
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
                    <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                    <p className="text-sm text-slate-600 mt-1">
                        Configure your invoice and receipt defaults
                    </p>
                </div>
                <Button
                    variant="primary"
                    onClick={handleSave}
                    isLoading={saving}
                    icon={Save}
                >
                    Save Changes
                </Button>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-200 bg-slate-50">
                    <nav className="flex space-x-1 px-4">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                                    activeTab === tab.id
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {/* Invoice Defaults Tab */}
                    {activeTab === 'invoice-defaults' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                    Invoice & Receipt Defaults
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SelectField
                                        label="Default Payment Terms"
                                        value={settings.invoiceDefaults.paymentTerms}
                                        onChange={(e) =>
                                            updateSettings('invoiceDefaults', 'paymentTerms', e.target.value)
                                        }
                                        options={['Net 15', 'Net 30', 'Net 60', 'Due on receipt']}
                                    />

                                    <SelectField
                                        label="Default Currency"
                                        value={settings.invoiceDefaults.currency}
                                        onChange={(e) =>
                                            updateSettings('invoiceDefaults', 'currency', e.target.value)
                                        }
                                        options={['NGN', 'USD', 'EUR', 'GBP']}
                                    />
                                </div>
                            </div>

                            {/* Tax Settings */}
                            <div className="pt-6 border-t border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">Tax Settings</h3>
                                
                                <div className="flex items-center mb-4">
                                    <input
                                        type="checkbox"
                                        id="taxEnabled"
                                        checked={settings.invoiceDefaults.taxEnabled}
                                        onChange={(e) =>
                                            updateSettings('invoiceDefaults', 'taxEnabled', e.target.checked)
                                        }
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="taxEnabled" className="ml-2 text-sm text-slate-700">
                                        Enable tax/VAT on invoices
                                    </label>
                                </div>

                                {settings.invoiceDefaults.taxEnabled && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField
                                            label="Default Tax Rate (%)"
                                            type="number"
                                            value={settings.invoiceDefaults.defaultTaxRate}
                                            onChange={(e) =>
                                                updateSettings(
                                                    'invoiceDefaults',
                                                    'defaultTaxRate',
                                                    parseFloat(e.target.value)
                                                )
                                            }
                                            step="0.1"
                                        />

                                        <InputField
                                            label="Tax Label"
                                            type="text"
                                            value={settings.invoiceDefaults.taxLabel}
                                            onChange={(e) =>
                                                updateSettings('invoiceDefaults', 'taxLabel', e.target.value)
                                            }
                                            placeholder="VAT, GST, Sales Tax"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Numbering System */}
                            <div className="pt-6 border-t border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                    Numbering System
                                </h3>

                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-sm font-medium text-slate-700 mb-3">
                                            Invoice Numbering
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InputField
                                                label="Invoice Prefix"
                                                type="text"
                                                value={settings.invoiceDefaults.invoicePrefix}
                                                onChange={(e) =>
                                                    updateSettings('invoiceDefaults', 'invoicePrefix', e.target.value)
                                                }
                                                placeholder="INV"
                                            />

                                            <InputField
                                                label="Starting Number"
                                                type="number"
                                                value={settings.invoiceDefaults.invoiceStartingNumber}
                                                onChange={(e) =>
                                                    updateSettings(
                                                        'invoiceDefaults',
                                                        'invoiceStartingNumber',
                                                        parseInt(e.target.value)
                                                    )
                                                }
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">
                                            Preview: {settings.invoiceDefaults.invoicePrefix}-
                                            {String(settings.invoiceDefaults.invoiceStartingNumber).padStart(3, '0')}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-slate-700 mb-3">
                                            Receipt Numbering
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InputField
                                                label="Receipt Prefix"
                                                type="text"
                                                value={settings.invoiceDefaults.receiptPrefix}
                                                onChange={(e) =>
                                                    updateSettings('invoiceDefaults', 'receiptPrefix', e.target.value)
                                                }
                                                placeholder="RCP"
                                            />

                                            <InputField
                                                label="Starting Number"
                                                type="number"
                                                value={settings.invoiceDefaults.receiptStartingNumber}
                                                onChange={(e) =>
                                                    updateSettings(
                                                        'invoiceDefaults',
                                                        'receiptStartingNumber',
                                                        parseInt(e.target.value)
                                                    )
                                                }
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">
                                            Preview: {settings.invoiceDefaults.receiptPrefix}-
                                            {String(settings.invoiceDefaults.receiptStartingNumber).padStart(4, '0')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Default Notes */}
                            <div className="pt-6 border-t border-slate-200">
                                <TextareaField
                                    label="Default Notes"
                                    value={settings.invoiceDefaults.defaultNotes}
                                    onChange={(e) =>
                                        updateSettings('invoiceDefaults', 'defaultNotes', e.target.value)
                                    }
                                    placeholder="Add default notes that will appear on all invoices..."
                                    rows={4}
                                />
                            </div>
                        </div>
                    )}

                    {/* Branding Tab */}
                    {activeTab === 'branding' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                    Brand Customization
                                </h3>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Primary Brand Color
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="color"
                                                value={settings.branding.primaryColor}
                                                onChange={(e) =>
                                                    updateSettings('branding', 'primaryColor', e.target.value)
                                                }
                                                className="h-12 w-20 rounded border border-slate-300 cursor-pointer"
                                            />
                                            <InputField
                                                type="text"
                                                value={settings.branding.primaryColor}
                                                onChange={(e) =>
                                                    updateSettings('branding', 'primaryColor', e.target.value)
                                                }
                                                placeholder="#1e40af"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">
                                            This color will be used in all your invoices and receipts
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Invoice Color</label>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="color"
                                                    value={settings.branding.invoiceColor || settings.branding.primaryColor}
                                                    onChange={(e) => updateSettings('branding', 'invoiceColor', e.target.value)}
                                                    className="h-10 w-14 rounded border border-slate-300 cursor-pointer"
                                                />
                                                <InputField
                                                    type="text"
                                                    value={settings.branding.invoiceColor || settings.branding.primaryColor}
                                                    onChange={(e) => updateSettings('branding', 'invoiceColor', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Receipt Color</label>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="color"
                                                    value={settings.branding.receiptColor || settings.branding.primaryColor}
                                                    onChange={(e) => updateSettings('branding', 'receiptColor', e.target.value)}
                                                    className="h-10 w-14 rounded border border-slate-300 cursor-pointer"
                                                />
                                                <InputField
                                                    type="text"
                                                    value={settings.branding.receiptColor || settings.branding.primaryColor}
                                                    onChange={(e) => updateSettings('branding', 'receiptColor', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <SelectField
                                        label="Invoice Template"
                                        value={settings.branding.defaultTemplate}
                                        onChange={(e) =>
                                            updateSettings('branding', 'defaultTemplate', e.target.value)
                                        }
                                        options={['classic', 'modern', 'minimal', 'elegant', 'creative', 'corporate']}
                                    />

                                    <SelectField
                                        label="Receipt Template"
                                        value={settings.branding.receiptTemplate || 'classic'}
                                        onChange={(e) =>
                                            updateSettings('branding', 'receiptTemplate', e.target.value)
                                        }
                                        options={['classic', 'modern', 'minimal', 'elegant', 'creative', 'corporate']}
                                    />

                                    {/* Template Preview */}
                                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                                        <p className="text-sm font-medium text-slate-700 mb-3">Preview</p>
                                        <div
                                            className="h-40 rounded border-2"
                                            style={{
                                                borderColor: settings.branding.primaryColor,
                                                background: `linear-gradient(135deg, ${settings.branding.primaryColor}22 0%, ${settings.branding.primaryColor}11 100%)`
                                            }}
                                        >
                                            <div className="p-4">
                                                <div
                                                    className="text-lg font-bold"
                                                    style={{ color: settings.branding.primaryColor }}
                                                >
                                                    INVOICE
                                                </div>
                                                <p className="text-sm text-slate-600 mt-2">
                                                    Template: {settings.branding.defaultTemplate}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                    Notification Preferences
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-900">Email Notifications</p>
                                            <p className="text-sm text-slate-500">
                                                Receive email updates about your account
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.notifications.emailNotifications}
                                                onChange={(e) =>
                                                    updateSettings('notifications', 'emailNotifications', e.target.checked)
                                                }
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-900">Invoice Reminders</p>
                                            <p className="text-sm text-slate-500">
                                                Automatically send reminders for overdue invoices
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.notifications.invoiceReminders}
                                                onChange={(e) =>
                                                    updateSettings('notifications', 'invoiceReminders', e.target.checked)
                                                }
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-900">Payment Received</p>
                                            <p className="text-sm text-slate-500">
                                                Get notified when a payment is received
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.notifications.paymentReceived}
                                                onChange={(e) =>
                                                    updateSettings('notifications', 'paymentReceived', e.target.checked)
                                                }
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-900">Weekly Report</p>
                                            <p className="text-sm text-slate-500">
                                                Receive a weekly summary of your business activity
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.notifications.weeklyReport}
                                                onChange={(e) =>
                                                    updateSettings('notifications', 'weeklyReport', e.target.checked)
                                                }
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Email Templates Tab */}
                    {activeTab === 'email-templates' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                    Email Templates
                                </h3>
                                <p className="text-sm text-slate-500 mb-6">
                                    Customize the email templates sent to your clients. Use variables like{' '}
                                    <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">
                                        {'{'}invoiceNumber{'}'}
                                    </code>
                                    ,{' '}
                                    <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">
                                        {'{'}clientName{'}'}
                                    </code>
                                    ,{' '}
                                    <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">
                                        {'{'}amount{'}'}
                                    </code>
                                </p>

                                <div className="space-y-6">
                                    {/* Invoice Email */}
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-slate-900 mb-3">Invoice Email</h4>
                                        <div className="space-y-4">
                                            <InputField
                                                label="Subject Line"
                                                type="text"
                                                value={settings.emailTemplates.invoiceEmail.subject}
                                                onChange={(e) =>
                                                    setSettings(prev => ({
                                                        ...prev,
                                                        emailTemplates: {
                                                            ...prev.emailTemplates,
                                                            invoiceEmail: {
                                                                ...prev.emailTemplates.invoiceEmail,
                                                                subject: e.target.value
                                                            }
                                                        }
                                                    }))
                                                }
                                            />
                                            <TextareaField
                                                label="Email Body"
                                                value={settings.emailTemplates.invoiceEmail.body}
                                                onChange={(e) =>
                                                    setSettings(prev => ({
                                                        ...prev,
                                                        emailTemplates: {
                                                            ...prev.emailTemplates,
                                                            invoiceEmail: {
                                                                ...prev.emailTemplates.invoiceEmail,
                                                                body: e.target.value
                                                            }
                                                        }
                                                    }))
                                                }
                                                rows={6}
                                            />
                                        </div>
                                    </div>

                                    {/* Reminder Email */}
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-slate-900 mb-3">Reminder Email</h4>
                                        <div className="space-y-4">
                                            <InputField
                                                label="Subject Line"
                                                type="text"
                                                value={settings.emailTemplates.reminderEmail.subject}
                                                onChange={(e) =>
                                                    setSettings(prev => ({
                                                        ...prev,
                                                        emailTemplates: {
                                                            ...prev.emailTemplates,
                                                            reminderEmail: {
                                                                ...prev.emailTemplates.reminderEmail,
                                                                subject: e.target.value
                                                            }
                                                        }
                                                    }))
                                                }
                                            />
                                            <TextareaField
                                                label="Email Body"
                                                value={settings.emailTemplates.reminderEmail.body}
                                                onChange={(e) =>
                                                    setSettings(prev => ({
                                                        ...prev,
                                                        emailTemplates: {
                                                            ...prev.emailTemplates,
                                                            reminderEmail: {
                                                                ...prev.emailTemplates.reminderEmail,
                                                                body: e.target.value
                                                            }
                                                        }
                                                    }))
                                                }
                                                rows={6}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;