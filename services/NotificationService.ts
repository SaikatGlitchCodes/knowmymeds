import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
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
      console.log('hours, minutes', hours, minutes);
      const notificationDate = new Date(date);
      notificationDate.setHours(hours, minutes, 0, 0);

      // Only schedule if the time is in the future
      if (notificationDate <= new Date()) {
        console.log('Cannot schedule notification for past time');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '💊 Medication Reminder',
          body: `Time to take ${medicationName} (${dose}mg)`,
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
          seconds: Math.max(1, Math.floor((notificationDate.getTime() - Date.now()) / 1000))
        } as Notifications.TimeIntervalTriggerInput,
      });

      console.log(`Scheduled notification ${notificationId} for ${medicationName} at ${time} on ${date}`);
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
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Loop through each day in the treatment period
      for (let currentDate = new Date(start); currentDate <= end; currentDate.setDate(currentDate.getDate() + 1)) {
        const dateString = currentDate.toISOString().split('T')[0];

        // Schedule notification for each frequency slot
        for (const slot of frequency) {
          if (slot.number_of_tablets > 0) {
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

  // Get all scheduled notifications
  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log(`Found ${notifications.length} scheduled notifications`);
      return notifications;
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
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

  // Clean up notification listeners
  static cleanupListeners(listeners: {
    notificationListener?: Notifications.Subscription;
    responseListener?: Notifications.Subscription;
  }) {
    listeners.notificationListener?.remove();
    listeners.responseListener?.remove();
  }
}