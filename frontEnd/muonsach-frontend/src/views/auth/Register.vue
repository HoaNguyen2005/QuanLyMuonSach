<template>
  <div class="register-container d-flex align-items-center justify-content-center bg-light py-5">
    <div class="card border-0 shadow-lg rounded-4 overflow-hidden register-card">
      <!-- Card Header -->
      <div class="card-header bg-success text-white text-center py-4 border-0">
        <h4 class="fw-bold mb-1">
          <i class="fas fa-user-plus me-2"></i>Đăng Ký Tài Khoản Độc Giả
        </h4>
        <p class="small text-white-50 mb-0">Tạo tài khoản mới để trải nghiệm dịch vụ thư viện</p>
      </div>

      <!-- Card Body -->
      <div class="card-body p-4 p-md-5">
        <form @submit.prevent="handleRegister">
          <div class="row g-3">
            
            <!-- Tên Tài Khoản -->
            <div class="col-md-6">
              <label class="form-label small fw-bold text-secondary">
                Tên Tài Khoản <span class="text-danger">*</span>
              </label>
              <input 
                type="text" 
                class="form-control" 
                v-model="formData.tenTaiKhoan" 
                placeholder="VD: cuongle99" 
                required 
              />
            </div>

            <!-- Họ và Tên -->
            <div class="col-md-6">
              <label class="form-label small fw-bold text-secondary">
                Họ và Tên <span class="text-danger">*</span>
              </label>
              <input 
                type="text" 
                class="form-control" 
                v-model="formData.hoTen" 
                placeholder="Nhập đầy đủ họ tên" 
                required 
              />
            </div>

            <!-- Email -->
            <div class="col-md-6">
              <label class="form-label small fw-bold text-secondary">
                Địa Chỉ Email <span class="text-danger">*</span>
              </label>
              <input 
                type="email" 
                class="form-control" 
                v-model="formData.email" 
                placeholder="example@gmail.com" 
                required 
              />
            </div>

            <!-- Mật Khẩu -->
            <div class="col-md-6">
              <label class="form-label small fw-bold text-secondary">
                Mật Khẩu <span class="text-danger">*</span>
              </label>
              <input 
                type="password" 
                class="form-control" 
                v-model="formData.matKhau" 
                placeholder="Ít nhất 6 ký tự" 
                required 
              />
            </div>

            <!-- Xác Nhận Mật Khẩu -->
            <div class="col-md-6">
              <label class="form-label small fw-bold text-secondary">
                Xác Nhận Mật Khẩu <span class="text-danger">*</span>
              </label>
              <input 
                type="password" 
                class="form-control" 
                v-model="formData.confirmPassword" 
                placeholder="Nhập lại mật khẩu" 
                required 
              />
            </div>

            <!-- Ngày Sinh -->
            <div class="col-md-6">
              <label class="form-label small fw-bold text-secondary">Ngày Sinh</label>
              <input 
                type="date" 
                class="form-control" 
                v-model="formData.ngaySinh" 
              />
            </div>

            <!-- Giới Tính -->
            <div class="col-md-6">
              <label class="form-label small fw-bold text-secondary">Giới Tính</label>
              <select class="form-select" v-model="formData.phai">
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <!-- Số Điện Thoại -->
            <div class="col-md-6">
              <label class="form-label small fw-bold text-secondary">Số Điện Thoại</label>
              <input 
                type="text" 
                class="form-control" 
                v-model="formData.dienThoai" 
                placeholder="VD: 0912345678" 
              />
            </div>

            <!-- Địa Chỉ Cư Trú (Đã cho dài ra trọn 1 hàng) -->
            <div class="col-12">
              <label class="form-label small fw-bold text-secondary">Địa Chỉ Cư Trú</label>
              <input 
                type="text" 
                class="form-control" 
                v-model="formData.diaChi" 
                placeholder="VD: Số 123 Đường Ninh Kiều, Quận Ninh Kiều, TP. Cần Thơ" 
              />
            </div>

          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            class="btn btn-success w-100 py-2.5 rounded-3 fw-bold shadow-sm mt-4 d-flex align-items-center justify-content-center gap-2"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm"></span>
            <i v-else class="fas fa-user-check"></i>
            <span>{{ loading ? 'Đang tạo tài khoản...' : 'Đăng Ký Tài Khoản' }}</span>
          </button>
        </form>
      </div>

      <!-- Card Footer -->
      <div class="card-footer bg-light text-center py-3 border-top-0">
        <p class="small text-muted mb-0">
          Đã có tài khoản độc giả? 
          <router-link to="/login" class="fw-bold text-success text-decoration-none">
            Đăng nhập ngay
          </router-link>
        </p>
      </div>
    </div>

    <!-- BOOTSTRAP MODAL THÔNG BÁO ĐĂNG KÝ -->
    <div 
      class="modal fade" 
      id="registerModal" 
      tabindex="-1" 
      ref="registerModalRef"
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
              :class="modalState.isSuccess ? 'btn-success' : 'btn-danger'"
              @click="closeRegisterModal"
            >
              {{ modalState.isSuccess ? 'Đăng Nhập Ngay' : 'Kiểm Tra Lại' }} 
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
    if (this.$refs.registerModalRef) {
      this.modalInstance = new bootstrap.Modal(this.$refs.registerModalRef);
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
        this.$router.push({ name: "login" });
      }
    },

    validateForm() {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(this.formData.email)) {
        this.showModal("Email không hợp lệ!", "Vui lòng nhập địa chỉ email đúng định dạng (vd: user@example.com).", false);
        return false;
      }

      if (this.formData.matKhau.length < 6) {
        this.showModal("Mật khẩu quá ngắn!", "Mật khẩu đăng ký phải chứa ít nhất 6 ký tự.", false);
        return false;
      }

      if (this.formData.matKhau !== this.formData.confirmPassword) {
        this.showModal("Mật khẩu không khớp!", "Mật khẩu xác nhận không trùng khớp với mật khẩu vừa nhập.", false);
        return false;
      }

      return true;
    },

    async handleRegister() {
      if (!this.validateForm()) return;

      this.loading = true;

      try {
        const response = await AuthService.register(this.formData);

        this.showModal(
          "Đăng Ký Thành Công! 🎉", 
          `Tài khoản độc giả <strong>${this.formData.hoTen}</strong> đã được khởi tạo thành công. Vui lòng đăng nhập để bắt đầu sử dụng!`, 
          true
        );

      } catch (error) {
        const errorMsg = error.response?.data?.message || "Đăng ký thất bại. Tên tài khoản hoặc Email có thể đã tồn tại!";
        this.showModal("Đăng ký thất bại!", errorMsg, false);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.register-card {
  width: 100%;
  max-width: 680px;
}
.form-control:focus, .form-select:focus {
  box-shadow: none;
  border-color: #198754;
}
</style>