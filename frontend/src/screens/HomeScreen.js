/**
 * Écran d'accueil principal.
 *
 * Affiche :
 * - Le solde en temps réel (revenus - dépenses) via GET /api/transactions/balance
 * - Les cartes revenus et dépenses
 * - Les boutons de navigation vers les autres écrans
 * - Le bouton de déconnexion
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ScrollView, RefreshControl, ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { transactionService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { user, logout } = useAuth();

  /**
   * Charge le solde depuis l'API.
   * useFocusEffect = se relance à chaque fois que l'écran devient actif
   * (utile après ajout/suppression d'une transaction)
   */
  const loadBalance = useCallback(async () => {
    try {
      const data = await transactionService.getBalance();
      setBalance(data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger le solde');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Recharge le solde à chaque fois que l'écran Home est affiché
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadBalance();
    }, [loadBalance])
  );

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnecter', style: 'destructive', onPress: logout },
      ]
    );
  };

  const formatMontant = (value) => {
    if (!value) return '0.00 MAD';
    return `${parseFloat(value).toFixed(2)} MAD`;
  };

  const solde = balance ? parseFloat(balance.solde) : 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => {
          setRefreshing(true);
          loadBalance();
        }} />
      }
    >
      {/* En-tête utilisateur */}
      <View style={styles.userHeader}>
        <Text style={styles.greeting}>Bonjour 👋</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>

      {/* Carte solde principal */}
      <View style={[styles.balanceCard, solde >= 0 ? styles.balancePositive : styles.balanceNegative]}>
        <Text style={styles.balanceLabel}>Solde actuel</Text>
        {loading ? (
          <ActivityIndicator color="#fff" size="large" />
        ) : (
          <Text style={styles.balanceAmount}>{formatMontant(balance?.solde)}</Text>
        )}
        <Text style={styles.balanceSubtitle}>
          {solde >= 0 ? '✅ Budget équilibré' : '⚠️ Budget déficitaire'}
        </Text>
      </View>

      {/* Cartes revenus / dépenses */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.revenuCard]}>
          <Text style={styles.statEmoji}>📈</Text>
          <Text style={styles.statLabel}>Revenus</Text>
          <Text style={styles.statAmount}>
            {loading ? '...' : formatMontant(balance?.totalRevenus)}
          </Text>
        </View>

        <View style={[styles.statCard, styles.depenseCard]}>
          <Text style={styles.statEmoji}>📉</Text>
          <Text style={styles.statLabel}>Dépenses</Text>
          <Text style={styles.statAmount}>
            {loading ? '...' : formatMontant(balance?.totalDepenses)}
          </Text>
        </View>
      </View>

      {/* Actions rapides */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('AddTransaction')}
        >
          <Text style={styles.actionEmoji}>➕</Text>
          <View>
            <Text style={styles.actionTitle}>Ajouter une transaction</Text>
            <Text style={styles.actionSubtitle}>Revenu ou dépense</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('TransactionList')}
        >
          <Text style={styles.actionEmoji}>📋</Text>
          <View>
            <Text style={styles.actionTitle}>Voir toutes les transactions</Text>
            <Text style={styles.actionSubtitle}>Historique complet</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  userHeader: {
    backgroundColor: '#4F46E5',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  userEmail: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  logoutBtn: {
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  logoutText: { color: '#fff', fontSize: 13 },

  balanceCard: {
    margin: 16,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  balancePositive: { backgroundColor: '#059669' },
  balanceNegative: { backgroundColor: '#DC2626' },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 10 },
  balanceAmount: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
  balanceSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 10 },

  statsRow: { flexDirection: 'row', marginHorizontal: 16, gap: 12, marginBottom: 8 },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  revenuCard: { backgroundColor: '#ECFDF5' },
  depenseCard: { backgroundColor: '#FEF2F2' },
  statEmoji: { fontSize: 28, marginBottom: 6 },
  statLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  statAmount: { fontSize: 14, fontWeight: 'bold', color: '#1F2937' },

  actionsSection: { margin: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#374151', marginBottom: 12 },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  actionEmoji: { fontSize: 28, marginRight: 14 },
  actionTitle: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  actionSubtitle: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
});
