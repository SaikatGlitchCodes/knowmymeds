import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export const resetOnboarding = async () => {
  try {
    await AsyncStorage.removeItem('hasSeenOnboarding');
    Alert.alert('Success', 'Onboarding reset! Restart the app to see onboarding screens again.');
  } catch (error) {
    console.error('Error resetting onboarding:', error);
    Alert.alert('Error', 'Failed to reset onboarding');
  }
};
