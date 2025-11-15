import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { NotificationService } from '../services/NotificationService';

export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [lastNotification, setLastNotification] = useState<Notifications.Notification | null>(null);
  
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  useEffect(() => {
    // Setup notification permissions and token
    const setupNotifications = async () => {
      const permission = await NotificationService.requestPermissions();
      setHasPermission(permission);

      if (permission) {
        const token = await NotificationService.getExpoPushToken();
        setExpoPushToken(token);
      }
    };

    setupNotifications();

    // Setup notification listeners
    const listeners = NotificationService.setupNotificationListeners(
      (notification) => {
        setLastNotification(notification);
      },
      (response) => {
        console.log('User interacted with notification:', response);
        // You can handle navigation or other actions here
        const data = response.notification.request.content.data;
        if (data?.prescriptionId) {
          // Navigate to medication details or mark as taken
          console.log('Navigate to prescription:', data.prescriptionId);
        }
      }
    );

    notificationListener.current = listeners.notificationListener;
    responseListener.current = listeners.responseListener;

    // Cleanup listeners on unmount
    return () => {
      NotificationService.cleanupListeners({
        notificationListener: notificationListener.current,
        responseListener: responseListener.current,
      });
    };
  }, []);

  // Function to schedule medication reminders
  const scheduleMedicationReminders = async (prescriptionData: {
    medicationName: string;
    dose: string;
    frequency: { time: string; number_of_tablets: number; id?: string }[];
    startDate: string;
    endDate: string;
    prescriptionId: string;
  }) => {
    if (!hasPermission) {
      console.log('No notification permission');
      return [];
    }

    return await NotificationService.scheduleMultipleMedicationReminders(prescriptionData);
  };

  // Function to cancel prescription notifications
  const cancelPrescriptionNotifications = async (prescriptionId: string) => {
    await NotificationService.cancelPrescriptionNotifications(prescriptionId);
  };

  // Function to get all scheduled notifications
  const getScheduledNotifications = async () => {
    return await NotificationService.getScheduledNotifications();
  };

  // Function to debug scheduled notifications
  const debugScheduledNotifications = async () => {
    return await NotificationService.debugScheduledNotifications();
  };

  // Function to cancel immediate notifications
  const cancelImmediateNotifications = async () => {
    return await NotificationService.cancelImmediateNotifications();
  };

  return {
    expoPushToken,
    hasPermission,
    lastNotification,
    scheduleMedicationReminders,
    cancelPrescriptionNotifications,
    getScheduledNotifications,
    debugScheduledNotifications,
    cancelImmediateNotifications,
  };
};