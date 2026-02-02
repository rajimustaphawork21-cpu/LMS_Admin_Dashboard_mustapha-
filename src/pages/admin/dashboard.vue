<!-- src/pages/admin/Dashboard.vue -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import StudentCoursesDrawer, { type StudentCourseItem, type StudentLight } from '@/components/dashboard/StudentCoursesDrawer.vue'
import { DashboardService, type EnrollmentDto, type StudentDto, type DashboardCounts } from '@/services/dashboard.service'

// UI
const loading = ref(false)
const drawerOpen = ref(false)
const drawerLoading = ref(false)
const snackbar = ref(false)
const snackbarText = ref('')

// Data
const students = ref<StudentLight[]>([])
const enrollments = ref<EnrollmentDto[]>([])
const counts = ref<DashboardCounts>({
  totalCourses: 0,
  totalLessons: 0,
  totalQuizzes: 0,
  totalStudents: 0,
  totalCertificates: 0,
})

const selectedStudent = ref<StudentLight | null>(null)
const selectedStudentCourses = ref<StudentCourseItem[]>([])
const studentSearch = ref('')

function toast(msg: string) {
  snackbarText.value = msg
  snackbar.value = true
}

function fallbackAvatar() {
  return 'https://i.pravatar.cc/150?img=12'
}

function normalizeStudent(s: StudentDto): StudentLight {
  return {
    id: s.id,
    name: s.fullName,
    email: s.email,
    avatar: s.avatar || fallbackAvatar(),
    // These will be computed from enrollments
    progress: 0,
    lastActivity: '—',
  }
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString()
}

// ====== Derived: enrollments by student ======
function enrollmentsForStudent(studentId: string) {
  return enrollments.value.filter(e => e.studentId === studentId)
}

function totalCoursesByStudentId(studentId: string) {
  return enrollmentsForStudent(studentId).length
}

function avgProgressByStudentId(studentId: string) {
  const list = enrollmentsForStudent(studentId)
  if (!list.length) return 0
  const sum = list.reduce((acc, e) => acc + (Number(e.progressPercent) || 0), 0)
  return Math.round(sum / list.length)
}

function lastActivityByStudentId(studentId: string, fallback?: string) {
  const list = enrollmentsForStudent(studentId)
    .map(e => e.lastActivityAt)
    .filter(Boolean) as string[]

  if (list.length) {
    // Pick latest date
    const latest = list
      .map(d => new Date(d).getTime())
      .filter(t => !Number.isNaN(t))
      .sort((a, b) => b - a)[0]

    return latest ? formatDate(new Date(latest).toISOString()) : '—'
  }

  return fallback ? formatDate(fallback) : '—'
}

// Keep students view in sync with enrollments
const studentsWithStats = computed(() => {
  return students.value.map(s => ({
    ...s,
    progress: avgProgressByStudentId(s.id),
    lastActivity: lastActivityByStudentId(s.id),
  }))
})

const filteredStudents = computed(() => {
  const q = studentSearch.value.trim().toLowerCase()
  if (!q) return studentsWithStats.value
  return studentsWithStats.value.filter(s =>
    s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q),
  )
})

// KPI Cards (from real API)
const kpiCards = computed(() => ([
  { title: 'Total Courses', value: counts.value.totalCourses, icon: 'tabler-books', color: 'primary' },
  { title: 'Total Lessons', value: counts.value.totalLessons, icon: 'tabler-book', color: 'info' },
  { title: 'Total Quizzes', value: counts.value.totalQuizzes, icon: 'tabler-help-hexagon', color: 'warning' },
  { title: 'Total Students', value: counts.value.totalStudents, icon: 'tabler-users', color: 'success' },
  { title: 'Certificates Issued', value: counts.value.totalCertificates, icon: 'tabler-certificate', color: 'secondary' },

]))

async function loadDashboard() {
  loading.value = true
  try {
    // Fetch in parallel
    const [studentsRes, enrollmentsRes, countsRes] = await Promise.all([
      DashboardService.getStudents(),
      // Pull many enrollments for correct calculations (adjust limit if needed)
      DashboardService.getEnrollments({ page: 1, limit: 1000 }),
      DashboardService.getDashboardCounts(),
    ])

    students.value = (studentsRes?.data ?? []).map(normalizeStudent)
    enrollments.value = enrollmentsRes?.data ?? []
    counts.value = countsRes
  } catch (e: any) {
    console.error(e)
    toast('فشل تحميل الداشبورد من الـ API. تأكد أن ngrok خدام وأن CORS مسموح.')
  } finally {
    loading.value = false
  }
}

async function openStudentCourses(student: StudentLight) {
  selectedStudent.value = student
  drawerOpen.value = true
  drawerLoading.value = true
  selectedStudentCourses.value = []

  try {
    // Use real API filter: /enrollments?studentId=...
    const res = await DashboardService.getEnrollments({ studentId: student.id, page: 1, limit: 1000 })
    const list = res?.data ?? []

    selectedStudentCourses.value = list.map(e => ({
      id: e.courseId,
      title: e.course?.title ?? 'Untitled course',
      progressPercent: Number(e.progressPercent) || 0,
      lastLessonTitle: e.lastLessonTitle ?? '—',
      lastActivityAt: e.lastActivityAt ?? e.updatedAt ?? null,
    }))
  } catch (e) {
    console.error(e)
    toast('فشل جلب كورسات الطالب من /api/enrollments?studentId=...')
    selectedStudentCourses.value = []
  } finally {
    drawerLoading.value = false
  }
}

function openCourseDetails(courseId: string) {
  toast(`Coming soon: Course details (${courseId})`)
}

onMounted(() => {
  loadDashboard()
})
</script>

<template>
  <div class="pa-6">
    <!-- Header -->
    <VRow align="center" class="mb-6">
      <VCol cols="12" md="6">
        <h1 class="text-h4 mb-1">Admin Dashboard</h1>
        <p class="text-body-1 text-medium-emphasis">
          Live data from Swagger API: <span class="font-weight-medium">/api/*</span>
        </p>
      </VCol>

      <VCol cols="12" md="6" class="d-flex justify-end gap-4">
        <VBtn icon variant="tonal" :loading="loading" @click="loadDashboard">
          <VIcon icon="tabler-refresh" />
        </VBtn>
      </VCol>
    </VRow>

    <!-- KPI Cards -->
    <VRow class="mb-6">
      <VCol v-for="card in kpiCards" :key="card.title" cols="12" sm="6" md="3" lg="" >
        <VCard :color="card.color" variant="tonal" class="h-150">
          <VCardText>
            <VIcon :icon="card.icon" size="30" class="mb-2" />
            <div class="text-h6 font-weight-semibold">{{ card.value }}</div>
            <div class="text-body-2 text-medium-emphasis">{{ card.title }}</div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Students Table -->
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between flex-wrap gap-3">
        <span class="text-h6 font-weight-semibold">Students Overview</span>

        <VTextField
          v-model="studentSearch"
          density="compact"
          variant="outlined"
          hide-details
          placeholder="Search students..."
          prepend-inner-icon="tabler-search"
          style="max-width: 320px;"
        />
      </VCardTitle>

      <VDivider />

      <VCardText>
        <div v-if="loading">
          <VSkeletonLoader type="table" />
        </div>

        <div v-else-if="!filteredStudents.length" class="text-center py-10 text-medium-emphasis">
          No students found.
        </div>

        <div v-else class="table-wrap">
          <VTable>
            <thead>
              <tr>
                <th class="text-left">Student</th>
                <th class="text-left">Email</th>
                <th class="text-left">Total Courses</th>
                <th class="text-left">Progress</th>
                <th class="text-left">Last Activity</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="s in filteredStudents" :key="s.id">
                <!-- Student: Avatar + Full Name only -->
                <td>
                  <div class="d-flex align-center gap-3">
                    <VAvatar :image="s.avatar" size="34" />
                    <span class="font-weight-medium">{{ s.name }}</span>
                  </div>
                </td>

                <td class="text-medium-emphasis">{{ s.email }}</td>

                <!-- Total Courses: computed from enrollments, clickable -->
                <td>
                  <VBtn variant="text" class="px-1" @click="openStudentCourses(s)">
                    <span class="font-weight-semibold">{{ totalCoursesByStudentId(s.id) }}</span>
                  </VBtn>
                </td>

                <td style="min-width: 200px;">
                  <div class="d-flex align-center gap-3">
                    <VProgressLinear :model-value="s.progress" height="7" rounded />
                    <span class="text-caption font-weight-medium" style="width: 42px; text-align:right;">
                      {{ s.progress }}%
                    </span>
                  </div>
                </td>

                <td class="text-medium-emphasis">
                  {{ lastActivityByStudentId(s.id) }}
                </td>

                <td class="text-right">
                  <VBtn size="small" variant="tonal" @click="openStudentCourses(s)">
                    View Courses
                  </VBtn>
                </td>
              </tr>
            </tbody>
          </VTable>
        </div>
      </VCardText>
    </VCard>

    <!-- Drawer -->
    <StudentCoursesDrawer
      v-model="drawerOpen"
      :loading="drawerLoading"
      :student="selectedStudent"
      :courses="selectedStudentCourses"
      @open-course="openCourseDetails"
    />

    <!-- Snackbar -->
    <VSnackbar v-model="snackbar" timeout="2600" location="bottom end">
      {{ snackbarText }}
    </VSnackbar>
  </div>
</template>

<style scoped>
.table-wrap { overflow-x: auto; }
</style>
