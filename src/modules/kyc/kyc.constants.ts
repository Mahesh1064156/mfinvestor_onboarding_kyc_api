export const PAN_STATUS = {
  PENDING: "PENDING",
  VERIFIED: "VERIFIED",
  REJECTED: "REJECTED",
} as const;

export const KYC_STATUS = {
  SUBMITTED: "SUBMITTED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export const KYC_AUDIT_ACTION = {
  SUBMIT: "SUBMIT_KYC",
  APPROVE: "APPROVE_KYC",
  REJECT: "REJECT_KYC",
} as const;

export const KYC_AUDIT_ENTITY = "KYC";
