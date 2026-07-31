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

      <!-- CỘT TRÁI: FORM ĐĂNG KÝ -->
      <div class="auth-form-side bg-white p-4 p-md-5 d-flex flex-column justify-content-center">
        <div class="py-2">
          <div class="mb-3 mt-2">
            <h4 class="fw-bold text-navy mb-1">Tạo Tài Khoản Mới</h4>
            <p class="text-muted small">Điền thông tin cá nhân để đăng ký tài khoản độc giả</p>
          </div>

          <form @submit.prevent="handleRegister">
            <div class="row g-2">
              
              <!-- Tên Tài Khoản -->
              <div class="col-6">
                <div class="custom-input-group d-flex align-items-center px-3 py-0.5 rounded-pill border">
                  <input type="text" class="form-control border-0 shadow-none bg-transparent py-1.5 fs-7 text-navy" v-model="formData.tenTaiKhoan" placeholder="Tên tài khoản *" required />
                </div>
              </div>

              <!-- Họ và Tên -->
              <div class="col-6">
                <div class="custom-input-group d-flex align-items-center px-3 py-0.5 rounded-pill border">
                  <input type="text" class="form-control border-0 shadow-none bg-transparent py-1.5 fs-7 text-navy" v-model="formData.hoTen" placeholder="Họ và Tên *" required />
                </div>
              </div>

              <!-- Email -->
              <div class="col-12">
                <div class="custom-input-group d-flex align-items-center px-3 py-0.5 rounded-pill border">
                  <input type="email" class="form-control border-0 shadow-none bg-transparent py-1.5 fs-7 text-navy" v-model="formData.email" placeholder="Địa chỉ email *" required />
                </div>
              </div>

              <!-- Mật Khẩu -->
              <div class="col-6">
                <div class="custom-input-group d-flex align-items-center px-3 py-0.5 rounded-pill border">
                  <input type="password" class="form-control border-0 shadow-none bg-transparent py-1.5 fs-7 text-navy" v-model="formData.matKhau" placeholder="Mật khẩu *" required />
                </div>
              </div>

              <!-- Xác Nhận Mật Khẩu -->
              <div class="col-6">
                <div class="custom-input-group d-flex align-items-center px-3 py-0.5 rounded-pill border">
                  <input type="password" class="form-control border-0 shadow-none bg-transparent py-1.5 fs-7 text-navy" v-model="formData.confirmPassword" placeholder="Nhập lại mật khẩu *" required />
                </div>
              </div>

              <!-- Ngày Sinh -->
              <div class="col-6">
                <div class="custom-input-group d-flex align-items-center px-3 py-0.5 rounded-pill border">
                  <input type="date" class="form-control border-0 shadow-none bg-transparent py-1.5 fs-7 text-secondary" v-model="formData.ngaySinh" />
                </div>
              </div>

              <!-- Giới Tính -->
              <div class="col-6">
                <div class="custom-input-group d-flex align-items-center px-3 py-0.5 rounded-pill border">
                  <select class="form-select border-0 shadow-none bg-transparent py-1.5 fs-7 text-navy" v-model="formData.phai">
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>

              <!-- Số Điện Thoại -->
              <div class="col-12">
                <div class="custom-input-group d-flex align-items-center px-3 py-0.5 rounded-pill border">
                  <input type="text" class="form-control border-0 shadow-none bg-transparent py-1.5 fs-7 text-navy" v-model="formData.dienThoai" placeholder="Số điện thoại" />
                </div>
              </div>

              <!-- Địa Chỉ Cư Trú -->
              <div class="col-12">
                <div class="custom-input-group d-flex align-items-center px-3 py-0.5 rounded-pill border">
                  <input type="text" class="form-control border-0 shadow-none bg-transparent py-1.5 fs-7 text-navy" v-model="formData.diaChi" placeholder="Địa chỉ cư trú" />
                </div>
              </div>

            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              class="btn btn-navy w-100 py-2.5 rounded-pill fw-bold text-uppercase shadow-sm mt-3 d-flex align-items-center justify-content-center gap-2"
              :disabled="loading"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm"></span>
              <span v-else>ĐĂNG KÝ NGAY</span>
            </button>
          </form>

          <!-- Chuyển hướng Đăng Nhập -->
          <div class="text-center pt-3">
            <span class="small text-muted">Đã có tài khoản? </span>
            <router-link :to="{ name: 'login' }" class="small fw-bold text-navy text-decoration-none">Đăng nhập</router-link>
          </div>
        </div>
      </div>

      <!-- CỘT PHẢI: BANNER NGHỆ THUẬT -->
      <div class="auth-banner-side p-5 d-none d-md-flex flex-column justify-content-center position-relative overflow-hidden text-white">
        <div class="gradient-wave-overlay"></div>

        <!-- Center Welcome Text -->
        <div class="position-relative z-1 py-4">
          <h1 class="display-4 fw-extrabold mb-3 tracking-tight">Tham Gia.</h1>
          <p class="text-white-70 fs-6 max-w-sm font-light leading-relaxed mb-4">
            Trở thành thành viên để dễ dàng tra cứu kho sách phong phú, đặt mượn trực tuyến và trải nghiệm dịch vụ tiện lợi.
          </p>
          <div>
            <span class="small text-white-50">Đã sở hữu tài khoản? </span>
            <router-link :to="{ name: 'login' }" class="small fw-bold text-white text-decoration-underline ms-1">Đăng nhập tại đây</router-link>
          </div>
        </div>
      </div>

    </div>

    <!-- BOOTSTRAP MODAL THÔNG BÁO -->
    <div class="modal fade" id="registerModal" tabindex="-1" ref="registerModalRef" data-bs-backdrop="static">
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
              @click="closeRegisterModal"
            >
              {{ modalState.isSuccess ? 'Đăng Nhập Ngay' : 'Thử Lại' }}
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
  name: "RegisterView",
  data() {
    return {
      formData: {
        tenTaiKhoan: "",
        hoTen: "",
        email: "",
        matKhau: "",
        confirmPassword: "",
        ngaySinh: "",
        phai: "Nam",
        dienThoai: "",
        diaChi: ""
      },
      loading: false,
      modalInstance: null,
      modalState: {
        isSuccess: true,
        title: "",
        message: ""
      }
    };
  },
  mounted() {
    console.log("[DEBUG REGISTER] Mounting RegisterView component...");
    if (this.$refs.registerModalRef) {
      document.body.appendChild(this.$refs.registerModalRef);
      this.modalInstance = new bootstrap.Modal(this.$refs.registerModalRef, {
        backdrop: 'static',
        keyboard: false
      });
    }
  },
  beforeUnmount() {
    if (this.$refs.registerModalRef && this.$refs.registerModalRef.parentNode === document.body) {
      document.body.removeChild(this.$refs.registerModalRef);
    }
  },
  methods: {
    showModal(title, message, isSuccess = true) {
      this.modalState = { title, message, isSuccess };
      if (this.modalInstance) {
        this.modalInstance.show();
      }
    },

    closeRegisterModal() {
      if (this.modalInstance) {
        this.modalInstance.hide();
      }
      if (this.modalState.isSuccess) {
        console.log("[DEBUG REGISTER] Registration success. Navigating to 'login' route...");
        this.$router.push({ name: "login" });
      }
    },

    validateForm() {
      console.log("[DEBUG REGISTER] Validating registration form data:", this.formData);
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(this.formData.email)) {
        console.warn("[DEBUG REGISTER VALIDATION] Invalid email format:", this.formData.email);
        this.showModal("Email không hợp lệ!", "Vui lòng nhập địa chỉ email chính xác.", false);
        return false;
      }

      if (this.formData.matKhau.length < 6) {
        console.warn("[DEBUG REGISTER VALIDATION] Password too short. Length:", this.formData.matKhau.length);
        this.showModal("Mật khẩu quá ngắn!", "Mật khẩu phải chứa ít nhất 6 ký tự.", false);
        return false;
      }

      if (this.formData.matKhau !== this.formData.confirmPassword) {
        console.warn("[DEBUG REGISTER VALIDATION] Password confirmation mismatch.");
        this.showModal("Mật khẩu không khớp!", "Mật khẩu xác nhận không trùng khớp.", false);
        return false;
      }

      return true;
    },

    async handleRegister() {
      if (!this.validateForm()) return;

      this.loading = true;
      console.log("[DEBUG REGISTER] Submitting registration request via AuthService.register(). Payload:", JSON.stringify(this.formData, null, 2));

      try {
        const response = await AuthService.register(this.formData);
        console.log("[DEBUG REGISTER SUCCESS] Server response:", response);

        this.showModal(
          "Đăng Ký Thành Công!", 
          `Tài khoản độc giả <strong>${this.formData.hoTen}</strong> đã được khởi tạo thành công!`, 
          true
        );

      } catch (error) {
        console.error("[DEBUG REGISTER ERROR] Registration failed:", error.response?.data || error);
        const errorMsg = error.response?.data?.message || "Tên tài khoản hoặc Email đã tồn tại!";
        this.showModal("Đăng ký thất bại!", errorMsg, false);
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
  flex: 1.1;
  width: 100%;
}

.auth-banner-side {
  flex: 1;
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

.fs-7 { font-size: 0.85rem; }
.tracking-tight { letter-spacing: -0.02em; }
.fw-extrabold { font-weight: 800; }
.text-white-70 { color: rgba(255, 255, 255, 0.75); }
.max-w-sm { max-width: 320px; }

.modal {
  z-index: 1055 !important;
}
</style>