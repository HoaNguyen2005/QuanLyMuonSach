import { createRouter, createWebHistory } from "vue-router";
import AuthService from "@/services/auth.service";

const routes = [
  {
    path: '/landing',
    name: 'landing',
    component: () => import("@/views/LandingView.vue")
  },
  // Auth
  { 
    path: "/login", 
    name: "login", 
    component: () => import("@/views/auth/Login.vue")
  },
  { 
    path: "/register",
    name: "register", 
    component: () => import("@/views/auth/Register.vue") 
  },

  // --- GIAO DIỆN ĐỘC GIẢ ---
  { 
    path: "/", 
    name: "reader.home", 
    component: () => import("@/views/reader/HomeView.vue") 
  },
  { 
    path: "/sach/:id", 
    name: "reader.sach.detail", 
    component: () => import("@/views/reader/SachDetailView.vue") 
  },
  { 
    path: "/lich-su-muon", 
    name: "reader.lichsu", 
    component: () => import("@/views/reader/LichSuMuonView.vue"),
    meta: { requiresAuth: true, role: "docgia" } 
  },
  { 
    path: "/profile", 
    name: "user.profile", 
    component: () => import("@/views/reader/ProfileView.vue"),
    meta: { requiresAuth: true } 
  },

  // --- GIAO DIỆN ADMIN ---
  { 
    path: "/admin", 
    name: "admin.dashboard", 
    component: () => import("@/views/admin/DashboardView.vue"),
    meta: { requiresAuth: true, role: "admin" } 
  },
  { 
    path: "/admin/sach", 
    name: "admin.sach", 
    component: () => import("@/views/admin/QuanLySach.vue"),
    meta: { requiresAuth: true, role: "admin" } 
  },
  { 
    path: "/admin/doc-gia", 
    name: "admin.docgia", 
    component: () => import("@/views/admin/QuanLyDocGia.vue"),
    meta: { requiresAuth: true, role: "admin" } 
  },
  { 
    path: "/admin/nhan-vien", 
    name: "admin.nhanvien", 
    component: () => import("@/views/admin/QuanLyNhanVien.vue"),
    meta: { requiresAuth: true, role: "admin" } 
  },
  { 
    path: "/admin/nxb", 
    name: "admin.nxb", 
    component: () => import("@/views/admin/QuanLyNXB.vue"),
    meta: { requiresAuth: true, role: "admin" } 
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const currentUser = AuthService.getCurrentUser();
  
  console.log(`[DEBUG ROUTER] Navigating to: '${to.path}' | User:`, currentUser);
  if (currentUser && currentUser.role === "admin") {
    if (to.name === "reader.home" || to.name === "reader.sach.detail") {
      console.warn("[DEBUG ROUTER - ADMIN DETECTED] Redirecting Admin from reader page to Admin Dashboard");
      return next({ name: "admin.dashboard" });
    }
  }
  if (to.meta.requiresAuth) {
    if (!currentUser) {
      console.warn("[DEBUG ROUTER] Unauthorized access! Redirecting to /login");
      return next({ name: "login" });
    }

    if (to.meta.role && currentUser.role !== to.meta.role) {
      console.warn(`[DEBUG ROUTER] Access denied. Required role: ${to.meta.role}, User role: ${currentUser.role}`);
      return next({ name: currentUser.role === "admin" ? "admin.dashboard" : "reader.home" });
    }
  }
  if ((to.name === "login" || to.name === "register") && currentUser) {
    console.log("[DEBUG ROUTER] Already logged in. Redirecting...");
    return next({ name: currentUser.role === "admin" ? "admin.dashboard" : "reader.home" });
  }
  next();
});

export default router;