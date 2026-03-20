import React, { useContext, useState } from 'react';
import { View, Text, Button, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { RootStackParamList, TravelEntry } from '../types';
import { ThemeContext } from '../context/ThemeContext';
import { saveEntry } from '../utils/storage';

// Ensure notifications show up even when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

type AddEntryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddEntry'>;

interface Props {
  navigation: AddEntryScreenNavigationProp;
}

export default function AddEntryScreen({ navigation }: Props) {
  const { isDarkMode } = useContext(ThemeContext);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const takePictureAndGetLocation = async () => {
    try {
      // 1. Request Camera Permissions & Take Picture
      const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraPerm.status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
      });

      if (result.canceled) return;
      
      setImageUri(result.assets[0].uri);
      setIsLoading(true);

      // 2. Request Location Permissions & Get Address
      const locationPerm = await Location.requestForegroundPermissionsAsync();
      if (locationPerm.status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to save the address.');
        setIsLoading(false);
        return;
      }

      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const place = reverseGeocode[0];
        const formattedAddress = `${place.name ? place.name + ', ' : ''}${place.city || ''}, ${place.region || ''}`;
        setAddress(formattedAddress);
      } else {
        setAddress('Address not found');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while fetching data.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!imageUri || !address) {
      Alert.alert('Missing Data', 'Please take a picture to get your location before saving.');
      return;
    }

    // Create a new entry object
    const newEntry: TravelEntry = {
      id: Date.now().toString(), // Simple unique ID generator
      imageUri,
      address,
    };

    // Save to AsyncStorage
    await saveEntry(newEntry);

    // Send Local Push Notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Entry Saved!',
        body: `Your travel memory at ${address} has been recorded.`,
        sound: 'default',
      },
      trigger: null, // trigger immediately
    });

    // Go back to the Home screen
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
      <View style={styles.content}>
        {!imageUri ? (
          <View style={styles.placeholder}>
            <Text style={{ color: isDarkMode ? '#ccc' : '#666', marginBottom: 20 }}>
              No picture taken yet.
            </Text>
            <Button title="Open Camera" onPress={takePictureAndGetLocation} />
          </View>
        ) : (
          <View style={styles.previewContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} />
            
            {isLoading ? (
              <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
            ) : (
              <Text style={[styles.addressText, { color: isDarkMode ? '#fff' : '#000' }]}>
                📍 {address}
              </Text>
            )}

            <View style={styles.actionButtons}>
              <Button title="Retake Picture" onPress={takePictureAndGetLocation} color="#888" />
              <View style={{ width: 10 }} />
              <Button title="Save Entry" onPress={handleSave} disabled={isLoading || !address} />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  placeholder: { alignItems: 'center' },
  previewContainer: { alignItems: 'center', width: '100%' },
  image: { width: 300, height: 300, borderRadius: 10, marginBottom: 20 },
  loader: { marginVertical: 20 },
  addressText: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
});