# Mutual Fund Investor Onboarding & KYC Platform - Backend

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Base URL: `http://localhost:5000/api`

## Main Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/investor/profile`
- `POST /api/kyc/pan`
- `POST /api/kyc/documents`
- `GET /api/kyc/status`
- `GET /api/verification/applications?status=PENDING`
- `GET /api/verification/applications/:investorId`
- `PATCH /api/verification/applications/:investorId/status`
- `GET /api/admin/dashboard`
- `GET /api/admin/audit-logs`
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`

See `docs/api-documentation.md`, `docs/setup-guide.md`, and `docs/frontend-prompts.md`.
