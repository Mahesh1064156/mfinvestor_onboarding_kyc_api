# API Documentation

## Auth

### Register
`POST /api/auth/register`

```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "9876543210",
  "password": "Password@123"
}
```

### Login
`POST /api/auth/login`

```json
{
  "email": "rahul@example.com",
  "password": "Password@123"
}
```

## KYC

Use header: `Authorization: Bearer <token>`

### Submit PAN
`POST /api/kyc/pan`

```json
{
  "panNumber": "ABCDE1234F",
  "panName": "Rahul Sharma",
  "dateOfBirth": "1998-04-12"
}
```

### Upload Document
`POST /api/kyc/documents`

Form data:
- `documentType`: `AADHAAR_FRONT`
- `file`: selected jpg/png/pdf

### Status
`GET /api/kyc/status`

## Verification

Officer/Admin token required.

- `GET /api/verification/applications?status=PENDING`
- `GET /api/verification/applications/:investorId`
- `PATCH /api/verification/applications/:investorId/status`

```json
{
  "status": "APPROVED",
  "remarks": "KYC verified successfully"
}
```

## Admin

Admin token required.

- `GET /api/admin/dashboard`
- `GET /api/admin/audit-logs`

## Notifications

Investor token required.

- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`
