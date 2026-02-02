<!-- src/pages/admin/Courses.vue -->
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useCoursesStore } from '@/stores/courses.store'
import type { Course, CreateCourseDto, UpdateCourseDto } from '@/types/course'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton.vue'

const store = useCoursesStore()

// UI
const snackbar = ref(false)
const snackbarText = ref('')

const dialogOpen = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const saving = ref(false)

const deleteDialog = ref(false)
const deleting = ref(false)
const courseToDelete = ref<Course | null>(null)

const form = ref<CreateCourseDto>({
  title: '',
  description: null,
  category: null,
  level: 'Beginner',
  status: 'published',
  price: null,
  thumbnail: null,
})

const editedId = ref<string | null>(null)

function toast(msg: string) {
  snackbarText.value = msg
  snackbar.value = true
}

function resetForm() {
  form.value = {
    title: '',
    description: null,
    category: null,
    level: 'Beginner',
    status: 'published',
    price: null,
    thumbnail: null,
  }
  editedId.value = null
}

function openCreate() {
  dialogMode.value = 'create'
  resetForm()
  dialogOpen.value = true
}

function openEdit(item: Course) {
  dialogMode.value = 'edit'
  editedId.value = item.id
  form.value = {
    title: item.title ?? '',
    description: item.description ?? null,
    category: item.category ?? null,
    level: item.level ?? 'Beginner',
    status: item.status ?? 'published',
    price: item.price ?? null,
    thumbnail: item.thumbnail ?? null,
  }
  dialogOpen.value = true
}

async function submit() {
  saving.value = true
  try {
    if (!form.value.title?.trim()) {
      toast('Title is required')
      return
    }

    if (dialogMode.value === 'create') {
      await store.create(form.value)
      toast('Course created successfully')
    } else if (dialogMode.value === 'edit' && editedId.value) {
      const dto: UpdateCourseDto = { ...form.value }
      await store.update(editedId.value, dto)
      toast('Course updated successfully')
    }

    dialogOpen.value = false
    // Refresh list to keep pagination correct
    await store.fetchList()
  } catch (e: any) {
    toast('API error: failed to save course')
  } finally {
    saving.value = false
  }
}

function askDelete(item: Course) {
  courseToDelete.value = item
  deleteDialog.value = true
}

async function confirmDelete() {
  if (!courseToDelete.value) return
  deleting.value = true
  try {
    await store.remove(courseToDelete.value.id)
    toast('Course deleted')
    deleteDialog.value = false
    courseToDelete.value = null
    await store.fetchList()
  } catch (e) {
    toast('API error: failed to delete course')
  } finally {
    deleting.value = false
  }
}

// Table helpers
function formatDate(value?: string) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString()
}

const headers = computed(() => ([
  { title: 'Title', key: 'title', sortable: false },
  { title: 'Category', key: 'category', sortable: false },
  { title: 'Level', key: 'level', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Updated', key: 'updatedAt', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
]))

// Load
async function load() {
  try {
    await store.fetchList()
  } catch (e) {
    toast('Failed to load courses (check ngrok/API)')
  }
}

onMounted(load)

// React to search/pagination
watch(
  () => [store.page, store.limit],
  () => load(),
)

// Debounced-ish search
let searchTimer: any = null
watch(
  () => store.search,
  () => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      store.page = 1
      load()
    }, 300)
  },
)
</script>

<template>
  <div class="pa-6">
    <!-- Header -->
    <VRow align="center" class="mb-6">
      <VCol cols="12" md="6">
        <h1 class="text-h4 mb-1">Courses</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Manage courses (CRUD) from Swagger API: <span class="font-weight-medium">/api/courses</span>
        </p>
      </VCol>

      <VCol cols="12" md="6" class="d-flex justify-end gap-3">
        <VBtn variant="tonal" :loading="store.loading" @click="load">
          <VIcon icon="tabler-refresh" class="me-2" />
          Refresh
        </VBtn>

        <VBtn color="primary" @click="openCreate">
          <VIcon icon="tabler-plus" class="me-2" />
          New Course
        </VBtn>
      </VCol>
    </VRow>

    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between flex-wrap gap-3">
        <div class="text-h6 font-weight-semibold">Courses List</div>

        <div class="d-flex align-center gap-3">
          <VTextField
            v-model="store.search"
            density="compact"
            variant="outlined"
            hide-details
            placeholder="Search..."
            prepend-inner-icon="tabler-search"
            style="width: 260px;"
          />

          <VSelect
            v-model="store.limit"
            :items="[5, 10, 20, 50]"
            density="compact"
            variant="outlined"
            hide-details
            style="width: 120px;"
            label="Per page"
          />
        </div>
      </VCardTitle>

      <VDivider />

      <VCardText>
        <LoadingSkeleton v-if="store.loading" type="table" />

        <EmptyState
          v-else-if="!store.items.length"
          title="No courses found"
          subtitle="Create your first course to get started."
          action-text="Create Course"
          @action="openCreate"
        />

        <div v-else class="table-wrap">
          <!-- Vuexy/Vuetify projects sometimes use VDataTable from labs.
               To keep it compatible, we use VTable + simple pagination UI. -->
          <VTable>
            <thead>
              <tr>
                <th class="text-left">Title</th>
                <th class="text-left">Category</th>
                <th class="text-left">Level</th>
                <th class="text-left">Status</th>
                <th class="text-left">Updated</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="c in store.items" :key="c.id">
                <td>
                  <div class="font-weight-medium">{{ c.title }}</div>
                  <div class="text-caption text-medium-emphasis" style="max-width: 520px;">
                    {{ c.description || '—' }}
                  </div>
                </td>
                <td class="text-medium-emphasis">{{ c.category || '—' }}</td>
                <td class="text-medium-emphasis">{{ c.level || '—' }}</td>
                <td>
                  <VChip size="small"
                        variant="tonal"
                        :color="c.status === 'published' ? 'success' : 'warning'" >
                    {{ c.status || '—' }}
                  </VChip>
                </td>
                <td class="text-medium-emphasis">{{ formatDate(c.updatedAt) }}</td>
                <td class="text-right">
                  <VBtn size="small" variant="tonal" class="me-2" @click="openEdit(c)">
                    Edit
                  </VBtn>
                  <VBtn size="small" color="error" variant="tonal" @click="askDelete(c)">
                    Delete
                  </VBtn>
                </td>
              </tr>
            </tbody>
          </VTable>

          <!-- Pagination -->
          <div class="d-flex align-center justify-space-between mt-4 flex-wrap gap-3">
            <div class="text-body-2 text-medium-emphasis">
              Total: <span class="font-weight-medium">{{ store.total }}</span>
            </div>

            <div class="d-flex align-center gap-3">
              <VBtn
                variant="tonal"
                :disabled="store.page <= 1"
                @click="store.page = Math.max(1, store.page - 1)"
              >
                Prev
              </VBtn>

              <div class="text-body-2">
                Page <span class="font-weight-medium">{{ store.page }}</span>
              </div>

              <VBtn
                variant="tonal"
                :disabled="store.page * store.limit >= store.total"
                @click="store.page = store.page + 1"
              >
                Next
              </VBtn>
            </div>
          </div>
        </div>
      </VCardText>
    </VCard>

    <!-- Create/Edit Dialog -->
    <VDialog v-model="dialogOpen" width="720">
      <VCard>
        <VCardTitle class="text-h6">
          {{ dialogMode === 'create' ? 'Create Course' : 'Edit Course' }}
        </VCardTitle>
        <VCardText>
          <VRow>
            <VCol cols="12" md="6">
              <VTextField v-model="form.title" label="Title" />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField v-model="form.category" label="Category" />
            </VCol>

            <VCol cols="12" md="6">
              <VSelect
                v-model="form.level"
                :items="['Beginner', 'Intermediate', 'Advanced']"
                label="Level"
              />
            </VCol>

            <VCol cols="12" md="6">
              <VSelect
                v-model="form.status"
                :items="['draft', 'published']"
                label="Status"
              />
            </VCol>

            <VCol cols="12" md="6">
              <VTextField v-model="form.price" label="Price" type="number" />
            </VCol>

            <VCol cols="12" md="6">
              <VTextField v-model="form.thumbnail" label="Thumbnail URL" />
            </VCol>

            <VCol cols="12">
              <VTextarea v-model="form.description" label="Description" rows="3" />
            </VCol>
          </VRow>
        </VCardText>

        <VCardActions class="justify-end">
          <VBtn variant="text" :disabled="saving" @click="dialogOpen = false">
            Cancel
          </VBtn>
          <VBtn color="primary" :loading="saving" @click="submit">
            Save
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete confirm -->
    <ConfirmDialog
      v-model="deleteDialog"
      title="Delete course"
      :message="`Do you really want to delete: ${courseToDelete?.title ?? ''}?`"
      confirm-text="Delete"
      cancel-text="Cancel"
      :loading="deleting"
      @confirm="confirmDelete"
    />

    <!-- Toast -->
    <VSnackbar v-model="snackbar" timeout="2600" location="bottom end">
      {{ snackbarText }}
    </VSnackbar>
  </div>
</template>

<style scoped>
.table-wrap { overflow-x: auto; }
</style>
