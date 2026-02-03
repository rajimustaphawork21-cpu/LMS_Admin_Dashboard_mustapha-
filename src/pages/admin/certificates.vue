<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import EmptyState from '@/components/shared/EmptyState.vue'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'

import { useCertificatesStore } from '@/stores/certificates.store'
import type { Certificate } from '@/types/certificate'

const router = useRouter()
const store = useCertificatesStore()

// Snackbar
const snackbar = ref(false)
const snackbarText = ref('')
function toast(msg: string) {
  snackbarText.value = msg
  snackbar.value = true
}

// Edit dialog (simple)
const editDialog = ref(false)
const saving = ref(false)
const edited = ref<Certificate | null>(null)
const editStatus = ref<string>('generated')
const editIssuedAt = ref<string>('')

// Delete
const deleteDialog = ref(false)
const deleting = ref(false)
const toDelete = ref<Certificate | null>(null)

function viewCertificate(item: Certificate) {
  router.push({ name: 'admin-view-id', params: { id: item.id } })
}

function openEdit(item: Certificate) {
  edited.value = item
  editStatus.value = item.status ?? 'generated'
  editIssuedAt.value = item.issuedAt ?? ''
  editDialog.value = true
}

async function saveEdit() {
  if (!edited.value)
   return saving.value = true
  try {
    await store.update(edited.value.id, {
      status: editStatus.value,
      issuedAt: editIssuedAt.value,
    })
    toast('Certificate updated')
    editDialog.value = false
    edited.value = null
    await store.fetchList()
  } catch {
    toast('API error: failed to update')
  } finally {
    saving.value = false
  }
}

function askDelete(item: Certificate) {
  toDelete.value = item
  deleteDialog.value = true
}

async function confirmDelete() {
  if (!toDelete.value) return
  deleting.value = true
  try {
    await store.remove(toDelete.value.id)
    toast('Certificate deleted')
    deleteDialog.value = false
    toDelete.value = null
    await store.fetchList()
  } catch {
    toast('API error: failed to delete')
  } finally {
    deleting.value = false
  }
}

function formatDate(v?: string) {
  if (!v) return '—'
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString()
}

const headers = computed(() => ([
  { title: 'Student', key: 'student', sortable: false },
  { title: 'Course', key: 'course', sortable: false },
  { title: 'Type', key: 'type', sortable: false },
  { title: 'Issued', key: 'issuedAt', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
]))

onMounted(async () => {
  try {
    await store.fetchList()
  } catch {
    toast('Failed to load certificates (check ngrok/API)')
  }
})
</script>

<template>
  <div class="pa-6">
    <VRow align="center" class="mb-6">
      <VCol cols="12" md="8">
        <h1 class="text-h4 mb-1">Certificates</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">Issued certificates list</p>
      </VCol>

      <VCol cols="12" md="4" class="d-flex justify-end gap-3">
        <VBtn variant="tonal" @click="store.fetchList">
          <VIcon icon="tabler-refresh" class="me-2" />
          Refresh
        </VBtn>
      </VCol>
    </VRow>

    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between">
        <span class="text-h6 font-weight-semibold">Certificates</span>
        <VChip size="small" variant="tonal" color="info">{{ store.total }}</VChip>
      </VCardTitle>

      <VDivider />

      <VCardText>
        <LoadingSkeleton v-if="store.loading" type="table" />

        <EmptyState
          v-else-if="!store.items.length"
          title="No certificates found"
          subtitle="Certificates will appear here when generated."
        />

        <div v-else class="table-wrap">
          <VTable>
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Type</th>
                <th>Issued</th>
                <th>Status</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="c in store.items" :key="c.id">
                <td>
                  <div class="d-flex align-center gap-3">
                    <VAvatar size="34" :image="c.student?.avatar ?? undefined">
                      <span v-if="!c.student?.avatar">{{ (c.student?.fullName ?? '—').slice(0, 1) }}</span>
                    </VAvatar>
                    <div>
                      <div class="font-weight-medium">{{ c.student?.fullName ?? '—' }}</div>
                      <div class="text-caption text-medium-emphasis">{{ c.student?.email ?? '—' }}</div>
                    </div>
                  </div>
                </td>

                <td>
                  <div class="font-weight-medium">{{ c.course?.title ?? '—' }}</div>
                  <div class="text-caption text-medium-emphasis">{{ c.course?.category ?? '—' }}</div>
                </td>

                <td>
                  <VChip size="small" variant="tonal" color="primary">
                    {{ c.course?.category ?? 'General' }}
                  </VChip>
                </td>

                <td>{{ formatDate(c.issuedAt) }}</td>

                <td>
                  <VChip size="small" variant="tonal" :color="c.status === 'generated' ? 'success' : 'warning'">
                    {{ c.status }}
                  </VChip>
                </td>

                <td class="text-right" @click.stop>
                    <VBtnGroup variant="tonal" rounded="lg" density="comfortable" class="action-group">
                      <VBtn icon color="info" title="View" @click="viewCertificate(c)">
                        <VIcon icon="tabler-eye" size="18" />
                      </VBtn>
                    
                      <VBtn icon color="primary" title="Edit" @click="openEdit(c)">
                        <VIcon icon="tabler-pencil" size="18" />
                      </VBtn>
                    
                      <VBtn icon color="error" title="Delete" @click="askDelete(c)">
                        <VIcon icon="tabler-trash" size="18" />
                      </VBtn>
                    </VBtnGroup>
                </td>

              </tr>
            </tbody>
          </VTable>
        </div>
      </VCardText>
    </VCard>

    <!-- Edit dialog (simple) -->
    <VDialog v-model="editDialog" width="520">
      <VCard>
        <VCardTitle class="text-h6">Edit Certificate</VCardTitle>
        <VCardText>
          <VRow>
            <VCol cols="12">
              <VSelect v-model="editStatus" label="Status" :items="['generated', 'pending', 'revoked']" hide-details />
            </VCol>
            <VCol cols="12">
              <VTextField v-model="editIssuedAt" label="Issued At" hide-details />
            </VCol>
          </VRow>
        </VCardText>
        <VCardActions class="justify-end">
          <VBtn variant="text" :disabled="saving" @click="editDialog=false">Cancel</VBtn>
          <VBtn color="primary" :loading="saving" @click="saveEdit">Save</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete confirm -->
    <ConfirmDialog
      v-model="deleteDialog"
      title="Delete certificate"
      :message="`Delete certificate: ${toDelete?.id?.slice(0, 8) ?? ''}...?`"
      confirm-text="Delete"
      :loading="deleting"
      @confirm="confirmDelete"
    />

    <VSnackbar v-model="snackbar" timeout="2500" location="bottom end">
      {{ snackbarText }}
    </VSnackbar>
  </div>
</template>

<style scoped>
.table-wrap { overflow-x: auto; }
</style>
