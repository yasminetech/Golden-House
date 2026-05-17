# Meriams Shop

Boutique en ligne complète avec backend Express et frontend React.

## Installation Rapide

Pour installer toutes les dépendances (root, backend et frontend) en une seule commande :

```bash
npm run install-all
```

## Démarrage Rapide

### Prérequis MySQL
1. Créez la base de données (ou vérifiez qu'elle existe) :
   - Exécutez `backend/db.sql` dans votre client MySQL.

2. Configurez les variables d'environnement :
   - Dans `backend/`, copiez :
     ```bash
     cp .env.example .env
     ```
   - Remplissez `JWT_SECRET` et les identifiants MySQL.

### Lancer le projet (backend + frontend)
Pour lancer le backend et le frontend simultanément :

```bash
npm run install-all
npm start
```

- Backend : `http://localhost:5500`
- Frontend : `http://localhost:3004`

### Seed (ajouter les produits + admin)
Pour réinitialiser les produits et créer l'admin :

```bash
cd backend
npm run seed
```

Compte admin par défaut :
- email : `admin@meriams.shop`
- password : `admin123`
- role : `admin`

Admin dashboard : `http://localhost:3004/admin.html` (ou via le bouton Admin de l'interface)

## Structure du projet


```
meriamsApp/
├── backend/              # API Express
│   ├── routes/          # Routes API (auth, products, orders, contact)
│   ├── middleware/      # Auth middleware
│   ├── public/          # Fichiers statiques (ancien frontend)
│   ├── db.js            # Pool connexion MySQL
│   ├── db.sql           # Schéma base de données
│   ├── seed.js          # Script seed pour les produits
│   ├── server.js        # Serveur Express
│   └── package.json
│
└── frontend/            # Application React
    ├── src/
    │   ├── components/  # Composants React
    │   ├── styles/      # CSS styling
    │   ├── App.js       # Composant principal
    │   └── api.js       # Utilitaires API
    ├── public/
    │   └── index.html   # Point d'entrée HTML
    └── package.json
```

## Installation et démarrage

### Backend

1. Aller dans le dossier backend :
   ```bash
   cd backend
   ```

2. Copier et configurer les variables d'environnement :
   ```bash
   cp .env.example .env
   ```
   Éditer `.env` avec vos paramètres MySQL

3. Installer les dépendances :
   ```bash
   npm install
   ```

4. Créer la base de données (exécuter db.sql dans votre client MySQL)

5. Lancer le serveur :
   ```bash
   npm start
   ```

   Ou pour seed les produits :
   ```bash
   npm run seed
   ```

Le serveur démarre sur `http://localhost:5500`

### Frontend

1. Aller dans le dossier frontend :
   ```bash
   cd frontend
   ```

2. Installer les dépendances :
   ```bash
   npm install
   ```

3. Lancer le développement :
   ```bash
   npm start
   ```

L'application s'ouvre sur `http://localhost:3004`

## Fonctionnalités

### Authentification
- Inscription et connexion utilisateur
- JWT tokens pour les requêtes protégées
- Roles admin pour la gestion des produits

### Produits
- Affichage de tous les produits
- Détails des produits (prix, stock, description)
- Ajout/suppression au panier

### Panier
- Gestion du panier (localStorage)
- Calcul du total
- Passage de commande

### Commandes
- Historique des commandes utilisateur
- Suivi du statut

### Contact
- Formulaire de contact simple
- Sauvegarde en base de données

### Admin
- Création/modification/suppression de produits (route protégée)

## API Endpoints

### Auth
- `POST /api/auth/signup` - Inscription
- `POST /api/auth/login` - Connexion

### Products
- `GET /api/products` - Lister tous les produits
- `GET /api/products/:id` - Détail d'un produit
- `POST /api/products` - Créer (admin)
- `PUT /api/products/:id` - Modifier (admin)
- `DELETE /api/products/:id` - Supprimer (admin)

### Orders
- `POST /api/orders` - Créer une commande
- `GET /api/orders/user` - Mes commandes

### Contact
- `POST /api/contact` - Envoyer un message

## Technologies

### Backend
- Node.js / Express
- MySQL
- JWT pour l'authentification
- bcryptjs pour les mots de passe

### Frontend
- React 18
- CSS3 (responsive design)
- Fetch API
- localStorage pour le panier

## Notes

- Les images des produits viennent d'Unsplash
- Le frontend communique avec le backend via proxy (localhost:5500)
- Les tokens JWT expirent après 24h
