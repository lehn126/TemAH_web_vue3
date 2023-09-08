import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/alarm',
      name: 'alarm',
      component: () => import('../views/alarm/AlarmView.vue')
    },
    {
      path: '/task',
      component: () => import('../views/task/TaskView.vue'),
      children: [
        { path: '', name: 'task', component: () => import('../views/task/TaskListView.vue') }, // 确保打开task后该子路由默认被渲染
        {
          path: 'list',
          name: 'task-list',
          component: () => import('../views/task/TaskListView.vue')
        },
        {
          path: 'create',
          name: 'task-create',
          component: () => import('../views/task/TaskCreateView.vue')
        }
      ]
    }
  ]
})

export default router
