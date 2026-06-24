import app from "./app";
import dotenv from 'dotenv';
const PORT = process.env.PORT;
app.get("/", (req, res) => {
  res.send("Hi I am mfinvestor_onboarding_kyc_api");
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
