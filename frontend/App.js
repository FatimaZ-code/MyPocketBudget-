/**
 * Point d'entrée de l'application React Native.
 *
 * Enveloppe l'application dans :
 * - GestureHandlerRootView : requis par React Navigation Stack
 * - AuthProvider : fournit l'état d'authentification global (JWT)
 * - AppNavigator : gère la navigation entre les écrans
 */

import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
