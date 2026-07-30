<template>
  <header class="admin-header sticky-top shadow-md">
    <nav class="navbar navbar-expand-lg bg-navy py-3 px-4 px-lg-5 border-bottom border-navy-light">
      <div class="container-fluid d-flex align-items-center justify-content-between">
        
        <!-- 1. BRAND / LOGO (Đã chỉnh icon trắng nền navy theo Landing) -->
        <router-link 
          :to="isAdmin ? '/admin' : '/'" 
          class="navbar-brand d-flex align-items-center gap-2 fw-bold me-3"
        >
          <div class="brand-icon bg-white text-navy rounded-3 d-flex align-items-center justify-content-center shadow-sm">
            <i class="fas fa-book-reader fs-5"></i>
          </div>
          <span class="fw-bold fs-5 text-white text-uppercase tracking-wide">LibManage</span>
        </router-link>

        <!-- 2. MENU LINKS (Tông trắng/mờ chuẩn Landing) -->
        <div class="collapse navbar-collapse flex-grow-1" id="adminNavbar" v-if="currentUser">
          
          <!-- MENU ADMIN -->
          <ul class="navbar-nav me-auto mb-2 mb-lg-0 gap-1 ms-lg-3 border-start border-white border-opacity-25 ps-lg-3 text-uppercase fs-7 fw-bold" v-if="isAdmin">
            <li class="nav-item">
              <router-link to="/admin" class="nav-link nav-link-custom" active-class="active" exact>
                Duyệt Mượn
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/admin/sach" class="nav-link nav-link-custom" active-class="active">
                Quản Lý Sách
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/admin/doc-gia" class="nav-link nav-link-custom" active-class="active">
                Quản Lý Độc Giả
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/admin/nhan-vien" class="nav-link nav-link-custom" active-class="active">
                Quản Lý Nhân Viên
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/admin/nxb" class="nav-link nav-link-custom" active-class="active">
                Quản Lý NXB
              </router-link>
            </li>
          </ul>

          <!-- MENU ĐỘC GIẢ -->
          <ul class="navbar-nav me-auto mb-2 mb-lg-0 gap-1 ms-lg-3 border-start border-white border-opacity-25 ps-lg-3 text-uppercase fs-7 fw-bold" v-else>
            <li class="nav-item">
              <router-link to="/" class="nav-link nav-link-custom" active-class="active" exact>
                Danh Mục Sách
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/lich-su-muon" class="nav-link nav-link-custom" active-class="active">
                Lịch Sử Mượn Sách
              </router-link>
            </li>
          </ul>

        </div>

        <!-- 3. ACTION BUTTONS / USER PROFILE -->
        <div class="d-flex align-items-center gap-2 ms-auto">
          
          <!-- TRƯỜNG HỢP A: CHƯA ĐĂNG NHẬP (Dùng style nút Landing) -->
          <template v-if="!currentUser">
            <router-link 
              to="/login" 
              class="btn btn-outline-light rounded-1 px-3 py-1.5 fw-bold fs-7"
            >
              Đăng Nhập
            </router-link>

            <router-link 
              to="/register" 
              class="btn btn-white-accent rounded-1 px-3 py-1.5 fw-bold fs-7 d-none d-sm-inline-block shadow-sm"
            >
              Đăng Ký
            </router-link>
          </template>

          <!-- TRƯỜNG HỢP B: ĐÃ ĐĂNG NHẬP -->
          <div class="position-relative" v-else>
            <button 
              class="btn btn-user-profile d-flex align-items-center gap-2 py-1.5 px-3 rounded-2 border border-white border-opacity-25 shadow-sm" 
              type="button" 
              @click="toggleDropdown"
            >
              <div class="avatar-sm rounded-circle text-navy bg-white d-flex align-items-center justify-content-center fw-bold shadow-sm">
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
              class="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-3 p-2 custom-dropdown-menu"
              :class="{ 'show': isDropdownOpen }"
            >
              <li class="px-3 py-2 border-bottom mb-1 bg-light rounded-2">
                <div class="fw-bold text-dark small">{{ userDisplayName }}</div>
              </li>
              
              <li v-if="!isAdmin">
                <router-link 
                  to="/lich-su-muon" 
                  class="dropdown-item py-2 px-3 rounded-2 fw-medium d-flex align-items-center gap-2"
                  @click="isDropdownOpen = false"
                >
                  <i class="fas fa-history text-navy fs-6"></i>
                  <span>Lịch sử mượn sách</span>
                </router-link>
              </li>

              <li>
                <router-link 
                  to="/profile" 
                  class="dropdown-item py-2 px-3 rounded-2 fw-medium d-flex align-items-center gap-2"
                  @click="isDropdownOpen = false"
                >
                  <i class="fas fa-user-circle text-navy fs-6"></i>
                  <span>Thông tin cá nhân</span>
                </router-link>
              </li>

              <li><hr class="dropdown-divider my-1"></li>
              <li>
                <button 
                  class="dropdown-item py-2 px-3 rounded-2 text-danger fw-medium d-flex align-items-center gap-2 w-100 border-0 bg-transparent" 
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
            class="navbar-toggler border-0 shadow-none ms-1 text-white" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#adminNavbar"
          >
            <i class="fas fa-bars text-white"></i>
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
              class="btn btn-navy-accent rounded-pill px-4 fw-semibold flex-fill shadow-sm" 
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

    closeLogoutModal() {
      if (this.logoutModalInstance) {
        this.logoutModalInstance.hide();
      }
    },

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
/* Navy Theme Variables */
.text-navy { color: #1a2b4c !important; }
.bg-navy { background-color: #1a2b4c !important; }
.border-navy-light { border-color: rgba(255, 255, 255, 0.15) !important; }

/* Brand Icon Logo */
.brand-icon {
  width: 36px;
  height: 36px;
}

/* Nav Link chuẩn Landing Header */
.nav-link-custom {
  color: rgba(255, 255, 255, 0.75) !important;
  text-decoration: none;
  padding: 6px 12px !important;
  border-radius: 4px;
  transition: all 0.2s ease;
}
.nav-link-custom:hover,
.nav-link-custom.active {
  color: #ffffff !important;
  background-color: rgba(255, 255, 255, 0.1);
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
}

/* Nút Đăng Ký trắng kiểu Accent */
.btn-white-accent {
  background-color: #ffffff;
  color: #1a2b4c;
  border: 1px solid #ffffff;
  transition: all 0.3s ease;
}
.btn-white-accent:hover {
  background-color: #e2e8f0;
  color: #121e36;
}

.btn-navy-accent {
  background-color: #1a2b4c;
  color: #ffffff;
  border: 1px solid #1a2b4c;
}
.btn-navy-accent:hover {
  background-color: #121e36;
  color: #ffffff;
}

/* Profile User Button */
.btn-user-profile {
  background-color: rgba(255, 255, 255, 0.08);
  transition: all 0.2s ease;
  cursor: pointer;
}
.btn-user-profile:hover {
  background-color: rgba(255, 255, 255, 0.18);
}

.avatar-sm {
  width: 32px;
  height: 32px;
  font-size: 0.9rem;
}

.fs-7 { font-size: 0.85rem; }
.fs-xs { font-size: 0.72rem; }
.tracking-wide { letter-spacing: 0.05em; }

.style-role {
  font-size: 0.65rem;
  padding: 2px 6px;
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
  color: #1a2b4c;
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