<template>
  <div class="login-container d-flex align-items-center justify-content-center bg-light py-5">
    <div class="card border-0 shadow-lg rounded-4 overflow-hidden login-card">
      <!-- Card Header -->
      <div class="card-header bg-primary text-white text-center py-4 border-0">
        <h4 class="fw-bold mb-1">
          <i class="fas fa-sign-in-alt me-2"></i>Đăng Nhập Hệ Thống
        </h4>
        <p class="small text-white-50 mb-0">Vui lòng điền thông tin tài khoản của bạn</p>
      </div>

      <!-- Card Body -->
      <div class="card-body p-4 p-md-5">
        <form @submit.prevent="handleLogin">
          
          <!-- Username Input -->
          <div class="mb-3">
            <label class="form-label small fw-bold text-secondary">
              Tên Tài Khoản / MSNV / Mã Độc Giả <span class="text-danger">*</span>
            </label>
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0">
                <i class="fas fa-user text-muted"></i>
              </span>
              <input 
                type="text" 
                class="form-control bg-light border-start-0 ps-0" 
                v-model="credentials.tenTaiKhoan" 
                placeholder="Nhập tên tài khoản, MSNV hoặc Mã Độc Giả" 
                required 
              />
            </div>
          </div>

          <!-- Password Input -->
          <div class="mb-4">
            <label class="form-label small fw-bold text-secondary">
              Mật Khẩu <span class="text-danger">*</span>
            </label>
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0">
                <i class="fas fa-lock text-muted"></i>
              </span>
              <input 
                type="password" 
                class="form-control bg-light border-start-0 ps-0" 
                v-model="credentials.matKhau" 
                placeholder="Nhập mật khẩu" 
                required 
              />
            </div>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            class="btn btn-primary w-100 py-2.5 rounded-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm"></span>
            <i v-else class="fas fa-arrow-right-to-bracket"></i>
            <span>{{ loading ? 'Đang xác thực...' : 'Đăng Nhập' }}</span>
          </button>
        </form>
      </div>

      <!-- Card Footer -->
      <div class="card-footer bg-light text-center py-3 border-top-0">
        <p class="small text-muted mb-0">
          Bạn là độc giả mới? 
          <router-link to="/register" class="fw-bold text-primary text-decoration-none">
            Đăng ký tài khoản ngay
          </router-link>
        </p>
      </div>
    </div>

    <!-- BOOTSTRAP MODAL CHÀO MỪNG / THÔNG BÁO -->
    <div 
      class="modal fade" 
      id="loginModal" 
      tabindex="-1" 
      ref="loginModalRef"
      data-bs-backdrop="static" 
      data-bs-keyboard="false"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-body p-4 text-center">
            
            <!-- Icon Trạng Thái -->
            <div 
              class="rounded-circle p-3 d-inline-flex mb-3"
              :class="modalState.isSuccess ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'"
            >
              <i class="fas" :class="modalState.isSuccess ? 'fa-check-circle fa-3x' : 'fa-exclamation-circle fa-3x'"></i>
            </div>

            <!-- Tiêu đề & Nội dung -->
            <h4 class="fw-bold text-dark mb-2">{{ modalState.title }}</h4>
            <p class="text-muted fs-6 mb-4" v-html="modalState.message"></p>
            
            <!-- Nút Xác Nhận -->
            <button 
              type="button" 
              class="btn py-2 px-4 rounded-pill fw-semibold shadow-sm w-100"
              :class="modalState.isSuccess ? 'btn-primary' : 'btn-danger'"
              @click="closeLoginModal"
            >
              {{ modalState.isSuccess ? 'Khám Phá Ngay' : 'Thử Lại' }} 
              <i class="fas ms-1" :class="modalState.isSuccess ? 'fa-arrow-right' : 'fa-rotate-right'"></i>
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
      redirectPath: "/",
      modalState: {
        isSuccess: true,
        title: "",
        message: ""
      }
    };
  },
  mounted() {
    if (this.$refs.loginModalRef) {
      this.modalInstance = new bootstrap.Modal(this.$refs.loginModalRef);
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
        this.$router.push(this.redirectPath);
      }
    },

    async handleLogin() {
      if (!this.credentials.tenTaiKhoan.trim() || !this.credentials.matKhau.trim()) {
        this.showModal("Chưa nhập đủ thông tin!", "Vui lòng điền đầy đủ Tên Tài Khoản và Mật Khẩu.", false);
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

      try {
        const response = await AuthService.login(payload);
        
        // Trích xuất linh hoạt mọi cấu trúc response mà Backend có thể trả về
        const resData = response.data || response;
        const userData = resData.user || resData.docGia || resData.nhanVien || resData;

        // Lưu thông tin phiên đăng nhập vào localStorage
        localStorage.setItem("user", JSON.stringify(userData));
        window.dispatchEvent(new Event("user-state-changed"));

        // Xác định tên hiển thị
        const displayName = userData.hoTen || userData.hoTenNV || userData.tenND || userData.tenTaiKhoan || this.credentials.tenTaiKhoan;
        
        // Kiểm tra quyền Admin/Nhân Viên
        const isAdminRole = userData.role === 'admin' || userData.chucVu === 'admin' || !!userData.MSNV || !!userData.chucVu;

        this.redirectPath = isAdminRole ? "/admin" : "/";

        this.showModal(
          "Chào mừng trở lại!", 
          `Xin chào <strong>${displayName}</strong>, chúc bạn có một trải nghiệm tuyệt vời!`, 
          true
        );

      } catch (error) {
        const errorMsg = error.response?.data?.message || error.response?.data?.error || "Tên tài khoản hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!";
        this.showModal("Đăng nhập thất bại!", errorMsg, false);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.login-card {
  width: 100%;
  max-width: 440px;
}
.input-group-text {
  border-color: #dee2e6;
}
.form-control:focus {
  box-shadow: none;
  border-color: #86b7fe;
}
</style>