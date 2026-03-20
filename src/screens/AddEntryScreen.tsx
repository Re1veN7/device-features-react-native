import React, { useContext, useState, useEffect } from 'react';
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

  // Request notification permissions on mount
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
      }
    })();
  }, []);

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

      // 2. Request Location Permissions & Get Address (Automatic Reverse Geocoding)
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
        // Formatting the address automatically
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
      Alert.alert("Error", "Please take a photo and wait for the address to load.");
      return;
    }

    const newEntry: TravelEntry = {
      id: Date.now().toString(),
      imageUri,
      address,
    };

    try {
      // 1. Save to AsyncStorage
      await saveEntry(newEntry);

      // 2. Send the Local Notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Travel Entry Saved! 📸",
          body: `New memory added at ${address}`,
          sound: 'default',
        },
        trigger: null, // Send immediately
      });

      // 3. Navigate back to Home (This clears the screen state)
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to save the entry.");
    }
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
                📍 {address || 'Fetching address...'}
              </Text>
            )}

            <View style={styles.actionButtons}>
              <Button title="Retake" onPress={takePictureAndGetLocation} color="#888" />
              <View style={{ width: 10 }} />
              <Button 
                title="Save Entry" 
                onPress={handleSave} 
                disabled={isLoading || !address} 
              />
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
  actionButtons: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
});