import React, { useContext } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native-stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './src/types';
import { ThemeProvider, ThemeContext } from './src/context/ThemeContext';

import HomeScreen from './src/screens/HomeScreen';
import AddEntryScreen from './src/screens/AddEntryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// A wrapper component to consume the theme context for React Navigation
function NavigationWrapper() {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: isDarkMode ? '#222' : '#f4511e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: { backgroundColor: isDarkMode ? '#333' : '#fff' }
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Travel Diary' }} />
        <Stack.Screen name="AddEntry" component={AddEntryScreen} options={{ title: 'Add Entry' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NavigationWrapper />
    </ThemeProvider>
  );
}