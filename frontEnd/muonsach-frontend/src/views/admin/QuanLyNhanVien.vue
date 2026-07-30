<template>
  <div class="container-fluid py-4 px-md-5">
    <!-- Khung Bọc Trong Suốt Tách Biệt Nền Global -->
    <div class="page-wrapper p-4 p-md-5 rounded-4 shadow-lg border">
      
      <!-- Header Section -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 class="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <i class="fas fa-user-shield text-navy"></i>
            <span>Quản Lý Nhân Viên</span>
          </h3>
          <p class="text-muted small mb-0">Quản lý đội ngũ nhân viên thư viện và phân quyền quản trị.</p>
        </div>
        <button class="btn btn-navy rounded-pill px-4 py-2 shadow-sm fw-bold d-flex align-items-center gap-2" @click="openModalToAdd">
          <i class="fas fa-user-plus"></i>
          <span>Thêm Nhân Viên Mới</span>
        </button>
      </div>

      <!-- Main Content Table Card -->
      <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <!-- Search Bar -->
        <div class="card-header bg-white py-3 px-4 border-bottom-0">
          <div class="row g-3 align-items-center justify-content-between">
            <div class="col-12 col-md-5">
              <div class="input-group search-box">
                <span class="input-group-text bg-light border-end-0 text-muted ps-3"><i class="fas fa-search"></i></span>
                <input 
                  type="text" 
                  class="form-control bg-light border-start-0 ps-0 py-2" 
                  placeholder="Tìm kiếm theo MSNV, tên nhân viên hoặc chức vụ..."
                  v-model="searchQuery"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Table Body -->
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 custom-table">
            <thead class="bg-navy text-white text-uppercase fs-xs">
              <tr>
                <th class="ps-4 py-3">Nhân Viên</th>
                <th class="py-3">MSNV</th>
                <th class="py-3">Chức Vụ</th>
                <th class="py-3">Số Điện Thoại</th>
                <th class="py-3">Địa Chỉ</th>
                <th class="text-end pe-4 py-3">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredStaff.length === 0">
                <td colspan="6" class="text-center py-5 text-muted">
                  <i class="fas fa-user-slash fa-3x mb-3 text-secondary opacity-50 d-block"></i>
                  Không tìm thấy dữ liệu nhân viên nào!
                </td>
              </tr>
              <tr v-for="nv in filteredStaff" :key="nv._id || nv.MSNV || nv.msnv">
                <td class="ps-4">
                  <div class="d-flex align-items-center gap-2.5">
                    <div class="avatar-circle bg-navy-subtle text-navy fw-bold rounded-circle d-flex align-items-center justify-content-center me-2 border border-navy-subtle">
                      {{ (nv.HoTenNV || nv.hoTenNV || nv.hoTen || 'S').charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <div class="fw-bold text-dark lh-1">{{ nv.HoTenNV || nv.hoTenNV || nv.hoTen }}</div>
                    </div>
                  </div>
                </td>
                <td><span class="badge bg-secondary bg-opacity-10 text-secondary fw-medium px-2.5 py-1.5 rounded-3">{{ nv.MSNV || nv.msnv }}</span></td>
                <td><span class="badge bg-info bg-opacity-10 text-info fw-semibold px-2.5 py-1.5 rounded-pill">{{ nv.ChucVu || nv.chucVu || 'Nhân viên' }}</span></td>
                <td class="text-secondary small">{{ nv.SoDienThoai || nv.soDienThoai || nv.dienThoai || nv.sdt || 'N/A' }}</td>
                <td class="text-secondary small">{{ nv.DiaChi || nv.diaChi || 'N/A' }}</td>
                <td class="text-end pe-4">
                  <div class="d-inline-flex gap-2">
                    <button class="btn btn-sm btn-outline-warning rounded-3 px-2.5 py-1 fw-bold" @click="openModalToEdit(nv)" title="Sửa">
                      <i class="fas fa-edit me-1"></i>Sửa
                    </button>
                    <button class="btn btn-sm btn-outline-danger rounded-3 px-2.5 py-1 fw-bold" @click="confirmDeleteNhanVien(nv)" title="Xóa">
                      <i class="fas fa-trash-alt me-1"></i>Xóa
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card-footer bg-white border-0 py-3 px-4">
          <span class="text-muted fs-xs">Tổng số: {{ filteredStaff.length }} nhân viên</span>
        </div>
      </div>

    </div>

    <!-- 1. MODAL FORM THÊM / SỬA NHÂN VIÊN -->
    <div class="modal fade" id="nhanVienModal" tabindex="-1" ref="nhanVienModalRef" data-bs-backdrop="static">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden bg-white">
          <div class="modal-header bg-navy text-white py-3 border-0">
            <h5 class="modal-title fw-bold">
              <i :class="isEditing ? 'fas fa-user-edit' : 'fas fa-user-plus'" class="me-2"></i>
              {{ isEditing ? 'Chỉnh Sửa Nhân Viên' : 'Thêm Nhân Viên Mới' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <div class="modal-body p-4">
            <form @submit.prevent="saveNhanVien">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-secondary">MSNV <span class="text-danger">*</span></label>
                  <input type="text" class="form-control rounded-3" v-model="currentNV.MSNV" placeholder="VD: NV002" :disabled="isEditing" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-secondary">Họ và Tên Nhân Viên <span class="text-danger">*</span></label>
                  <input type="text" class="form-control rounded-3" v-model="currentNV.HoTenNV" placeholder="Nhập đầy đủ họ tên" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-secondary">Chức Vụ</label>
                  <input type="text" class="form-control rounded-3" v-model="currentNV.ChucVu" placeholder="VD: Thủ thư / Quản lý" />
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-secondary">Ngày Sinh</label>
                  <input type="date" v-model="currentNV.NgaySinh" class="form-control rounded-3" />
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-secondary">Giới Tính</label>
                  <select v-model="currentNV.Phai" class="form-select rounded-3">
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-secondary">Mật Khẩu <span v-if="!isEditing" class="text-danger">*</span></label>
                  <input type="password" class="form-control rounded-3" v-model="currentNV.Password" :placeholder="isEditing ? 'Để trống nếu không muốn đổi' : 'Nhập mật khẩu'" :required="!isEditing" />
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-secondary">Số Điện Thoại</label>
                  <input type="text" class="form-control rounded-3" v-model="currentNV.SoDienThoai" placeholder="VD: 0909123456" />
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-secondary">Địa Chỉ</label>
                  <input type="text" class="form-control rounded-3" v-model="currentNV.DiaChi" placeholder="Nhập địa chỉ cư trú" />
                </div>
              </div>

              <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                <button type="button" class="btn btn-light rounded-pill px-4 border" @click="closeModal">Hủy</button>
                <button type="submit" class="btn btn-navy rounded-pill px-4 fw-bold shadow-sm" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                  <i v-else class="fas fa-save me-1"></i> Lưu Nhân Viên
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. MODAL THÔNG BÁO TỔNG HỢP -->
    <div class="modal fade" id="statusModal" tabindex="-1" aria-hidden="true" ref="statusModalRef">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content rounded-4 border-0 shadow text-center p-3 bg-white">
          <div class="modal-body">
            <div :class="statusModalType === 'success' ? 'text-success' : 'text-danger'" class="mb-3">
              <i :class="statusModalType === 'success' ? 'fas fa-check-circle fa-4x' : 'fas fa-exclamation-circle fa-4x'"></i>
            </div>
            <h5 class="fw-bold text-dark mb-2">{{ statusModalTitle }}</h5>
            <p class="text-muted small mb-4">{{ statusModalMessage }}</p>
            <button 
              type="button" 
              :class="statusModalType === 'success' ? 'btn-success' : 'btn-danger'"
              class="btn rounded-pill w-100 fw-bold py-2 shadow-sm text-white" 
              data-bs-dismiss="modal"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. MODAL XÁC NHẬN XÓA NHÂN VIÊN -->
    <div class="modal fade" id="deleteConfirmModal" tabindex="-1" aria-hidden="true" ref="deleteModalRef">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content rounded-4 border-0 shadow text-center p-3 bg-white">
          <div class="modal-body">
            <div class="text-warning mb-3">
              <i class="fas fa-exclamation-triangle fa-4x"></i>
            </div>
            <h5 class="fw-bold text-dark mb-2">Xác Nhận Xóa</h5>
            <p class="text-muted small mb-4">Bạn có chắc chắn muốn xóa nhân viên <strong>{{ deletingNVName }}</strong>?</p>
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-light rounded-pill flex-fill fw-bold border" data-bs-dismiss="modal">Hủy</button>
              <button type="button" class="btn btn-danger rounded-pill flex-fill fw-bold text-white shadow-sm" @click="executeDeleteNhanVien">Xóa</button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import NhanVienService from "@/services/nhanvien.service";
import * as bootstrap from "bootstrap";

export default {
  name: "QuanLyNhanVien",
  data() {
    return {
      staffList: [],
      searchQuery: "",
      isEditing: false,
      loading: false,
      modalInstance: null,
      statusModalInstance: null,
      deleteModalInstance: null,
      statusModalTitle: "",
      statusModalMessage: "",
      statusModalType: "success",
      pendingDeleteNV: null,
      deletingNVName: "",
      currentNV: { 
        MSNV: "", 
        HoTenNV: "", 
        NgaySinh: "", 
        Phai: "Nam", 
        Password: "", 
        ChucVu: "Nhân viên", 
        SoDienThoai: "", 
        DiaChi: "" 
      }
    };
  },
  computed: {
    filteredStaff() {
      if (!this.searchQuery) return this.staffList;
      const q = this.searchQuery.toLowerCase();
      return this.staffList.filter(s => {
        const msnv = (s.MSNV || s.msnv || "").toLowerCase();
        const ten = (s.HoTenNV || s.hoTenNV || s.hoTen || "").toLowerCase();
        const cv = (s.ChucVu || s.chucVu || "").toLowerCase();
        return msnv.includes(q) || ten.includes(q) || cv.includes(q);
      });
    }
  },
  methods: {
    showPopUp(title, message, type = "success") {
      this.statusModalTitle = title;
      this.statusModalMessage = message;
      this.statusModalType = type;

      if (!this.statusModalInstance) {
        this.statusModalInstance = new bootstrap.Modal(this.$refs.statusModalRef);
      }
      this.statusModalInstance.show();
    },

    async fetchStaff() {
      try { 
        const res = await NhanVienService.getAll();
        this.staffList = Array.isArray(res) ? res : (res.data || []);
      } catch (error) {
        // Suppress fetch error
      }
    },

    openModalToAdd() {
      this.isEditing = false;
      this.currentNV = { 
        MSNV: "NV" + Math.floor(1000 + Math.random() * 9000), 
        HoTenNV: "", 
        NgaySinh: "", 
        Phai: "Nam", 
        Password: "123", 
        ChucVu: "Nhân viên", 
        SoDienThoai: "", 
        DiaChi: "" 
      };
      this.getModal().show();
    },

    openModalToEdit(nv) {
      this.isEditing = true;
      
      let formattedDate = "";
      const rawDate = nv.NgaySinh || nv.ngaySinh || nv.dateOfBirth || "";
      
      if (rawDate) {
        if (typeof rawDate === "string") {
          if (rawDate.includes("-")) {
            formattedDate = rawDate.split("T")[0];
          } else if (rawDate.includes("/")) {
            const parts = rawDate.split("/");
            if (parts.length === 3) {
              const [day, month, year] = parts;
              formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
          }
        }
        
        if (!formattedDate) {
          const d = new Date(rawDate);
          if (!isNaN(d.getTime())) {
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            formattedDate = `${yyyy}-${mm}-${dd}`;
          }
        }
      }

      this.currentNV = {
        _id: nv._id,
        MSNV: nv.MSNV || nv.msnv || "",
        HoTenNV: nv.HoTenNV || nv.hoTenNV || nv.hoTen || "",
        NgaySinh: formattedDate,
        Phai: nv.Phai || nv.phai || nv.gioiTinh || "Nam",
        ChucVu: nv.ChucVu || nv.chucVu || "Nhân viên",
        SoDienThoai: nv.SoDienThoai || nv.soDienThoai || nv.dienThoai || nv.sdt || "",
        DiaChi: nv.DiaChi || nv.diaChi || "",
        Password: ""
      };

      this.getModal().show();
    },

    closeModal() { this.getModal().hide(); },

    getModal() {
      if (!this.modalInstance) {
        this.modalInstance = new bootstrap.Modal(this.$refs.nhanVienModalRef);
      }
      return this.modalInstance;
    },

    async saveNhanVien() {
      this.loading = true;

      const payload = {
        _id: this.currentNV._id,
        MSNV: this.currentNV.MSNV,
        msnv: this.currentNV.MSNV,
        HoTenNV: this.currentNV.HoTenNV,
        hoTenNV: this.currentNV.HoTenNV,
        hoTen: this.currentNV.HoTenNV,
        NgaySinh: this.currentNV.NgaySinh,
        ngaySinh: this.currentNV.NgaySinh,
        Phai: this.currentNV.Phai,
        phai: this.currentNV.Phai,
        ChucVu: this.currentNV.ChucVu,
        chucVu: this.currentNV.ChucVu,
        SoDienThoai: this.currentNV.SoDienThoai,
        soDienThoai: this.currentNV.SoDienThoai,
        dienThoai: this.currentNV.SoDienThoai,
        DiaChi: this.currentNV.DiaChi,
        diaChi: this.currentNV.DiaChi
      };

      if (this.currentNV.Password && this.currentNV.Password.trim() !== "") {
        payload.Password = this.currentNV.Password.trim();
        payload.password = this.currentNV.Password.trim();
      }

      try {
        if (this.isEditing) {
          const targetId = payload.MSNV || this.currentNV._id;
          await NhanVienService.update(targetId, payload);
          this.showPopUp("Thành Công", "Cập nhật nhân viên thành công!", "success");
        } else {
          await NhanVienService.create(payload);
          this.showPopUp("Thành Công", "Thêm nhân viên mới thành công!", "success");
        }
        this.closeModal();
        await this.fetchStaff();
      } catch (error) {
        const errMsg = error.response?.data?.message || error.message || "Lỗi khi lưu dữ liệu nhân viên!";
        this.showPopUp("Lỗi Hệ Thống", errMsg, "error");
      } finally { 
        this.loading = false; 
      }
    },

    confirmDeleteNhanVien(nv) {
      this.pendingDeleteNV = nv;
      this.deletingNVName = nv.HoTenNV || nv.hoTenNV || nv.hoTen || "";

      if (!this.deleteModalInstance) {
        this.deleteModalInstance = new bootstrap.Modal(this.$refs.deleteModalRef);
      }
      this.deleteModalInstance.show();
    },

    async executeDeleteNhanVien() {
      if (this.deleteModalInstance) {
        this.deleteModalInstance.hide();
      }

      if (!this.pendingDeleteNV) return;

      const targetId = this.pendingDeleteNV.MSNV || 
                       this.pendingDeleteNV.msnv || 
                       this.pendingDeleteNV._id;

      try {
        await NhanVienService.delete(targetId);
        this.showPopUp("Thành Công", "Đã xóa nhân viên khỏi hệ thống!", "success");
        await this.fetchStaff();
      } catch (error) {
        const errMsg = error.response?.data?.message || "Lỗi khi xóa nhân viên!";
        this.showPopUp("Lỗi Xóa", errMsg, "error");
      }
    }
  },
  mounted() { this.fetchStaff(); }
};
</script>

<style scoped>
.text-navy { color: #1a2b4c !important; }
.bg-navy { background-color: #1a2b4c !important; }
.bg-navy-subtle { background-color: rgba(26, 43, 76, 0.1) !important; }
.border-navy-subtle { border-color: rgba(26, 43, 76, 0.2) !important; }

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
  border-color: rgba(229, 231, 235, 0.8) !important;
}

.avatar-circle { width: 36px; height: 36px; font-size: 0.9rem; }
.search-box .form-control:focus { box-shadow: none; background-color: #f8f9fa; }
.custom-table { font-size: 0.9rem; }
.custom-table thead th { font-weight: 600; letter-spacing: 0.03em; border-bottom: 1px solid #f1f5f9; }
.custom-table tbody tr:hover { background-color: #f8fafc; }
.fs-xs { font-size: 0.78rem; }
</style>