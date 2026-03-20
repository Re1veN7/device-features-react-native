import 'react-native-gesture-handler';
import React, { useContext, useEffect } from 'react'; // Added useEffect
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Notifications from 'expo-notifications'; // Ensure this is imported

import { RootStackParamList } from './src/types';
import { ThemeProvider, ThemeContext } from './src/context/ThemeContext';
import HomeScreen from './src/screens/HomeScreen';
import AddEntryScreen from './src/screens/AddEntryScreen';

const Stack = createStackNavigator<RootStackParamList>();

// 1. Global configuration for foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function NavigationWrapper() {
  const { isDarkMode } = useContext(ThemeContext);

  // 2. Request permissions on mount
  useEffect(() => {
    async function requestPermissions() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission for notifications was denied!');
      }
    }
    requestPermissions();
  }, []);

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
          cardStyle: { backgroundColor: isDarkMode ? '#333' : '#fff' }
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