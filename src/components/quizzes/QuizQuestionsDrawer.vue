<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import type { QuizQuestion, UpdateQuizQuestionDto, CorrectOption } from '@/types/quizQuestion'
import { QuizQuestionsService } from '@/services/quizQuestions.service'

const props = defineProps<{
  modelValue: boolean
  question: QuizQuestion | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'updated'): void
  (e: 'deleted'): void
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const saving = ref(false)
const snackbar = ref(false)
const snackbarText = ref('')

const delDialog = ref(false)
const deleting = ref(false)

function toast(msg: string) {
  snackbarText.value = msg
  snackbar.value = true
}

const form = ref<UpdateQuizQuestionDto>({
  text: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctOption: 'A',
  points: 1,
})

watch(
  () => props.question,
  q => {
    if (!q) return
    form.value = {
      text: q.text,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctOption: q.correctOption,
      points: q.points,
    }
  },
  { immediate: true },
)

async function save() {
  if (!props.question) return
  saving.value = true
  try {
    if (!form.value.text?.trim()) {
      toast('Question text is required')
      return
    }

    await QuizQuestionsService.update(props.question.id, {
      ...form.value,
      correctOption: form.value.correctOption as CorrectOption,
      points: Number(form.value.points) || 1,
    })

    toast('Question updated')
    emit('updated')
    isOpen.value = false
  } catch (e) {
    toast('API error: failed to update question')
  } finally {
    saving.value = false
  }
}

async function confirmDelete() {
  if (!props.question) return
  deleting.value = true
  try {
    await QuizQuestionsService.remove(props.question.id)
    toast('Question deleted')
    emit('deleted')
    delDialog.value = false
    isOpen.value = false
  } catch (e) {
    toast('API error: failed to delete question')
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <VNavigationDrawer v-model="isOpen" location="right" temporary width="520">
    <div class="pa-4 d-flex align-center justify-space-between">
      <div>
        <div class="text-body-1 font-weight-semibold">Edit Question</div>
        <div class="text-caption text-medium-emphasis">
          {{ question?.id ? `ID: ${question.id.slice(0, 8)}...` : '' }}
        </div>
      </div>

      <VBtn icon variant="text" @click="isOpen = false">
        <VIcon icon="tabler-x" />
      </VBtn>
    </div>

    <VDivider />

    <div class="pa-4">
      <VRow>
        <VCol cols="12">
          <VTextarea v-model="form.text" label="Question text" rows="2" />
        </VCol>

        <VCol cols="12" md="6">
          <VTextField v-model="form.optionA" label="Option A" />
        </VCol>
        <VCol cols="12" md="6">
          <VTextField v-model="form.optionB" label="Option B" />
        </VCol>

        <VCol cols="12" md="6">
          <VTextField v-model="form.optionC" label="Option C" />
        </VCol>
        <VCol cols="12" md="6">
          <VTextField v-model="form.optionD" label="Option D" />
        </VCol>

        <VCol cols="12" md="6">
          <VSelect v-model="form.correctOption" :items="['A','B','C','D']" label="Correct option" />
        </VCol>

        <VCol cols="12" md="6">
          <VTextField v-model="form.points" type="number" label="Points" />
        </VCol>
      </VRow>

      <div class="d-flex justify-end gap-3 mt-3">
        <VBtn variant="tonal" color="error" @click="delDialog = true">
          <VIcon icon="tabler-trash" class="me-2" />
          Delete
        </VBtn>

        <VBtn color="primary" :loading="saving" @click="save">
          <VIcon icon="tabler-device-floppy" class="me-2" />
          Save
        </VBtn>
      </div>
    </div>

    <ConfirmDialog
      v-model="delDialog"
      title="Delete question"
      message="Are you sure you want to delete this question?"
      confirm-text="Delete"
      :loading="deleting"
      @confirm="confirmDelete"
    />

    <VSnackbar v-model="snackbar" timeout="2500" location="bottom end">
      {{ snackbarText }}
    </VSnackbar>
  </VNavigationDrawer>
</template>
