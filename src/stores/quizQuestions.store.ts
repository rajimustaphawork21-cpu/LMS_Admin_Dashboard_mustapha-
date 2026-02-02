// src/stores/quizQuestions.store.ts
import { defineStore } from 'pinia'
import { QuizQuestionsService } from '@/services/quizQuestions.service'
import type { QuizQuestion, CreateQuizQuestionDto, UpdateQuizQuestionDto } from '@/types/quizQuestion'

export const useQuizQuestionsStore = defineStore('quizQuestions', {
  state: () => ({
    items: [] as QuizQuestion[],
    total: 0,
    loading: false,
    page: 1,
    limit: 10,
    quizId: '' as string,
  }),

  actions: {
    async fetchList() {
      this.loading = true
      try {
        const { data, total } = await QuizQuestionsService.list({
          page: this.page,
          limit: this.limit,
          quizId: this.quizId || undefined,
        })
        this.items = data
        this.total = total
      } finally {
        this.loading = false
      }
    },

    async fetchByQuizId(quizId: string) {
      this.quizId = quizId
      this.page = 1
      // Get many for drawer
      this.limit = 1000
      await this.fetchList()
    },

    async create(dto: CreateQuizQuestionDto) {
      const created = await QuizQuestionsService.create(dto)
      this.items = [created, ...this.items]
      this.total++
      return created
    },

    async update(id: string, dto: UpdateQuizQuestionDto) {
      const updated = await QuizQuestionsService.update(id, dto)
      const idx = this.items.findIndex(q => q.id === id)
      if (idx !== -1) this.items[idx] = updated
      return updated
    },

    async remove(id: string) {
      await QuizQuestionsService.remove(id)
      this.items = this.items.filter(q => q.id !== id)
      this.total = Math.max(0, this.total - 1)
      return true
    },
  },
})
