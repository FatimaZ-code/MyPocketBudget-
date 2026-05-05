/**
 * Configuration de la navigation React Navigation (Stack Navigator).
 *
 * Deux groupes de routes :
 * 1. Routes non authentifiées : Login, Register
 * 2. Routes authentifiées : Home, TransactionList, AddTransaction
 *
 * La navigation change automatiquement selon l'état d'authentification.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../context/AuthContext';

// Écrans
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import TransactionListScreen from '../screens/TransactionListScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';

const Stack = createStackNavigator();

// Options d'en-tête communes
const headerOptions = {
  headerStyle: { backgroundColor: '#4F46E5' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' },
};

export default function AppNavigator() {
  const { user, loading } = useAuth();

  // Afficher un loader pendant la vérification du token stocké
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          // ===== Routes publiques (non connecté) =====
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ ...headerOptions, title: 'Connexion', headerLeft: null }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ ...headerOptions, title: 'Inscription' }}
            />
          </>
        ) : (
          // ===== Routes privées (connecté) =====
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ ...headerOptions, title: '💰 MyPocket Budget', headerLeft: null }}
            />
            <Stack.Screen
              name="TransactionList"
              component={TransactionListScreen}
              options={{ ...headerOptions, title: 'Mes Transactions' }}
            />
            <Stack.Screen
              name="AddTransaction"
              component={AddTransactionScreen}
              options={{ ...headerOptions, title: 'Nouvelle Transaction' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
