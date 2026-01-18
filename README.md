# Parcours Bénéficiaire - Composant WeWeb

Composant WeWeb pour afficher le parcours d'un bénéficiaire avec des étapes, rendez-vous, ressources et tests.

## Design

Le composant a été mis à jour pour correspondre au nouveau design épuré avec :

- **En-tête simplifié** : Titre "Votre parcours" avec compteur d'étapes et barre de progression
- **Cartes d'étapes** avec :
  - Checkbox cliquable pour marquer les étapes comme terminées (sauf pour les tests)
  - Icône emoji selon le type d'étape
  - Tags colorés (Rendez-vous, Ressource, Test)
  - Badge "Terminé" pour les étapes complétées
  - Informations contextuelles selon le type
  - Boutons d'action adaptés

## Installation

1. Construire le composant :
```bash
npm install
npm run build
```

2. Le fichier `dist/manager.js` sera généré et pourra être importé dans WeWeb.

## Structure des données

### Étapes (steps)

Chaque étape doit contenir :

```javascript
{
  id: 'step-1',                    // Identifiant unique
  ordre: 1,                         // Ordre d'affichage
  titre: 'Titre de l\'étape',      // Titre affiché
  description: 'Description...',    // Description
  statut: 'terminee',              // 'terminee', 'en_cours', 'a_faire'
  typeEtape: 'rdv',                // 'rdv', 'test', ou 'etape'

  // Pour les RDV (typeEtape === 'rdv')
  modaliteRDV: 'distanciel',       // 'distanciel' ou 'presentiel'
  dateRDV: '15 déc. 2024',         // Date du RDV
  heureRDV: '10h00',               // Heure du RDV
  lienVisio: 'https://...',        // Lien visio (si distanciel)
  lieu: '15 rue...',               // Lieu (si presentiel)

  // Pour les ressources/tests
  resource: {
    nom: 'Guide.pdf',              // Nom de la ressource
    type: 'pdf',                   // Type: 'pdf', 'video', 'test'
    duree: '20 min',               // Durée (optionnel)
    testCount: 3,                  // Nombre de tests (pour type='test')
  },

  completedAt: '20/10/2023',       // Date de complétion (optionnel)
}
```

## Events

Le composant émet les événements suivants :

- **step-toggle-complete** : Quand l'utilisateur clique sur la checkbox
  - `stepId`: ID de l'étape
  - `status`: Nouveau statut ('terminee' ou 'a_faire')

- **step-click** : Quand l'utilisateur clique sur une étape
  - `stepId`: ID de l'étape
  - `step`: Objet étape complet

- **join-visio** : Quand l'utilisateur clique sur "Rejoindre la visio"
  - `stepId`: ID de l'étape
  - `lienVisio`: URL de la visioconférence

- **resource-click** : Quand l'utilisateur clique sur une ressource
  - `stepId`: ID de l'étape
  - `resource`: Objet ressource

- **test-start** : Quand l'utilisateur clique sur "Commencer le test"
  - `stepId`: ID de l'étape
  - `resource`: Objet ressource du test

## Configuration

### Affichage

- `showHeader`: Afficher l'en-tête (par défaut: true)
- `showProgressBar`: Afficher la barre de progression (par défaut: true)
- `showStats`: Afficher les statistiques (par défaut: true)
- `showInstructions`: Afficher les instructions (par défaut: true)
- `showCompleteButton`: Afficher le bouton terminer (par défaut: true)

### Labels personnalisables

- `headerTitle`: Titre de l'en-tête (par défaut: "Votre parcours")
- `rdvBadgeText`: Texte du badge RDV (par défaut: "Rendez-vous")
- `resourceBadgeText`: Texte du badge ressource (par défaut: "Ressource")
- `testBadgeText`: Texte du badge test (par défaut: "Test")
- `joinVisioText`: Texte du bouton visio (par défaut: "Rejoindre la visio")
- `startTestText`: Texte du bouton test (par défaut: "COMMENCER LE TEST")
- `openResourceText`: Texte du bouton ressource (par défaut: "Consulter la ressource")
- `presentielText`: Texte présentiel (par défaut: "Présentiel")
- `distancielText`: Texte distanciel (par défaut: "Visioconférence")

### Couleurs

- `primaryColor`: Couleur principale (par défaut: #3b82f6)
- `secondaryColor`: Couleur secondaire (par défaut: #8b5cf6)
- `completedColor`: Couleur des étapes terminées (par défaut: #22c55e)
- `inProgressColor`: Couleur en cours (par défaut: #3b82f6)
- `cardBorderRadius`: Rayon des bordures (par défaut: 16px)

## Fonctionnalités

### Checkbox interactive

- Les étapes normales et RDV peuvent être marquées comme terminées en cliquant sur la checkbox
- Les tests ne peuvent PAS être marqués manuellement (la checkbox est désactivée)
- Les tests sont marqués automatiquement comme terminés quand l'utilisateur clique sur "Commencer le test"

### Messages d'encouragement

Le composant affiche des messages adaptatifs :
- "Continuez, vous progressez bien !" (début du parcours)
- "Dernière ligne droite ! Complétez le test pour finaliser." (avant-dernière étape)
- "Parcours terminé ! Vos résultats arrivent bientôt." (toutes les étapes terminées)

### Carte de félicitations

Quand toutes les étapes sont terminées, une carte de félicitations s'affiche avec :
- Icône trophée
- Message de félicitations personnalisé

## Développement

Pour tester en local :

```bash
npm run serve
```

Le composant sera accessible sur http://localhost:8082
