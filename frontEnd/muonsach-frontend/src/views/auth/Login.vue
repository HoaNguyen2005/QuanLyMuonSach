<template>
  <div class="auth-page d-flex align-items-center justify-content-center min-vh-100 py-4 px-3">
    <!-- Split Layout Container (Luôn giữ dạng hàng ngang) -->
    <div class="auth-card border-0 shadow-lg rounded-5 overflow-hidden d-flex flex-row position-relative">
      
      <!-- NÚT MŨI TÊN QUAY VỀ TRANG LANDING PAGE -->
      <router-link 
        :to="{ name: 'landing' }" 
        class="btn-back-home d-flex align-items-center justify-content-center text-decoration-none shadow-sm"
        title="Quay về Trang Chủ"
      >
        <i class="fas fa-arrow-left"></i>
      </router-link>

      <!-- CỘT TRÁI: FORM ĐĂNG NHẬP -->
      <div class="auth-form-side bg-white p-4 p-md-5 d-flex flex-column justify-content-center">
        <div class="py-2">
          <!-- Avatar Icon Placeholder -->
          <div class="text-center mb-4 mt-2">
            <div class="avatar-circle mx-auto d-flex align-items-center justify-content-center text-navy shadow-sm mb-3">
              <i class="fas fa-user fa-2x"></i>
            </div>
            <h4 class="fw-bold text-navy mb-1">Đăng Nhập System</h4>
            <p class="text-muted small">Vui lòng điền thông tin tài khoản của bạn</p>
          </div>

          <form @submit.prevent="handleLogin">
            <!-- Username Input -->
            <div class="mb-3">
              <div class="custom-input-group d-flex align-items-center px-3 py-1 rounded-pill border">
                <i class="fas fa-user text-muted me-2"></i>
                <input 
                  type="text" 
                  class="form-control border-0 shadow-none bg-transparent py-2 text-navy fw-medium" 
                  v-model="credentials.tenTaiKhoan" 
                  placeholder="TÊN TÀI KHOẢN / MSNV / MÃ ĐỘC GIẢ" 
                  required 
                />
              </div>
            </div>

            <!-- Password Input -->
            <div class="mb-3">
              <div class="custom-input-group d-flex align-items-center px-3 py-1 rounded-pill border">
                <i class="fas fa-lock text-muted me-2"></i>
                <input 
                  type="password" 
                  class="form-control border-0 shadow-none bg-transparent py-2 text-navy" 
                  v-model="credentials.matKhau" 
                  placeholder="MẬT KHẨU" 
                  required 
                />
              </div>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              class="btn btn-navy w-100 py-2.5 rounded-pill fw-bold text-uppercase shadow-sm d-flex align-items-center justify-content-center gap-2"
              :disabled="loading"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm"></span>
              <span v-else>ĐĂNG NHẬP</span>
            </button>
          </form>

          <!-- Chuyển hướng Đăng Ký -->
          <div class="text-center pt-4">
            <span class="small text-muted">Chưa có tài khoản? </span>
            <router-link :to="{ name: 'register' }" class="small fw-bold text-navy text-decoration-underline ms-1">Đăng ký ngay</router-link>
          </div>
        </div>
      </div>

      <!-- CỘT PHẢI: BANNER NGHỆ THUẬT -->
      <div class="auth-banner-side p-5 d-none d-md-flex flex-column justify-content-center position-relative overflow-hidden text-white">
        <div class="gradient-wave-overlay"></div>

        <!-- Center Welcome Text -->
        <div class="position-relative z-1 py-4">
          <h1 class="display-4 fw-extrabold mb-3 tracking-tight">Xin Chào.</h1>
          <p class="text-white-70 fs-6 max-w-sm font-light leading-relaxed mb-4">
            Khám phá kho tàng tri thức với hàng ngàn đầu sách hấp dẫn. Quản lý mượn trả dễ dàng, nhanh chóng và thuận tiện.
          </p>
          <div>
            <span class="small text-white-50">Bạn là độc giả mới? </span>
            <router-link :to="{ name: 'register' }" class="small fw-bold text-white text-decoration-underline ms-1">Tạo tài khoản mới</router-link>
          </div>
        </div>
      </div>

    </div>

    <!-- BOOTSTRAP MODAL THÔNG BÁO -->
    <div class="modal fade" id="loginModal" tabindex="-1" ref="loginModalRef" data-bs-backdrop="static">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden bg-white text-center p-4">
          <div class="modal-body p-0">
            <div :class="modalState.isSuccess ? 'text-success' : 'text-danger'" class="mb-3">
              <i class="fas" :class="modalState.isSuccess ? 'fa-check-circle fa-4x' : 'fa-exclamation-circle fa-4x'"></i>
            </div>
            <h5 class="fw-bold text-navy mb-2">{{ modalState.title }}</h5>
            <p class="text-muted small mb-4" v-html="modalState.message"></p>
            <button 
              type="button" 
              class="btn py-2.5 rounded-pill fw-bold w-100 text-white shadow-sm"
              :class="modalState.isSuccess ? 'btn-navy' : 'btn-danger'"
              @click="closeLoginModal"
            >
              {{ modalState.isSuccess ? 'Khám Phá Ngay' : 'Thử Lại' }}
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import AuthService from "@/services/auth.service";
import * as bootstrap from "bootstrap";

export default {
  name: "LoginView",
  data() {
    return {
      credentials: {
        tenTaiKhoan: "",
        matKhau: ""
      },
      loading: false,
      modalInstance: null,
      redirectRoute: { name: "reader.home" },
      modalState: {
        isSuccess: true,
        title: "",
        message: ""
      }
    };
  },
  mounted() {
    console.log("[DEBUG LOGIN] Mounting LoginView component...");
    if (this.$refs.loginModalRef) {
      document.body.appendChild(this.$refs.loginModalRef);
      this.modalInstance = new bootstrap.Modal(this.$refs.loginModalRef, {
        backdrop: 'static',
        keyboard: false
      });
    }
  },
  beforeUnmount() {
    if (this.$refs.loginModalRef && this.$refs.loginModalRef.parentNode === document.body) {
      document.body.removeChild(this.$refs.loginModalRef);
    }
  },
  methods: {
    showModal(title, message, isSuccess = true) {
      this.modalState = { title, message, isSuccess };
      if (this.modalInstance) {
        this.modalInstance.show();
      }
    },

    closeLoginModal() {
      if (this.modalInstance) {
        this.modalInstance.hide();
      }
      if (this.modalState.isSuccess) {
        console.log("[DEBUG LOGIN] Navigating to redirect route:", this.redirectRoute);
        this.$router.push(this.redirectRoute);
      }
    },

    async handleLogin() {
      if (!this.credentials.tenTaiKhoan.trim() || !this.credentials.matKhau.trim()) {
        console.warn("[DEBUG LOGIN VALIDATION] Missing username or password.");
        this.showModal("Thiếu thông tin!", "Vui lòng nhập Tên Tài Khoản và Mật Khẩu.", false);
        return;
      }

      this.loading = true;

      const payload = {
        tenTaiKhoan: this.credentials.tenTaiKhoan,
        matKhau: this.credentials.matKhau,
        username: this.credentials.tenTaiKhoan,
        password: this.credentials.matKhau,
        maDocGia: this.credentials.tenTaiKhoan,
        MSNV: this.credentials.tenTaiKhoan
      };

      console.log("[DEBUG LOGIN] Submitting login request via AuthService.login(). Payload:", payload);

      try {
        const response = await AuthService.login(payload);
        console.log("[DEBUG LOGIN SUCCESS] AuthService response:", response);

        const resData = response.data || response;
        const userData = resData.user || resData.docGia || resData.nhanVien || resData;

        console.log("[DEBUG LOGIN] Extracted userData:", userData);
        localStorage.setItem("user", JSON.stringify(userData));
        window.dispatchEvent(new Event("user-state-changed"));

        const displayName = userData.hoTen || userData.hoTenNV || userData.tenND || userData.tenTaiKhoan || this.credentials.tenTaiKhoan;
        const isAdminRole = userData.role === 'admin' || userData.chucVu === 'admin' || !!userData.MSNV || !!userData.chucVu;

        this.redirectRoute = isAdminRole ? { name: "admin.dashboard" } : { name: "reader.home" };
        console.log(`[DEBUG LOGIN] User identified as [${isAdminRole ? 'ADMIN' : 'READER'}]. Set redirectRoute to:`, this.redirectRoute);

        this.showModal(
          "Chào mừng trở lại!", 
          `Xin chào <strong>${displayName}</strong>, chúc bạn có một ngày tuyệt vời!`, 
          true
        );

      } catch (error) {
        console.error("[DEBUG LOGIN ERROR] Login failed:", error.response?.data || error);
        const errorMsg = error.response?.data?.message || "Tên tài khoản hoặc mật khẩu không chính xác!";
        this.showModal("Đăng nhập thất bại!", errorMsg, false);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.text-navy { color: #1a2b4c; }
.bg-navy { background-color: #1a2b4c; }
.btn-navy {
  background-color: #1a2b4c;
  color: #ffffff;
  border: none;
  transition: all 0.3s ease;
}
.btn-navy:hover {
  background-color: #121e36;
  color: #ffffff;
  transform: translateY(-1px);
}

.btn-back-home {
  position: absolute;
  top: 18px;
  left: 18px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: #ffffff;
  color: #1a2b4c;
  border: 1px solid rgba(26, 43, 76, 0.15);
  z-index: 10;
  transition: all 0.3s ease;
}

.btn-back-home:hover {
  background-color: #1a2b4c;
  color: #ffffff;
  transform: translateX(-3px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15) !important;
}

.auth-page {
  opacity: 0.97;
  background-image: url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1920') !important;
}

.auth-card {
  width: 100%;
  max-width: 900px;
  min-height: 500px;
  background-color: #ffffff;
}

.auth-form-side {
  flex: 1;
  width: 100%;
}

.auth-banner-side {
  flex: 1.2;
  background: linear-gradient(135deg, #101c36 0%, #1a2b4c 50%, #2a4365 100%);
}

.gradient-wave-overlay {
  position: absolute;
  top: -20%;
  right: -20%;
  width: 140%;
  height: 140%;
  background: radial-gradient(circle at 70% 30%, rgba(246, 224, 181, 0.35) 0%, rgba(66, 153, 225, 0.25) 40%, transparent 70%);
  filter: blur(40px);
  pointer-events: none;
}

.custom-input-group {
  border-color: #cbd5e0 !important;
  background-color: #ffffff;
  transition: all 0.2s ease;
}
.custom-input-group:focus-within {
  border-color: #1a2b4c !important;
  box-shadow: 0 0 0 3px rgba(26, 43, 76, 0.1);
}

.avatar-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 2px solid #1a2b4c;
  background-color: #f7fafc;
}

.fs-xs { font-size: 0.78rem; }
.tracking-tight { letter-spacing: -0.02em; }
.fw-extrabold { font-weight: 800; }
.text-white-70 { color: rgba(255, 255, 255, 0.75); }
.max-w-sm { max-width: 320px; }

.modal {
  z-index: 1055 !important;
}
</style>