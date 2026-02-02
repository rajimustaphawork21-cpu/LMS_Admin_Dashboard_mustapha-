// src/router/routes/admin.routes.ts
export default [
  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: () => import('@/pages/admin/Dashboard.vue'),
  },
  {
    path: '/admin/courses',
    name: 'admin-courses',
    component: () => import('@/pages/admin/Courses.vue'),
  },
  {
    path: '/admin/quizzes',
    name: 'admin-quizzes',
    component: () => import('@/pages/admin/Quizzes.vue'),
  },
  {
    path: '/admin/students',
    name: 'admin-students',
    component: () => import('@/pages/admin/Students.vue'),
  },
  {
    path: '/admin/certificates',
    name: 'admin-certificates',
    component: () => import('@/pages/admin/Certificates.vue'),
  },
  {
    path: '/admin/settings',
    name: 'admin-settings',
    component: () => import('@/pages/admin/Settings.vue'),
  },
]
