import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAuditLog extends Document {
  actorId?: Types.ObjectId;
  actorRole?: string;
  action: string;
  entityType: string;
  entityId?: Types.ObjectId;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
  userAgent?: string;
}

const auditLogSchema = new Schema<IAuditLog>({
  actorId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  actorRole: String,
  action: { type: String, required: true, index: true },
  entityType: { type: String, required: true },
  entityId: Schema.Types.ObjectId,
  oldValue: Schema.Types.Mixed,
  newValue: Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
}, { timestamps: true });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
