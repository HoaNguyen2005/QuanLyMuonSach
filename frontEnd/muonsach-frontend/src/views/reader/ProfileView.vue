<template>
  <div class="container mt-4 mb-5">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card shadow border-0 rounded-3">
          <div class="card-header bg-primary text-white py-3">
            <h4 class="mb-0"><i class="fas fa-user-edit me-2"></i>Thông Tin Cá Nhân</h4>
          </div>
          <div class="card-body p-4">
            
            <!-- Cảnh báo thành công / Lỗi -->
            <div 
              v-if="message" 
              :class="['alert', isError ? 'alert-danger' : 'alert-success', 'alert-dismissible fade show']" 
              role="alert"
            >
              <i :class="isError ? 'fas fa-exclamation-circle me-1' : 'fas fa-check-circle me-1'"></i>
              {{ message }}
              <button type="button" class="btn-close" @click="message = ''"></button>
            </div>

            <form @submit.prevent="updateProfile">
              
              <!-- Họ và Tên -->
              <div class="mb-3">
                <label class="form-label fw-bold">Họ và Tên <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  v-model="user.hoTen" 
                  class="form-control" 
                  placeholder="Nhập họ và tên"
                  required 
                />
              </div>

              <!-- Địa chỉ Email -->
              <div class="mb-3">
                <label class="form-label fw-bold">Địa chỉ Email <span class="text-danger">*</span></label>
                <input 
                  type="email" 
                  v-model="user.email" 
                  class="form-control" 
                  :class="{ 'is-invalid': emailError }"
                  placeholder="example@gmail.com"
                  required 
                />
                <div class="invalid-feedback" v-if="emailError">
                  {{ emailError }}
                </div>
              </div>

              <!-- Ngày Sinh -->
              <div class="mb-3">
                <label class="form-label fw-bold">Ngày Sinh</label>
                <input 
                  type="date" 
                  v-model="user.ngaySinh" 
                  class="form-control" 
                />
              </div>

              <!-- Số Điện Thoại -->
              <div class="mb-3">
                <label class="form-label fw-bold">Số Điện Thoại</label>
                <input 
                  type="text" 
                  v-model="user.dienThoai" 
                  class="form-control" 
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <!-- Địa Chỉ -->
              <div class="mb-3">
                <label class="form-label fw-bold">Địa Chỉ</label>
                <input 
                  type="text" 
                  v-model="user.diaChi" 
                  class="form-control" 
                  placeholder="Nhập địa chỉ cư trú"
                />
              </div>

              <!-- Giới Tính -->
              <div class="mb-3">
                <label class="form-label fw-bold">Giới Tính</label>
                <select v-model="user.phai" class="form-select">
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <!-- HÀNG NÚT BẤM -->
              <div class="d-flex justify-content-between align-items-center mt-4">
                <button type="button" @click="goBack" class="btn btn-outline-secondary px-4">
                  <i class="fas fa-arrow-left me-1"></i> Quay lại
                </button>

                <button type="submit" class="btn btn-primary px-4 fw-bold" :disabled="loading">
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

export default {
  name: "ProfileView",
  data() {
    return {
      user: {
        _id: "",
        hoTen: "",
        email: "",
        ngaySinh: "", // Khai báo trường ngaySinh
        dienThoai: "",
        diaChi: "",
        phai: "Nam",
        role: "docgia"
      },
      message: "",
      emailError: "",
      isError: false,
      loading: false
    };
  },
  mounted() {
    this.fetchProfileData();
  },
  methods: {
    validateEmail(email) {
      const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return regex.test(email);
    },

    goBack() {
      console.log("[DEBUG PROFILE] Navigating back based on role:", this.user.role);
      if (this.user.role === "admin") {
        this.$router.push({ name: "admin.dashboard" });
      } else {
        this.$router.push({ name: "reader.home" });
      }
    },

    async fetchProfileData() {
      const currentUser = AuthService.getCurrentUser();
      console.log("[DEBUG PROFILE] Current user from LocalStorage:", currentUser);

      if (!currentUser) {
        this.$router.push({ name: "login" });
        return;
      }

      this.user = {
        ...currentUser,
        hoTen: currentUser.hoTen || currentUser.tenND || currentUser.tenDocGia || "",
        email: currentUser.email || "",
        ngaySinh: currentUser.ngaySinh ? currentUser.ngaySinh.split('T')[0] : "", // Chuẩn hóa chuỗi Date định dạng YYYY-MM-DD
        dienThoai: currentUser.dienThoai || currentUser.soDienThoai || "",
        diaChi: currentUser.diaChi || "",
        phai: currentUser.phai || currentUser.gioiTinh || "Nam",
        role: currentUser.role || "docgia"
      };

      const userId = currentUser._id || currentUser.maDocGia || currentUser.maNV;
      if (!userId) return;

      try {
        const endpoint = currentUser.role === "admin"
          ? `http://localhost:3000/api/nhanvien/${userId}`
          : `http://localhost:3000/api/docgia/${userId}`;

        const res = await fetch(endpoint);
        if (res.ok) {
          const fetchedData = await res.json();
          console.log("[DEBUG PROFILE] Fetched fresh data from server:", fetchedData);

          this.user = {
            ...this.user,
            ...fetchedData,
            hoTen: fetchedData.hoTen || fetchedData.tenND || this.user.hoTen,
            email: fetchedData.email || this.user.email,
            ngaySinh: fetchedData.ngaySinh ? fetchedData.ngaySinh.split('T')[0] : this.user.ngaySinh,
            dienThoai: fetchedData.dienThoai || fetchedData.soDienThoai || this.user.dienThoai,
            diaChi: fetchedData.diaChi || this.user.diaChi,
            phai: fetchedData.phai || fetchedData.gioiTinh || this.user.phai
          };
        }
      } catch (err) {
        console.warn("[DEBUG PROFILE WARN] Cannot fetch fresh profile from API:", err);
      }
    },

    async updateProfile() {
      this.message = "";
      this.emailError = "";
      this.isError = false;

      if (!this.user.email || !this.validateEmail(this.user.email)) {
        this.emailError = "Địa chỉ email không đúng định dạng (VD: example@gmail.com)";
        console.warn("[DEBUG FRONTEND WARN] Invalid email format:", this.user.email);
        return;
      }

      this.loading = true;
      const userId = this.user._id || this.user.maDocGia || this.user.maNV;

      console.log(`[DEBUG PROFILE] Updating user [${userId}] payload:`, JSON.stringify(this.user, null, 2));

      try {
        const endpoint = this.user.role === "admin" 
          ? `http://localhost:3000/api/nhanvien/${userId}`
          : `http://localhost:3000/api/docgia/${userId}`;

        const response = await fetch(endpoint, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.user)
        });

        const resData = await response.json();

        if (!response.ok) {
          throw new Error(resData.message || "Cập nhật thất bại từ Server!");
        }

        console.log("[DEBUG PROFILE SUCCESS] Server response:", resData);

        const updatedUser = {
          ...AuthService.getCurrentUser(),
          ...this.user,
          ...(resData.data || resData)
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        this.message = "Cập nhật thông tin cá nhân thành công!";
      } catch (err) {
        console.error("[DEBUG PROFILE ERROR]:", err);
        this.isError = true;
        this.message = err.message;
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>