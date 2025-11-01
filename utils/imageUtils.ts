import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export interface ImagePickerOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  base64?: boolean;
}

export interface ImageResult {
  uri: string;
  canceled: boolean;
}

export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera permissions to take a photo.'
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    return false;
  }
};

export const requestMediaLibraryPermission = async (): Promise<boolean> => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to select photos.'
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error requesting media library permission:', error);
    return false;
  }
};

export const openCamera = async (options: ImagePickerOptions = {}): Promise<ImageResult> => {
  try {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      return { uri: '', canceled: true };
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: options.allowsEditing ?? true,
      aspect: options.aspect ?? [1, 1],
      quality: options.quality ?? 0.8,
      base64: options.base64 ?? false,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return { uri: '', canceled: true };
    }
    
    const uri = result.assets[0].uri;
    return { uri, canceled: false };
  } catch (error) {
    console.error('Error opening camera:', error);
    Alert.alert('Error', 'Failed to open camera');
    return { uri: '', canceled: true };
  }
};

export const openGallery = async (options: ImagePickerOptions = {}): Promise<ImageResult> => {
  try {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) {
      return { uri: '', canceled: true };
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: options.allowsEditing ?? true,
      aspect: options.aspect ?? [1, 1],
      quality: options.quality ?? 0.8,
    });

    if (result.canceled || !result.assets[0]) {
      return { uri: '', canceled: true };
    }

    return { uri: result.assets[0].uri, canceled: false };
  } catch (error) {
    console.error('Error opening gallery:', error);
    Alert.alert('Error', 'Failed to open gallery');
    return { uri: '', canceled: true };
  }
};

export const prepareImageForUpload = (uri: string) => {
  // For React Native, we need to prepare the file in a different format
  return {
    uri,
    type: 'image/jpeg',
    name: 'image.jpg',
  };
};

export const getImageBase64 = async (uri: string): Promise<string> => {
  const response = await fetch(uri);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64 = reader.result?.toString().split(',')[1];
      if (base64) resolve(base64);
      else reject(new Error('Failed to convert image to base64'));
    };
    reader.onerror = reject;
  });
};