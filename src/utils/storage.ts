import AsyncStorage from '@react-native-async-storage/async-storage';
import { TravelEntry } from '../types';

const STORAGE_KEY = '@travel_entries';

// Load all saved entries
export const loadEntries = async (): Promise<TravelEntry[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Failed to load travel entries.', e);
    return [];
  }
};

// Save a single new entry
export const saveEntry = async (newEntry: TravelEntry): Promise<void> => {
  try {
    const existingEntries = await loadEntries();
    const updatedEntries = [...existingEntries, newEntry];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
  } catch (e) {
    console.error('Failed to save the entry.', e);
  }
};

// Delete an entry by its ID
export const deleteEntry = async (idToRemove: string): Promise<void> => {
  try {
    const existingEntries = await loadEntries();
    const updatedEntries = existingEntries.filter(entry => entry.id !== idToRemove);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
  } catch (e) {
    console.error('Failed to delete the entry.', e);
  }
};