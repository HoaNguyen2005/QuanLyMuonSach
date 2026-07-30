<template>
  <header class="admin-header sticky-top shadow-sm">
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark-gradient py-2 px-3">
      <div class="container-fluid d-flex align-items-center justify-content-between">
        
        <!-- 1. BRAND / LOGO -->
        <router-link 
          :to="isAdmin ? '/admin' : '/'" 
          class="navbar-brand d-flex align-items-center gap-2 fw-bold me-3"
        >
          <div class="brand-icon rounded-3 d-flex align-items-center justify-content-center">
            <i class="fas fa-book-reader text-white fs-5"></i>
          </div>
          <span class="brand-text text-white fs-5 d-none d-sm-inline">Quản Lý Thư Viện</span>
        </router-link>

        <!-- 2. MENU LINKS -->
        <div class="collapse navbar-collapse flex-grow-1" id="adminNavbar" v-if="currentUser">
          
          <!-- MENU ADMIN -->
          <ul class="navbar-nav me-auto mb-2 mb-lg-0 gap-1 ms-lg-3 border-start border-secondary border-opacity-50 ps-lg-3" v-if="isAdmin">
            <li class="nav-item">
              <router-link to="/admin" class="nav-link nav-pill" active-class="active" exact>
                Duyệt Mượn
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/admin/sach" class="nav-link nav-pill" active-class="active">
                Quản Lý Sách
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/admin/doc-gia" class="nav-link nav-pill" active-class="active">
                Quản Lý Độc Giả
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/admin/nhan-vien" class="nav-link nav-pill" active-class="active">
                Quản Lý Nhân Viên
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/admin/nxb" class="nav-link nav-pill" active-class="active">
                Quản Lý Nhà Xuất Bản
              </router-link>
            </li>
          </ul>

          <!-- MENU ĐỘC GIẢ (Đã bỏ icon) -->
          <ul class="navbar-nav me-auto mb-2 mb-lg-0 gap-1 ms-lg-3 border-start border-secondary border-opacity-50 ps-lg-3" v-else>
            <li class="nav-item">
              <router-link to="/" class="nav-link nav-pill" active-class="active" exact>
                Danh Mục Sách
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/lich-su-muon" class="nav-link nav-pill" active-class="active">
                Lịch Sử Mượn Sách
              </router-link>
            </li>
          </ul>

        </div>

        <!-- 3. ACTION BUTTONS / USER PROFILE -->
        <div class="d-flex align-items-center gap-2 ms-auto">
          
          <!-- TRƯỜNG HỢP A: CHƯA ĐĂNG NHẬP -->
          <template v-if="!currentUser">
            <router-link 
              to="/login" 
              class="btn btn-sm rounded-pill px-3 py-1.5 fw-semibold transition-all"
              :class="$route.path === '/login' ? 'btn-primary shadow-sm' : 'btn-outline-light border-opacity-25'"
            >
              <i class="fas fa-sign-in-alt me-1"></i> Đăng nhập
            </router-link>

            <router-link 
              to="/register" 
              class="btn btn-sm rounded-pill px-3 py-1.5 fw-semibold transition-all"
              :class="$route.path === '/register' ? 'btn-success shadow-sm' : 'btn-outline-light border-opacity-25'"
            >
              <i class="fas fa-user-plus me-1"></i> Đăng ký
            </router-link>
          </template>

          <!-- TRƯỜNG HỢP B: ĐÃ ĐĂNG NHẬP -->
          <div class="position-relative" v-else>
            <button 
              class="btn btn-user-profile d-flex align-items-center gap-2 py-1.5 px-3 rounded-pill border border-secondary border-opacity-25 shadow-sm" 
              type="button" 
              @click="toggleDropdown"
            >
              <div class="avatar-sm rounded-circle text-white d-flex align-items-center justify-content-center fw-bold shadow-sm" :class="isAdmin ? 'bg-primary' : 'bg-success'">
                {{ userDisplayName.charAt(0).toUpperCase() }}
              </div>
              <div class="text-start pe-1 d-none d-md-block">
                <div class="user-name fw-bold text-white lh-1 small">
                  {{ userDisplayName }}
                </div>
                <span class="badge mt-1 style-role" :class="isAdmin ? 'bg-warning text-dark' : 'bg-info text-dark'">
                  {{ userRoleText }}
                </span>
              </div>
              <i class="fas fa-chevron-down text-white-50 fs-xs ms-1 transition-icon" :class="{ 'rotate-180': isDropdownOpen }"></i>
            </button>

            <!-- Custom Dropdown Menu -->
            <ul 
              class="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-4 p-2 custom-dropdown-menu"
              :class="{ 'show': isDropdownOpen }"
            >
              <li class="px-3 py-2 border-bottom mb-1 bg-light rounded-3">
                <div class="fw-bold text-dark small">{{ userDisplayName }}</div>
                <div class="text-muted text-truncate fs-xs">{{ currentUser.email || 'Chưa cập nhật email' }}</div>
              </li>
              
              <li v-if="!isAdmin">
                <router-link 
                  to="/lich-su-muon" 
                  class="dropdown-item py-2 px-3 rounded-3 fw-medium d-flex align-items-center gap-2"
                  @click="isDropdownOpen = false"
                >
                  <i class="fas fa-history text-success fs-6"></i>
                  <span>Lịch sử mượn sách</span>
                </router-link>
              </li>

              <li>
                <router-link 
                  to="/profile" 
                  class="dropdown-item py-2 px-3 rounded-3 fw-medium d-flex align-items-center gap-2"
                  @click="isDropdownOpen = false"
                >
                  <i class="fas fa-user-circle text-primary fs-6"></i>
                  <span>Thông tin cá nhân</span>
                </router-link>
              </li>

              <li><hr class="dropdown-divider my-1"></li>
              <li>
                <button 
                  class="dropdown-item py-2 px-3 rounded-3 text-danger fw-medium d-flex align-items-center gap-2 w-100 border-0 bg-transparent" 
                  @click="openLogoutModal"
                >
                  <i class="fas fa-sign-out-alt fs-6"></i>
                  <span>Đăng xuất</span>
                </button>
              </li>
            </ul>
          </div>

          <!-- Toggle Button Mobile -->
          <button 
            v-if="currentUser"
            class="navbar-toggler border-0 shadow-none ms-1" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#adminNavbar"
          >
            <span class="navbar-toggler-icon"></span>
          </button>

        </div>

      </div>
    </nav>

    <!-- BOOTSTRAP MODAL POPUP XÁC NHẬN ĐĂNG XUẤT -->
    <div 
      class="modal fade" 
      id="logoutConfirmModal" 
      tabindex="-1" 
      ref="logoutModalRef"
    >
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden text-center p-3">
          
          <div class="modal-body py-3">
            <div class="logout-icon-circle bg-danger bg-opacity-10 text-danger rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center">
              <i class="fas fa-sign-out-alt fa-2x"></i>
            </div>
            <h5 class="fw-bold text-dark mb-2">Đăng xuất?</h5>
            <p class="text-muted small mb-0">
              Bạn có chắc chắn muốn rời khỏi hệ thống Quản Lý Thư Viện không?
            </p>
          </div>

          <div class="d-flex gap-2 justify-content-center pt-2">
            <button 
              type="button" 
              class="btn btn-light rounded-pill px-4 fw-semibold flex-fill border" 
              @click="closeLogoutModal"
            >
              Hủy
            </button>
            <button 
              type="button" 
              class="btn btn-danger rounded-pill px-4 fw-semibold flex-fill shadow-sm" 
              @click="confirmLogout"
            >
              Đăng xuất
            </button>
          </div>

        </div>
      </div>
    </div>

  </header>
</template>

<script>
import AuthService from "@/services/auth.service";
import * as bootstrap from "bootstrap";

export default {
  name: "AppHeader",
  data() {
    return {
      currentUser: null,
      isDropdownOpen: false,
      logoutModalInstance: null
    };
  },
  computed: {
    isAdmin() {
      if (!this.currentUser) return false;
      const role = this.currentUser.role || this.currentUser.chucVu;
      return role === 'admin' || role === 'nhanvien' || !!this.currentUser.MSNV;
    },
    userDisplayName() {
      if (!this.currentUser) return "Người dùng";
      return this.currentUser.hoTen || this.currentUser.hoTenNV || this.currentUser.tenND || this.currentUser.tenTaiKhoan || "Người dùng";
    },
    userRoleText() {
      return this.isAdmin ? "Admin / Nhân Viên" : "Độc Giả";
    }
  },
  watch: {
    $route() {
      this.updateUserState();
    }
  },
  mounted() {
    this.updateUserState();
    document.addEventListener("click", this.closeDropdownOnClickOutside);
    window.addEventListener("user-state-changed", this.updateUserState);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.closeDropdownOnClickOutside);
    window.removeEventListener("user-state-changed", this.updateUserState);
    
    // Dọn dẹp DOM Modal nếu đã được append ra body
    const modalEl = this.$refs.logoutModalRef;
    if (modalEl && modalEl.parentNode === document.body) {
      document.body.removeChild(modalEl);
    }
  },
  methods: {
    updateUserState() {
      this.currentUser = AuthService.getCurrentUser();
    },
    toggleDropdown(event) {
      event.stopPropagation();
      this.isDropdownOpen = !this.isDropdownOpen;
    },
    closeDropdownOnClickOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.isDropdownOpen = false;
      }
    },
    
    // Mở Popup Đăng Xuất
    openLogoutModal() {
      this.isDropdownOpen = false;
      const modalEl = this.$refs.logoutModalRef;
      if (modalEl) {
        if (modalEl.parentNode !== document.body) {
          document.body.appendChild(modalEl);
        }
        
        if (!this.logoutModalInstance) {
          this.logoutModalInstance = new bootstrap.Modal(modalEl, {
            backdrop: true,
            keyboard: true
          });
        }
        this.logoutModalInstance.show();
      }
    },

    // Đóng Popup
    closeLogoutModal() {
      if (this.logoutModalInstance) {
        this.logoutModalInstance.hide();
      }
    },

    // Xác nhận Đăng xuất
    confirmLogout() {
      this.closeLogoutModal();

      setTimeout(() => {
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';

        AuthService.logout();
        this.currentUser = null;
        window.dispatchEvent(new Event("user-state-changed"));
        this.$router.push({ name: "login" });
      }, 150);
    }
  }
};
</script>

<style scoped>
.bg-dark-gradient {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.brand-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.nav-pill {
  color: #94a3b8 !important;
  font-weight: 500;
  padding: 8px 14px !important;
  border-radius: 10px;
  transition: all 0.2s ease-in-out;
  font-size: 0.9rem;
}

.nav-pill:hover {
  color: #ffffff !important;
  background-color: rgba(255, 255, 255, 0.08);
}

.nav-pill.active {
  color: #ffffff !important;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  font-weight: 600;
}

.btn-user-profile {
  background-color: rgba(255, 255, 255, 0.06);
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-user-profile:hover {
  background-color: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4) !important;
}

.avatar-sm {
  width: 30px;
  height: 30px;
  font-size: 0.85rem;
}

.style-role {
  font-size: 0.65rem;
  padding: 2px 6px;
}

.fs-xs {
  font-size: 0.72rem;
}

.transition-icon {
  transition: transform 0.2s ease;
}

.rotate-180 {
  transform: rotate(180deg);
}

.custom-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 10px !important;
  min-width: 220px;
  z-index: 1050;
  display: none;
  background-color: #ffffff;
  animation: fadeIn 0.15s ease-in-out;
}

.custom-dropdown-menu.show {
  display: block !important;
}

.custom-dropdown-menu .dropdown-item {
  white-space: nowrap;
  font-size: 0.88rem;
  color: #334155;
  transition: all 0.15s ease;
}

.custom-dropdown-menu .dropdown-item:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.logout-icon-circle {
  width: 60px;
  height: 60px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>