import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

export default function AddEntryScreen() {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
      <Text style={{ color: isDarkMode ? '#fff' : '#000' }}>Add Travel Entry Screen (WIP)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});