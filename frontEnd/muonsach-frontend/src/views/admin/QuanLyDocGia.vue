<template>
  <div class="container-fluid py-4 px-md-5">
    <!-- Khung Bọc Trong Suốt Tách Biệt Nền Global -->
    <div class="page-wrapper p-4 p-md-5 rounded-4 shadow-lg border">
      
      <!-- Header Section -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 class="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <i class="fas fa-users text-navy"></i>
            <span>Quản Lý Độc Giả</span>
          </h3>
          <p class="text-muted small mb-0">Quản lý danh sách, trạng thái tài khoản và thông tin cá nhân của độc giả.</p>
        </div>
        <button class="btn btn-navy rounded-pill px-4 py-2 shadow-sm fw-bold d-flex align-items-center gap-2" @click="openModalToAdd">
          <i class="fas fa-user-plus"></i>
          <span>Thêm Độc Giả Mới</span>
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
                  placeholder="Tìm kiếm theo mã, họ tên hoặc email..."
                  v-model="searchText"
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
                <th class="ps-4 py-3">Mã Độc Giả</th>
                <th class="py-3">Họ và Tên</th>
                <th class="py-3">Email / Tài Khoản</th>
                <th class="py-3">Số Điện Thoại</th>
                <th class="py-3">Giới Tính</th>
                <th class="py-3">Trạng Thái</th>
                <th class="text-end pe-4 py-3">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredReaders.length === 0">
                <td colspan="7" class="text-center py-5 text-muted">
                  <i class="fas fa-user-slash fa-3x mb-3 text-secondary opacity-50 d-block"></i>
                  Không tìm thấy độc giả nào.
                </td>
              </tr>
              <tr v-for="docgia in filteredReaders" :key="docgia._id || docgia.maDocGia || docgia.MaDocGia">
                <td class="ps-4">
                  <span class="badge bg-navy-subtle text-navy fw-bold px-2.5 py-1.5 rounded-pill border border-navy-subtle">
                    {{ docgia.maDocGia || docgia.MaDocGia }}
                  </span>
                </td>
                <td class="fw-bold text-dark">
                  {{ docgia.hoTen || docgia.HoTen || docgia.tenDocGia || docgia.TenDocGia }}
                </td>
                <td class="text-secondary small">
                  {{ docgia.email || docgia.Email || docgia.tenTaiKhoan || docgia.TenTaiKhoan }}
                </td>
                <td class="text-dark fw-semibold">
                  {{ docgia.dienThoai || docgia.DienThoai || docgia.soDienThoai || '---' }}
                </td>
                <td>
                  <span class="badge bg-light text-dark border px-2 py-1">
                    {{ docgia.gioiTinh || docgia.GioiTinh || 'Nam' }}
                  </span>
                </td>
                <td>
                  <span class="badge bg-success bg-opacity-10 text-success fw-semibold px-2.5 py-1.5 rounded-pill">
                    Hoạt động
                  </span>
                </td>
                <td class="text-end pe-4">
                  <div class="d-inline-flex gap-2">
                    <button class="btn btn-sm btn-outline-warning rounded-3 px-2.5 py-1 fw-bold" @click="openModalToEdit(docgia)">
                      <i class="fas fa-edit me-1"></i>Sửa
                    </button>
                    <button class="btn btn-sm btn-outline-danger rounded-3 px-2.5 py-1 fw-bold" @click="confirmDeleteDocGia(docgia)">
                      <i class="fas fa-trash-alt me-1"></i>Xóa
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card-footer bg-white border-0 py-3 px-4">
          <span class="text-muted fs-xs">Tổng số: {{ filteredReaders.length }} độc giả</span>
        </div>
      </div>

    </div>

    <!-- 1. MODAL FORM THÊM / SỬA ĐỘC GIẢ -->
    <div class="modal fade" id="docGiaModal" tabindex="-1" ref="docGiaModalRef" data-bs-backdrop="static">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden bg-white">
          <div class="modal-header bg-navy text-white py-3 border-0">
            <h5 class="modal-title fw-bold">
              <i :class="isEditing ? 'fas fa-user-edit' : 'fas fa-user-plus'" class="me-2"></i>
              {{ isEditing ? 'Chỉnh Sửa Thông Tin Độc Giả' : 'Thêm Độc Giả Mới' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <div class="modal-body p-4">
            <form @submit.prevent="saveDocGia">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-secondary">Mã Độc Giả <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    class="form-control rounded-3"
                    v-model="currentDocGia.maDocGia"
                    placeholder="VD: DG0005"
                    :disabled="isEditing"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-secondary">Tên Tài Khoản / Username <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    class="form-control rounded-3"
                    v-model="currentDocGia.tenTaiKhoan"
                    placeholder="VD: reader05"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-secondary">Họ và Tên <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    class="form-control rounded-3"
                    v-model="currentDocGia.hoTen"
                    placeholder="Nhập đầy đủ họ tên"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-secondary">Email <span class="text-danger">*</span></label>
                  <input
                    type="email"
                    class="form-control rounded-3"
                    v-model="currentDocGia.email"
                    placeholder="VD: email@example.com"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-secondary">Ngày Sinh</label>
                  <input
                    type="date"
                    class="form-control rounded-3"
                    v-model="currentDocGia.ngaySinh"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-secondary">Giới Tính</label>
                  <select class="form-select rounded-3" v-model="currentDocGia.gioiTinh">
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div class="col-md-6" v-if="!isEditing">
                  <label class="form-label small fw-bold text-secondary">Mật Khẩu <span class="text-danger">*</span></label>
                  <input
                    type="password"
                    class="form-control rounded-3"
                    v-model="currentDocGia.matKhau"
                    placeholder="******"
                    :required="!isEditing"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-secondary">Số Điện Thoại</label>
                  <input
                    type="text"
                    class="form-control rounded-3"
                    v-model="currentDocGia.dienThoai"
                    placeholder="VD: 0912345678"
                  />
                </div>
                <div class="col-md-12">
                  <label class="form-label small fw-bold text-secondary">Địa Chỉ</label>
                  <input
                    type="text"
                    class="form-control rounded-3"
                    v-model="currentDocGia.diaChi"
                    placeholder="Nhập địa chỉ cư trú"
                  />
                </div>
              </div>

              <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                <button type="button" class="btn btn-light rounded-pill px-4 border" @click="closeModal">Hủy</button>
                <button type="submit" class="btn btn-navy rounded-pill px-4 fw-bold shadow-sm" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                  <i v-else class="fas fa-save me-1"></i> Lưu Dữ Liệu
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

    <!-- 3. MODAL XÁC NHẬN XÓA ĐỘC GIẢ -->
    <div class="modal fade" id="deleteConfirmModal" tabindex="-1" aria-hidden="true" ref="deleteModalRef">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content rounded-4 border-0 shadow text-center p-3 bg-white">
          <div class="modal-body">
            <div class="text-warning mb-3">
              <i class="fas fa-exclamation-triangle fa-4x"></i>
            </div>
            <h5 class="fw-bold text-dark mb-2">Xác Nhận Xóa</h5>
            <p class="text-muted small mb-4">Bạn có chắc chắn muốn xóa độc giả <strong>{{ deletingDocGiaName }}</strong>?</p>
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-light rounded-pill flex-fill fw-bold border" data-bs-dismiss="modal">Hủy</button>
              <button type="button" class="btn btn-danger rounded-pill flex-fill fw-bold text-white shadow-sm" @click="executeDeleteDocGia">Xóa</button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import DocGiaService from "@/services/docgia.service";
import * as bootstrap from "bootstrap";

export default {
  name: "QuanLyDocGia",
  data() {
    return {
      docGiaList: [],
      searchText: "",
      isEditing: false,
      loading: false,
      modalInstance: null,
      statusModalInstance: null,
      deleteModalInstance: null,
      statusModalTitle: "",
      statusModalMessage: "",
      statusModalType: "success",
      pendingDeleteDocGia: null,
      deletingDocGiaName: "",
      currentDocGia: {
        maDocGia: "",
        tenTaiKhoan: "",
        hoTen: "",
        email: "",
        ngaySinh: "2005-07-01",
        gioiTinh: "Nam",
        matKhau: "123456",
        dienThoai: "",
        diaChi: ""
      }
    };
  },
  computed: {
    filteredReaders() {
      if (!this.searchText) return this.docGiaList;
      const term = this.searchText.toLowerCase();
      return this.docGiaList.filter((d) => {
        const ma = (d.maDocGia || d.MaDocGia || "").toLowerCase();
        const ten = (d.hoTen || d.HoTen || d.tenDocGia || d.TenDocGia || "").toLowerCase();
        const email = (d.email || d.Email || "").toLowerCase();
        return ma.includes(term) || ten.includes(term) || email.includes(term);
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

    async fetchReaders() {
      try {
        const res = await DocGiaService.getAll();
        this.docGiaList = Array.isArray(res) ? res : (res.data || []);
      } catch (error) {
        // Suppress fetch error
      }
    },

    openModalToAdd() {
      this.isEditing = false;
      this.currentDocGia = {
        maDocGia: "DG" + Math.floor(1000 + Math.random() * 9000),
        tenTaiKhoan: "",
        hoTen: "",
        email: "",
        ngaySinh: "2005-07-01",
        gioiTinh: "Nam",
        matKhau: "123456",
        dienThoai: "",
        diaChi: ""
      };
      this.getModal().show();
    },

    openModalToEdit(docgia) {
      this.isEditing = true;
      this.currentDocGia = {
        _id: docgia._id,
        maDocGia: docgia.maDocGia || docgia.MaDocGia || "",
        tenTaiKhoan: docgia.tenTaiKhoan || docgia.TenTaiKhoan || "",
        hoTen: docgia.hoTen || docgia.HoTen || docgia.tenDocGia || docgia.TenDocGia || "",
        email: docgia.email || docgia.Email || "",
        ngaySinh: docgia.ngaySinh || docgia.NgaySinh || "2005-07-01",
        gioiTinh: docgia.gioiTinh || docgia.GioiTinh || "Nam",
        dienThoai: docgia.dienThoai || docgia.DienThoai || docgia.soDienThoai || "",
        diaChi: docgia.diaChi || docgia.DiaChi || ""
      };
      this.getModal().show();
    },

    closeModal() { this.getModal().hide(); },

    getModal() {
      if (!this.modalInstance) {
        this.modalInstance = new bootstrap.Modal(this.$refs.docGiaModalRef);
      }
      return this.modalInstance;
    },

    async saveDocGia() {
      const maVal = (this.currentDocGia.maDocGia || "").trim();
      const tenVal = (this.currentDocGia.hoTen || "").trim();
      const emailVal = (this.currentDocGia.email || "").trim();

      if (!maVal || !tenVal || !emailVal) {
        this.showPopUp("Lỗi Nhập Liệu", "Mã độc giả, Họ tên và Email không được để trống!", "error");
        return;
      }

      this.loading = true;

      const payload = {
        _id: this.currentDocGia._id,
        maDocGia: maVal,
        MaDocGia: maVal,
        tenTaiKhoan: this.currentDocGia.tenTaiKhoan || maVal,
        TenTaiKhoan: this.currentDocGia.tenTaiKhoan || maVal,
        hoTen: tenVal,
        HoTen: tenVal,
        tenDocGia: tenVal,
        TenDocGia: tenVal,
        email: emailVal,
        Email: emailVal,
        ngaySinh: this.currentDocGia.ngaySinh || "2005-07-01",
        NgaySinh: this.currentDocGia.ngaySinh || "2005-07-01",
        gioiTinh: this.currentDocGia.gioiTinh || "Nam",
        GioiTinh: this.currentDocGia.gioiTinh || "Nam",
        matKhau: this.currentDocGia.matKhau || "123456",
        MatKhau: this.currentDocGia.matKhau || "123456",
        dienThoai: this.currentDocGia.dienThoai || "",
        DienThoai: this.currentDocGia.dienThoai || "",
        diaChi: this.currentDocGia.diaChi || "",
        DiaChi: this.currentDocGia.diaChi || ""
      };

      try {
        if (this.isEditing) {
          const targetId = payload.maDocGia || this.currentDocGia._id;
          await DocGiaService.update(targetId, payload);
          this.showPopUp("Thành Công", "Cập nhật độc giả thành công!", "success");
        } else {
          await DocGiaService.create(payload);
          this.showPopUp("Thành Công", "Thêm độc giả mới thành công!", "success");
        }
        this.closeModal();
        await this.fetchReaders();
      } catch (error) {
        const errMsg = error.response?.data?.message || error.message || "Lỗi khi lưu thông tin độc giả!";
        this.showPopUp("Lỗi Hệ Thống", errMsg, "error");
      } finally {
        this.loading = false;
      }
    },

    confirmDeleteDocGia(docgia) {
      this.pendingDeleteDocGia = docgia;
      this.deletingDocGiaName = docgia.hoTen || docgia.HoTen || docgia.tenDocGia || "";

      if (!this.deleteModalInstance) {
        this.deleteModalInstance = new bootstrap.Modal(this.$refs.deleteModalRef);
      }
      this.deleteModalInstance.show();
    },

    async executeDeleteDocGia() {
      if (this.deleteModalInstance) {
        this.deleteModalInstance.hide();
      }

      if (!this.pendingDeleteDocGia) return;

      const targetId = this.pendingDeleteDocGia.maDocGia || 
                       this.pendingDeleteDocGia.MaDocGia || 
                       this.pendingDeleteDocGia._id;

      try {
        await DocGiaService.delete(targetId);
        this.showPopUp("Thành Công", "Đã xóa độc giả khỏi hệ thống!", "success");
        await this.fetchReaders();
      } catch (error) {
        const errMsg = error.response?.data?.message || "Lỗi khi xóa độc giả!";
        this.showPopUp("Lỗi Xóa", errMsg, "error");
      }
    }
  },
  mounted() { this.fetchReaders(); }
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

.search-box .form-control:focus { box-shadow: none; background-color: #f8f9fa; }
.custom-table { font-size: 0.9rem; }
.custom-table thead th { font-weight: 600; letter-spacing: 0.03em; border-bottom: 1px solid #f1f5f9; }
.custom-table tbody tr:hover { background-color: #f8fafc; }
.fs-xs { font-size: 0.78rem; }
</style>