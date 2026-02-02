// src/stores/students.store.ts
import { defineStore } from 'pinia'
import { StudentsService } from '@/services/students.service'
import type { Student, CreateStudentDto, UpdateStudentDto } from '@/types/student'

export const useStudentsStore = defineStore('students', {
  state: () => ({
    items: [] as Student[],
    total: 0,
    loading: false,
    page: 1,
    limit: 10,
    search: '',
  }),

  actions: {
    async fetchList() {
      this.loading = true
      try {
        const { data, total } = await StudentsService.list({
          page: this.page,
          limit: this.limit,
          search: this.search || undefined,
        })
        this.items = data
        this.total = total
      } finally {
        this.loading = false
      }
    },

    async create(dto: CreateStudentDto) {
      const created = await StudentsService.create(dto)
      this.items = [created, ...this.items]
      this.total++
    },

    async update(id: string, dto: UpdateStudentDto) {
      const updated = await StudentsService.update(id, dto)
      const idx = this.items.findIndex(s => s.id === id)
      if (idx !== -1) this.items[idx] = updated
    },

    async remove(id: string) {
      await StudentsService.remove(id)
      this.items = this.items.filter(s => s.id !== id)
      this.total--
    },
  },
})
