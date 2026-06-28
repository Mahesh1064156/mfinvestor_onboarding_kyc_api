# Frontend Prompts

## React Native Investor Mobile App Prompt

Build a React Native Investor Mobile App for Mutual Fund Investor Onboarding & KYC Platform using React Navigation, Axios, SecureStore/AsyncStorage, React Hook Form, and Yup. Screens: Login, Register, PAN Submission, Document Upload, Onboarding Status, Notifications, Profile. Connect APIs: POST /api/auth/register, POST /api/auth/login, POST /api/kyc/pan, POST /api/kyc/documents, GET /api/kyc/status, GET /api/notifications, PATCH /api/notifications/:id/read. Store JWT securely, attach Authorization header, implement loading states, validation, document upload using multipart/form-data, status badge, logout, and reusable components CustomInput, CustomButton, Loader, StatusBadge.

## React/Next.js Officer/Admin Web Portal Prompt

Build a React/Next.js Operations/Admin Web Portal for Mutual Fund Investor Onboarding & KYC Platform using Axios, Tailwind CSS/Material UI, Context API/Zustand, and protected routes. Roles: OFFICER and ADMIN. Officer screens: Login, Pending Applications, Application Details, Document Preview, Verification Action Form. Admin screens: Login, Dashboard, Applications List, Audit Logs, Reports. APIs: POST /api/auth/login, GET /api/verification/applications, GET /api/verification/applications/:investorId, PATCH /api/verification/applications/:investorId/status, GET /api/admin/dashboard, GET /api/admin/audit-logs. Implement JWT login, role-based redirection, approve/reject/reupload flow, dashboard cards, audit logs, and reusable Sidebar, Navbar, DataTable, StatusBadge, DocumentViewer, ProtectedRoute.
