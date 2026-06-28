import express from 'express';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { User } from '../modules/auth/auth.model';
import { InvestorProfile } from '../modules/investor/investor.model';
import { VerificationRequest } from '../modules/verification/verification.model';
import { KycDocument } from '../modules/kyc/kyc.model';
import { AuditLog } from '../modules/admin/audit.model';
import { getDashboardSummary, getAuditLogs, createAuditLog } from '../modules/admin/admin.service';
import { getApplications, getApplicationDetails } from '../modules/verification/verification.service';
import { upload } from '../common/middleware/upload.middleware';
import { uploadToSupabase } from '../integrations/storage.service';

const router = express.Router();

// =========================================================================
// MOBILE APP COMPATIBILITY ENDPOINTS
// =========================================================================

// 1. POST /api/admin/register
router.post('/admin/register', async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;
    
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const exists = await User.findOne({ $or: [{ email }, { phone: mobile }] });
    if (exists) {
      return res.status(409).json({ error: 'Email or phone already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      phone: mobile,
      password: hashedPassword,
      role: 'INVESTOR',
    });

    await InvestorProfile.create({ userId: user._id, fullName: user.name });
    
    try {
      await createAuditLog({
        actorId: user._id,
        actorRole: user.role,
        action: 'USER_REGISTERED',
        entityType: 'USER',
        entityId: user._id
      });
    } catch (auditErr) {
      console.error('Audit log failed during registration:', auditErr);
    }

    return res.status(201).json({ user_id: user._id });
  } catch (error: any) {
    console.error('Mobile registration error:', error);
    return res.status(500).json({ error: error.message || 'Failed to register user' });
  }
});

// 2. POST /api/kyc/submit
router.post('/kyc/submit', async (req, res) => {
  try {
    const { user_id, pan_number } = req.body;

    if (!user_id || !pan_number) {
      return res.status(400).json({ error: 'user_id and pan_number are required' });
    }

    const profile = await InvestorProfile.findOneAndUpdate(
      { userId: user_id },
      {
        panNumber: pan_number,
        panName: 'INVESTOR',
        dateOfBirth: new Date('1990-01-01'),
        panValidated: true,
        onboardingStatus: 'PAN_SUBMITTED',
      },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ error: 'Investor profile not found' });
    }

    try {
      await createAuditLog({
        actorId: user_id,
        actorRole: 'INVESTOR',
        action: 'PAN_SUBMITTED',
        entityType: 'INVESTOR_PROFILE',
        entityId: profile._id
      });
    } catch (auditErr) {
      console.error('Audit log failed during PAN submission:', auditErr);
    }

    return res.status(200).json({ message: 'PAN details submitted successfully' });
  } catch (error: any) {
    console.error('Mobile PAN submission error:', error);
    return res.status(500).json({ error: error.message || 'Failed to submit PAN verification' });
  }
});

// 3. GET /api/kyc/:userId
router.get('/kyc/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await InvestorProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ error: 'Investor profile not found' });
    }

    const kycStatus = profile.onboardingStatus === 'APPROVED' ? 'VERIFIED' : 
                      profile.onboardingStatus === 'REJECTED' ? 'REJECTED' : 
                      ['DOCUMENT_UPLOADED', 'UNDER_REVIEW', 'PAN_SUBMITTED'].includes(profile.onboardingStatus) ? 'SUBMITTED' : 'PENDING';

    const panStatus = profile.panValidated ? 'VERIFIED' : 'PENDING';

    return res.status(200).json({
      kyc: {
        kyc_status: kycStatus,
        pan_status: panStatus,
      }
    });
  } catch (error: any) {
    console.error('Mobile KYC status error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch KYC details' });
  }
});

// 4. POST /api/kyc/upload-mock (for simulating mobile document uploads to backend)
router.post('/kyc/upload-mock', async (req, res) => {
  try {
    const { user_id, files } = req.body;

    if (!user_id || !files) {
      return res.status(400).json({ error: 'user_id and files are required' });
    }

    // Clean old document records for this user
    await KycDocument.deleteMany({ userId: user_id });

    // Map keys to match schema enum 'AADHAAR_FRONT' | 'AADHAAR_BACK' | 'PAN_CARD' | 'PHOTO'
    const docMapping: Record<string, 'AADHAAR_FRONT' | 'AADHAAR_BACK' | 'PAN_CARD'> = {
      aadhaarFront: 'AADHAAR_FRONT',
      aadhaarBack: 'AADHAAR_BACK',
      panCard: 'PAN_CARD',
    };

    for (const [key, fileName] of Object.entries(files)) {
      const docType = docMapping[key];
      if (docType && fileName) {
        await KycDocument.create({
          userId: user_id,
          documentType: docType,
          fileName: fileName,
          fileUrl: `https://vzrmgorgkslusbkoequm.supabase.co/storage/v1/object/public/kyc-documents/${user_id}/${fileName}`, // mocked supabase URL
          storagePath: `${user_id}/${fileName}`,
          mimeType: 'image/jpeg',
          fileSize: 1024 * 350, // mock size: 350KB
        });
      }
    }

    // Update onboarding status
    await InvestorProfile.findOneAndUpdate(
      { userId: user_id },
      { onboardingStatus: 'DOCUMENT_UPLOADED' }
    );

    // Update VerificationRequest
    await VerificationRequest.findOneAndUpdate(
      { investorId: user_id },
      { status: 'PENDING' },
      { upsert: true }
    );

    try {
      await createAuditLog({
        actorId: user_id,
        actorRole: 'INVESTOR',
        action: 'DOCUMENT_UPLOADED',
        entityType: 'DOCUMENT',
        entityId: user_id
      });
    } catch (auditErr) {
      console.error('Audit log failed during mock document upload:', auditErr);
    }

    return res.status(200).json({ message: 'Documents uploaded successfully' });
  } catch (error: any) {
    console.error('Mock document upload error:', error);
    return res.status(500).json({ error: error.message || 'Failed to upload documents' });
  }
});


// =========================================================================
// WEB APP COMPATIBILITY ENDPOINTS (Admin Portal)
// =========================================================================

// 5. GET /api/dashboard/stats
router.get('/dashboard/stats', async (req, res) => {
  try {
    const summary = await getDashboardSummary();
    return res.json({
      total: summary.totalApplications,
      pending: summary.pending + summary.underReview,
      approved: summary.approved,
      rejected: summary.rejected + summary.reuploadRequired
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch dashboard stats' });
  }
});

// 6. GET /api/applications
router.get('/applications', async (req, res) => {
  try {
    const status = req.query.status as string | undefined;
    const apps = await getApplications(status);
    
    // Map to Application schema: id, name, pan, status, createdAt
    const formatted = apps.map(app => {
      let uiStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' = 'PENDING';
      if (app.status === 'APPROVED') uiStatus = 'VERIFIED';
      else if (app.status === 'REJECTED') uiStatus = 'REJECTED';
      
      return {
        id: app.investorId,
        name: app.name,
        pan: app.panNumber || 'N/A',
        status: uiStatus,
        createdAt: new Date().toISOString().split('T')[0] // default fallback date
      };
    });
    
    return res.json(formatted);
  } catch (error: any) {
    console.error('Fetch applications list error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch applications' });
  }
});

// 7. GET /api/applications/:id
router.get('/applications/:id', async (req, res) => {
  try {
    const details = await getApplicationDetails(req.params.id);
    
    let uiStatus = 'PENDING_VERIFICATION';
    if (details.profile?.onboardingStatus === 'APPROVED') uiStatus = 'APPROVED';
    else if (details.profile?.onboardingStatus === 'REJECTED') uiStatus = 'REJECTED';
    
    return res.json({
      id: details.investor._id,
      name: details.investor.name,
      email: details.investor.email,
      phone: details.investor.phone,
      pan: details.profile?.panNumber || 'N/A',
      panStatus: details.profile?.panValidated ? 'VERIFIED' : 'PENDING',
      submittedAt: new Date((details.profile as any)?.createdAt || Date.now()).toISOString().split('T')[0],
      lastUpdatedAt: new Date((details.profile as any)?.updatedAt || Date.now()).toLocaleDateString(),
      assignedOfficer: 'Officer',
      status: uiStatus,
      documents: details.documents.map(d => ({
        id: d._id,
        type: d.documentType.toLowerCase(),
        fileName: d.fileName,
        fileUrl: d.fileUrl,
        verificationStatus: d.verificationStatus
      }))
    });
  } catch (error: any) {
    console.error('Fetch application details error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch application details' });
  }
});

// 8. POST /api/verify/:id
router.post('/verify/:id', async (req, res) => {
  try {
    const { status, remarks } = req.body;
    
    let dbStatus = 'PENDING';
    if (status === 'APPROVE' || status === 'APPROVED' || status === 'VERIFIED') dbStatus = 'APPROVED';
    else if (status === 'REJECT' || status === 'REJECTED') dbStatus = 'REJECTED';
    else if (status === 'RESUBMIT' || status === 'REUPLOAD_REQUIRED') dbStatus = 'REUPLOAD_REQUIRED';

    const profile = await InvestorProfile.findOneAndUpdate(
      { userId: req.params.id },
      { onboardingStatus: dbStatus },
      { new: true }
    );
    
    await VerificationRequest.findOneAndUpdate(
      { investorId: req.params.id },
      { status: dbStatus, remarks: remarks || '' },
      { new: true, upsert: true }
    );

    // Update individual documents status
    const docStatus = dbStatus === 'APPROVED' ? 'VERIFIED' : dbStatus === 'REJECTED' || dbStatus === 'REUPLOAD_REQUIRED' ? 'REJECTED' : 'PENDING';
    await KycDocument.updateMany({ userId: req.params.id }, { verificationStatus: docStatus });

    try {
      await createAuditLog({
        actorId: req.params.id,
        actorRole: 'ADMIN',
        action: dbStatus === 'APPROVED' ? 'KYC_APPROVED' : dbStatus === 'REJECTED' ? 'KYC_REJECTED' : 'STATUS_UPDATED',
        entityType: 'KYC_APPLICATION',
        entityId: req.params.id,
        oldValue: { status: profile?.onboardingStatus },
        newValue: { status: dbStatus, remarks: remarks }
      });
    } catch (auditErr) {
      console.error('Audit log failed during verification update:', auditErr);
    }

    return res.json({ success: true });
  } catch (error: any) {
    console.error('Verify status update error:', error);
    return res.status(500).json({ error: error.message || 'Failed to update verification status' });
  }
});

// 9. GET /api/audit
router.get('/audit', async (req, res) => {
  try {
    const logs = await getAuditLogs();
    
    const formatted = logs.map(log => ({
      id: log._id,
      investorName: log.actorId ? (log.actorId as any).name : 'System',
      action: log.action,
      time: new Date((log as any).createdAt).toLocaleTimeString() + ' ' + new Date((log as any).createdAt).toLocaleDateString(),
      status: log.action.includes('APPROVED') ? 'VERIFIED' : log.action.includes('REJECTED') ? 'REJECTED' : 'PENDING'
    }));
    
    return res.json(formatted);
  } catch (error: any) {
    console.error('Fetch audit logs error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch audit logs' });
  }
});

// 10. POST /api/kyc/upload (real file upload endpoint from mobile app)
router.post('/kyc/upload', upload.single('file'), async (req: any, res: any) => {
  try {
    const { user_id, documentType } = req.body;
    const file = req.file;

    if (!user_id || !documentType || !file) {
      return res.status(400).json({ error: 'user_id, documentType, and file are required' });
    }

    let fileUrl = '';
    let storagePath = '';

    // 1. Try uploading to Supabase
    try {
      const storageResult = await uploadToSupabase(file, `kyc-documents/${user_id}/${documentType}_${Date.now()}_${file.originalname}`);
      fileUrl = storageResult.fileUrl;
      storagePath = storageResult.storagePath;
    } catch (supabaseErr) {
      console.warn('Supabase upload failed, falling back to local file storage:', supabaseErr);
      
      // 2. Local disk fallback
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
      }
      
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileName = `${user_id}-${documentType}-${Date.now()}-${safeName}`;
      const filePath = path.join(uploadsDir, fileName);
      fs.writeFileSync(filePath, file.buffer);
      
      // Construct dynamic local file URL using current request host
      fileUrl = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;
      storagePath = `uploads/${fileName}`;
    }

    // Clean up any existing document of this type for the user
    await KycDocument.deleteMany({ userId: user_id, documentType });

    // Create a new document in MongoDB
    await KycDocument.create({
      userId: user_id,
      documentType,
      fileName: file.originalname,
      fileUrl,
      storagePath,
      mimeType: file.mimetype,
      fileSize: file.size,
    });

    // Check if both Aadhaar Front and Back are uploaded to transition onboarding status
    const docs = await KycDocument.find({ userId: user_id });
    const hasFront = docs.some(d => d.documentType === 'AADHAAR_FRONT');
    const hasBack = docs.some(d => d.documentType === 'AADHAAR_BACK');

    if (hasFront && hasBack) {
      await InvestorProfile.findOneAndUpdate(
        { userId: user_id },
        { onboardingStatus: 'DOCUMENT_UPLOADED' }
      );

      await VerificationRequest.findOneAndUpdate(
        { investorId: user_id },
        { status: 'PENDING' },
        { upsert: true }
      );

      try {
        await createAuditLog({
          actorId: user_id,
          actorRole: 'INVESTOR',
          action: 'DOCUMENT_UPLOADED',
          entityType: 'DOCUMENT',
          entityId: user_id
        });
      } catch (auditErr) {
        console.error('Audit log failed during document upload:', auditErr);
      }
    }

    return res.status(200).json({ message: 'Document uploaded successfully', fileUrl });
  } catch (error: any) {
    console.error('File upload error:', error);
    return res.status(500).json({ error: error.message || 'Failed to upload file' });
  }
});

export default router;
