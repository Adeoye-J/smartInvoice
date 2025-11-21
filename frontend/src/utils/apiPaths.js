export const BASE_URL = "http://localhost:8000";

export const API_PATHS = {
    AUTH: {
        REGISTER: "/api/auth/register", // SignUp
        LOGIN: "/api/auth/login", // Authenticate user & return JWT token
        GET_PROFILE: "/api/auth/me", // Get logged-in user details
        UPDATE_PROFILE: "/api/auth/me", // Update profile details (PUT)
        CONNECT_GMAIL : "/api/auth/google/url", // Get Google OAuth URL
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

    // AI: {
    //     PARSE_INVOICE_TEXT: `/api/ai/parse-text`,
    //     GENERATE_REMINDER: `/api/ai/generate-reminder`,
    //     GET_DASHBOARD_SUMMARY: `/api/ai/dashboard-summary`
    // }
}