import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { ThemeContext } from '../context/ThemeContext';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: Props) {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
      <Text style={{ color: isDarkMode ? '#fff' : '#000', marginBottom: 20 }}>Home Screen</Text>
      <Button title="Go to Add Entry" onPress={() => navigation.navigate('AddEntry')} />
      <View style={{ marginTop: 20 }}>
        <Button title={`Toggle ${isDarkMode ? 'Light' : 'Dark'} Mode`} onPress={toggleTheme} color="#888" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});