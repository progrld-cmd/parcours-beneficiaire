<template>
  <div class="parcours-beneficiaire" :style="cssVariables">
    <!-- Header avec progression simplifiée -->
    <div class="header-card">
      <div class="header-top">
        <h1 class="header-title">{{ content?.headerTitle || 'Votre parcours' }}</h1>
        <span class="steps-counter">{{ stats.completed }}/{{ stats.total }} étapes</span>
      </div>

      <!-- Progress Bar -->
      <div class="progress-bar-wrapper">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </div>

      <!-- Message d'encouragement -->
      <p class="encouragement-message">
        <span v-if="stats.completed === stats.total && stats.total > 0">
          ✅ <strong>Parcours terminé !</strong> Vos résultats arrivent bientôt.
        </span>
        <span v-else-if="stats.completed === stats.total - 1">
          🎯 <strong>Dernière ligne droite !</strong> Complétez le test pour finaliser.
        </span>
        <span v-else>
          💪 Continuez, vous progressez bien !
        </span>
      </p>
    </div>

    <!-- Empty State -->
    <div v-if="!processedSteps?.length" class="empty-state">
      Aucune étape dans ce parcours
    </div>

    <!-- Steps Cards -->
    <div v-else class="steps-container">
      <div
        v-for="(step, index) in processedSteps"
        :key="step.id"
        class="step-card"
        :class="getCardClass(step)"
      >
        <div class="step-content">
          <!-- Left: Checkbox -->
          <div class="step-checkbox-wrapper">
            <button
              class="step-checkbox"
              :class="{ 'is-checked': step.status === 'terminee', 'is-test': step.typeEtape === 'test' }"
              @click="handleToggleComplete(step)"
              :disabled="step.typeEtape === 'test'"
            >
              <svg v-if="step.status === 'terminee'" viewBox="0 0 24 24" fill="currentColor" class="check-icon">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </button>
          </div>

          <!-- Icon + Main Content -->
          <div class="step-icon-wrapper">
            <div class="step-icon" :class="getIconClass(step)">
              {{ getStepEmoji(step) }}
            </div>
          </div>

          <div class="step-main">
            <!-- Tags + Status -->
            <div class="step-tags">
              <span class="step-tag" :class="getTagClass(step)">
                {{ getStepTagLabel(step) }}
              </span>
              <span class="step-number">Étape {{ step.order }}</span>

              <span v-if="step.status === 'terminee'" class="completed-badge">
                <svg viewBox="0 0 24 24" fill="currentColor" class="badge-icon">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Terminé
              </span>
            </div>

            <!-- Title & Description -->
            <h3 class="step-title">{{ step.title }}</h3>
            <p v-if="step.description" class="step-description">{{ step.description }}</p>

            <!-- RDV Details -->
            <div v-if="step.typeEtape === 'rdv'" class="step-details">
              <div class="rdv-info-box">
                <div class="rdv-info-row">
                  <svg viewBox="0 0 24 24" fill="currentColor" class="info-icon">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                  </svg>
                  <span>{{ step.dateRDV }}</span>
                </div>
                <div class="rdv-info-row">
                  <svg viewBox="0 0 24 24" fill="currentColor" class="info-icon">
                    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                  </svg>
                  <span>{{ step.modaliteRDV === 'distanciel' ? (content?.distancielText || 'Visioconférence') : (content?.presentielText || 'Présentiel') }}</span>
                </div>
              </div>

              <button
                v-if="step.modaliteRDV === 'distanciel' && step.lienVisio"
                class="action-btn action-btn-primary"
                @click.stop="handleJoinVisio(step)"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" class="btn-icon">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                </svg>
                {{ content?.joinVisioText || 'Rejoindre la visio' }}
              </button>
            </div>

            <!-- Resource -->
            <div v-if="step.resource && step.typeEtape !== 'rdv'" class="step-details">
              <div
                class="resource-box"
                @click.stop="handleResourceClick(step)"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" class="resource-doc-icon">
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                </svg>
                <span class="resource-name">{{ getResourceName(step.resource) }}</span>
                <svg viewBox="0 0 24 24" fill="currentColor" class="chevron-icon">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                </svg>
              </div>

              <button
                v-if="step.resource.type === 'test'"
                class="action-btn action-btn-test"
                @click.stop="handleResourceClick(step)"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" class="btn-icon">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                {{ content?.startTestText || 'COMMENCER LE TEST' }}
                <svg viewBox="0 0 24 24" fill="currentColor" class="btn-icon-right">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                </svg>
              </button>
              <button
                v-else
                class="action-btn action-btn-secondary"
                @click.stop="handleResourceClick(step)"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" class="btn-icon">
                  <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                </svg>
                {{ content?.openResourceText || 'Consulter la ressource' }}
              </button>
            </div>

            <!-- Test Info -->
            <div v-if="step.typeEtape === 'test' && step.status !== 'terminee'" class="test-info">
              <div class="test-info-item">
                <svg viewBox="0 0 24 24" fill="currentColor" class="test-icon">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
                <span>{{ step.resource?.duree || '20 min' }}</span>
              </div>
              <div class="test-info-item">
                <svg viewBox="0 0 24 24" fill="currentColor" class="test-icon">
                  <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                </svg>
                <span>{{ step.resource?.testCount || '3' }} tests</span>
              </div>
              <div class="test-info-item">
                <svg viewBox="0 0 24 24" fill="currentColor" class="test-icon">
                  <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                </svg>
                <span>Résultats immédiats</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Congratulations Final -->
    <div
      v-if="stats.completed === stats.total && stats.total > 0"
      class="congratulations-card"
    >
      <div class="congrats-icon-wrapper">
        <span class="congrats-emoji">🏆</span>
      </div>
      <div class="congrats-content">
        <h3 class="congrats-title">Félicitations !</h3>
        <p class="congrats-text">
          Votre portrait professionnel est en cours de préparation.
          Nous vous contacterons très bientôt avec vos recommandations personnalisées.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  props: {
    uid: { type: String, required: true },
    content: { type: Object, required: true },
  },
  emits: ['trigger-event'],
  setup(props, { emit }) {
    // Helper: Get nested value
    const getNestedValue = (obj, path) => {
      if (!obj || !path) return undefined;
      const keys = String(path).split('.');
      let value = obj;
      for (const key of keys) {
        if (value == null) return undefined;
        value = value[key];
      }
      return value;
    };

    // Normalize resource
    const normalizeResource = (resource) => {
      if (!resource) return null;
      if (typeof resource === 'object') return resource;
      return null;
    };

    // Process steps
    const processedSteps = computed(() => {
      const rawSteps = props.content?.steps;
      if (!Array.isArray(rawSteps) || !rawSteps.length) return [];

      return rawSteps.map((item, index) => {
        const id = item?.id ?? `step-${index}`;
        const title = item?.titre ?? item?.title ?? 'Sans titre';
        const description = item?.description ?? '';
        const order = item?.ordre ?? item?.order ?? (index + 1);
        const status = item?.statut ?? item?.status ?? 'a_faire';
        const typeEtape = item?.typeEtape ?? item?.type_etape ?? 'etape';
        const resource = normalizeResource(item?.resource ?? item?.ressource);
        const instructions = item?.instructions ?? null;
        const completedAt = item?.completedAt ?? item?.completed_at ?? null;

        // RDV fields
        const modaliteRDV = item?.modaliteRDV ?? item?.modalite_rdv ?? item?.modalite ?? null;
        const dateRDV = item?.dateRDV ?? item?.date_rdv ?? null;
        const heureRDV = item?.heureRDV ?? item?.heure_rdv ?? null;
        const lieu = item?.lieu ?? item?.location ?? null;
        const lienVisio = item?.lienVisio ?? item?.lien_visio ?? null;

        return {
          id: String(id),
          title: String(title),
          description: String(description),
          order: Number(order) || (index + 1),
          status: String(status),
          typeEtape: String(typeEtape),
          resource,
          instructions,
          completedAt,
          modaliteRDV,
          dateRDV,
          heureRDV,
          lieu,
          lienVisio,
          originalItem: item,
        };
      }).sort((a, b) => a.order - b.order);
    });

    // Stats
    const stats = computed(() => {
      const steps = processedSteps.value;
      return {
        total: steps.length,
        completed: steps.filter(s => s.status === 'terminee').length,
        inProgress: steps.filter(s => s.status === 'en_cours').length,
        todo: steps.filter(s => s.status === 'a_faire').length,
      };
    });

    // Progress percent
    const progressPercent = computed(() => {
      if (stats.value.total === 0) return 0;
      return Math.round((stats.value.completed / stats.value.total) * 100);
    });

    // Get status class
    const getStatusClass = (status) => {
      switch (status) {
        case 'terminee': return 'status-completed';
        case 'en_cours': return 'status-in-progress';
        default: return 'status-todo';
      }
    };

    // Get card class
    const getCardClass = (step) => {
      const classes = [];
      if (step.status === 'terminee') classes.push('card-completed');
      else if (step.status === 'en_cours') classes.push('card-in-progress');
      if (step.typeEtape === 'rdv' || step.resource) classes.push('card-clickable');
      return classes.join(' ');
    };

    // Resource helpers
    const getResourceName = (resource) => {
      if (!resource) return '';
      return resource?.nom ?? resource?.name ?? 'Ressource';
    };

    const getResourceType = (resource) => {
      if (!resource) return '';
      const type = resource?.type ?? resource?.format ?? '';
      return String(type).toUpperCase();
    };

    // Get step emoji based on type
    const getStepEmoji = (step) => {
      if (step.typeEtape === 'rdv') return '🗓️';
      if (step.typeEtape === 'test' || step.resource?.type === 'test') return '🧠';
      if (step.resource) return '📋';
      return '📝';
    };

    // Get icon background class
    const getIconClass = (step) => {
      if (step.typeEtape === 'rdv') return 'icon-blue';
      if (step.typeEtape === 'test' || step.resource?.type === 'test') return 'icon-red';
      if (step.resource) return 'icon-yellow';
      return 'icon-gray';
    };

    // Get tag label
    const getStepTagLabel = (step) => {
      if (step.typeEtape === 'rdv') return content.value?.rdvBadgeText || 'Rendez-vous';
      if (step.typeEtape === 'test' || step.resource?.type === 'test') return content.value?.testBadgeText || 'Test';
      if (step.resource) return content.value?.resourceBadgeText || 'Ressource';
      return 'Étape';
    };

    // Get tag color class
    const getTagClass = (step) => {
      if (step.typeEtape === 'rdv') return 'tag-blue';
      if (step.typeEtape === 'test' || step.resource?.type === 'test') return 'tag-red';
      if (step.resource) return 'tag-yellow';
      return 'tag-gray';
    };

    // Handlers
    const handleStepClick = (step) => {
      emit('trigger-event', {
        name: 'step-click',
        event: { stepId: step.id, step: step.originalItem },
      });
    };

    const handleToggleComplete = (step) => {
      // Tests cannot be toggled manually
      if (step.typeEtape === 'test') return;

      const newStatus = step.status === 'terminee' ? 'a_faire' : 'terminee';
      emit('trigger-event', {
        name: 'step-toggle-complete',
        event: { stepId: step.id, status: newStatus },
      });
    };

    const handleComplete = (step) => {
      emit('trigger-event', {
        name: 'step-complete',
        event: { stepId: step.id, completed: true },
      });
    };

    const handleResourceClick = (step) => {
      const resource = step.resource;
      if (resource?.type === 'test') {
        emit('trigger-event', {
          name: 'test-start',
          event: { stepId: step.id, resource },
        });
      } else {
        emit('trigger-event', {
          name: 'resource-click',
          event: {
            stepId: step.id,
            resource: {
              id: resource?.id ?? null,
              name: resource?.nom ?? resource?.name ?? null,
              type: resource?.type ?? null,
              file_path: resource?.file_path ?? null,
              url: resource?.url ?? null,
            },
          },
        });
      }
    };

    const handleJoinVisio = (step) => {
      emit('trigger-event', {
        name: 'join-visio',
        event: { stepId: step.id, lienVisio: step.lienVisio },
      });
    };

    // CSS Variables
    const cssVariables = computed(() => ({
      '--primary-color': props.content?.primaryColor || '#3b82f6',
      '--secondary-color': props.content?.secondaryColor || '#8b5cf6',
      '--completed-color': props.content?.completedColor || '#22c55e',
      '--in-progress-color': props.content?.inProgressColor || '#3b82f6',
      '--card-radius': props.content?.cardBorderRadius || '16px',
    }));

    return {
      processedSteps,
      stats,
      progressPercent,
      cssVariables,
      getStatusClass,
      getCardClass,
      getResourceName,
      getResourceType,
      getStepEmoji,
      getIconClass,
      getStepTagLabel,
      getTagClass,
      handleStepClick,
      handleToggleComplete,
      handleComplete,
      handleResourceClick,
      handleJoinVisio,
    };
  },
};
</script>

<style lang="scss" scoped>
.parcours-beneficiaire {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(160deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
  min-height: 100vh;
}

/* Header Card */
.header-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.01em;
}

.steps-counter {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
}

/* Progress Bar */
.progress-bar-wrapper {
  margin-bottom: 16px;
}

.progress-bar {
  height: 8px;
  background: #f1f5f9;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(to right, #10b981, #059669);
  border-radius: 9999px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Encouragement Message */
.encouragement-message {
  font-size: 14px;
  color: #475569;
  margin: 0;
  line-height: 1.5;

  strong {
    font-weight: 700;
  }
}

/* Steps Container */
.steps-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Step Card */
.step-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 1;

  &.card-completed {
    border-color: #10b981;
    background: rgba(240, 253, 244, 0.5);
    opacity: 0.8;
  }

  &.card-in-progress {
    border: 2px solid #3b82f6;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
  }
}

.step-content {
  display: flex;
  gap: 16px;
  padding: 16px;
}

/* Checkbox */
.step-checkbox-wrapper {
  flex-shrink: 0;
  padding-top: 2px;
}

.step-checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid #cbd5e1;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;

  &:hover:not(:disabled) {
    border-color: #10b981;
    background: #f0fdf4;
  }

  &.is-checked {
    background: #10b981;
    border-color: #10b981;
  }

  &.is-test {
    cursor: not-allowed;

    &:not(.is-checked) {
      background: #f1f5f9;
      border-color: #e2e8f0;
    }
  }

  &:disabled {
    cursor: not-allowed;
  }

  .check-icon {
    width: 16px;
    height: 16px;
    color: white;
  }
}

/* Icon */
.step-icon-wrapper {
  flex-shrink: 0;
}

.step-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;

  &.icon-blue {
    background: #dbeafe;
  }

  &.icon-yellow {
    background: #fef3c7;
  }

  &.icon-red {
    background: #fce7f3;
  }

  &.icon-gray {
    background: #f1f5f9;
  }
}

/* Main Content */
.step-main {
  flex: 1;
  min-width: 0;
}

/* Tags */
.step-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.step-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid;

  &.tag-blue {
    background: #dbeafe;
    color: #1e40af;
    border-color: #93c5fd;
  }

  &.tag-yellow {
    background: #fef3c7;
    color: #92400e;
    border-color: #fde047;
  }

  &.tag-red {
    background: #fce7f3;
    color: #9f1239;
    border-color: #f9a8d4;
  }
}

.step-number {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

.completed-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  color: #10b981;
  font-size: 12px;
  font-weight: 600;

  .badge-icon {
    width: 14px;
    height: 14px;
  }
}

/* Title & Description */
.step-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px;
  letter-spacing: -0.01em;
  line-height: 1.4;

  .card-completed & {
    color: #64748b;
  }
}

.step-description {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 16px;
  line-height: 1.5;

  .card-completed & {
    color: #94a3b8;
  }
}

/* Step Details */
.step-details {
  margin-top: 16px;
}

/* RDV Info Box */
.rdv-info-box {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  gap: 16px;
}

.rdv-info-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #1e40af;

  .info-icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
}

/* Resource Box */
.resource-box {
  background: #fef3c7;
  border: 1px solid #fde047;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #fef08a;
  }

  .resource-doc-icon {
    width: 32px;
    height: 32px;
    color: #92400e;
    flex-shrink: 0;
  }

  .resource-name {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
    color: #78350f;
  }

  .chevron-icon {
    width: 20px;
    height: 20px;
    color: #ca8a04;
    flex-shrink: 0;
  }
}

/* Test Info */
.test-info {
  display: flex;
  gap: 16px;
  margin-top: 16px;
  font-size: 14px;
  color: #64748b;
}

.test-info-item {
  display: flex;
  align-items: center;
  gap: 6px;

  .test-icon {
    width: 14px;
    height: 14px;
  }
}

/* Action Buttons */
.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;

  .btn-icon {
    width: 16px;
    height: 16px;
  }

  .btn-icon-right {
    width: 16px;
    height: 16px;
  }
}

.action-btn-primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }
}

.action-btn-secondary {
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;

  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }
}

.action-btn-test {
  background: linear-gradient(135deg, #ec4899, #db2777);
  color: white;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(236, 72, 153, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}

/* Congratulations Card */
.congratulations-card {
  margin-top: 24px;
  padding: 24px;
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  border: 1px solid #6ee7b7;
  border-radius: 12px;
  display: flex;
  gap: 16px;
}

.congrats-icon-wrapper {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);

  .congrats-emoji {
    font-size: 24px;
  }
}

.congrats-content {
  flex: 1;
}

.congrats-title {
  font-size: 16px;
  font-weight: 700;
  color: #065f46;
  margin: 0 0 4px;
}

.congrats-text {
  font-size: 14px;
  color: #047857;
  margin: 0;
  line-height: 1.5;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: #64748b;
  background: white;
  border: 2px dashed #e2e8f0;
  border-radius: 8px;
}

/* Responsive */
@media (max-width: 640px) {
  .parcours-beneficiaire {
    padding: 12px;
  }

  .header-card {
    padding: 20px;
  }

  .header-title {
    font-size: 18px;
  }

  .step-content {
    gap: 12px;
    padding: 12px;
  }

  .step-icon {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }

  .rdv-info-box {
    flex-direction: column;
    gap: 8px;
  }

  .test-info {
    flex-direction: column;
    gap: 8px;
  }

  .congratulations-card {
    flex-direction: column;
    text-align: center;
  }

  .congrats-icon-wrapper {
    margin: 0 auto;
  }
}
</style>
