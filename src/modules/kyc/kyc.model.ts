
export interface SubmitKycRequest {
  user_id: number;
  pan_number: string;
}

export interface KycDetails {
  id: number;
  user_id: number;
  pan_number: string;
  pan_status: string;
  kyc_status: string;
  submitted_at: Date | null;
  verified_at: Date | null;
  created_at: Date;
}


