import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { ThemeContext } from "../context/ThemeContext";
import { saveEntry } from "../utils/storage";

type AddEntryScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "AddEntry"
>;

interface Props {
  navigation: AddEntryScreenNavigationProp;
}

const AddEntryScreen: React.FC<Props> = ({ navigation }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const takePhoto = async () => {
    const { status: camStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: locStatus } =
      await Location.requestForegroundPermissionsAsync();

    if (camStatus !== "granted" || locStatus !== "granted") {
      Alert.alert(
        "Permission Required",
        "Camera and Location access are needed.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      fetchAddress();
    }
  };

  const fetchAddress = async () => {
    setLoading(true);
    try {
      const location = await Location.getCurrentPositionAsync({});
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const { name, street, city, region } = reverseGeocode[0];
        setAddress(`${name || street}, ${city}, ${region}`);
      }
    } catch (error) {
      setAddress("Unknown Location");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!imageUri || !address) {
      Alert.alert("Error", "Please take a photo first.");
      return;
    }

    const newEntry = {
      id: Date.now().toString(),
      imageUri,
      address,
      timestamp: new Date().toLocaleString(),
    };

    await saveEntry(newEntry);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Travel Entry Saved! 📍",
        body: `New memory added at ${address}`,
      },
      trigger: null,
    });

    navigation.goBack();
  };

  return (
    <ScrollView
      style={[
        styles.main,
        { backgroundColor: isDarkMode ? "#121212" : "#F5F5F5" },
      ]}
      contentContainerStyle={styles.container}
    >
      <View style={styles.content}>
        <View
          style={[
            styles.photoBox,
            { backgroundColor: isDarkMode ? "#1E1E1E" : "#E0E0E0" },
          ]}
        >
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <Text style={{ color: isDarkMode ? "#888" : "#999" }}>
              No Photo Taken
            </Text>
          )}
        </View>

        {loading && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#6200EE" />
            <Text style={{ color: isDarkMode ? "#AAA" : "#666" }}>
              Fetching Address...
            </Text>
          </View>
        )}

        {address && (
          <View
            style={[
              styles.addressContainer,
              { backgroundColor: isDarkMode ? "#1E1E1E" : "#FFF" },
            ]}
          >
            <Text style={styles.addressLabel}>LOCATION</Text>
            <Text
              style={[
                styles.addressText,
                { color: isDarkMode ? "#FFF" : "#333" },
              ]}
            >
              {address}
            </Text>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryBtn} onPress={takePhoto}>
            <Text style={styles.btnText}>
              {imageUri ? "Retake Photo" : "Take Photo"}
            </Text>
          </TouchableOpacity>

          {imageUri && (
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleSave}>
              <Text style={styles.btnText}>Save Entry</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  main: { flex: 1 },
  container: {
    padding: 20,
    paddingBottom: 60, // Ensures space for buttons at the bottom
    alignItems: "center",
  },
  content: { width: "100%", alignItems: "center" },
  photoBox: {
    width: "100%",
    height: 250, // Slightly shorter height to fit better on screen
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
    elevation: 2,
  },
  image: { width: "100%", height: "100%" },
  loader: { marginVertical: 20, alignItems: "center" },
  addressContainer: {
    width: "100%",
    padding: 15,
    borderRadius: 10,
    marginBottom: 25,
    elevation: 1,
  },
  addressLabel: {
    fontWeight: "bold",
    fontSize: 10,
    color: "#6200EE",
    marginBottom: 5,
  },
  addressText: { fontSize: 16, fontWeight: "500" },
  actionButtons: { width: "50%" },
  primaryBtn: {
    backgroundColor: "#6200EE",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  secondaryBtn: {
    backgroundColor: "#03DAC6",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
});

export default AddEntryScreen;