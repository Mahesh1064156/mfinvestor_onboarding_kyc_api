import { Notification } from './notification.model';

export const createNotification = async (payload: any) => Notification.create(payload);
export const getNotificationsByUser = async (userId: string) => Notification.find({ userId }).sort({ createdAt: -1 });
export const markNotificationRead = async (id: string, userId: string) => Notification.findOneAndUpdate({ _id: id, userId }, { isRead: true }, { new: true });
