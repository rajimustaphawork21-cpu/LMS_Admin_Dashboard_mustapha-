// src/stores/courses.store.ts
import { defineStore } from 'pinia'
import { CoursesService } from '@/services/courses.service'
import type { Course, CreateCourseDto, UpdateCourseDto } from '@/types/course'

export const useCoursesStore = defineStore('courses', {
  state: () => ({
    items: [] as Course[],
    total: 0,
    loading: false,
    error: '' as string | null,

    // table query
    page: 1,
    limit: 10,
    search: '',
  }),

  actions: {
    async fetchList() {
      this.loading = true
      this.error = null
      try {
        const { data, total } = await CoursesService.list({
          page: this.page,
          limit: this.limit,
          search: this.search || undefined,
        })

        this.items = data
        this.total = total
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to load courses'
        throw e
      } finally {
        this.loading = false
      }
    },

    async create(dto: CreateCourseDto) {
      try {
        const created = await CoursesService.create(dto)
        // Optimistic: prepend
        this.items = [created, ...this.items]
        this.total += 1
        return created
      } catch (e) {
        throw e
      }
    },

    async update(id: string, dto: UpdateCourseDto) {
      try {
        const updated = await CoursesService.update(id, dto)
        const idx = this.items.findIndex(i => i.id === id)
        if (idx !== -1) this.items[idx] = updated
        return updated
      } catch (e) {
        throw e
      }
    },

    async remove(id: string) {
      try {
        await CoursesService.remove(id)
        this.items = this.items.filter(i => i.id !== id)
        this.total = Math.max(0, this.total - 1)
        return true
      } catch (e) {
        throw e
      }
    },
  },
})
