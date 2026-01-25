import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor() {
    // Load notifications from storage or API
    this.loadNotifications();
  }

  private loadNotifications(): void {
    // Simulated notifications - replace with actual API call
    const notifications: Notification[] = [
      {
        id: '1',
        title: 'Certificate Issued',
        message: 'New certificate has been successfully issued',
        type: 'success',
        timestamp: new Date(Date.now() - 3600000),
        read: false
      },
      {
        id: '2',
        title: 'Verification Request',
        message: 'New verification request received',
        type: 'info',
        timestamp: new Date(Date.now() - 7200000),
        read: false
      }
    ];

    this.notificationsSubject.next(notifications);
    this.updateUnreadCount();
  }

  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };

    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([newNotification, ...current]);
    this.updateUnreadCount();
  }

  markAsRead(id: string): void {
    const notifications = this.notificationsSubject.value.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(notifications);
    this.updateUnreadCount();
  }

  markAllAsRead(): void {
    const notifications = this.notificationsSubject.value.map(n => ({
      ...n,
      read: true
    }));
    this.notificationsSubject.next(notifications);
    this.updateUnreadCount();
  }

  deleteNotification(id: string): void {
    const notifications = this.notificationsSubject.value.filter(n => n.id !== id);
    this.notificationsSubject.next(notifications);
    this.updateUnreadCount();
  }

  private updateUnreadCount(): void {
    const unread = this.notificationsSubject.value.filter(n => !n.read).length;
    this.unreadCountSubject.next(unread);
  }
}