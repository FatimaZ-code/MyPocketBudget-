import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import TransactionListScreen from '../screens/TransactionListScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import EditTransactionScreen from '../screens/EditTransactionScreen';

const Stack = createStackNavigator();

const headerOptions = {
  headerStyle: { backgroundColor: '#4F46E5' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' },
};

export default function AppNavigator() {
  const { user, loading } = useAuth();

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
            <Stack.Screen
              name="EditTransaction"
              component={EditTransactionScreen}
              options={{ ...headerOptions, title: 'Modifier la Transaction' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
