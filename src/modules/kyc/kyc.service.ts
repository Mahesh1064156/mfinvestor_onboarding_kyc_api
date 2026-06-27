
import client from "../../config/supabase";
import { isValidPan, normalizePan } from "../../common/utils/panValidator";
import {
  KYC_AUDIT_ACTION,
  KYC_AUDIT_ENTITY,
  KYC_STATUS,
  PAN_STATUS,
} from "./kyc.constants";
import { SubmitKycRequest } from "./kyc.model";

const validateInvestorUser = async (userId: number) => {
  const result = await client.query(
    `SELECT u.user_id, r.role_type
     FROM mf_users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.user_id = $1`,
    [userId],
  );

  const user = result.rows[0];

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role_type?.toLowerCase() !== "investor") {
    throw new Error("Only investor users can submit KYC");
  }
};

export const submitKycService = async (data: SubmitKycRequest) => {
  const { user_id, pan_number } = data;

  if (!user_id || !pan_number) {
    throw new Error("User ID and PAN number are required");
  }

  if (!isValidPan(pan_number)) {
    throw new Error("Invalid PAN number");
  }

  const normalizedPan = normalizePan(pan_number);

  await client.query("BEGIN");

  try {
    await validateInvestorUser(user_id);

    const existingKyc = await client.query(
      "SELECT id FROM kyc_details WHERE user_id = $1",
      [user_id],
    );

    let result;

    if (existingKyc.rows.length > 0) {
      result = await client.query(
        `UPDATE kyc_details
         SET pan_number = $1,
             pan_status = $2,
             kyc_status = $3,
             submitted_at = NOW(),
             verified_at = NULL
         WHERE user_id = $4
         RETURNING *`,
        [normalizedPan, PAN_STATUS.PENDING, KYC_STATUS.SUBMITTED, user_id],
      );
    } else {
      result = await client.query(
        `INSERT INTO kyc_details (
           user_id,
           pan_number,
           pan_status,
           kyc_status,
           submitted_at
         )
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING *`,
        [user_id, normalizedPan, PAN_STATUS.PENDING, KYC_STATUS.SUBMITTED],
      );
    }

    await client.query(
      "INSERT INTO audit_logs(user_id, action, entity) VALUES ($1, $2, $3)",
      [user_id, KYC_AUDIT_ACTION.SUBMIT, KYC_AUDIT_ENTITY],
    );

    await client.query("COMMIT");

    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
};

export const getKycByUserService = async (userId: number) => {
  const result = await client.query(
    "SELECT * FROM kyc_applications WHERE user_id = $1",
    [userId],
  );

  return result.rows[0];
};
