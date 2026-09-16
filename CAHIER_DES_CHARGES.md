# Cahier des Charges - Application "Golden House" (MeriamsApp)

## 1. Présentation du Projet
**Golden House** est une application web d'e-commerce spécialisée dans la vente de produits (décoration, ameublement, etc.). L'objectif est de fournir une interface élégante et intuitive pour les clients et un panneau de gestion robuste pour l'administrateur.

## 2. Objectifs de l'Application
- Présenter un catalogue de produits de manière attractive.
- Permettre aux utilisateurs de passer des commandes via des paiements sécurisés.
- Offrir une interface d'administration pour gérer le catalogue et suivre les ventes.
- Faciliter la communication entre les clients et l'entreprise via un formulaire de contact.

## 3. Public Cible
- **Clients :** Particuliers cherchant des produits de qualité pour leur intérieur.
- **Administrateur :** Gestionnaire de la boutique (Mériam).

## 4. Spécifications Fonctionnelles

### 4.1 Interface Client
- **Accueil :** Présentation de la marque et des produits phares.
- **Catalogue :** Grille de produits avec images, descriptions et prix.
- **Panier :** Ajout/suppression de produits, gestion des quantités, calcul automatique du total.
- **Paiement (Checkout) :** 
    - Paiement par Carte Bancaire (simulé/Stripe).
    - Paiement via PayPal.
- **Espace Client :** Historique des commandes personnelles.
- **Contact :** Formulaire d'envoi de messages.

### 4.2 Interface Administrateur
- **Gestion des Produits :**
    - Ajout de nouveaux produits.
    - Modification/Suppression de produits existants.
    - **Gestion des Images :** Possibilité d'utiliser une URL externe ou de télécharger une image depuis l'ordinateur/galerie.
- **Gestion des Commandes :** Visualisation de toutes les commandes passées, statuts et montants.
- **Messagerie :** Lecture des messages reçus via le formulaire de contact.

## 5. Spécifications Techniques

### 5.1 Frontend (Client)
- **Framework :** React.js
- **Langage :** TypeScript / JavaScript
- **Style :** Vanilla CSS (design moderne, épuré, responsive).
- **Gestion d'état :** Hooks React (useState, useEffect).

### 5.2 Backend (Serveur)
- **Runtime :** Node.js
- **Framework :** Express.js
- **Base de données :** MySQL (hébergé sur Railway ou similaire).
- **Authentification :** JSON Web Tokens (JWT) et hachage de mots de passe (bcrypt).
- **Gestion des fichiers :** Multer (pour l'upload d'images local).

### 5.3 Sécurité
- Protection des routes admin via middleware.
- Hachage sécurisé des mots de passe.
- Variables d'environnement pour les clés API et accès DB.

## 6. Design et Ergonomie
- **Thème :** Moderne, luxueux (doré, blanc, noir).
- **Navigation :** Menu fluide (Header) et pied de page informatif (Footer).
- **Interactivité :** Feedback visuel lors des ajouts au panier et des validations de formulaires.

## 7. Déploiement et Maintenance
- **Hébergement Backend :** Railway.
- **Hébergement Frontend :** Vercel ou intégré au serveur Node.js.
- **Suivi :** Logs serveur et vérification de la santé de la base de données.
