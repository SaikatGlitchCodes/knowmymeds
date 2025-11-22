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
        // For Expo managed workflow, you don't need Firebase initialization
        // Just use the projectId from your app.json
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
      
      // If the error is about Firebase, try without projectId
      if (error instanceof Error && error.message?.includes('FirebaseApp')) {
        try {
          console.log('Trying to get token without projectId...');
          const token = (await Notifications.getExpoPushTokenAsync()).data;
          console.log('Expo Push Token (fallback):', token);
          return token;
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          return null;
        }
      }
      
      return null;
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