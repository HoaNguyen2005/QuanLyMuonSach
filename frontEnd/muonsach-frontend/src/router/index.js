import { createRouter, createWebHistory } from "vue-router";
import AuthService from "@/services/auth.service";

const routes = [

  {
    path: '/',
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
    path: "/home", // Chuyển từ "/" sang "/home"
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
  
  console.log(`[DEBUG ROUTER] Navigating to: '${to.path}' (Name: '${String(to.name)}') | User:`, currentUser);

  // 1. Tự động chuyển hướng người dùng ĐÃ ĐĂNG NHẬP nếu họ cố vào trang /landing, /login, /register
  if (currentUser && (to.name === "landing" || to.name === "login" || to.name === "register")) {
    return next({ name: currentUser.role === "admin" ? "admin.dashboard" : "reader.home" });
  }

  // 2. Chặn Admin truy cập giao diện Độc giả
  if (currentUser && currentUser.role === "admin") {
    if (to.name === "reader.home" || to.name === "reader.sach.detail") {
      return next({ name: "admin.dashboard" });
    }
  }

  // 3. Kiểm tra Yêu cầu Xác thực (requiresAuth) & Quyền (role)
  if (to.meta.requiresAuth) {
    if (!currentUser) {
      return next({ name: "login" });
    }

    if (to.meta.role && currentUser.role !== to.meta.role) {
      return next({ name: currentUser.role === "admin" ? "admin.dashboard" : "reader.home" });
    }
  }

  next();
});

export default router;