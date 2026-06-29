# Setup Guide

1. Install Node.js (Local MongoDB installation is optional; MongoDB Atlas is recommended).
2. Set up MongoDB Atlas (No local installation needed):
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and sign up for a free account.
   - Create a new free cluster (Shared Tier).
   - In the Network Access tab, add your IP address (or `0.0.0.0/0` to allow access from anywhere).
   - In the Database Access tab, create a database user (e.g. `admin`) and set a password (like `pfMsXEgRPz7e8sxb`).
   - Click "Connect", select "Drivers", and copy your connection string.
3. Create a Supabase project and bucket named `kyc-documents`.
4. Copy environment file:

```bash
cp .env.example .env
```

5. Fill MongoDB (`MONGO_URI`), JWT, and Supabase values in `.env`.
   - For `MONGO_URI`, paste your copied connection string and replace `<username>` and `<password>` with your database user credentials. Add `/mutual_fund_kyc` before the `?` query parameters to specify the database name.
6. Install and run:

```bash
npm install
npm run dev
```
