import React, { useContext, useState, useCallback } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList, TravelEntry } from '../types';
import { ThemeContext } from '../context/ThemeContext';
import { loadEntries, deleteEntry } from '../utils/storage';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: Props) {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [entries, setEntries] = useState<TravelEntry[]>([]);

  // Fetch entries from AsyncStorage
  const fetchEntries = async () => {
    const data = await loadEntries();
    setEntries(data);
  };

  // useFocusEffect triggers every time this screen becomes active
  useFocusEffect(
    useCallback(() => {
      fetchEntries();
    }, [])
  );

  const handleRemove = async (id: string) => {
    await deleteEntry(id);
    fetchEntries(); // Refresh the list immediately after deleting
  };

  // Component to render each individual item in the FlatList
  const renderItem = ({ item }: { item: TravelEntry }) => (
    <View style={[styles.card, { backgroundColor: isDarkMode ? '#444' : '#f9f9f9' }]}>
      <Image source={{ uri: item.imageUri }} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={[styles.address, { color: isDarkMode ? '#fff' : '#000' }]}>{item.address}</Text>
        <TouchableOpacity onPress={() => handleRemove(item.id)} style={styles.removeBtn}>
          <Text style={styles.removeBtnText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
      <View style={styles.headerControls}>
        <Button title={`Theme: ${isDarkMode ? 'Dark' : 'Light'}`} onPress={toggleTheme} color="#888" />
        <Button title="+ Add Entry" onPress={() => navigation.navigate('AddEntry')} />
      </View>

      {/* Conditional rendering for Empty State vs FlatList */}
      {entries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ color: isDarkMode ? '#ccc' : '#555', fontSize: 18 }}>No Entries yet</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerControls: { flexDirection: 'row', justifyContent: 'space-between', padding: 15 },
  listContainer: { padding: 15, paddingBottom: 30 },
  card: { flexDirection: 'row', marginBottom: 15, borderRadius: 8, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  image: { width: 100, height: 100, backgroundColor: '#ccc' },
  cardContent: { flex: 1, padding: 10, justifyContent: 'space-between' },
  address: { fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  removeBtn: { alignSelf: 'flex-start', backgroundColor: '#ff4d4d', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 5 },
  removeBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});