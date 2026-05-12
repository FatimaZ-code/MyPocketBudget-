import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================
// CONFIGURATION DE BASE
// Remplacez par l'IP de votre machine si test sur appareil physique
// Ex: http://192.168.1.100:8080/api
// ============================================================
const BASE_URL = 'http://192.168.11.106:8080/api'; // Android Emulator

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 secondes max
});

// ============================================================
// INTERCEPTEUR DE REQUÊTE : Injecte le JWT automatiquement
// Chaque requête sécurisée reçoit : Authorization: Bearer <token>
// ============================================================
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// INTERCEPTEUR DE RÉPONSE : Gestion globale des erreurs
// ============================================================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Affiche l'erreur complète dans la console Expo
    console.log('❌ Erreur API:', JSON.stringify(error.message));
    console.log('❌ URL appelée:', error.config?.url);
    console.log('❌ Status:', error.response?.status);

    if (error.response?.status === 401) {
      // Token expiré ou invalide → nettoyer le stockage
      await AsyncStorage.removeItem('jwt_token');
      await AsyncStorage.removeItem('user_info');
    }
    return Promise.reject(error);
  }
);

// ============================================================
// SERVICES D'AUTHENTIFICATION
// ============================================================
export const authService = {
  /**
   * Inscription : POST /api/auth/register
   * Retourne : { token, email, userId, message }
   */
  register: async (email, password) => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  },

  /**
   * Connexion : POST /api/auth/login
   * Retourne : { token, email, userId, message }
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  /**
   * Sauvegarder le token JWT dans AsyncStorage (stockage persistant mobile)
   */
  saveToken: async (token, userInfo) => {
    await AsyncStorage.setItem('jwt_token', token);
    await AsyncStorage.setItem('user_info', JSON.stringify(userInfo));
  },

  /**
   * Supprimer le token (déconnexion)
   */
  logout: async () => {
    await AsyncStorage.removeItem('jwt_token');
    await AsyncStorage.removeItem('user_info');
  },

  /**
   * Récupérer les infos utilisateur stockées
   */
  getUserInfo: async () => {
    const info = await AsyncStorage.getItem('user_info');
    return info ? JSON.parse(info) : null;
  },

  /**
   * Vérifier si l'utilisateur est connecté (token présent)
   */
  isLoggedIn: async () => {
    const token = await AsyncStorage.getItem('jwt_token');
    return !!token;
  },
};

// ============================================================
// SERVICES TRANSACTIONS
// ============================================================
export const transactionService = {
  /**
   * GET /api/transactions → liste complète de l'utilisateur
   */
  getAll: async () => {
    const response = await api.get('/transactions');
    return response.data;
  },

  /**
   * GET /api/transactions/balance → solde calculé
   */
  getBalance: async () => {
    const response = await api.get('/transactions/balance');
    return response.data;
  },

  /**
   * POST /api/transactions → créer une transaction
   * @param {type, montant, categorie, date, description}
   */
  create: async (transactionData) => {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  },

  /**
   * PUT /api/transactions/:id → modifier une transaction
   */
  update: async (id, transactionData) => {
    const response = await api.put(`/transactions/${id}`, transactionData);
    return response.data;
  },

  /**
   * DELETE /api/transactions/:id → supprimer une transaction
   */
  delete: async (id) => {
    await api.delete(`/transactions/${id}`);
  },
};

export default api;
