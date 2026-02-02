<!-- src/components/dashboard/StudentCoursesDrawer.vue -->
<script setup lang="ts">
import { computed } from 'vue'

export interface StudentLight {
  id: string
  name: string
  email: string
  avatar: string
  progress: number
  lastActivity: string
}

export interface StudentCourseItem {
  id: string
  title: string
  progressPercent: number
  lastLessonTitle?: string | null
  lastActivityAt?: string | null
}

const props = defineProps<{
  modelValue: boolean
  loading: boolean
  student: StudentLight | null
  courses: StudentCourseItem[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'open-course', courseId: string): void
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

function formatDate(value?: string | null) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString()
}
</script>

<template>
  <VNavigationDrawer
    v-model="isOpen"
    location="right"
    temporary
    width="420"
    class="student-courses-drawer"
  >
    <div class="pa-4 d-flex align-center justify-space-between">
      <div class="d-flex align-center gap-3">
        <VAvatar
          v-if="student"
          :image="student.avatar"
          size="40"
        />
        <div>
          <div class="text-body-1 font-weight-semibold">
            {{ student?.name ?? 'Student' }}
          </div>
          <div class="text-caption text-medium-emphasis">
            {{ student?.email ?? '' }} • Courses: {{ courses.length }}
          </div>
        </div>
      </div>

      <VBtn icon variant="text" @click="isOpen = false">
        <VIcon icon="tabler-x" />
      </VBtn>
    </div>

    <VDivider />

    <div class="pa-4">
      <div v-if="loading">
        <VSkeletonLoader type="list-item-two-line" class="mb-2" />
        <VSkeletonLoader type="list-item-two-line" class="mb-2" />
        <VSkeletonLoader type="list-item-two-line" class="mb-2" />
      </div>

      <div
        v-else-if="!courses.length"
        class="text-body-2 text-medium-emphasis text-center py-10"
      >
        No courses found for this student.
      </div>

      <VList v-else class="courses-scroll" density="comfortable">
        <VListItem
          v-for="c in courses"
          :key="c.id"
          class="mb-2 rounded-lg"
        >
          <template #title>
            <div class="d-flex align-center justify-space-between gap-3">
              <span class="font-weight-medium text-body-2">
                {{ c.title }}
              </span>

              <VBtn size="small" variant="tonal" @click="emit('open-course', c.id)">
                Details
              </VBtn>
            </div>
          </template>

          <template #subtitle>
            <div class="mt-2">
              <div class="text-caption text-medium-emphasis">
                Last lesson: {{ c.lastLessonTitle || '—' }}
              </div>
              <div class="text-caption text-medium-emphasis">
                Updated: {{ formatDate(c.lastActivityAt) }}
              </div>

              <div class="d-flex align-center justify-space-between mt-2">
                <div class="text-caption font-weight-medium">
                  Progress
                </div>
                <div class="text-caption font-weight-medium">
                  {{ c.progressPercent }}%
                </div>
              </div>

              <VProgressLinear :model-value="c.progressPercent" height="7" rounded class="mt-2" />
            </div>
          </template>
        </VListItem>
      </VList>
    </div>
  </VNavigationDrawer>
</template>

<style scoped lang="scss">
.student-courses-drawer {
  border-top-left-radius: 18px;
  border-bottom-left-radius: 18px;
}
.courses-scroll {
  max-height: calc(100vh - 140px);
  overflow: auto;
}
</style>
