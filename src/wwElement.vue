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

    <!-- Progress Alert -->
    <div
      v-if="progressAlert"
      class="progress-alert"
      :class="progressAlert.type"
    >
      <span class="alert-icon">{{ progressAlert.icon }}</span>
      <span class="alert-text">{{ progressAlert.message }}</span>
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
        :class="getTimelineItemClass(step)"
      >
        <!-- Status Icon -->
        <div class="timeline-icon" :class="getStatusClass(step.status)">
          <svg v-if="step.status === 'terminee'" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          <span v-else-if="step.status === 'en_cours'" class="pulse-dot"></span>
          <span v-else class="step-number">{{ step.order }}</span>
        </div>

        <!-- Card -->
        <div
          class="step-card"
          :class="getCardClass(step)"
          @click="handleStepClick(step)"
        >
          <!-- Left Border Indicator -->
          <div class="card-border-indicator" :class="getStatusClass(step.status)"></div>

          <div class="card-inner">
            <!-- Type Badge -->
            <div class="card-badges">
              <span class="type-badge" :class="getTypeBadgeClass(step)">
                <span class="badge-icon">{{ getTypeIcon(step) }}</span>
                {{ getTypeLabel(step) }}
              </span>
              <span v-if="step.status === 'terminee'" class="completed-badge">
                ✅ Terminé
              </span>
            </div>

            <!-- Title & Description -->
            <div class="step-header">
              <h3 class="step-title">{{ step.title }}</h3>
              <p v-if="step.description" class="step-description">{{ truncateText(step.description, 100) }}</p>
            </div>

            <!-- RDV Details -->
            <div v-if="step.typeEtape === 'rdv'" class="rdv-details" :class="{ 'rdv-completed': step.status === 'terminee' }">
              <div class="rdv-info">
                <span class="rdv-date">
                  <svg viewBox="0 0 24 24" fill="currentColor" class="info-icon">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
                  </svg>
                  {{ formatDate(step.dateRDV) }} · {{ step.heureRDV }}
                </span>
                <span class="rdv-mode">
                  <span v-if="step.modaliteRDV === 'presentiel'">🏢 {{ step.lieu || 'Présentiel' }}</span>
                  <span v-else>💻 Visioconférence</span>
                </span>
              </div>

              <!-- Join Visio Button -->
              <button
                v-if="step.modaliteRDV === 'distanciel' && step.lienVisio && step.status !== 'terminee'"
                class="btn btn-primary"
                @click.stop="handleJoinVisio(step)"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" class="btn-icon">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                </svg>
                Rejoindre la visio
              </button>
            </div>

            <!-- Resource -->
            <div v-if="step.resource && step.typeEtape !== 'rdv'" class="resource-section">
              <div class="resource-preview" :class="getResourceClass(step.resource)">
                <div class="resource-icon">
                  <svg v-if="step.resource.type === 'video'" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <svg v-else-if="step.resource.type === 'test'" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l4.59-4.58L18 11l-6 6z"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/>
                  </svg>
                </div>
                <div class="resource-info">
                  <span class="resource-name">{{ getResourceName(step.resource) }}</span>
                  <span class="resource-meta">
                    {{ getResourceTypeLabel(step.resource) }}
                    <span v-if="step.resource.duree"> · {{ step.resource.duree }}</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Instructions -->
            <div
              v-if="content?.showInstructions !== false && step.instructions"
              class="instructions-section"
            >
              <span class="instructions-icon">💡</span>
              <p class="instructions-text">{{ step.instructions }}</p>
            </div>

            <!-- Action Footer -->
            <div class="step-footer">
              <div class="footer-left">
                <span v-if="step.status === 'terminee' && step.completedAt" class="completed-date">
                  Terminé le {{ step.completedAt }}
                </span>
                <span v-else-if="step.status === 'en_cours'" class="status-label status-active">
                  🔄 En cours
                </span>
                <span v-else class="status-label status-pending">
                  ⏳ À faire
                </span>
              </div>

              <div class="footer-actions">
                <!-- Completed: Voir le résumé -->
                <button
                  v-if="step.status === 'terminee'"
                  class="btn btn-ghost"
                  @click.stop="handleStepClick(step)"
                >
                  Voir le résumé
                </button>

                <!-- Resource (not test): Consulter -->
                <button
                  v-else-if="step.resource && step.resource.type !== 'test'"
                  class="btn btn-secondary"
                  @click.stop="handleResourceClick(step)"
                >
                  Consulter les ressources
                </button>

                <!-- Test: COMMENCER LE TEST -->
                <button
                  v-else-if="step.resource && step.resource.type === 'test'"
                  class="btn btn-test"
                  @click.stop="handleResourceClick(step)"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" class="btn-icon">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  COMMENCER LE TEST
                </button>

                <!-- Mark as complete -->
                <button
                  v-if="content?.showCompleteButton !== false && step.status === 'en_cours'"
                  class="btn btn-success"
                  @click.stop="handleComplete(step)"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" class="btn-icon">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  Marquer terminé
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Congratulations -->
    <div
      v-if="stats.completed === stats.total && stats.total > 0"
      class="congratulations"
    >
      <div class="congrats-icon-wrap">
        <svg viewBox="0 0 24 24" fill="currentColor" class="congrats-icon">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      </div>
      <h2 class="congrats-title">Parcours terminé !</h2>
      <p class="congrats-text">Bravo pour votre engagement !</p>
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

    // Progress Alert
    const progressAlert = computed(() => {
      const { completed, total } = stats.value;
      if (completed === 0 || completed >= total) return null;

      const remaining = total - completed;
      if (remaining === 1) {
        return { icon: '🎯', message: 'Excellent ! Plus qu\'une étape !', type: 'alert-final' };
      } else if (remaining === 2) {
        return { icon: '💪', message: 'Super ! Plus que 2 étapes !', type: 'alert-progress' };
      }
      return { icon: '✨', message: `Bravo ! ${completed} étape${completed > 1 ? 's' : ''} complétée${completed > 1 ? 's' : ''} !`, type: 'alert-progress' };
    });

    // Truncate text
    const truncateText = (text, maxLength) => {
      if (!text || text.length <= maxLength) return text;
      return text.substring(0, maxLength).trim() + '...';
    };

    // Format date
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const months = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        return `${day} ${months[month]}`;
      }
      return dateStr;
    };

    // Get status class
    const getStatusClass = (status) => {
      switch (status) {
        case 'terminee': return 'status-completed';
        case 'en_cours': return 'status-in-progress';
        default: return 'status-todo';
      }
    };

    // Get timeline item class
    const getTimelineItemClass = (step) => {
      if (step.status === 'terminee') return 'item-completed';
      if (step.status === 'en_cours') return 'item-active';
      return 'item-pending';
    };

    // Get card class
    const getCardClass = (step) => {
      const classes = [];
      if (step.status === 'terminee') classes.push('card-completed');
      else if (step.status === 'en_cours') classes.push('card-active');
      if (step.typeEtape === 'rdv' || step.resource) classes.push('card-clickable');
      return classes.join(' ');
    };

    // Get type badge class
    const getTypeBadgeClass = (step) => {
      if (step.typeEtape === 'rdv') return 'badge-rdv';
      if (step.resource?.type === 'test') return 'badge-test';
      return 'badge-resource';
    };

    // Get type icon
    const getTypeIcon = (step) => {
      if (step.typeEtape === 'rdv') return '🗓️';
      if (step.resource?.type === 'test') return '🧠';
      return '📋';
    };

    // Get type label
    const getTypeLabel = (step) => {
      if (step.typeEtape === 'rdv') return 'Rendez-vous';
      if (step.resource?.type === 'test') return 'Test';
      return 'Ressource';
    };

    // Get resource class
    const getResourceClass = (resource) => {
      if (resource?.type === 'test') return 'resource-test';
      if (resource?.type === 'video') return 'resource-video';
      return 'resource-doc';
    };

    // Resource helpers
    const getResourceName = (resource) => {
      if (!resource) return '';
      return resource?.nom ?? resource?.name ?? 'Ressource';
    };

    const getResourceTypeLabel = (resource) => {
      if (!resource) return '';
      const type = resource?.type ?? '';
      const labels = { test: 'Test', video: 'Vidéo', pdf: 'PDF', document: 'Document' };
      return labels[type.toLowerCase()] || type.toUpperCase();
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
      '--primary-color': props.content?.primaryColor || '#2563eb',
      '--completed-color': props.content?.completedColor || '#16a34a',
      '--in-progress-color': props.content?.inProgressColor || '#2563eb',
      '--test-color': '#dc2626',
      '--resource-color': '#d97706',
      '--rdv-color': '#2563eb',
    }));

    return {
      processedSteps,
      stats,
      progressPercent,
      progressAlert,
      cssVariables,
      truncateText,
      formatDate,
      getStatusClass,
      getTimelineItemClass,
      getCardClass,
      getTypeBadgeClass,
      getTypeIcon,
      getTypeLabel,
      getResourceClass,
      getResourceName,
      getResourceTypeLabel,
      handleStepClick,
      handleComplete,
      handleResourceClick,
      handleJoinVisio,
    };
  },
};
</script>

<style lang="scss" scoped>
/* =============================================
   Design System - 8px grid, 4px radius, WCAG AA
   ============================================= */

.parcours-beneficiaire {
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --radius: 4px;
  --radius-lg: 8px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 2px 8px rgba(0,0,0,0.1);

  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1f2937;
  line-height: 1.5;
}

/* Header */
.header {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.header-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.header-subtitle {
  color: #6b7280;
  font-size: 14px;
  margin: var(--spacing-xs) 0 0;
}

.header-stats {
  display: flex;
  gap: var(--spacing-lg);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  margin-top: var(--spacing-xs);
}

.stat-completed .stat-value { color: var(--completed-color); }
.stat-in-progress .stat-value { color: var(--in-progress-color); }
.stat-todo .stat-value { color: #9ca3af; }

/* Progress Bar */
.progress-section {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px solid #f3f4f6;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.progress-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.progress-value {
  font-size: 13px;
  font-weight: 700;
  color: var(--primary-color);
}

.progress-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: var(--radius);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary-color);
  border-radius: var(--radius);
  transition: width 0.4s ease;
}

/* Progress Alert */
.progress-alert {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-lg);
  font-weight: 500;
  font-size: 14px;
}

.alert-progress {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
}

.alert-final {
  background: #fef3c7;
  border: 1px solid #fcd34d;
  color: #92400e;
}

.alert-icon {
  font-size: 18px;
}

/* Timeline */
.timeline-container {
  position: relative;
  padding-left: 48px;
}

.timeline-line {
  position: absolute;
  left: 15px;
  top: var(--spacing-lg);
  bottom: var(--spacing-lg);
  width: 2px;
  background: #e5e7eb;
}

.timeline-item {
  position: relative;
  margin-bottom: var(--spacing-md);

  &:last-child {
    margin-bottom: 0;
  }

  &.item-completed {
    opacity: 0.6;

    &:hover {
      opacity: 0.8;
    }
  }
}

/* Timeline Icon */
.timeline-icon {
  position: absolute;
  left: -48px;
  top: var(--spacing-md);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  z-index: 1;
  background: #fff;

  svg {
    width: 16px;
    height: 16px;
  }

  &.status-completed {
    background: var(--completed-color);
    color: #fff;
  }

  &.status-in-progress {
    background: var(--in-progress-color);
    color: #fff;
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
  }

  &.status-todo {
    border: 2px solid #d1d5db;
    color: #9ca3af;
  }
}

.pulse-dot {
  width: 10px;
  height: 10px;
  background: #fff;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
}

.step-number {
  font-size: 13px;
}

/* Card */
.step-card {
  position: relative;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);

  &.card-completed {
    .card-border-indicator {
      background: var(--completed-color);
    }

    .step-title, .step-description {
      color: #6b7280;
    }
  }

  &.card-active {
    border-color: var(--in-progress-color);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1), var(--shadow-md);

    .card-border-indicator {
      background: var(--in-progress-color);
      width: 5px;
    }
  }

  &.card-clickable {
    cursor: pointer;

    &:hover {
      box-shadow: var(--shadow-md);
      border-color: var(--primary-color);
    }
  }
}

.card-border-indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #d1d5db;
}

.card-inner {
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-md) var(--spacing-lg);
}

/* Badges */
.card-badges {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  flex-wrap: wrap;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius);
  font-size: 12px;
  font-weight: 600;
}

.badge-icon {
  font-size: 14px;
}

.badge-rdv {
  background: #dbeafe;
  color: #1e40af;
}

.badge-test {
  background: #fee2e2;
  color: #991b1b;
}

.badge-resource {
  background: #fef3c7;
  color: #92400e;
}

.completed-badge {
  font-size: 12px;
  font-weight: 600;
  color: #166534;
  background: #dcfce7;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius);
}

/* Step Header */
.step-header {
  margin-bottom: var(--spacing-md);
}

.step-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 var(--spacing-xs);
}

.step-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

/* RDV Details */
.rdv-details {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.rdv-details.rdv-completed {
  background: #f9fafb;
  border-color: #e5e7eb;
  padding: var(--spacing-sm) var(--spacing-md);
}

.rdv-info {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  font-size: 13px;
  color: #1e40af;
}

.rdv-completed .rdv-info {
  color: #6b7280;
}

.rdv-date, .rdv-mode {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.info-icon {
  width: 16px;
  height: 16px;
}

/* Resource */
.resource-section {
  margin-bottom: var(--spacing-md);
}

.resource-preview {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  border: 1px solid;
}

.resource-test {
  background: #fef2f2;
  border-color: #fecaca;

  .resource-icon {
    background: #fee2e2;
    color: #dc2626;
  }
}

.resource-video {
  background: #eff6ff;
  border-color: #bfdbfe;

  .resource-icon {
    background: #dbeafe;
    color: #2563eb;
  }
}

.resource-doc {
  background: #fffbeb;
  border-color: #fde68a;

  .resource-icon {
    background: #fef3c7;
    color: #d97706;
  }
}

.resource-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 20px;
    height: 20px;
  }
}

.resource-info {
  flex: 1;
  min-width: 0;
}

.resource-name {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.resource-meta {
  font-size: 12px;
  color: #6b7280;
}

/* Instructions */
.instructions-section {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-md);
}

.instructions-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.instructions-text {
  font-size: 13px;
  color: #92400e;
  margin: 0;
}

/* Footer */
.step-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-md);
  border-top: 1px solid #f3f4f6;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.footer-left {
  font-size: 12px;
}

.completed-date {
  color: #9ca3af;
}

.status-label {
  font-weight: 500;
}

.status-active {
  color: var(--in-progress-color);
}

.status-pending {
  color: #9ca3af;
}

.footer-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
  white-space: nowrap;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.btn-ghost {
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;

  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;

  &:hover {
    background: #e5e7eb;
  }
}

.btn-primary {
  background: var(--primary-color);
  color: #fff;

  &:hover {
    filter: brightness(1.1);
  }
}

.btn-success {
  background: var(--completed-color);
  color: #fff;

  &:hover {
    filter: brightness(1.1);
  }
}

.btn-test {
  background: var(--test-color);
  color: #fff;
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover {
    filter: brightness(1.1);
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
  }
}

/* Congratulations */
.congratulations {
  text-align: center;
  margin-top: var(--spacing-xl);
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  border: 1px solid #a7f3d0;
  border-radius: var(--radius-lg);
}

.congrats-icon-wrap {
  width: 56px;
  height: 56px;
  margin: 0 auto var(--spacing-md);
  background: var(--completed-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.congrats-icon {
  width: 28px;
  height: 28px;
  color: #fff;
}

.congrats-title {
  font-size: 20px;
  font-weight: 700;
  color: #065f46;
  margin: 0 0 var(--spacing-sm);
}

.congrats-text {
  font-size: 14px;
  color: #047857;
  margin: 0;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: #6b7280;
  background: #f9fafb;
  border: 2px dashed #e5e7eb;
  border-radius: var(--radius-lg);
}

/* Responsive */
@media (max-width: 640px) {
  .header-content {
    flex-direction: column;
  }

  .header-stats {
    width: 100%;
    justify-content: space-between;
  }

  .timeline-container {
    padding-left: 40px;
  }

  .timeline-icon {
    left: -40px;
    width: 28px;
    height: 28px;
  }

  .step-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .footer-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .rdv-info {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}
</style>
