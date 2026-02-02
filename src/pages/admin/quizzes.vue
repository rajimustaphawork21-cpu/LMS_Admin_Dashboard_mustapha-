<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

// Use relative imports to avoid alias issues
import { useCoursesStore } from '../../stores/courses.store'
import { useQuizzesStore } from '../../stores/quizzes.store'

import EmptyState from '@/components/shared/EmptyState.vue'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'

import QuizQuestionDrawer from '@/components/quizzes/QuizQuestionsDrawer.vue'

import { QuizzesService } from '@/services/quizzes.service'
import { QuizQuestionsService } from '@/services/quizQuestions.service'

import type { Quiz, CreateQuizDto, UpdateQuizDto } from '@/types/quiz'
import type { QuizQuestion, CreateQuizQuestionDto } from '@/types/quizQuestion'

const coursesStore = useCoursesStore()
const quizzesStore = useQuizzesStore()

// UI
const snackbar = ref(false)
const snackbarText = ref('')
function toast(msg: string) {
  snackbarText.value = msg
  snackbar.value = true
}

function formatDate(value?: string) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString()
}

// Left panel: selected quiz
const selectedQuizId = ref<string | null>(null)
const selectedQuiz = computed<Quiz | null>(() => {
  if (!selectedQuizId.value) return null
  return quizzesStore.items.find(q => q.id === selectedQuizId.value) ?? null
})

// Right panel state
const detailsLoading = ref(false)
const savingQuiz = ref(false)
const savingQuestion = ref(false)

const isCreateMode = ref(true) // true => creating new quiz, false => editing selected quiz

// Quiz form (big card)
const quizForm = ref<CreateQuizDto>({
  courseId: '',
  title: '',
  description: null,
  status: 'published',
  passScore: 70,
  timeLimitMin: 20,
})

// Questions list for selected quiz (or newly created quiz after save)
const questions = ref<QuizQuestion[]>([])

// Inline question form
const qForm = ref<CreateQuizQuestionDto>({
  quizId: '',
  text: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctOption: 'A',
  points: 1,
})

const canManageQuestions = computed(() => {
  // Questions require a quizId (quiz must exist in backend)
  return !!qForm.value.quizId
})

// Delete quiz
const delDialog = ref(false)
const deleting = ref(false)
const quizToDelete = ref<Quiz | null>(null)

function resetQuizFormForCreate() {
  isCreateMode.value = true
  selectedQuizId.value = null
  quizForm.value = {
    courseId: '',
    title: '',
    description: null,
    status: 'published',
    passScore: 70,
    timeLimitMin: 20,
  }
  questions.value = []
  qForm.value = {
    quizId: '',
    text: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'A',
    points: 1,
  }
}

function fillQuizFormForEdit(q: Quiz) {
  isCreateMode.value = false
  quizForm.value = {
    courseId: q.courseId,
    title: q.title,
    description: q.description ?? null,
    status: q.status,
    passScore: q.passScore,
    timeLimitMin: q.timeLimitMin,
  }
  qForm.value.quizId = q.id
}

// ===== Loaders =====
async function loadCoursesForSelect() {
  coursesStore.page = 1
  coursesStore.limit = 1000
  try {
    await coursesStore.fetchList()
  } catch {
    toast('Failed to load courses for select')
  }
}

async function loadQuizzesList() {
  try {
    await quizzesStore.fetchList()
  } catch {
    toast('Failed to load quizzes (check ngrok/API)')
  }
}

async function loadQuestionsForQuiz(quizId: string) {
  detailsLoading.value = true
  try {
    const res = await QuizQuestionsService.list({ quizId, page: 1, limit: 1000 })
    questions.value = res.data
  } catch {
    toast('Failed to load quiz questions')
    questions.value = []
  } finally {
    detailsLoading.value = false
  }
}

async function selectQuiz(q: Quiz) {
  selectedQuizId.value = q.id
  fillQuizFormForEdit(q)
  await loadQuestionsForQuiz(q.id)
}

// ===== Quiz CRUD =====
async function saveQuiz() {
  savingQuiz.value = true
  try {
    if (!quizForm.value.title?.trim()) {
      toast('Title is required')
      return
    }
    if (!quizForm.value.courseId?.trim()) {
      toast('Please select a course')
      return
    }

    if (isCreateMode.value) {
      const created = await QuizzesService.create(quizForm.value)
      toast('Quiz created. Now add questions.')

      // Refresh list and select created quiz
      await loadQuizzesList()

      selectedQuizId.value = created.id
      isCreateMode.value = false
      qForm.value.quizId = created.id

      // Load questions (empty at start)
      questions.value = []
    } else {
      if (!selectedQuiz.value) return
      const dto: UpdateQuizDto = { ...quizForm.value } as UpdateQuizDto
      await QuizzesService.update(selectedQuiz.value.id, dto)
      toast('Quiz updated')

      // Refresh list to update row UI
      await loadQuizzesList()
    }
  } catch {
    toast('API error: failed to save quiz')
  } finally {
    savingQuiz.value = false
  }
}

function askDeleteQuiz(q: Quiz) {
  quizToDelete.value = q
  delDialog.value = true
}

async function confirmDeleteQuiz() {
  if (!quizToDelete.value) return
  deleting.value = true
  try {
    await quizzesStore.remove(quizToDelete.value.id)
    toast('Quiz deleted')
    delDialog.value = false

    // If deleted quiz was selected, reset builder to create mode
    if (selectedQuizId.value === quizToDelete.value.id) {
      resetQuizFormForCreate()
    }

    await loadQuizzesList()
  } catch {
    toast('API error: failed to delete quiz')
  } finally {
    deleting.value = false
  }
}

// ===== Questions CRUD (inline create + single-question drawer edit) =====
async function addQuestion() {
  if (!qForm.value.quizId) {
    toast('Save quiz first to create questions')
    return
  }

  savingQuestion.value = true
  try {
    if (!qForm.value.text?.trim()) {
      toast('Question text is required')
      return
    }

    const payload: CreateQuizQuestionDto = {
      ...qForm.value,
      quizId: qForm.value.quizId,
      points: Number(qForm.value.points) || 1,
    }

    const created = await QuizQuestionsService.create(payload)
    questions.value = [created, ...questions.value]

    // Reset inline form (keep quizId)
    qForm.value = {
      quizId: payload.quizId,
      text: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 'A',
      points: 1,
    }

    toast('Question added')

    // Optional: refresh quizzes list (questionsCount might update)
    await loadQuizzesList()
  } catch {
    toast('API error: failed to add question')
  } finally {
    savingQuestion.value = false
  }
}

// Single-question drawer
const qDrawerOpen = ref(false)
const selectedQuestion = ref<QuizQuestion | null>(null)

function openQuestion(q: QuizQuestion) {
  selectedQuestion.value = q
  qDrawerOpen.value = true
}

async function refreshQuestions() {
  if (!qForm.value.quizId) return
  await loadQuestionsForQuiz(qForm.value.quizId)
  await loadQuizzesList()
}

// ===== On mount =====
onMounted(async () => {
  await loadCoursesForSelect()
  await loadQuizzesList()
  resetQuizFormForCreate()
})

// If pagination changes (if you use it), reload
watch(() => [quizzesStore.page, quizzesStore.limit], loadQuizzesList)
</script>

<template>
  <div class="pa-6">
    <VRow align="center" class="mb-6">
      <VCol cols="12" md="8">
        <h1 class="text-h4 mb-1">Quizzes</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Manage quizzes + questions in the same page (better UX)
        </p>
      </VCol>

      <VCol cols="12" md="4" class="d-flex justify-end gap-3">
        <VBtn variant="tonal" :loading="quizzesStore.loading" @click="loadQuizzesList">
          <VIcon icon="tabler-refresh" class="me-2" />
          Refresh
        </VBtn>

        <VBtn color="primary" @click="resetQuizFormForCreate">
          <VIcon icon="tabler-plus" class="me-2" />
          New Quiz
        </VBtn>
      </VCol>
    </VRow>

    <VRow>
      <!-- LEFT: Quizzes List -->
      <VCol cols="12" md="6">
        <VCard>
          <VCardTitle class="d-flex align-center justify-space-between">
            <span class="text-h6 font-weight-semibold">Quizzes List</span>
            <VChip size="small" variant="tonal" color="info">
              {{ quizzesStore.total }}
            </VChip>
          </VCardTitle>

          <VDivider />

          <VCardText>
            <LoadingSkeleton v-if="quizzesStore.loading" type="table" />

            <EmptyState
              v-else-if="!quizzesStore.items.length"
              title="No quizzes found"
              subtitle="Create your first quiz."
              action-text="New Quiz"
              @action="resetQuizFormForCreate"
            />

            <div v-else class="table-wrap">
              <VTable>
                <thead>
                  <tr>
                    <th>Quiz</th>
                    <th>Status</th>
                    <th>Q</th>
                    <th>Action</th>
                   
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="q in quizzesStore.items"
                    :key="q.id"
                    :style="selectedQuizId === q.id ? 'background: rgba(var(--v-theme-primary), 0.06);' : ''"
                    @click="selectQuiz(q)"
                    style="cursor: pointer;"
                  >
                    <td>
                      <div class="font-weight-medium">{{ q.title }}</div>
                      <div class="text-caption text-medium-emphasis">
                        {{ q.timeLimitMin }} min • Pass {{ q.passScore }}%
                      </div>
                    </td>

                    <td>
                      <VChip
                        size="small"
                        variant="tonal"
                        :color="q.status === 'published' ? 'success' : 'warning'"
                      >
                        {{ q.status }}
                      </VChip>
                    </td>

                    <td>
                      <VChip size="small" variant="tonal" color="info">
                        {{ q.questionsCount }}
                      </VChip>
                    </td>

                    <td class="text-right" @click.stop>
                      <VBtn icon size="small" variant="tonal" color="info" class="me-2" @click="selectQuiz(q)">
                        <VIcon icon="tabler-pencil" />
                      </VBtn>
                      <VBtn icon size="small" variant="tonal" color="error" @click="askDeleteQuiz(q)">
                        <VIcon icon="tabler-trash" />
                      </VBtn>
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <!-- RIGHT: Big Builder Card -->
      <VCol cols="12" md="6">
        <VCard>
          <VCardTitle class="d-flex align-center justify-space-between">
            <div>
              <div class="text-h6 font-weight-semibold">
                {{ isCreateMode ? 'Create Quiz' : 'Edit Quiz' }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ isCreateMode ? 'Fill quiz info and save, then add questions.' : `Quiz ID: ${qForm.quizId.slice(0, 8)}...` }}
              </div>
            </div>

            <VBtn color="primary" :loading="savingQuiz" @click="saveQuiz">
              <VIcon icon="tabler-device-floppy" class="me-2" />
              Save
            </VBtn>
          </VCardTitle>

          <VDivider />

          <VCardText>
            <!-- Quiz Form -->
            <VRow>
              <VCol cols="12">
                <VSelect
                  v-model="quizForm.courseId"
                  :items="coursesStore.items"
                  item-title="title"
                  item-value="id"
                  label="Course"
                  persistent-hint
                  :hint="quizForm.courseId ? `Selected: ${quizForm.courseId.slice(0, 8)}...` : 'Select a course' "
                >
                  <template #item="{ props, item }">
                    <VListItem
                      v-bind="props"
                      :title="item.raw.title"
                      :subtitle="item.raw.category || item.raw.level || ''"
                    />
                  </template>
                </VSelect>
              </VCol>

              <VCol cols="12" md="6">
                <VTextField v-model="quizForm.title" label="Title" />
              </VCol>

              <VCol cols="12" md="6">
                <VSelect v-model="quizForm.status" :items="['draft','published']" label="Status" />
              </VCol>

              <VCol cols="12">
                <VTextarea v-model="quizForm.description" label="Description" rows="2" />
              </VCol>

              <VCol cols="12" md="6">
                <VTextField v-model="quizForm.passScore" type="number" label="Pass Score (%)" />
              </VCol>

              <VCol cols="12" md="6">
                <VTextField v-model="quizForm.timeLimitMin" type="number" label="Time Limit (min)" />
              </VCol>
            </VRow>

            <VDivider class="my-6" />

            <!-- Questions Section -->
            <div class="d-flex align-center justify-space-between mb-3">
              <div class="text-h6 font-weight-semibold">Questions</div>
              <VChip size="small" variant="tonal" color="info">
                {{ questions.length }}
              </VChip>
            </div>

            <VAlert v-if="!canManageQuestions" type="info" variant="tonal" class="mb-4">
              Save the quiz first to enable question creation.
            </VAlert>

            <!-- Inline Add Question Form -->
            <VCard variant="tonal" class="mb-4">
              <VCardText>
                <VRow>
                  <VCol cols="12">
                    <VTextarea v-model="qForm.text" label="Question text" rows="2" :disabled="!canManageQuestions" />
                  </VCol>

                  <VCol cols="12" md="6">
                    <VTextField v-model="qForm.optionA" label="Option A" :disabled="!canManageQuestions" />
                  </VCol>
                  <VCol cols="12" md="6">
                    <VTextField v-model="qForm.optionB" label="Option B" :disabled="!canManageQuestions" />
                  </VCol>

                  <VCol cols="12" md="6">
                    <VTextField v-model="qForm.optionC" label="Option C" :disabled="!canManageQuestions" />
                  </VCol>
                  <VCol cols="12" md="6">
                    <VTextField v-model="qForm.optionD" label="Option D" :disabled="!canManageQuestions" />
                  </VCol>

                  <VCol cols="12" md="6">
                    <VSelect v-model="qForm.correctOption" :items="['A','B','C','D']" label="Correct option" :disabled="!canManageQuestions" />
                  </VCol>

                  <VCol cols="12" md="6">
                    <VTextField v-model="qForm.points" type="number" label="Points" :disabled="!canManageQuestions" />
                  </VCol>
                </VRow>

                <div class="d-flex justify-end">
                  <VBtn color="primary" :loading="savingQuestion" :disabled="!canManageQuestions" @click="addQuestion">
                    <VIcon icon="tabler-plus" class="me-2" />
                    Add Question
                  </VBtn>
                </div>
              </VCardText>
            </VCard>

            <!-- Questions List -->
            <LoadingSkeleton v-if="detailsLoading" type="table" />

            <EmptyState
              v-else-if="canManageQuestions && !questions.length"
              title="No questions"
              subtitle="Add your first question using the form above."
            />

            <div v-else-if="questions.length" class="table-wrap">
              <VTable>
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Correct</th>
                    <th>Points</th>
                    <th class="text-right">
                      <VIcon icon="tabler-eye" color="info" size="18" />
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="(q, idx) in questions" :key="q.id">
                    <td style="max-width: 360px;">
                      <div class="font-weight-medium">
                        {{ `Q${idx + 1}. ${q.text}` }}
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        A: {{ q.optionA }} • B: {{ q.optionB }} • C: {{ q.optionC }} • D: {{ q.optionD }}
                      </div>
                    </td>

                    <td>
                      <VChip size="small" variant="tonal" color="info">
                        {{ q.correctOption }}
                      </VChip>
                    </td>

                    <td>{{ q.points }}</td>

                    <td class="text-right">
                      <VBtn icon size="small" variant="tonal" color="info" @click="openQuestion(q)">
                        <VIcon icon="tabler-eye" />
                      </VBtn>
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Single Question Drawer -->
    <QuizQuestionDrawer
      v-model="qDrawerOpen"
      :question="selectedQuestion"
      @updated="refreshQuestions"
      @deleted="refreshQuestions"
    />

    <!-- Delete Quiz Confirm -->
    <ConfirmDialog
      v-model="delDialog"
      title="Delete quiz"
      :message="`Delete quiz: ${quizToDelete?.title ?? ''}?`"
      confirm-text="Delete"
      :loading="deleting"
      @confirm="confirmDeleteQuiz"
    />

    <VSnackbar v-model="snackbar" timeout="2500" location="bottom end">
      {{ snackbarText }}
    </VSnackbar>
  </div>
</template>

<style scoped>
.table-wrap { overflow-x: auto; }
</style>
