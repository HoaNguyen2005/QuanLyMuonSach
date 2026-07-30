<template>
  <div class="container-fluid py-4 px-md-5">
    <!-- Header Section -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
      <div>
        <h3 class="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
          <i class="fas fa-user-shield text-primary"></i>
          <span>Quản Lý Nhân Viên</span>
        </h3>
        <p class="text-muted small mb-0">Quản lý đội ngũ nhân viên thư viện và phân quyền quản trị.</p>
      </div>
      <button class="btn btn-primary rounded-pill px-4 py-2 shadow-sm fw-semibold d-flex align-items-center gap-2" @click="openModalToAdd">
        <i class="fas fa-user-plus"></i>
        <span>Thêm Nhân Viên Mới</span>
      </button>
    </div>

    <!-- Main Content Table Card -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
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
          <thead class="table-light text-secondary text-uppercase fs-xs">
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
            <tr v-for="nv in filteredStaff" :key="nv._id || nv.MSNV">
              <td class="ps-4">
                <div class="d-flex align-items-center gap-2.5">
                  <div class="avatar-circle bg-primary bg-opacity-10 text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center me-2">
                    {{ (nv.HoTenNV || nv.hoTen || 'S').charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <div class="fw-bold text-dark lh-1">{{ nv.HoTenNV || nv.hoTen }}</div>
                    <div class="text-muted fs-xs mt-1">{{ nv.Email || nv.email || 'Chưa có email' }}</div>
                  </div>
                </div>
              </td>
              <td><span class="badge bg-secondary bg-opacity-10 text-secondary fw-medium px-2.5 py-1.5 rounded-3">{{ nv.MSNV }}</span></td>
              <td><span class="badge bg-info bg-opacity-10 text-info fw-semibold px-2.5 py-1.5 rounded-pill">{{ nv.ChucVu || 'Nhân viên' }}</span></td>
              <td class="text-secondary small">{{ nv.SoDienThoai || 'N/A' }}</td>
              <td class="text-secondary small">{{ nv.DiaChi || 'N/A' }}</td>
              <td class="text-end pe-4">
                <div class="d-inline-flex gap-2">
                  <button class="btn btn-sm btn-outline-warning rounded-3 px-2.5 py-1" @click="openModalToEdit(nv)" title="Sửa">
                    <i class="fas fa-edit me-1"></i>Sửa
                  </button>
                  <button class="btn btn-sm btn-outline-danger rounded-3 px-2.5 py-1" @click="deleteNhanVien(nv)" title="Xóa">
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

    <!-- Modal Form -->
    <div class="modal fade" id="nhanVienModal" tabindex="-1" ref="nhanVienModalRef" data-bs-backdrop="static">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-header bg-primary text-white py-3 border-0">
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
                  <label class="form-label small fw-bold text-secondary">Email <span class="text-danger">*</span></label>
                  <input type="email" v-model="currentNV.Email" class="form-control rounded-3" placeholder="nhanvien@gmail.com" required />
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
                <div class="col-12">
                  <label class="form-label small fw-bold text-secondary">Địa Chỉ</label>
                  <input type="text" class="form-control rounded-3" v-model="currentNV.DiaChi" placeholder="Nhập địa chỉ cư trú" />
                </div>
              </div>

              <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                <button type="button" class="btn btn-light rounded-pill px-4" @click="closeModal">Hủy</button>
                <button type="submit" class="btn btn-primary rounded-pill px-4 fw-semibold" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                  <i v-else class="fas fa-save me-1"></i> Lưu Nhân Viên
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
      currentNV: { MSNV: "", HoTenNV: "", Email: "", NgaySinh: "", Phai: "Nam", Password: "", ChucVu: "Nhân viên", SoDienThoai: "", DiaChi: "" }
    };
  },
  computed: {
    filteredStaff() {
      if (!this.searchQuery) return this.staffList;
      const q = this.searchQuery.toLowerCase();
      return this.staffList.filter(s => 
        (s.MSNV && s.MSNV.toLowerCase().includes(q)) ||
        (s.HoTenNV && s.HoTenNV.toLowerCase().includes(q)) ||
        (s.ChucVu && s.ChucVu.toLowerCase().includes(q))
      );
    }
  },
  methods: {
    async fetchStaff() {
      try { this.staffList = await NhanVienService.getAll(); } catch (error) { console.error(error); }
    },
    openModalToAdd() {
      this.isEditing = false;
      this.currentNV = { MSNV: "", HoTenNV: "", Email: "", NgaySinh: "", Phai: "Nam", Password: "", ChucVu: "Nhân viên", SoDienThoai: "", DiaChi: "" };
      this.getModal().show();
    },
    openModalToEdit(nv) {
      this.isEditing = true;
      const rawDate = nv.NgaySinh || nv.ngaySinh || "";
      this.currentNV = {
        ...nv,
        MSNV: nv.MSNV || nv.msnv || "",
        HoTenNV: nv.HoTenNV || nv.hoTenNV || nv.hoTen || "",
        Email: nv.Email || nv.email || "",
        NgaySinh: rawDate ? rawDate.split('T')[0] : "",
        Phai: nv.Phai || nv.phai || nv.gioiTinh || "Nam",
        ChucVu: nv.ChucVu || nv.chucVu || "Nhân viên",
        SoDienThoai: nv.SoDienThoai || nv.soDienThoai || nv.dienThoai || "",
        DiaChi: nv.DiaChi || nv.diaChi || "",
        Password: ""
      };
      this.getModal().show();
    },
    closeModal() { this.getModal().hide(); },
    getModal() {
      if (!this.modalInstance) this.modalInstance = new bootstrap.Modal(this.$refs.nhanVienModalRef);
      return this.modalInstance;
    },
    async saveNhanVien() {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(this.currentNV.Email)) {
        alert("Địa chỉ email không đúng định dạng!");
        return;
      }
      this.loading = true;
      try {
        if (this.isEditing) {
          await NhanVienService.update(this.currentNV.MSNV || this.currentNV._id, this.currentNV);
        } else {
          await NhanVienService.create(this.currentNV);
        }
        this.closeModal();
        await this.fetchStaff();
      } catch (error) {
        alert(error.response?.data?.message || "Lỗi khi lưu dữ liệu!");
      } finally { this.loading = false; }
    },
    async deleteNhanVien(nv) {
      const id = nv.MSNV || nv._id;
      if (confirm(`Bạn có chắc muốn xóa nhân viên '${nv.HoTenNV || nv.hoTen}'?`)) {
        try {
          await NhanVienService.delete(id);
          await this.fetchStaff();
        } catch (error) { alert("Lỗi khi xóa!"); }
      }
    }
  },
  mounted() { this.fetchStaff(); }
};
</script>

<style scoped>
.avatar-circle { width: 36px; height: 36px; font-size: 0.9rem; }
.search-box .form-control:focus { box-shadow: none; background-color: #f8f9fa; }
.custom-table { font-size: 0.9rem; }
.custom-table thead th { font-weight: 600; letter-spacing: 0.03em; border-bottom: 1px solid #f1f5f9; }
.custom-table tbody tr:hover { background-color: #f8fafc; }
.fs-xs { font-size: 0.78rem; }
</style>