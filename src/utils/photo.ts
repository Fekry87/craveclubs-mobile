import { Alert, Platform, ActionSheetIOS } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

/** What a picked profile photo becomes: a local preview and what the API gets. */
export interface PickedPhoto {
  /** Local file URI of the resized square, for immediate preview. */
  uri: string;
  /** `data:image/jpeg;base64,...` — cropped square, 512px, ready to upload. */
  dataUrl: string;
}

/** Longest edge the app sends. The server does no resizing (no GD in production). */
export const PROFILE_PHOTO_SIZE = 512;

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.9,
};

/**
 * Shrink the picked image to a 512px square JPEG and return it with its
 * base64. A phone camera's crop is several megabytes; this is ~50KB.
 */
const prepare = async (uri: string): Promise<PickedPhoto> => {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: PROFILE_PHOTO_SIZE, height: PROFILE_PHOTO_SIZE } }],
    { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG, base64: true },
  );
  return {
    uri: result.uri,
    dataUrl: `data:image/jpeg;base64,${result.base64 ?? ''}`,
  };
};

/**
 * Open the camera or the library (asking permission first) and return the
 * prepared photo, or null when the swimmer cancelled or refused permission.
 */
export const pickProfilePhoto = async (
  source: 'camera' | 'library',
): Promise<PickedPhoto | null> => {
  let result: ImagePicker.ImagePickerResult;

  if (source === 'camera') {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to take a photo.');
      return null;
    }
    result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
  } else {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Photo library access is required to choose a photo.');
      return null;
    }
    result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
  }

  if (result.canceled || !result.assets[0]) return null;
  return prepare(result.assets[0].uri);
};

interface PhotoMenuOptions {
  /** Offer "Remove photo" (only when there is one). */
  canRemove?: boolean;
  onPick: (source: 'camera' | 'library') => void;
  onRemove?: () => void;
}

/**
 * The same Take photo / Choose from gallery menu on both platforms: an
 * action sheet on iOS, an alert on Android.
 */
export const showPhotoMenu = ({ canRemove = false, onPick, onRemove }: PhotoMenuOptions) => {
  if (Platform.OS === 'ios') {
    const options = ['Cancel', 'Take photo', 'Choose from gallery', ...(canRemove ? ['Remove photo'] : [])];
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: 0,
        destructiveButtonIndex: canRemove ? 3 : undefined,
      },
      (index) => {
        if (index === 1) onPick('camera');
        else if (index === 2) onPick('library');
        else if (index === 3 && canRemove) onRemove?.();
      },
    );
    return;
  }

  Alert.alert('Profile photo', 'Choose an option', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Take photo', onPress: () => onPick('camera') },
    { text: 'Choose from gallery', onPress: () => onPick('library') },
    ...(canRemove ? [{ text: 'Remove photo', style: 'destructive' as const, onPress: () => onRemove?.() }] : []),
  ]);
};
