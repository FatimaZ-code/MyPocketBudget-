/**
 * Écran liste des transactions.
 * Affiche toutes les transactions de l'utilisateur avec possibilité de suppression.
 * Appel GET /api/transactions avec JWT dans les en-têtes.
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, RefreshControl, ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { transactionService } from '../services/api';

// Catégories avec emojis pour l'affichage
const CATEGORY_EMOJIS = {
  'Salaire': '💼',
  'Alimentation': '🍔',
  'Loyer': '🏠',
  'Transport': '🚗',
  'Santé': '🏥',
  'Loisirs': '🎮',
  'Vêtements': '👕',
  'Éducation': '📚',
  'Freelance': '💻',
  'Autre': '💰',
};

export default function TransactionListScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTransactions = useCallback(async () => {
    try {
      const data = await transactionService.getAll();
      setTransactions(data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les transactions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadTransactions();
    }, [loadTransactions])
  );

  const handleDelete = (id) => {
    Alert.alert(
      'Supprimer',
      'Voulez-vous supprimer cette transaction ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await transactionService.delete(id);
              setTransactions(prev => prev.filter(t => t.id !== id));
            } catch (error) {
              Alert.alert('Erreur', 'Suppression impossible');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const renderTransaction = ({ item }) => {
    const isRevenu = item.type === 'REVENU';
    const emoji = CATEGORY_EMOJIS[item.categorie] || '💰';

    return (
      <View style={styles.transactionCard}>
        <View style={[styles.typeIndicator, isRevenu ? styles.revenuIndicator : styles.depenseIndicator]} />

        <View style={styles.cardLeft}>
          <Text style={styles.categoryEmoji}>{emoji}</Text>
        </View>

        <View style={styles.cardMiddle}>
          <Text style={styles.categorie}>{item.categorie}</Text>
          <Text style={styles.date}>{formatDate(item.date)}</Text>
          {item.description ? (
            <Text style={styles.description} numberOfLines={1}>{item.description}</Text>
          ) : null}
        </View>

        <View style={styles.cardRight}>
          <Text style={[styles.montant, isRevenu ? styles.revenuText : styles.depenseText]}>
            {isRevenu ? '+' : '-'}{parseFloat(item.montant).toFixed(2)} MAD
          </Text>
          <View style={[styles.typeBadge, isRevenu ? styles.revenuBadge : styles.depenseBadge]}>
            <Text style={styles.typeBadgeText}>{isRevenu ? 'Revenu' : 'Dépense'}</Text>
          </View>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
            <Text style={styles.deleteBtnText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Bouton ajouter */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddTransaction')}
      >
        <Text style={styles.addButtonText}>+ Nouvelle transaction</Text>
      </TouchableOpacity>

      {/* Compteur */}
      <Text style={styles.count}>
        {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
      </Text>

      {transactions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyText}>Aucune transaction pour le moment</Text>
          <Text style={styles.emptySubtext}>Ajoutez votre première transaction !</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTransaction}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => {
              setRefreshing(true);
              loadTransactions();
            }} />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 14 },

  addButton: {
    margin: 16,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },

  count: { marginHorizontal: 16, marginBottom: 8, color: '#6B7280', fontSize: 13 },

  listContent: { paddingHorizontal: 16, paddingBottom: 20 },

  transactionCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  typeIndicator: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  revenuIndicator: { backgroundColor: '#10B981' },
  depenseIndicator: { backgroundColor: '#EF4444' },

  cardLeft: { marginLeft: 8, marginRight: 12 },
  categoryEmoji: { fontSize: 28 },

  cardMiddle: { flex: 1 },
  categorie: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  date: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  description: { fontSize: 12, color: '#6B7280', marginTop: 2 },

  cardRight: { alignItems: 'flex-end' },
  montant: { fontSize: 16, fontWeight: 'bold' },
  revenuText: { color: '#059669' },
  depenseText: { color: '#DC2626' },
  typeBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
  revenuBadge: { backgroundColor: '#ECFDF5' },
  depenseBadge: { backgroundColor: '#FEF2F2' },
  typeBadgeText: { fontSize: 10, fontWeight: '600', color: '#374151' },
  deleteBtn: { marginTop: 6, padding: 4 },
  deleteBtnText: { fontSize: 16 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  emptySubtext: { fontSize: 13, color: '#9CA3AF', marginTop: 6 },
});
