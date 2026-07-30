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

              <!-- Địa chỉ Email (Chỉ hiển thị đối với Độc giả, Admin/Nhân viên sẽ không thấy) -->
              <div class="mb-3" v-if="user.role !== 'admin' && !user.MSNV">
                <label class="form-label fw-bold">Địa chỉ Email <span class="text-danger">*</span></label>
                <input 
                  type="email" 
                  v-model="user.email" 
                  class="form-control" 
                  :class="{ 'is-invalid': emailError }"
                  placeholder="example@gmail.com"
                  :required="user.role !== 'admin' && !user.MSNV"
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
        ngaySinh: "",
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
      if (this.user.role === "admin" || this.user.MSNV) {
        this.$router.push({ name: "admin.dashboard" });
      } else {
        this.$router.push({ name: "reader.home" });
      }
    },

    async fetchProfileData() {
      const currentUser = AuthService.getCurrentUser();

      if (!currentUser) {
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
        phai: currentUser.phai || currentUser.Phai || currentUser.gioiTinh || "Nam",
        role: isStaffOrAdmin ? "admin" : "docgia",
        MSNV: currentUser.MSNV || currentUser.msnv || ""
      };

      const userId = currentUser._id || currentUser.maDocGia || currentUser.MSNV || currentUser.msnv;
      if (!userId) return;

      try {
        const endpoint = isStaffOrAdmin
          ? `http://localhost:3000/api/nhanvien/${userId}`
          : `http://localhost:3000/api/docgia/${userId}`;

        const res = await fetch(endpoint);
        if (res.ok) {
          const fetchedData = await res.json();

          this.user = {
            ...this.user,
            ...fetchedData,
            hoTen: fetchedData.hoTen || fetchedData.hoTenNV || fetchedData.HoTenNV || fetchedData.tenND || this.user.hoTen,
            email: fetchedData.email || this.user.email,
            ngaySinh: fetchedData.ngaySinh || fetchedData.NgaySinh ? (fetchedData.ngaySinh || fetchedData.NgaySinh).split('T')[0] : this.user.ngaySinh,
            dienThoai: fetchedData.dienThoai || fetchedData.soDienThoai || fetchedData.SoDienThoai || this.user.dienThoai,
            diaChi: fetchedData.diaChi || fetchedData.DiaChi || this.user.diaChi,
            phai: fetchedData.phai || fetchedData.Phai || fetchedData.gioiTinh || this.user.phai
          };
        }
      } catch (err) {
        // Bỏ qua lỗi kết nối fetch phụ
      }
    },

    async updateProfile() {
      this.message = "";
      this.emailError = "";
      this.isError = false;

      const isStaffOrAdmin = this.user.role === "admin" || !!this.user.MSNV;

      // Chỉ validate email khi người dùng KHÔNG PHẢI là Admin/Nhân viên
      if (!isStaffOrAdmin) {
        if (!this.user.email || !this.validateEmail(this.user.email)) {
          this.emailError = "Địa chỉ email không đúng định dạng (VD: example@gmail.com)";
          return;
        }
      }

      this.loading = true;
      const userId = this.user._id || this.user.maDocGia || this.user.MSNV || this.user.msnv;

      try {
        const endpoint = isStaffOrAdmin 
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

        const updatedUser = {
          ...AuthService.getCurrentUser(),
          ...this.user,
          ...(resData.data || resData)
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        this.message = "Cập nhật thông tin cá nhân thành công!";
      } catch (err) {
        this.isError = true;
        this.message = err.message;
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>