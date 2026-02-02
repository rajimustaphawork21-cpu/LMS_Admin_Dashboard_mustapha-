<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useStudentsStore } from '../../stores/students.store'
import { DashboardService } from '@/services/dashboard.service'
import StudentCoursesDrawer from '@/components/dashboard/StudentCoursesDrawer.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton.vue'
import type { Student } from '@/types/student'
import type { EnrollmentDto } from '@/services/dashboard.service'

const store = useStudentsStore()

// Enrollments for stats + drawer
const enrollments = ref<EnrollmentDto[]>([])

// UI
const drawerOpen = ref(false)
const drawerLoading = ref(false)
const selectedStudent = ref<any>(null)
const selectedCourses = ref<any[]>([])

const deleteDialog = ref(false)
const studentToDelete = ref<Student | null>(null)
const deleting = ref(false)

const snackbar = ref(false)
const snackbarText = ref('')

function toast(msg: string) {
  snackbarText.value = msg
  snackbar.value = true
}

function fallbackAvatar() {
  return 'https://i.pravatar.cc/150?img=11'
}

// ===== Progress color rules =====
function progressColor(value: number) {
  // Rules:
  // 0 => red
  // 1-10 => blue
  // 11-20 => purple
  // 21-50 => green
  // >50 => green
  if (!value || value <= 0) return 'error'
  if (value <= 10) return 'info'       // blue-ish
  if (value <= 20) return 'secondary'  // purple-ish (theme token)
  if (value <= 50) return 'success'    // green
  return 'success'
}

// ===== Stats helpers =====
function enrollmentsForStudent(id: string) {
  return enrollments.value.filter(e => e.studentId === id)
}

function totalCourses(id: string) {
  return enrollmentsForStudent(id).length
}

function avgProgress(id: string) {
  const list = enrollmentsForStudent(id)
  if (!list.length) return 0
  const sum = list.reduce((a, e) => a + (Number(e.progressPercent) || 0), 0)
  return Math.round(sum / list.length)
}

function lastActivity(id: string, fallback?: string) {
  const dates = enrollmentsForStudent(id)
    .map(e => e.lastActivityAt)
    .filter(Boolean) as string[]

  if (!dates.length) return fallback ? new Date(fallback).toLocaleString() : '—'
  return new Date(Math.max(...dates.map(d => new Date(d).getTime()))).toLocaleString()
}

// ===== Drawer =====
async function openCourses(student: Student) {
  selectedStudent.value = {
    id: student.id,
    name: student.fullName,
    email: student.email,
    avatar: student.avatar || fallbackAvatar(),
  }

  drawerOpen.value = true
  drawerLoading.value = true
  selectedCourses.value = []

  try {
    const res = await DashboardService.getEnrollments({ studentId: student.id, limit: 1000 })
    selectedCourses.value = res.data.map(e => ({
      id: e.courseId,
      title: e.course?.title ?? '—',
      progressPercent: Number(e.progressPercent) || 0,
      lastLessonTitle: e.lastLessonTitle,
      lastActivityAt: e.lastActivityAt,
    }))
  } catch (e) {
    toast('Failed to load courses for this student.')
    selectedCourses.value = []
  } finally {
    drawerLoading.value = false
  }
}

// ===== Delete =====
function askDelete(s: Student) {
  studentToDelete.value = s
  deleteDialog.value = true
}

async function confirmDelete() {
  if (!studentToDelete.value) return
  deleting.value = true
  try {
    await store.remove(studentToDelete.value.id)
    toast('Student deleted')
    await store.fetchList()
  } catch {
    toast('Failed to delete student')
  } finally {
    deleting.value = false
    deleteDialog.value = false
  }
}

async function load() {
  await store.fetchList()
  const res = await DashboardService.getEnrollments({ limit: 1000 })
  enrollments.value = res.data
}

onMounted(load)
watch(() => [store.page, store.limit], load)
</script>

<template>
  <div class="pa-6">
    <VRow class="mb-6">
      <VCol cols="12" md="6">
        <h1 class="text-h4">Students</h1>
        <p class="text-body-2 text-medium-emphasis">
          Manage students & progress
        </p>
      </VCol>
    </VRow>

    <VCard>
      <VCardTitle class="d-flex justify-space-between flex-wrap gap-3">
        <span class="text-h6">Students List</span>

        <VTextField
          v-model="store.search"
          density="compact"
          variant="outlined"
          hide-details
          placeholder="Search..."
          style="width: 260px"
        />
      </VCardTitle>

      <VDivider />

      <VCardText>
        <LoadingSkeleton v-if="store.loading" />

        <EmptyState
          v-else-if="!store.items.length"
          title="No students"
          subtitle="No students found."
        />

        <VTable v-else>
          <thead>
            <tr>
              <th>Student</th>
              <th>Email</th>
              <th>Courses</th>
              <th>Progress</th>
              <th>Last Activity</th>
              <th>view courses</th>
              <th>delete</th>

              <!-- Header shows icons instead of text "Actions" -->
            </tr>
          </thead>

          <tbody>
            <tr v-for="s in store.items" :key="s.id">
              <td>
                <div class="d-flex align-center gap-3">
                  <VAvatar :image="s.avatar || fallbackAvatar()" size="34" />
                  <span class="font-weight-medium">{{ s.fullName }}</span>
                </div>
              </td>

              <td class="text-medium-emphasis">{{ s.email }}</td>

              <td>
                <VBtn variant="text" class="px-1" @click="openCourses(s)">
                  {{ totalCourses(s.id) }}
                </VBtn>
              </td>

              <!-- Progress with colors + bar -->
              <td style="min-width: 220px;">
                <div class="d-flex align-center gap-3">
                  <VProgressLinear
                    :model-value="avgProgress(s.id)"
                    :color="progressColor(avgProgress(s.id))"
                    height="7"
                    rounded
                  />
                  <VChip
                    size="small"
                    variant="tonal"
                    :color="progressColor(avgProgress(s.id))"
                    class="font-weight-medium"
                    style="min-width: 56px; justify-content: center;"
                  >
                    {{ avgProgress(s.id) }}%
                  </VChip>
                </div>
              </td>

              <td class="text-medium-emphasis">
                {{ lastActivity(s.id, s.updatedAt) }}
              </td>

              <!-- Actions: Eye (blue) + Trash (red) -->
              <td class="text-right">
                <VBtn
                  icon
                  size="small"
                  variant="tonal"
                  color="info"
                  class="me-6"
                  @click="openCourses(s)"
                >
                  <VIcon icon="tabler-eye" />
                </VBtn>

              </td>
              <td>
                 <VBtn
                  icon
                  size="small"
                  variant="tonal"
                  color="error"
                   class="me-6"
                  @click="askDelete(s)"
                >
                  <VIcon icon="tabler-trash" />
                </VBtn>
              </td>
            </tr>
          </tbody>
        </VTable>
      </VCardText>
    </VCard>

    <!-- Drawer -->
    <StudentCoursesDrawer
      v-model="drawerOpen"
      :loading="drawerLoading"
      :student="selectedStudent"
      :courses="selectedCourses"
    />

    <!-- Delete dialog -->
    <ConfirmDialog
      v-model="deleteDialog"
      title="Delete student"
      :message="`Delete ${studentToDelete?.fullName}?`"
      confirm-text="Delete"
      :loading="deleting"
      @confirm="confirmDelete"
    />

    <VSnackbar v-model="snackbar" timeout="2500" location="bottom end">
      {{ snackbarText }}
    </VSnackbar>
  </div>
</template>
