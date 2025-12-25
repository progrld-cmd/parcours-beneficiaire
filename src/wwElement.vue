<template>
  <div class="parcours-beneficiaire" :style="cssVariables">
    <!-- Header -->
    <div v-if="content?.showHeader !== false" class="header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="header-title">{{ content?.headerTitle || 'Mon Parcours' }}</h1>
          <p v-if="content?.parcoursType" class="header-subtitle">{{ content?.parcoursType }}</p>
        </div>

        <!-- Stats -->
        <div v-if="content?.showStats !== false" class="header-stats">
          <div class="stat-item stat-completed">
            <div class="stat-value">{{ stats.completed }}</div>
            <div class="stat-label">{{ content?.completedLabel || 'Complétées' }}</div>
          </div>
          <div class="stat-item stat-in-progress">
            <div class="stat-value">{{ stats.inProgress }}</div>
            <div class="stat-label">{{ content?.inProgressLabel || 'En cours' }}</div>
          </div>
          <div class="stat-item stat-todo">
            <div class="stat-value">{{ stats.todo }}</div>
            <div class="stat-label">{{ content?.todoLabel || 'À venir' }}</div>
          </div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div v-if="content?.showProgressBar !== false" class="progress-section">
        <div class="progress-header">
          <span class="progress-label">{{ content?.progressLabel || 'Progression globale' }}</span>
          <span class="progress-value">{{ progressPercent }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!processedSteps?.length" class="empty-state">
      Aucune étape dans ce parcours
    </div>

    <!-- Timeline -->
    <div v-else class="timeline-container">
      <div class="timeline-line"></div>

      <div
        v-for="(step, index) in processedSteps"
        :key="step.id"
        class="timeline-item"
      >
        <!-- Status Icon -->
        <div class="timeline-icon" :class="getStatusClass(step.status)">
          <svg v-if="step.status === 'terminee'" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <svg v-else-if="step.status === 'en_cours'" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" fill="currentColor" fill-opacity="0.2"/>
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>

        <!-- Card -->
        <div
          class="step-card"
          :class="getCardClass(step)"
          @click="handleStepClick(step)"
        >
          <!-- Order Badge -->
          <div class="order-badge">{{ step.order }}</div>

          <!-- RDV Badge -->
          <span v-if="step.typeEtape === 'rdv'" class="rdv-badge">
            <svg viewBox="0 0 24 24" fill="currentColor" class="rdv-icon">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
            </svg>
            {{ content?.rdvBadgeText || 'Rendez-vous' }}
          </span>

          <!-- Title & Description -->
          <div class="step-header">
            <h3 class="step-title">
              <span v-if="step.status === 'terminee'" class="completed-icon">✅</span>
              {{ step.title }}
            </h3>
            <p v-if="step.description" class="step-description">{{ step.description }}</p>
          </div>

          <!-- RDV Details -->
          <div v-if="step.typeEtape === 'rdv'" class="rdv-details">
            <div class="rdv-info-grid">
              <div class="rdv-info-item">
                <svg viewBox="0 0 24 24" fill="currentColor" class="info-icon">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
                </svg>
                <span>{{ step.dateRDV }}</span>
              </div>
              <div class="rdv-info-item">
                <svg viewBox="0 0 24 24" fill="currentColor" class="info-icon">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
                <span>{{ step.heureRDV }}</span>
              </div>
              <div class="rdv-info-item rdv-info-full">
                <span v-if="step.modaliteRDV === 'presentiel'" class="modalite-icon">🏢</span>
                <span v-else class="modalite-icon">💻</span>
                <span v-if="step.modaliteRDV === 'presentiel'">
                  {{ content?.presentielText || 'Présentiel' }}
                  <span v-if="step.lieu" class="lieu-text"> - {{ step.lieu }}</span>
                </span>
                <span v-else>{{ content?.distancielText || 'Visioconférence' }}</span>
              </div>
            </div>

            <!-- Join Visio Button -->
            <button
              v-if="step.modaliteRDV === 'distanciel' && step.lienVisio"
              class="join-visio-btn"
              @click.stop="handleJoinVisio(step)"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" class="btn-icon">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
              </svg>
              {{ content?.joinVisioText || 'Rejoindre la visio' }}
            </button>
          </div>

          <!-- Resource -->
          <div v-if="step.resource && step.typeEtape !== 'rdv'" class="resource-section">
            <button
              class="resource-card"
              @click.stop="handleResourceClick(step)"
            >
              <div class="resource-icon">
                <svg v-if="step.resource.type === 'video'" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                </svg>
                <svg v-else-if="step.resource.type === 'test'" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                </svg>
              </div>
              <div class="resource-info">
                <span class="resource-name">{{ getResourceName(step.resource) }}</span>
                <span class="resource-meta">
                  {{ getResourceType(step.resource) }}
                  <span v-if="step.resource.duree"> • {{ step.resource.duree }}</span>
                  <span v-if="step.resource.taille"> • {{ step.resource.taille }}</span>
                </span>
              </div>
              <span class="resource-action">
                <span v-if="step.resource.type === 'test'">
                  <svg viewBox="0 0 24 24" fill="currentColor" class="action-icon">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  {{ content?.startTestText || 'Démarrer' }}
                </span>
                <span v-else>
                  <svg viewBox="0 0 24 24" fill="currentColor" class="action-icon">
                    <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                  </svg>
                  {{ content?.openResourceText || 'Ouvrir' }}
                </span>
              </span>
            </button>
          </div>

          <!-- Instructions -->
          <div
            v-if="content?.showInstructions !== false && step.instructions"
            class="instructions-section"
          >
            <span class="instructions-icon">💡</span>
            <p class="instructions-text">{{ step.instructions }}</p>
          </div>

          <!-- Footer -->
          <div class="step-footer">
            <div class="status-badge" :class="getStatusClass(step.status)">
              <span v-if="step.status === 'terminee'">✅ Complété</span>
              <span v-else-if="step.status === 'en_cours'">🔄 En cours</span>
              <span v-else>⏳ À faire</span>
              <span v-if="step.completedAt" class="completed-date">le {{ step.completedAt }}</span>
            </div>

            <button
              v-if="content?.showCompleteButton !== false && step.status !== 'terminee'"
              class="complete-btn"
              @click.stop="handleComplete(step)"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" class="btn-icon">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              {{ content?.completeButtonText || 'Marquer comme complété' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Motivation Message -->
    <div
      v-if="stats.completed > 0 && stats.completed < stats.total"
      class="motivation-message"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" class="motivation-icon">
        <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
      </svg>
      <div>
        <h3 class="motivation-title">Excellent travail ! 🎉</h3>
        <p class="motivation-text">
          Vous avez complété <strong>{{ stats.completed }}</strong> étape{{ stats.completed > 1 ? 's' : '' }} sur {{ stats.total }}.
          Continuez sur cette lancée !
        </p>
      </div>
    </div>

    <!-- Congratulations -->
    <div
      v-if="stats.completed === stats.total && stats.total > 0"
      class="congratulations"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" class="congrats-icon">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      <h2 class="congrats-title">Félicitations ! 🎉</h2>
      <p class="congrats-text">
        Vous avez complété toutes les étapes de votre parcours. Bravo pour votre engagement !
      </p>
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

    // Handlers
    const handleStepClick = (step) => {
      emit('trigger-event', {
        name: 'step-click',
        event: { stepId: step.id, step: step.originalItem },
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
      handleStepClick,
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Header */
.header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 24px;
  margin-bottom: 24px;
  border-radius: var(--card-radius);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
}

.header-title {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.header-subtitle {
  color: #6b7280;
  margin: 4px 0 0;
}

.header-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
}

.stat-completed .stat-value { color: var(--completed-color); }
.stat-in-progress .stat-value { color: var(--in-progress-color); }
.stat-todo .stat-value { color: #9ca3af; }

/* Progress */
.progress-section {
  margin-top: 24px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.progress-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--primary-color);
}

.progress-bar {
  height: 12px;
  background: #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
  border-radius: 6px;
  transition: width 0.5s ease;
}

/* Timeline */
.timeline-container {
  position: relative;
  padding-left: 48px;
}

.timeline-line {
  position: absolute;
  left: 11px;
  top: 24px;
  bottom: 24px;
  width: 2px;
  background: linear-gradient(to bottom, #d1d5db, transparent);
}

.timeline-item {
  position: relative;
  margin-bottom: 24px;
}

.timeline-icon {
  position: absolute;
  left: -48px;
  top: 12px;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 24px;
    height: 24px;
  }

  &.status-completed { color: var(--completed-color); }
  &.status-in-progress { color: var(--in-progress-color); }
  &.status-todo { color: #d1d5db; }
}

/* Card */
.step-card {
  position: relative;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: var(--card-radius);
  padding: 24px;
  transition: all 0.2s ease;

  &.card-completed {
    background: #f0fdf4;
    border-color: #bbf7d0;
  }

  &.card-in-progress {
    background: #eff6ff;
    border-color: #93c5fd;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  }

  &.card-clickable {
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      border-color: var(--primary-color);
    }
  }
}

.order-badge {
  position: absolute;
  top: -12px;
  left: -12px;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.rdv-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;

  .rdv-icon {
    width: 14px;
    height: 14px;
  }
}

/* Step Header */
.step-header {
  margin-bottom: 16px;
  padding-right: 100px;
}

.step-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px;
  display: flex;
  align-items: center;
  gap: 8px;

  .completed-icon {
    font-size: 16px;
  }
}

.step-description {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

/* RDV Details */
.rdv-details {
  background: #dbeafe;
  border: 2px solid #93c5fd;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.rdv-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.rdv-info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #1e40af;

  &.rdv-info-full {
    grid-column: 1 / -1;
  }

  .info-icon {
    width: 16px;
    height: 16px;
    color: #3b82f6;
  }

  .modalite-icon {
    font-size: 16px;
  }

  .lieu-text {
    color: #6b7280;
  }
}

.join-visio-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  margin-top: 12px;
  padding: 12px;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }

  .btn-icon {
    width: 18px;
    height: 18px;
  }
}

/* Resource */
.resource-section {
  margin-bottom: 16px;
}

.resource-card {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 16px;
  background: #faf5ff;
  border: 2px solid #e9d5ff;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;

  &:hover {
    background: #f3e8ff;
    border-color: #c084fc;
  }
}

.resource-icon {
  width: 48px;
  height: 48px;
  background: #e9d5ff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7c3aed;
  flex-shrink: 0;

  svg {
    width: 24px;
    height: 24px;
  }
}

.resource-info {
  flex: 1;
  min-width: 0;
}

.resource-name {
  display: block;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.resource-meta {
  font-size: 12px;
  color: #6b7280;
}

.resource-action {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #7c3aed;
  color: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;

  .action-icon {
    width: 16px;
    height: 16px;
  }
}

/* Instructions */
.instructions-section {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #fef9c3;
  border: 2px solid #fde047;
  border-radius: 12px;
  margin-bottom: 16px;
}

.instructions-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.instructions-text {
  font-size: 14px;
  color: #713f12;
  line-height: 1.5;
  margin: 0;
}

/* Footer */
.step-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  flex-wrap: wrap;
  gap: 12px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;

  &.status-completed {
    background: #dcfce7;
    color: #166534;
  }

  &.status-in-progress {
    background: #dbeafe;
    color: #1e40af;
  }

  &.status-todo {
    background: #f3f4f6;
    color: #6b7280;
  }

  .completed-date {
    font-weight: 400;
    opacity: 0.8;
  }
}

.complete-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--completed-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  .btn-icon {
    width: 18px;
    height: 18px;
  }
}

/* Motivation */
.motivation-message {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
  padding: 24px;
  background: linear-gradient(135deg, #f0fdf4, #eff6ff);
  border: 2px solid #bbf7d0;
  border-radius: var(--card-radius);
}

.motivation-icon {
  width: 40px;
  height: 40px;
  color: var(--completed-color);
  flex-shrink: 0;
}

.motivation-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px;
}

.motivation-text {
  color: #4b5563;
  margin: 0;

  strong {
    color: var(--completed-color);
  }
}

/* Congratulations */
.congratulations {
  text-align: center;
  margin-top: 32px;
  padding: 48px;
  background: linear-gradient(135deg, var(--completed-color), #059669);
  border-radius: var(--card-radius);
  color: white;
}

.congrats-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
}

.congrats-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px;
}

.congrats-text {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 48px;
  color: #6b7280;
  background: #f9fafb;
  border: 2px dashed #e5e7eb;
  border-radius: var(--card-radius);
}

/* Responsive */
@media (max-width: 640px) {
  .header-content {
    flex-direction: column;
  }

  .header-stats {
    width: 100%;
    justify-content: space-around;
  }

  .timeline-container {
    padding-left: 40px;
  }

  .timeline-icon {
    left: -40px;
  }

  .step-header {
    padding-right: 0;
  }

  .rdv-badge {
    position: static;
    margin-bottom: 12px;
  }

  .rdv-info-grid {
    grid-template-columns: 1fr;
  }

  .step-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .complete-btn {
    justify-content: center;
  }
}
</style>
