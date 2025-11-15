import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    console.log('Handling notification in foreground:', notification.request.identifier);
    return {
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

export class NotificationService {
  // Request notification permissions
  static async requestPermissions(): Promise<boolean> {
    try {
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.log('Failed to get push token for push notification!');
          return false;
        }

        return true;
      } else {
        console.log('Must use physical device for Push Notifications');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  // Get push notification token
  static async getExpoPushToken(): Promise<string | null> {
    try {
      if (Device.isDevice) {
        const token = (await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        })).data;
        console.log('Expo Push Token:', token);
        return token;
      } else {
        console.log('Must use physical device for Push Notifications');
        return null;
      }
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  // Schedule a local notification for medication reminder
  static async scheduleMedicationReminder({
    medicationName,
    dose,
    time,
    date,
    prescriptionId,
    scheduleId,
  }: {
    medicationName: string;
    dose: string;
    time: string;
    date: string;
    prescriptionId: string;
    scheduleId: string;
  }): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('No notification permission granted');
        return null;
      }

      // Parse the date and time
      const [hours, minutes] = time.split(':').map(Number);
      console.log('Scheduling notification for:', { medicationName, time, date, hours, minutes });
      
      const notificationDate = new Date(date);
      notificationDate.setHours(hours, minutes, 0, 0);

      const now = new Date();
      const timeDifferenceMs = notificationDate.getTime() - now.getTime();
      const timeDifferenceSeconds = Math.floor(timeDifferenceMs / 1000);

      console.log('Time calculation:', {
        now: now.toISOString(),
        notificationDate: notificationDate.toISOString(),
        timeDifferenceMs,
        timeDifferenceSeconds,
      });

      // Only schedule if the time is in the future (at least 30 seconds from now to avoid immediate firing)
      if (timeDifferenceSeconds <= 30) {
        console.log('Skipping notification - time is in the past or too close to current time:', {
          notificationDate: notificationDate.toISOString(),
          now: now.toISOString(),
          timeDifferenceSeconds,
          reason: timeDifferenceSeconds <= 0 ? 'Past time' : 'Too close to current time (less than 30 seconds)'
        });
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '💊 Medication Reminder',
          body: `Time to take ${medicationName} (${dose})`,
          sound: true,
          data: {
            prescriptionId,
            scheduleId,
            date,
            medicationName,
            dose,
            time,
          },
        },
        trigger: { 
          seconds: timeDifferenceSeconds
        } as Notifications.TimeIntervalTriggerInput,
      });

      console.log(`Scheduled notification ${notificationId} for ${medicationName} at ${time} on ${date}`);
      console.log(`Notification will fire in ${timeDifferenceSeconds} seconds (${Math.floor(timeDifferenceSeconds / 60)} minutes)`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  // Schedule multiple notifications for a prescription
  static async scheduleMultipleMedicationReminders({
    medicationName,
    dose,
    frequency,
    startDate,
    endDate,
    prescriptionId,
  }: {
    medicationName: string;
    dose: string;
    frequency: { time: string; number_of_tablets: number; id?: string }[];
    startDate: string;
    endDate: string;
    prescriptionId: string;
  }): Promise<string[]> {
    const notificationIds: string[] = [];

    try {
      console.log('Scheduling multiple notifications for:', {
        medicationName,
        startDate,
        endDate,
        frequency: frequency.length,
        currentTime: new Date().toISOString()
      });

      const start = new Date(startDate);
      const end = new Date(endDate);

      console.log('startDate', start, 'endDate', end)

      // Loop through each day in the treatment period
      for (let currentDate = new Date(start); currentDate <= end; currentDate.setDate(currentDate.getDate() + 1)) {
        const dateString = currentDate.toISOString().split('T')[0];

        // Schedule notification for each frequency slot
        for (const slot of frequency) {
          if (slot.number_of_tablets > 0) {
            console.log('Attempting to schedule for date:', dateString, 'time:', slot.time);
            
            const notificationId = await this.scheduleMedicationReminder({
              medicationName,
              dose: `${dose} (${slot.number_of_tablets} tablet${slot.number_of_tablets > 1 ? 's' : ''})`,
              time: slot.time,
              date: dateString,
              prescriptionId,
              scheduleId: slot.id || `${prescriptionId}-${slot.time}`,
            });

            if (notificationId) {
              notificationIds.push(notificationId);
              console.log('Successfully scheduled notification:', notificationId, 'for', dateString, slot.time);
            } else {
              console.log('Failed to schedule notification for', dateString, slot.time);
            }
          }
        }
      }

      console.log(`Scheduled ${notificationIds.length} notifications for ${medicationName}`);
      return notificationIds;
    } catch (error) {
      console.error('Error scheduling multiple notifications:', error);
      return notificationIds;
    }
  }

  // Cancel a specific notification
  static async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log(`Cancelled notification: ${notificationId}`);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  // Cancel all notifications for a prescription
  static async cancelPrescriptionNotifications(prescriptionId: string): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      for (const notification of scheduledNotifications) {
        if (notification.content.data?.prescriptionId === prescriptionId) {
          await this.cancelNotification(notification.identifier);
        }
      }

      console.log(`Cancelled all notifications for prescription: ${prescriptionId}`);
    } catch (error) {
      console.error('Error cancelling prescription notifications:', error);
    }
  }

  // Cancel all scheduled notifications
  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('Cancelled all scheduled notifications');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  // Get all scheduled notifications with detailed info
  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log(`Found ${notifications.length} scheduled notifications:`);
      
      // Log details of each scheduled notification
      notifications.forEach((notification, index) => {
        const trigger = notification.trigger as any;
        console.log(`Notification ${index + 1}:`, {
          id: notification.identifier,
          title: notification.content.title,
          body: notification.content.body,
          data: notification.content.data,
          trigger: trigger,
          triggerType: trigger.type || 'unknown'
        });
      });
      
      return notifications;
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Debug method to check notification timing
  static async debugScheduledNotifications(): Promise<void> {
    try {
      const notifications = await this.getScheduledNotifications();
      const now = new Date();
      
      console.log('Current time:', now.toISOString());
      console.log('Scheduled notifications analysis:');
      
      notifications.forEach((notification, index) => {
        const trigger = notification.trigger as any;
        if (trigger.seconds) {
          const triggerTime = new Date(now.getTime() + (trigger.seconds * 1000));
          console.log(`Notification ${index + 1} will trigger at:`, triggerTime.toISOString());
        }
      });
    } catch (error) {
      console.error('Error debugging scheduled notifications:', error);
    }
  }

  // Set up notification listeners
  static setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationResponse?: (response: Notifications.NotificationResponse) => void
  ) {
    // Listener for when notification is received while app is in foreground
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      onNotificationReceived?.(notification);
    });

    // Listener for when user taps on notification
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      onNotificationResponse?.(response);
    });

    return {
      notificationListener,
      responseListener,
    };
  }

  // Test method to schedule a simple future notification
  static async scheduleTestNotification(delaySeconds: number = 120): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('No notification permission for test');
        return null;
      }

      const now = new Date();
      const futureTime = new Date(now.getTime() + delaySeconds * 1000);
      
      console.log('Test notification scheduling:', {
        now: now.toISOString(),
        futureTime: futureTime.toISOString(),
        delaySeconds
      });

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧪 Test Notification',
          body: `This is a test notification scheduled for ${delaySeconds} seconds`,
          sound: true,
          data: {
            test: true,
            scheduledAt: now.toISOString(),
            scheduledFor: futureTime.toISOString()
          },
        },
        trigger: { 
          seconds: delaySeconds
        } as Notifications.TimeIntervalTriggerInput,
      });

      console.log(`Test notification scheduled: ${notificationId}, will fire in ${delaySeconds} seconds`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling test notification:', error);
      return null;
    }
  }

  // Clean up notification listeners
  static cleanupListeners(listeners: {
    notificationListener?: Notifications.Subscription;
    responseListener?: Notifications.Subscription;
  }) {
    listeners.notificationListener?.remove();
    listeners.responseListener?.remove();
  }

  // Cancel any notifications that are scheduled for immediate firing (less than 10 seconds)
  static async cancelImmediateNotifications(): Promise<void> {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      let cancelledCount = 0;

      for (const notification of notifications) {
        const trigger = notification.trigger as any;
        // Only cancel if it's scheduled for less than 10 seconds (likely immediate)
        if (trigger.seconds && trigger.seconds < 10) {
          await this.cancelNotification(notification.identifier);
          cancelledCount++;
          console.log('Cancelled immediate notification:', notification.identifier, `(${trigger.seconds} seconds)`);
        }
      }

      if (cancelledCount > 0) {
        console.log(`Cancelled ${cancelledCount} immediate notifications`);
      } else {
        console.log('No immediate notifications found to cancel');
      }
    } catch (error) {
      console.error('Error cancelling immediate notifications:', error);
    }
  }
}