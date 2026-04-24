import { createRouter, createWebHistory } from "vue-router";
import Index from "@/views/Index.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: Index },
    { path: "/articles", component: () => import("@/views/ArticlesEvidence.vue") },
    { path: "/login", component: () => import("@/views/Login.vue") },
    { path: "/register", component: () => import("@/views/Register.vue") },
    { path: "/dashboard", component: () => import("@/views/Dashboard.vue") },
    { path: "/subscription", component: () => import("@/views/Subscription.vue") },
    { path: "/:pathMatch(.*)*", component: () => import("@/views/NotFound.vue") },
  ],
});

export default router;
