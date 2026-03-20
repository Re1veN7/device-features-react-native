import React, { useContext, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { ThemeContext } from "../context/ThemeContext";
import { getEntries, deleteEntry } from "../utils/storage";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [entries, setEntries] = useState<any[]>([]);

  const fetchEntries = async () => {
    const data = await getEntries();
    setEntries(data);
  };

  useFocusEffect(
    useCallback(() => {
      fetchEntries();
    }, []),
  );

  const handleDelete = (id: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to remove this travel entry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteEntry(id);
            fetchEntries();
          },
        },
      ],
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#121212" : "#F5F5F5" },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDarkMode ? "#FFF" : "#333" }]}>
          My Travels
        </Text>
        <TouchableOpacity style={styles.themeBtn} onPress={toggleTheme}>
          <Text style={{ color: "#FFF" }}>
            {isDarkMode ? "☀️ Light" : "🌙 Dark"}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No entries yet. Start exploring!</Text>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              { backgroundColor: isDarkMode ? "#1E1E1E" : "#FFF" },
            ]}
          >
            <Image source={{ uri: item.imageUri }} style={styles.image} />
            <View style={styles.cardBody}>
              <Text
                style={[
                  styles.address,
                  { color: isDarkMode ? "#BBB" : "#666" },
                ]}
              >
                {item.address}
              </Text>
              <Text
                style={[styles.date, { color: isDarkMode ? "#777" : "#999" }]}
              >
                {item.timestamp}
              </Text>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.deleteText}>Remove Entry</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddEntry")}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 40,
  },
  title: { fontSize: 28, fontWeight: "bold" },
  themeBtn: {
    backgroundColor: "#6200EE",
    padding: 8,
    borderRadius: 20,
    width: 80,
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    color: "#888",
    fontSize: 16,
  },
  card: {
    borderRadius: 15,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: { width: "100%", height: 200 },
  cardBody: { padding: 15 },
  address: { fontSize: 14, fontWeight: "600", marginBottom: 5 },
  date: { fontSize: 12, marginBottom: 15 },
  deleteBtn: {
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    paddingTop: 10,
    alignItems: "center",
  },
  deleteText: { color: "#FF3B30", fontWeight: "bold" },
  fab: {
    position: "absolute",
    right: 30,
    bottom: 30,
    backgroundColor: "#6200EE",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  fabText: { color: "#FFF", fontSize: 30, fontWeight: "300" },
});

export default HomeScreen;
