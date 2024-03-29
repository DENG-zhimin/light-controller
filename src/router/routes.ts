import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      // { path: '', component: () => import('pages/Ble.vue') },
      { path: '', component: () => import('pages/Index.vue') },
      { path: 'bledev', component: () => import('pages/BleDev.vue') },
      // {
      //   path: 'ble',
      //   name: 'ble',
      //   component: () => import('pages/Ble.vue'),
      // },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
