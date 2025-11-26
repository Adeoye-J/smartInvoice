export const BASE_URL = "http://localhost:8000";

export const API_PATHS = {
    AUTH: {
        REGISTER: "/api/auth/register", // SignUp
        LOGIN: "/api/auth/login", // Authenticate user & return JWT token
        GET_PROFILE: "/api/auth/me", // Get logged-in user details
        UPDATE_PROFILE: "/api/auth/me", // Update profile details (PUT)
        CONNECT_GMAIL : "/api/auth/google/url", // Get Google OAuth URL,
        UPLOAD_PROFILE_PICTURE: "/api/auth/upload-profile-picture", // Upload profile picture
        UPLOAD_BUSINESS_LOGO: "/api/auth/upload-business-logo", // Upload business logo
    },

    INVOICE: {
        CREATE: "/api/invoices",
        GET_ALL_INVOICES: "/api/invoices",
        GET_INVOICE_BY_ID: (id) => `/api/invoices/${id}`,
        UPDATE_INVOICE: (id) => `/api/invoices/${id}`,
        DELETE_INVOICE: (id) => `/api/invoices/${id}`,
        SEND_INVOICE_EMAIL: (id) => `/api/invoices/${id}/send-email`,
        GENERATE_PDF: (id) => `/api/invoices/${id}/generate-pdf`,
    },

    RECEIPT: {
        GENERATE: (invoiceId) => `/api/receipts/invoice/${invoiceId}/generate`,
        GET_ALL: "/api/receipts",
        GET_BY_ID: (id) => `/api/receipts/${id}`,
        GET_BY_INVOICE: (invoiceId) => `/api/receipts/invoice/${invoiceId}`,
        UPDATE: (id) => `/api/receipts/${id}`,
        DELETE: (id) => `/api/receipts/${id}`,
        GENERATE_PDF: (id) => `/api/receipts/${id}/generate-pdf`,
        GET_STATS: "/api/receipts/stats/summary",
    }
}