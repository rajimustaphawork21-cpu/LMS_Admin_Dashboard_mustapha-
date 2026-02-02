// src/stores/quizzes.store.ts
import { defineStore } from 'pinia'
import { QuizzesService } from '@/services/quizzes.service'
import type { Quiz, CreateQuizDto, UpdateQuizDto } from '@/types/quiz'

export const useQuizzesStore = defineStore('quizzes', {
  state: () => ({
    items: [] as Quiz[],
    total: 0,
    loading: false,
    page: 1,
    limit: 10,
    courseId: '' as string,
  }),

  actions: {
    async fetchList() {
      this.loading = true
      try {
        const { data, total } = await QuizzesService.list({
          page: this.page,
          limit: this.limit,
          courseId: this.courseId || undefined,
        })
        this.items = data
        this.total = total
      } finally {
        this.loading = false
      }
    },

    async create(dto: CreateQuizDto) {
      const created = await QuizzesService.create(dto)
      this.items = [created, ...this.items]
      this.total++
      return created
    },

    async update(id: string, dto: UpdateQuizDto) {
      const updated = await QuizzesService.update(id, dto)
      const idx = this.items.findIndex(q => q.id === id)
      if (idx !== -1) this.items[idx] = updated
      return updated
    },

    async remove(id: string) {
      await QuizzesService.remove(id)
      this.items = this.items.filter(q => q.id !== id)
      this.total = Math.max(0, this.total - 1)
      return true
    },
  },
})
