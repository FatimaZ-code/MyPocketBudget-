import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, ActivityIndicator
} from 'react-native';
import { transactionService } from '../services/api';

const CATEGORIES_REVENU = ['Salaire', 'Freelance', 'Vente', 'Investissement', 'Autre'];
const CATEGORIES_DEPENSE = ['Alimentation', 'Loyer', 'Transport', 'Santé', 'Loisirs', 'Vêtements', 'Éducation', 'Autre'];

export default function EditTransactionScreen({ route, navigation }) {
  // Récupérer la transaction passée en paramètre de navigation
  const { transaction } = route.params;

  const [type, setType] = useState(transaction.type);
  const [montant, setMontant] = useState(String(transaction.montant));
  const [categorie, setCategorie] = useState(transaction.categorie);
  const [date, setDate] = useState(transaction.date);
  const [description, setDescription] = useState(transaction.description || '');
  const [loading, setLoading] = useState(false);

  const categories = type === 'REVENU' ? CATEGORIES_REVENU : CATEGORIES_DEPENSE;

  const handleUpdate = async () => {
    if (!montant || isNaN(parseFloat(montant)) || parseFloat(montant) <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide');
      return;
    }
    if (!categorie) {
      Alert.alert('Erreur', 'Veuillez choisir une catégorie');
      return;
    }

    setLoading(true);
    try {
      await transactionService.update(transaction.id, {
        type,
        montant: parseFloat(montant),
        categorie,
        date,
        description: description.trim() || null,
      });

      Alert.alert('Succès ✅', 'Transaction modifiée !', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de modifier la transaction');
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
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Description */}
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

      {/* Bouton sauvegarder */}
      <TouchableOpacity
        style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
        onPress={handleUpdate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitBtnText}>💾 Sauvegarder les modifications</Text>
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
    flex: 1, borderRadius: 12, padding: 14, alignItems: 'center',
    backgroundColor: '#F3F4F6', borderWidth: 2, borderColor: 'transparent',
  },
  typeBtnActiveRevenu: { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
  typeBtnActiveDepense: { backgroundColor: '#FEF2F2', borderColor: '#EF4444' },
  typeEmoji: { fontSize: 24, marginBottom: 6 },
  typeBtnText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  typeBtnTextActive: { color: '#1F2937' },
  input: {
    backgroundColor: '#F3F4F6', borderRadius: 10, padding: 14,
    fontSize: 16, color: '#1F2937', borderWidth: 1, borderColor: '#E5E7EB',
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB',
  },
  categoryChipActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  categoryChipText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  categoryChipTextActive: { color: '#fff' },
  submitBtn: {
    margin: 16, backgroundColor: '#4F46E5', borderRadius: 14,
    padding: 18, alignItems: 'center', marginBottom: 40,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});