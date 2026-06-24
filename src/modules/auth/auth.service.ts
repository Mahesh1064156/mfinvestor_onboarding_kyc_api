import client from "../../config/supabase"
export const registerUserService = async (data: any) => {
  const { name, email,mobile,password, role_id } = data;

  const result = await client.query(
    "SELECT register_user($1, $2, $3, $4,$5)",
    [name, email,mobile, password, role_id]
  );

  return result.rows[0].register_user;
};