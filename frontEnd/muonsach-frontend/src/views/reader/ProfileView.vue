<template>
  <div class="container my-4">
    <div class="row justify-content-center">
      <div class="col-md-9 col-lg-8">
        <!-- Khung Bao Trong Suốt Nổi Bật -->
        <div class="card shadow-lg border border-light-subtle rounded-4 page-wrapper overflow-hidden">
          
          <div class="card-header bg-navy text-white py-3 px-4 border-0">
            <h4 class="mb-0 fw-bold fs-5">
              <i class="fas fa-user-edit me-2"></i>Thông Tin Cá Nhân
            </h4>
          </div>

          <div class="card-body p-4 p-md-5">
            
            <!-- Cảnh báo thành công / Lỗi -->
            <div 
              v-if="message" 
              :class="['alert', isError ? 'alert-danger' : 'alert-success', 'alert-dismissible fade show rounded-3 shadow-sm']" 
              role="alert"
            >
              <i :class="isError ? 'fas fa-exclamation-circle me-1' : 'fas fa-check-circle me-1'"></i>
              {{ message }}
              <button type="button" class="btn-close" @click="message = ''"></button>
            </div>

            <form @submit.prevent="updateProfile">
              
              <!-- Họ và Tên -->
              <div class="mb-3">
                <label class="form-label fw-bold text-dark">Họ và Tên <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  v-model="user.hoTen" 
                  class="form-control rounded-3 py-2 px-3" 
                  placeholder="Nhập họ và tên"
                  required 
                />
              </div>

              <!-- Địa chỉ Email -->
              <div class="mb-3" v-if="user.role !== 'admin' && !user.MSNV">
                <label class="form-label fw-bold text-dark">Địa chỉ Email <span class="text-danger">*</span></label>
                <input 
                  type="email" 
                  v-model="user.email" 
                  class="form-control rounded-3 py-2 px-3" 
                  :class="{ 'is-invalid': emailError }"
                  placeholder="example@gmail.com"
                  :required="user.role !== 'admin' && !user.MSNV"
                />
                <div class="invalid-feedback" v-if="emailError">
                  {{ emailError }}
                </div>
              </div>

              <div class="row g-3">
                <!-- Ngày Sinh -->
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-bold text-dark">Ngày Sinh</label>
                  <input 
                    type="date" 
                    v-model="user.ngaySinh" 
                    class="form-control rounded-3 py-2 px-3" 
                  />
                </div>

                <!-- Giới Tính (Đã chuyển sang dùng v-model="user.gioiTinh") -->
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-bold text-dark">Giới Tính</label>
                  <select v-model="user.gioiTinh" class="form-select rounded-3 py-2 px-3">
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>

              <!-- Số Điện Thoại -->
              <div class="mb-3">
                <label class="form-label fw-bold text-dark">Số Điện Thoại</label>
                <input 
                  type="text" 
                  v-model="user.dienThoai" 
                  class="form-control rounded-3 py-2 px-3" 
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <!-- Địa Chỉ -->
              <div class="mb-4">
                <label class="form-label fw-bold text-dark">Địa Chỉ</label>
                <input 
                  type="text" 
                  v-model="user.diaChi" 
                  class="form-control rounded-3 py-2 px-3" 
                  placeholder="Nhập địa chỉ cư trú"
                />
              </div>

              <!-- HÀNG NÚT BẤM -->
              <div class="d-flex justify-content-between align-items-center pt-3 border-top">
                <button type="button" @click="goBack" class="btn btn-outline-secondary rounded-pill px-4 fw-semibold">
                  <i class="fas fa-arrow-left me-1"></i> Quay lại
                </button>

                <button type="submit" class="btn btn-navy rounded-pill px-4 fw-bold shadow-sm text-white" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                  <i v-else class="fas fa-save me-1"></i>
                  {{ loading ? 'Đang lưu...' : 'Cập nhật thông tin' }}
                </button>
              </div>

            </form>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AuthService from "@/services/auth.service";
import DocGiaService from "@/services/docGia.service";
import NhanVienService from "@/services/nhanVien.service";

export default {
  name: "ProfileView",
  data() {
    return {
      user: {
        _id: "",
        hoTen: "",
        email: "",
        ngaySinh: "",
        dienThoai: "",
        diaChi: "",
        gioiTinh: "Nam",
        role: "docgia"
      },
      message: "",
      emailError: "",
      isError: false,
      loading: false
    };
  },
  mounted() {
    console.log("[DEBUG PROFILE] Mounting ProfileView component...");
    this.fetchProfileData();
  },
  methods: {
    validateEmail(email) {
      const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return regex.test(email);
    },

    goBack() {
      console.log("[DEBUG PROFILE] Navigating back based on role:", this.user.role);
      if (this.user.role === "admin" || this.user.MSNV) {
        this.$router.push({ name: "admin.dashboard" });
      } else {
        this.$router.push({ name: "reader.home" });
      }
    },

    async fetchProfileData() {
      const currentUser = AuthService.getCurrentUser();
      console.log("[DEBUG PROFILE] Fetching currentUser from AuthService:", currentUser);

      if (!currentUser) {
        console.warn("[DEBUG PROFILE] No current user found. Redirecting to login...");
        this.$router.push({ name: "login" });
        return;
      }

      const isStaffOrAdmin = currentUser.role === "admin" || currentUser.role === "nhanvien" || !!currentUser.MSNV;

      this.user = {
        ...currentUser,
        hoTen: currentUser.hoTen || currentUser.hoTenNV || currentUser.tenND || currentUser.tenDocGia || "",
        email: currentUser.email || "",
        ngaySinh: currentUser.ngaySinh ? currentUser.ngaySinh.split('T')[0] : "",
        dienThoai: currentUser.dienThoai || currentUser.soDienThoai || currentUser.SoDienThoai || "",
        diaChi: currentUser.diaChi || currentUser.DiaChi || "",
        gioiTinh: currentUser.gioiTinh || "Nam",
        role: isStaffOrAdmin ? "admin" : "docgia",
        MSNV: currentUser.MSNV || currentUser.msnv || ""
      };

      const userId = currentUser._id || currentUser.maDocGia || currentUser.MSNV || currentUser.msnv;
      if (!userId) {
        console.warn("[DEBUG PROFILE] Missing user ID for fetching data.");
        return;
      }

      console.log(`[DEBUG PROFILE] Fetching profile from DB for userId [${userId}] (isStaffOrAdmin: ${isStaffOrAdmin})...`);

      try {
        const fetchedData = isStaffOrAdmin
          ? await NhanVienService.get(userId)
          : await DocGiaService.get(userId);

        console.log("[DEBUG PROFILE] Fetched profile data from server:", fetchedData);

        if (fetchedData) {
          const data = fetchedData.data || fetchedData;
          this.user = {
            ...this.user,
            ...data,
            hoTen: data.hoTen || data.hoTenNV || data.HoTenNV || data.tenND || this.user.hoTen,
            email: data.email || this.user.email,
            ngaySinh: (data.ngaySinh || data.NgaySinh) ? (data.ngaySinh || data.NgaySinh).split('T')[0] : this.user.ngaySinh,
            dienThoai: data.dienThoai || data.soDienThoai || data.SoDienThoai || this.user.dienThoai,
            diaChi: data.diaChi || data.DiaChi || this.user.diaChi,
            gioiTinh: data.gioiTinh || this.user.gioiTinh
          };
        }
        console.log("[DEBUG PROFILE] Form mapped user data:", this.user);
      } catch (err) {
        console.error("[DEBUG PROFILE ERROR] Error fetching profile data:", err);
      }
    },

    async updateProfile() {
      this.message = "";
      this.emailError = "";
      this.isError = false;

      const isStaffOrAdmin = this.user.role === "admin" || !!this.user.MSNV;

      if (!isStaffOrAdmin) {
        if (!this.user.email || !this.validateEmail(this.user.email)) {
          this.emailError = "Địa chỉ email không đúng định dạng (VD: example@gmail.com)";
          console.warn("[DEBUG PROFILE VALIDATION] Invalid email:", this.user.email);
          return;
        }
      }

      this.loading = true;
      const userId = this.user._id || this.user.maDocGia || this.user.MSNV || this.user.msnv;
      const payload = {
        ...this.user,
        gioiTinh: this.user.gioiTinh,
      };

      console.log(`[DEBUG PROFILE] Executing updateProfile for userId [${userId}]. Payload:`, JSON.stringify(payload, null, 2));

      try {
        const resData = isStaffOrAdmin
          ? await NhanVienService.update(userId, payload)
          : await DocGiaService.update(userId, payload);

        console.log("[DEBUG PROFILE SUCCESS] Server response:", resData);

        const updatedUser = {
          ...AuthService.getCurrentUser(),
          ...payload,
          ...(resData.data || resData)
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("user-state-changed"));

        this.message = "Cập nhật thông tin cá nhân thành công!";
      } catch (err) {
        console.error("[DEBUG PROFILE ERROR] Profile update failed:", err.response?.data || err);
        this.isError = true;
        this.message = err.response?.data?.message || err.message || "Cập nhật thất bại từ Server!";
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.text-navy { color: #1a2b4c !important; }
.bg-navy { background-color: #1a2b4c !important; }

.btn-navy {
  background-color: #1a2b4c;
  border-color: #1a2b4c;
  color: #ffffff;
  transition: all 0.3s ease;
}
.btn-navy:hover {
  background-color: #121e36;
  border-color: #121e36;
  color: #ffffff;
}

.page-wrapper {
  background-color: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(8px);
}
</style>