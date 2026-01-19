export default {
  editor: {
    label: {
      en: 'Parcours Beneficiaire',
      fr: 'Parcours Bénéficiaire',
    },
    icon: 'timeline',
  },
  triggerEvents: [
    {
      name: 'step-click',
      label: { en: 'On step click', fr: 'Clic sur étape' },
      event: { stepId: '', step: {} },
    },
    {
      name: 'step-status-change',
      label: { en: 'On step status change', fr: 'Changement statut étape' },
      event: { stepId: '', completed: true, message: '' },
    },
    {
      name: 'resource-click',
      label: { en: 'On resource click', fr: 'Clic sur ressource' },
      event: {
        stepId: '',
        resource: {
          id: '',
          name: '',
          type: '',
          file_path: '',
          url: '',
        },
      },
    },
    {
      name: 'rdv-click',
      label: { en: 'On RDV click', fr: 'Clic sur RDV' },
      event: {
        stepId: '',
        rdv: {
          date: '',
          heure: '',
          modalite: '',
          lieu: '',
          lienVisio: '',
        },
      },
    },
    {
      name: 'join-visio',
      label: { en: 'On join visio', fr: 'Rejoindre visio' },
      event: {
        stepId: '',
        lienVisio: '',
      },
    },
    {
      name: 'test-start',
      label: { en: 'On test start', fr: 'Démarrer test' },
      event: {
        stepId: '',
        resource: {},
      },
    },
  ],
  properties: {
    // ===== BENEFICIARY INFO =====
    beneficiaireName: {
      label: { en: 'Beneficiary Name', fr: 'Nom du bénéficiaire' },
      type: 'Text',
      section: 'settings',
      defaultValue: '',
      bindable: true,
    },
    parcoursType: {
      label: { en: 'Course Type', fr: 'Type de parcours' },
      type: 'Text',
      section: 'settings',
      defaultValue: 'Bilan de compétences',
      bindable: true,
    },

    // ===== STEPS DATA =====
    steps: {
      label: { en: 'Steps', fr: 'Étapes' },
      type: 'Array',
      section: 'settings',
      bindable: true,
      defaultValue: [
        {
          id: 'step-1',
          ordre: 1,
          titre: 'Rendez-vous de lancement',
          description: 'Première séance en visio pour définir vos objectifs.',
          statut: 'terminee',
          typeEtape: 'rdv',
          modaliteRDV: 'distanciel',
          dateRDV: '20/10/2023',
          heureRDV: '10:00',
          lienVisio: 'https://meet.google.com/abc-defg-hij',
          completedAt: '20/10/2023',
        },
        {
          id: 'step-2',
          ordre: 2,
          titre: 'Consulter le guide des métiers',
          description: 'Découvrez les différents secteurs professionnels.',
          statut: 'terminee',
          typeEtape: 'etape',
          resource: {
            type: 'document',
            nom: 'Guide des métiers 2024',
            duree: '15 min',
          },
          completedAt: '25/10/2023',
        },
        {
          id: 'step-3',
          ordre: 3,
          titre: 'Passer le test RIASEC',
          description: 'Identifiez vos intérêts professionnels.',
          statut: 'en_cours',
          typeEtape: 'etape',
          resource: {
            type: 'test',
            nom: 'Test RIASEC',
            duree: '20 min',
          },
          instructions: 'Répondez spontanément sans trop réfléchir.',
        },
        {
          id: 'step-4',
          ordre: 4,
          titre: 'Rendez-vous de suivi',
          description: 'Point d\'avancement sur votre parcours.',
          statut: 'a_faire',
          typeEtape: 'rdv',
          modaliteRDV: 'distanciel',
          dateRDV: '15/11/2023',
          heureRDV: '14:00',
          lienVisio: 'https://meet.google.com/xyz-uvwx-rst',
        },
      ],
      options: {
        expandable: true,
        getItemLabel(item, index) {
          return item?.titre || item?.title || `Étape ${index + 1}`;
        },
      },
    },

    // ===== FIELD MAPPINGS =====
    stepsIdFormula: {
      label: { en: 'ID Field', fr: 'Champ ID' },
      type: 'Formula',
      section: 'settings',
      options: (content) => ({
        template: Array.isArray(content?.steps) && content.steps.length > 0 ? content.steps[0] : null,
      }),
      defaultValue: { type: 'f', code: "context.mapping?.['id']" },
      hidden: (content, sidepanelContent, boundProps) => !boundProps?.steps,
    },
    stepsTitleFormula: {
      label: { en: 'Title Field', fr: 'Champ Titre' },
      type: 'Formula',
      section: 'settings',
      options: (content) => ({
        template: Array.isArray(content?.steps) && content.steps.length > 0 ? content.steps[0] : null,
      }),
      defaultValue: { type: 'f', code: "context.mapping?.['titre']" },
      hidden: (content, sidepanelContent, boundProps) => !boundProps?.steps,
    },
    stepsDescriptionFormula: {
      label: { en: 'Description Field', fr: 'Champ Description' },
      type: 'Formula',
      section: 'settings',
      options: (content) => ({
        template: Array.isArray(content?.steps) && content.steps.length > 0 ? content.steps[0] : null,
      }),
      defaultValue: { type: 'f', code: "context.mapping?.['description']" },
      hidden: (content, sidepanelContent, boundProps) => !boundProps?.steps,
    },
    stepsOrderFormula: {
      label: { en: 'Order Field', fr: 'Champ Ordre' },
      type: 'Formula',
      section: 'settings',
      options: (content) => ({
        template: Array.isArray(content?.steps) && content.steps.length > 0 ? content.steps[0] : null,
      }),
      defaultValue: { type: 'f', code: "context.mapping?.['ordre']" },
      hidden: (content, sidepanelContent, boundProps) => !boundProps?.steps,
    },
    stepsStatusFormula: {
      label: { en: 'Status Field', fr: 'Champ Statut' },
      type: 'Formula',
      section: 'settings',
      options: (content) => ({
        template: Array.isArray(content?.steps) && content.steps.length > 0 ? content.steps[0] : null,
      }),
      defaultValue: { type: 'f', code: "context.mapping?.['statut']" },
      hidden: (content, sidepanelContent, boundProps) => !boundProps?.steps,
    },
    stepsTypeFormula: {
      label: { en: 'Step Type Field', fr: 'Champ Type Étape' },
      type: 'Formula',
      section: 'settings',
      options: (content) => ({
        template: Array.isArray(content?.steps) && content.steps.length > 0 ? content.steps[0] : null,
      }),
      defaultValue: { type: 'f', code: "context.mapping?.['typeEtape']" },
      hidden: (content, sidepanelContent, boundProps) => !boundProps?.steps,
    },
    stepsResourceFormula: {
      label: { en: 'Resource Field', fr: 'Champ Ressource' },
      type: 'Formula',
      section: 'settings',
      options: (content) => ({
        template: Array.isArray(content?.steps) && content.steps.length > 0 ? content.steps[0] : null,
      }),
      defaultValue: { type: 'f', code: "context.mapping?.['resource']" },
      hidden: (content, sidepanelContent, boundProps) => !boundProps?.steps,
    },
    stepsInstructionsFormula: {
      label: { en: 'Instructions Field', fr: 'Champ Instructions' },
      type: 'Formula',
      section: 'settings',
      options: (content) => ({
        template: Array.isArray(content?.steps) && content.steps.length > 0 ? content.steps[0] : null,
      }),
      defaultValue: { type: 'f', code: "context.mapping?.['instructions']" },
      hidden: (content, sidepanelContent, boundProps) => !boundProps?.steps,
    },
    stepsCompletedAtFormula: {
      label: { en: 'Completed At Field', fr: 'Champ Date Complétion' },
      type: 'Formula',
      section: 'settings',
      options: (content) => ({
        template: Array.isArray(content?.steps) && content.steps.length > 0 ? content.steps[0] : null,
      }),
      defaultValue: { type: 'f', code: "context.mapping?.['completedAt']" },
      hidden: (content, sidepanelContent, boundProps) => !boundProps?.steps,
    },
    // RDV Fields
    stepsModaliteRdvFormula: {
      label: { en: 'RDV Mode Field', fr: 'Champ Modalité RDV' },
      type: 'Formula',
      section: 'settings',
      options: (content) => ({
        template: Array.isArray(content?.steps) && content.steps.length > 0 ? content.steps[0] : null,
      }),
      defaultValue: { type: 'f', code: "context.mapping?.['modaliteRDV']" },
      hidden: (content, sidepanelContent, boundProps) => !boundProps?.steps,
    },
    stepsDateRdvFormula: {
      label: { en: 'RDV Date Field', fr: 'Champ Date RDV' },
      type: 'Formula',
      section: 'settings',
      options: (content) => ({
        template: Array.isArray(content?.steps) && content.steps.length > 0 ? content.steps[0] : null,
      }),
      defaultValue: { type: 'f', code: "context.mapping?.['dateRDV']" },
      hidden: (content, sidepanelContent, boundProps) => !boundProps?.steps,
    },
    stepsHeureRdvFormula: {
      label: { en: 'RDV Time Field', fr: 'Champ Heure RDV' },
      type: 'Formula',
      section: 'settings',
      options: (content) => ({
        template: Array.isArray(content?.steps) && content.steps.length > 0 ? content.steps[0] : null,
      }),
      defaultValue: { type: 'f', code: "context.mapping?.['heureRDV']" },
      hidden: (content, sidepanelContent, boundProps) => !boundProps?.steps,
    },
    stepsLieuFormula: {
      label: { en: 'Location Field', fr: 'Champ Lieu' },
      type: 'Formula',
      section: 'settings',
      options: (content) => ({
        template: Array.isArray(content?.steps) && content.steps.length > 0 ? content.steps[0] : null,
      }),
      defaultValue: { type: 'f', code: "context.mapping?.['lieu']" },
      hidden: (content, sidepanelContent, boundProps) => !boundProps?.steps,
    },
    stepsLienVisioFormula: {
      label: { en: 'Visio Link Field', fr: 'Champ Lien Visio' },
      type: 'Formula',
      section: 'settings',
      options: (content) => ({
        template: Array.isArray(content?.steps) && content.steps.length > 0 ? content.steps[0] : null,
      }),
      defaultValue: { type: 'f', code: "context.mapping?.['lienVisio']" },
      hidden: (content, sidepanelContent, boundProps) => !boundProps?.steps,
    },

    // ===== DISPLAY OPTIONS =====
    showHeader: {
      label: { en: 'Show Header', fr: 'Afficher en-tête' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true,
    },
    showProgressBar: {
      label: { en: 'Show Progress Bar', fr: 'Afficher barre de progression' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true,
    },
    showStats: {
      label: { en: 'Show Stats', fr: 'Afficher statistiques' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true,
    },
    showInstructions: {
      label: { en: 'Show Instructions', fr: 'Afficher instructions' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true,
    },
    showCompleteButton: {
      label: { en: 'Show Complete Button', fr: 'Afficher bouton terminer' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true,
    },

    // ===== LABELS =====
    headerTitle: {
      label: { en: 'Header Title', fr: 'Titre en-tête' },
      type: 'Text',
      section: 'settings',
      defaultValue: 'Mon Parcours',
      bindable: true,
    },
    completedLabel: {
      label: { en: 'Completed Label', fr: 'Label Complétées' },
      type: 'Text',
      section: 'settings',
      defaultValue: 'Complétées',
      bindable: true,
    },
    inProgressLabel: {
      label: { en: 'In Progress Label', fr: 'Label En cours' },
      type: 'Text',
      section: 'settings',
      defaultValue: 'En cours',
      bindable: true,
    },
    todoLabel: {
      label: { en: 'To Do Label', fr: 'Label À venir' },
      type: 'Text',
      section: 'settings',
      defaultValue: 'À venir',
      bindable: true,
    },
    progressLabel: {
      label: { en: 'Progress Label', fr: 'Label Progression' },
      type: 'Text',
      section: 'settings',
      defaultValue: 'Progression globale',
      bindable: true,
    },
    completeButtonText: {
      label: { en: 'Complete Button Text', fr: 'Texte bouton terminer' },
      type: 'Text',
      section: 'settings',
      defaultValue: 'Marquer comme complété',
      bindable: true,
    },
    rdvBadgeText: {
      label: { en: 'RDV Badge Text', fr: 'Texte badge RDV' },
      type: 'Text',
      section: 'settings',
      defaultValue: 'Rendez-vous',
      bindable: true,
    },
    presentielText: {
      label: { en: 'On-site Text', fr: 'Texte Présentiel' },
      type: 'Text',
      section: 'settings',
      defaultValue: 'Présentiel',
      bindable: true,
    },
    distancielText: {
      label: { en: 'Remote Text', fr: 'Texte Distanciel' },
      type: 'Text',
      section: 'settings',
      defaultValue: 'Visioconférence',
      bindable: true,
    },
    openResourceText: {
      label: { en: 'Open Resource Text', fr: 'Texte Ouvrir ressource' },
      type: 'Text',
      section: 'settings',
      defaultValue: 'Ouvrir',
      bindable: true,
    },
    startTestText: {
      label: { en: 'Start Test Text', fr: 'Texte Démarrer test' },
      type: 'Text',
      section: 'settings',
      defaultValue: 'Démarrer',
      bindable: true,
    },
    joinVisioText: {
      label: { en: 'Join Visio Text', fr: 'Texte Rejoindre visio' },
      type: 'Text',
      section: 'settings',
      defaultValue: 'Rejoindre la visio',
      bindable: true,
    },

    // ===== STYLING =====
    primaryColor: {
      label: { en: 'Primary Color', fr: 'Couleur principale' },
      type: 'Color',
      section: 'style',
      defaultValue: '#3b82f6',
      bindable: true,
    },
    secondaryColor: {
      label: { en: 'Secondary Color', fr: 'Couleur secondaire' },
      type: 'Color',
      section: 'style',
      defaultValue: '#8b5cf6',
      bindable: true,
    },
    completedColor: {
      label: { en: 'Completed Color', fr: 'Couleur terminé' },
      type: 'Color',
      section: 'style',
      defaultValue: '#22c55e',
      bindable: true,
    },
    inProgressColor: {
      label: { en: 'In Progress Color', fr: 'Couleur en cours' },
      type: 'Color',
      section: 'style',
      defaultValue: '#3b82f6',
      bindable: true,
    },
    cardBorderRadius: {
      label: { en: 'Card Border Radius', fr: 'Rayon bordure carte' },
      type: 'Length',
      section: 'style',
      defaultValue: '16px',
      bindable: true,
    },
  },
};
