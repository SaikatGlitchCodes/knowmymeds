import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { NAV_THEME } from '../constants';
import { NotificationService } from '../services/NotificationService';

interface NotificationSettingsProps {
  onPermissionChange?: (hasPermission: boolean) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ 
  onPermissionChange 
}) => {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [scheduledCount, setScheduledCount] = useState<number>(0);

  useEffect(() => {
    const checkPermissionStatus = async () => {
      try {
        setIsLoading(true);
        const { status } = await Notifications.getPermissionsAsync();
        const permission = status === 'granted';
        setHasPermission(permission);
        onPermissionChange?.(permission);
      } catch (error) {
        console.error('Error checking notification permission:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const getScheduledNotificationsCount = async () => {
      try {
        const notifications = await NotificationService.getScheduledNotifications();
        setScheduledCount(notifications.length);
      } catch (error) {
        console.error('Error getting scheduled notifications:', error);
      }
    };

    const init = async () => {
      await checkPermissionStatus();
      await getScheduledNotificationsCount();
    };
    init();
  }, [onPermissionChange]);

  const getScheduledNotificationsCount = async () => {
    try {
      const notifications = await NotificationService.getScheduledNotifications();
      setScheduledCount(notifications.length);
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
    }
  };

  const handlePermissionToggle = async () => {
    if (hasPermission) {
      // If permission is granted, show alert to go to settings
      Alert.alert(
        'Disable Notifications',
        'To disable notifications, please go to your device settings and turn off notifications for KnowMyMeds.',
        [{ text: 'OK' }]
      );
    } else {
      // Request permission
      try {
        const granted = await NotificationService.requestPermissions();
        setHasPermission(granted);
        onPermissionChange?.(granted);
        
        if (!granted) {
          Alert.alert(
            'Permission Denied',
            'Notification permission is required for medication reminders. You can enable it in your device settings.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        Alert.alert('Error', 'Failed to request notification permission');
      }
    }
  };

  const handleClearAllNotifications = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to cancel all scheduled medication reminders?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await NotificationService.cancelAllNotifications();
              setScheduledCount(0);
              Alert.alert('Success', 'All notifications have been cleared');
            } catch (error) {
              console.error('Error clearing notifications:', error);
              Alert.alert('Error', 'Failed to clear notifications');
            }
          },
        },
      ]
    );
  };

  const handleTestNotification = async () => {
    try {
      if (!hasPermission) {
        Alert.alert('Error', 'Notification permission is required');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💊 Test Notification',
          body: 'This is a test medication reminder!',
          sound: true,
        },
        trigger: { seconds: 2 } as Notifications.TimeIntervalTriggerInput,
      });

      Alert.alert('Success', 'Test notification scheduled for 2 seconds');
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { color: NAV_THEME.dark.text }]}>
          Loading notification settings...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: NAV_THEME.dark.text }]}>
        Notification Settings
      </Text>

      {/* Permission Toggle */}
      <View style={[styles.settingRow, { borderBottomColor: NAV_THEME.dark.border }]}>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: NAV_THEME.dark.text }]}>
            Medication Reminders
          </Text>
          <Text style={[styles.settingDescription, { color: '#9ca3af' }]}>
            {hasPermission 
              ? 'Receive notifications for medication times' 
              : 'Enable to get medication reminders'
            }
          </Text>
        </View>
        <Switch
          value={hasPermission}
          onValueChange={handlePermissionToggle}
          trackColor={{ false: '#767577', true: NAV_THEME.dark.primary }}
          thumbColor={hasPermission ? '#ffffff' : '#f4f3f4'}
        />
      </View>

      {/* Scheduled Notifications Count */}
      <View style={[styles.settingRow, { borderBottomColor: NAV_THEME.dark.border }]}>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: NAV_THEME.dark.text }]}>
            Scheduled Reminders
          </Text>
          <Text style={[styles.settingDescription, { color: '#9ca3af' }]}>
            {scheduledCount} notification{scheduledCount !== 1 ? 's' : ''} scheduled
          </Text>
        </View>
        <TouchableOpacity 
          onPress={getScheduledNotificationsCount}
          style={[styles.refreshButton, { backgroundColor: NAV_THEME.dark.primary }]}
        >
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Test Notification */}
      {hasPermission && (
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: NAV_THEME.dark.primary }]}
          onPress={handleTestNotification}
        >
          <Text style={styles.buttonText}>Send Test Notification</Text>
        </TouchableOpacity>
      )}

      {/* Clear All Notifications */}
      {hasPermission && scheduledCount > 0 && (
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#ef4444' }]}
          onPress={handleClearAllNotifications}
        >
          <Text style={styles.buttonText}>Clear All Notifications</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingText: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  button: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});