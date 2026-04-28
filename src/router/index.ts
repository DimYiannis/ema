import { createRouter, createWebHistory } from "vue-router";
import Index from "@/views/Index.vue";

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash) return { el: to.hash, behavior: "smooth" };
    return { top: 0, behavior: "smooth" };
  },
  routes: [
    { path: "/", component: Index },
    { path: "/articles", component: () => import("@/views/ArticlesEvidence.vue") },
    { path: "/login", component: () => import("@/views/Login.vue") },
    { path: "/register", component: () => import("@/views/Register.vue") },
    { path: "/dashboard", component: () => import("@/views/Dashboard.vue") },
    { path: "/voice", component: () => import("@/views/Voice.vue") },
    { path: "/subscription", component: () => import("@/views/Subscription.vue") },
    { path: "/:pathMatch(.*)*", component: () => import("@/views/NotFound.vue") },
  ],
});

export default router;
