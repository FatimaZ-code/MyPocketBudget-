# 💰 MyPocket Budget — Application de Gestion Financière Personnelle

Application mobile complète composée d'un **backend Spring Boot** (API REST sécurisée par JWT) et d'un **frontend React Native** (Expo).

---

## 🏗️ Architecture globale

```
MyPocketBudget/
├── backend/                    ← API REST Spring Boot
│   ├── pom.xml                 ← Dépendances Maven
│   └── src/main/java/com/mypocket/budget/
│       ├── BudgetApplication.java       ← Point d'entrée
│       ├── entity/                      ← Entités JPA (User, Transaction)
│       ├── repository/                  ← Accès base de données
│       ├── dto/                         ← Objets de transfert de données
│       ├── service/                     ← Logique métier
│       ├── controller/                  ← Contrôleurs REST
│       ├── security/                    ← JWT + Filtres Spring Security
│       └── config/                      ← Configuration sécurité
│
└── frontend/                   ← Application React Native (Expo)
    ├── App.js                           ← Point d'entrée
    ├── package.json
    └── src/
        ├── screens/                     ← Écrans de l'application
        ├── navigation/                  ← Stack Navigator
        ├── services/api.js              ← Appels HTTP Axios
        └── context/AuthContext.js       ← État d'authentification global
```

---

## ⚙️ Prérequis

| Outil    | Version minimale |
| -------- | ---------------- |
| Java     | 17               |
| Maven    | 3.8+             |
| MySQL    | 8.0              |
| Node.js  | 18+              |
| npm      | 9+               |
| Expo CLI | dernière         |

---

## 🚀 Lancement du Backend

### 1. Créer la base de données MySQL

```sql
-- Connectez-vous à MySQL et exécutez :
CREATE DATABASE IF NOT EXISTS budget_db;
```

> La base de données est aussi créée automatiquement si vous avez `createDatabaseIfNotExist=true` dans `application.properties`.

### 2. Configurer `application.properties`

Fichier : `backend/src/main/resources/application.properties`

```properties
# Modifier selon votre configuration MySQL :
spring.datasource.username=root
spring.datasource.password=votre_mot_de_passe
```

### 3. Démarrer le backend

```bash
cd backend
'nvm use 20.19.0'
mvn spring-boot:run
```

✅ Le serveur démarre sur `http://localhost:8080`

### 4. Tester avec Postman

#### Inscription

```http
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "email": "test@email.com",
  "password": "123456"
}
```

#### Connexion

```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "test@email.com",
  "password": "123456"
}
```

→ Récupérer le `token` retourné

#### Ajouter une transaction (avec JWT)

```http
POST http://localhost:8080/api/transactions
Authorization: Bearer <votre_token_jwt>
Content-Type: application/json

{
  "type": "REVENU",
  "montant": 5000.00,
  "categorie": "Salaire",
  "date": "2024-01-15",
  "description": "Salaire janvier"
}
```

#### Consulter le solde

```http
GET http://localhost:8080/api/transactions/balance
Authorization: Bearer <votre_token_jwt>
```

---

## 📱 Lancement du Frontend (React Native / Expo)

### 1. Installer les dépendances

```bash
cd frontend
npm install
```

### 2. Configurer l'URL de l'API

Fichier : `frontend/src/services/api.js`

```javascript
// Pour émulateur Android :
//const BASE_URL = "http://192.168.11.123:8080/api";

// Pour iOS Simulator :
// const BASE_URL = 'http://localhost:8080/api';

// Pour appareil physique (remplacer par l'IP de votre machine) :
const BASE_URL = "http://192.168.x.x:8080/api";
```

### 3. Démarrer l'application

```bash
cd frontend
npx expo start
```

Ensuite, choisissez :

- **`a`** → Ouvrir sur l'émulateur Android
- **`i`** → Ouvrir sur le simulateur iOS
- **Scanner le QR code** → Ouvrir sur l'application Expo Go (appareil physique)

---

## 🔐 Flux JWT — Comment ça fonctionne ?

```
┌─────────────┐                    ┌──────────────────┐                ┌─────────┐
│  React Native│                    │  Spring Boot API  │                │ MySQL   │
└──────┬──────┘                    └────────┬─────────┘                └────┬────┘
       │                                    │                               │
       │   1. POST /api/auth/login          │                               │
       │   {email, password}                │                               │
       │ ─────────────────────────────────► │                               │
       │                                    │  2. Vérifie email/password    │
       │                                    │ ─────────────────────────────►│
       │                                    │◄─────────────────────────────┤
       │                                    │  3. Génère JWT signé          │
       │   4. Retourne { token: "eyJ..." }  │                               │
       │◄─────────────────────────────────  │                               │
       │                                    │                               │
       │   5. Stocke token dans AsyncStorage│                               │
       │                                    │                               │
       │   6. GET /api/transactions         │                               │
       │   Authorization: Bearer eyJ...     │                               │
       │ ─────────────────────────────────► │                               │
       │                                    │  7. JwtAuthFilter valide token │
       │                                    │  8. Extrait email du JWT      │
       │                                    │  9. Charge l'utilisateur      │
       │                                    │ ─────────────────────────────►│
       │                                    │◄─────────────────────────────┤
       │                                    │  10. Retourne les transactions│
       │◄─────────────────────────────────  │                               │
       │                                    │                               │
```

---

## 📋 Endpoints API

| Méthode | Endpoint                    | Auth | Description                   |
| ------- | --------------------------- | ---- | ----------------------------- |
| POST    | `/api/auth/register`        | Non  | Inscription                   |
| POST    | `/api/auth/login`           | Non  | Connexion → JWT               |
| GET     | `/api/transactions`         | JWT  | Liste toutes les transactions |
| GET     | `/api/transactions/{id}`    | JWT  | Une transaction               |
| POST    | `/api/transactions`         | JWT  | Créer une transaction         |
| PUT     | `/api/transactions/{id}`    | JWT  | Modifier une transaction      |
| DELETE  | `/api/transactions/{id}`    | JWT  | Supprimer une transaction     |
| GET     | `/api/transactions/balance` | JWT  | Solde (revenus - dépenses)    |

---

## 🗄️ Structure de la base de données

```sql
-- Table users
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL  -- Hashé BCrypt
);

-- Table transactions
CREATE TABLE transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('REVENU', 'DEPENSE') NOT NULL,
    montant DECIMAL(10, 2) NOT NULL,
    categorie VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    description VARCHAR(255),
    user_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🔧 Technologies utilisées

### Backend

- **Java 17** + **Spring Boot 3.2**
- **Spring MVC** → Contrôleurs REST
- **Spring Security** → Protection des endpoints
- **Spring Data JPA** → Accès base de données
- **JWT (jjwt 0.11.5)** → Authentification sans état
- **BCrypt** → Hashage des mots de passe
- **MySQL 8** → Base de données
- **Lombok** → Réduction du code boilerplate

### Frontend

- **React Native** + **Expo 50**
- **React Navigation** (Stack Navigator)
- **Axios** → Client HTTP
- **AsyncStorage** → Stockage sécurisé du JWT
- **React Context** → Gestion état global

---

## ❓ Dépannage

**"Connection refused" dans l'app mobile**
→ Vérifiez que le backend tourne et que l'URL dans `api.js` est correcte.
→ Sur Android physique, utilisez l'IP de votre machine, pas `localhost`.

**"Table doesn't exist"**
→ Lancez le backend une fois, JPA crée les tables automatiquement (`ddl-auto=update`).

**"401 Unauthorized"**
→ Le token JWT a expiré (24h). Reconnectez-vous pour en obtenir un nouveau.

**Expo ne démarre pas**
→ Supprimez `node_modules` et relancez `npm install`.
