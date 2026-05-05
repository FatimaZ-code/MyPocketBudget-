/**
 * Écran d'ajout de transaction.
 * Formulaire complet pour créer une nouvelle transaction (revenu ou dépense).
 * Appel POST /api/transactions avec JWT dans les en-têtes.
 */

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, ActivityIndicator, Platform
} from 'react-native';
import { transactionService } from '../services/api';

const CATEGORIES_REVENU = ['Salaire', 'Freelance', 'Vente', 'Investissement', 'Autre'];
const CATEGORIES_DEPENSE = ['Alimentation', 'Loyer', 'Transport', 'Santé', 'Loisirs', 'Vêtements', 'Éducation', 'Autre'];

export default function AddTransactionScreen({ navigation }) {
  const [type, setType] = useState('REVENU'); // 'REVENU' ou 'DEPENSE'
  const [montant, setMontant] = useState('');
  const [categorie, setCategorie] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Format YYYY-MM-DD
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = type === 'REVENU' ? CATEGORIES_REVENU : CATEGORIES_DEPENSE;

  const handleSubmit = async () => {
    // Validations
    if (!montant || isNaN(parseFloat(montant)) || parseFloat(montant) <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide');
      return;
    }
    if (!categorie) {
      Alert.alert('Erreur', 'Veuillez choisir une catégorie');
      return;
    }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      Alert.alert('Erreur', 'Format de date invalide (YYYY-MM-DD)');
      return;
    }

    setLoading(true);
    try {
      await transactionService.create({
        type,
        montant: parseFloat(montant),
        categorie,
        date,
        description: description.trim() || null,
      });

      Alert.alert('Succès ✅', 'Transaction ajoutée avec succès !', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter la transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Sélecteur type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Type de transaction</Text>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'REVENU' && styles.typeBtnActiveRevenu]}
            onPress={() => { setType('REVENU'); setCategorie(''); }}
          >
            <Text style={styles.typeEmoji}>📈</Text>
            <Text style={[styles.typeBtnText, type === 'REVENU' && styles.typeBtnTextActive]}>
              Revenu
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeBtn, type === 'DEPENSE' && styles.typeBtnActiveDepense]}
            onPress={() => { setType('DEPENSE'); setCategorie(''); }}
          >
            <Text style={styles.typeEmoji}>📉</Text>
            <Text style={[styles.typeBtnText, type === 'DEPENSE' && styles.typeBtnTextActive]}>
              Dépense
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Montant */}
      <View style={styles.section}>
        <Text style={styles.label}>Montant (MAD)</Text>
        <TextInput
          style={styles.input}
          value={montant}
          onChangeText={setMontant}
          placeholder="0.00"
          keyboardType="decimal-pad"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Catégorie */}
      <View style={styles.section}>
        <Text style={styles.label}>Catégorie</Text>
        <View style={styles.categoriesGrid}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, categorie === cat && styles.categoryChipActive]}
              onPress={() => setCategorie(cat)}
            >
              <Text style={[styles.categoryChipText, categorie === cat && styles.categoryChipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Date */}
      <View style={styles.section}>
        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="2024-01-15"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Description (optionnel) */}
      <View style={styles.section}>
        <Text style={styles.label}>Description (optionnel)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Note sur cette transaction..."
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Récapitulatif */}
      {montant && categorie ? (
        <View style={[styles.recap, type === 'REVENU' ? styles.recapRevenu : styles.recapDepense]}>
          <Text style={styles.recapText}>
            {type === 'REVENU' ? '✅ Revenu' : '❌ Dépense'} de{' '}
            <Text style={styles.recapAmount}>{parseFloat(montant || 0).toFixed(2)} MAD</Text>
            {' '}— {categorie}
          </Text>
        </View>
      ) : null}

      {/* Bouton soumettre */}
      <TouchableOpacity
        style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitBtnText}>
            {type === 'REVENU' ? '💰 Ajouter le revenu' : '💸 Ajouter la dépense'}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  section: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    margin: 12,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#374151', marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 10 },

  typeSelector: { flexDirection: 'row', gap: 10 },
  typeBtn: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeBtnActiveRevenu: { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
  typeBtnActiveDepense: { backgroundColor: '#FEF2F2', borderColor: '#EF4444' },
  typeEmoji: { fontSize: 24, marginBottom: 6 },
  typeBtnText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  typeBtnTextActive: { color: '#1F2937' },

  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: { height: 80, textAlignVertical: 'top' },

  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  categoryChipText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  categoryChipTextActive: { color: '#fff' },

  recap: { margin: 12, borderRadius: 10, padding: 14 },
  recapRevenu: { backgroundColor: '#ECFDF5' },
  recapDepense: { backgroundColor: '#FEF2F2' },
  recapText: { fontSize: 13, color: '#374151' },
  recapAmount: { fontWeight: 'bold' },

  submitBtn: {
    margin: 16,
    backgroundColor: '#4F46E5',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginBottom: 40,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
