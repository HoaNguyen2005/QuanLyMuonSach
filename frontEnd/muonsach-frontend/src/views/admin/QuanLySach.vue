<template>
  <div class="container-fluid py-4 px-md-5">
    <div class="page-wrapper p-4 p-md-5 rounded-4 shadow-lg border">
      
      <!-- Header Section -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 class="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <i class="fas fa-book text-navy"></i>
            <span>Quản Lý Sách</span>
          </h3>
          <p class="text-muted small mb-0">Quản lý danh mục sách, đơn giá, số lượng còn và mã nhà xuất bản.</p>
        </div>
        <button class="btn btn-navy rounded-pill px-4 py-2 shadow-sm fw-bold d-flex align-items-center gap-2" @click="openModalToAdd">
          <i class="fas fa-plus-circle"></i>
          <span>Thêm Sách Mới</span>
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
                  placeholder="Tìm theo Mã Sách hoặc Tên Sách..."
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
                <th class="ps-4 py-3">Mã Sách</th>
                <th class="py-3">Tên Sách</th>
                <th class="py-3">Đơn Giá</th>
                <th class="py-3">Số Quyển</th>
                <th class="py-3">Năm XB</th>
                <th class="py-3">Mã NXB</th>
                <th class="text-end pe-4 py-3">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredBooks.length === 0">
                <td colspan="7" class="text-center py-5 text-muted">
                  <i class="fas fa-book-open-reader fa-3x mb-3 text-secondary opacity-50 d-block"></i>
                  Không tìm thấy quyển sách nào.
                </td>
              </tr>
              <tr v-for="sach in filteredBooks" :key="sach._id || sach.maSach">
                <td class="ps-4">
                  <span class="badge bg-navy-subtle text-navy fw-bold px-2.5 py-1.5 rounded-pill border border-navy-subtle">
                    {{ sach.maSach }}
                  </span>
                </td>
                <td class="fw-bold text-dark">{{ sach.tenSach }}</td>
                <td class="text-danger fw-semibold">{{ formatCurrency(sach.donGia) }}</td>
                <td>
                  <span class="badge bg-success bg-opacity-10 text-success fw-bold px-2.5 py-1.5 rounded-pill">
                    {{ sach.soQuyen ?? 0 }}
                  </span>
                </td>
                <td class="text-secondary small">{{ sach.namXuatBan }}</td>
                <td>
                  <span class="badge bg-secondary bg-opacity-10 text-secondary fw-medium px-2 py-1 rounded-3">
                    {{ sach.maNXB || '---' }}
                  </span>
                </td>
                <td class="text-end pe-4">
                  <div class="d-inline-flex gap-2">
                    <button class="btn btn-sm btn-outline-warning rounded-3 px-2.5 py-1 fw-bold" @click="openModalToEdit(sach)">
                      <i class="fas fa-edit me-1"></i>Sửa
                    </button>
                    <button class="btn btn-sm btn-outline-danger rounded-3 px-2.5 py-1 fw-bold" @click="confirmDeleteSach(sach)">
                      <i class="fas fa-trash-alt me-1"></i>Xóa
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card-footer bg-white border-0 py-3 px-4">
          <span class="text-muted fs-xs">Tổng số: {{ filteredBooks.length }} cuốn sách</span>
        </div>
      </div>

    </div>

    <!-- 1. MODAL FORM THÊM / SỬA SÁCH -->
    <div class="modal fade" id="sachModal" tabindex="-1" ref="sachModalRef" data-bs-backdrop="static">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden bg-white">
          <div class="modal-header bg-navy text-white py-3 border-0">
            <h5 class="modal-title fw-bold">
              <i :class="isEditing ? 'fas fa-edit' : 'fas fa-plus-circle'" class="me-2"></i>
              {{ isEditing ? 'Chỉnh Sửa Thông Tin Sách' : 'Thêm Sách Mới' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <div class="modal-body p-4">
            <form @submit.prevent="saveSach">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-secondary">Mã Sách <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    class="form-control rounded-3"
                    v-model="currentSach.maSach"
                    placeholder="VD: S001"
                    :disabled="isEditing"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-secondary">Tên Sách <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    class="form-control rounded-3"
                    v-model="currentSach.tenSach"
                    placeholder="Nhập tên sách"
                    required
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-secondary">Đơn Giá (VNĐ)</label>
                  <input
                    type="number"
                    class="form-control rounded-3"
                    v-model.number="currentSach.donGia"
                    placeholder="VD: 55000"
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-secondary">Số Quyển</label>
                  <input
                    type="number"
                    class="form-control rounded-3"
                    v-model.number="currentSach.soQuyen"
                    placeholder="VD: 10"
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-secondary">Năm Xuất Bản</label>
                  <input
                    type="number"
                    class="form-control rounded-3"
                    v-model.number="currentSach.namXuatBan"
                    placeholder="VD: 2026"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-secondary">Mã Nhà Xuất Bản</label>
                  <input
                    type="text"
                    class="form-control rounded-3"
                    v-model="currentSach.maNXB"
                    placeholder="VD: NXB001"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-secondary">Tác Giả</label>
                  <input
                    type="text"
                    class="form-control rounded-3"
                    v-model="currentSach.tacGia"
                    placeholder="VD: Nguyễn Nhật Ánh"
                  />
                </div>
              </div>

              <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                <button type="button" class="btn btn-light rounded-pill px-4 border" @click="closeModal">Hủy</button>
                <button type="submit" class="btn btn-navy rounded-pill px-4 fw-bold shadow-sm" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                  <i v-else class="fas fa-save me-1"></i> Lưu Thông Tin
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

    <!-- 3. MODAL XÁC NHẬN XÓA SÁCH -->
    <div class="modal fade" id="deleteConfirmModal" tabindex="-1" aria-hidden="true" ref="deleteModalRef">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content rounded-4 border-0 shadow text-center p-3 bg-white">
          <div class="modal-body">
            <div class="text-warning mb-3">
              <i class="fas fa-exclamation-triangle fa-4x"></i>
            </div>
            <h5 class="fw-bold text-dark mb-2">Xác Nhận Xóa</h5>
            <p class="text-muted small mb-4">Bạn có chắc chắn muốn xóa cuốn sách <strong>{{ deletingSachName }}</strong>?</p>
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-light rounded-pill flex-fill fw-bold border" data-bs-dismiss="modal">Hủy</button>
              <button type="button" class="btn btn-danger rounded-pill flex-fill fw-bold text-white shadow-sm" @click="executeDeleteSach">Xóa</button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import SachService from "@/services/sach.service";
import * as bootstrap from "bootstrap";

export default {
  name: "QuanLySach",
  data() {
    return {
      sachList: [],
      searchText: "",
      isEditing: false,
      loading: false,
      modalInstance: null,
      statusModalInstance: null,
      deleteModalInstance: null,
      statusModalTitle: "",
      statusModalMessage: "",
      statusModalType: "success",
      pendingDeleteSach: null,
      deletingSachName: "",
      currentSach: {
        _id: "",
        maSach: "",
        tenSach: "",
        donGia: 0,
        soQuyen: 1,
        namXuatBan: new Date().getFullYear(),
        maNXB: "",
        tacGia: ""
      }
    };
  },
  computed: {
    filteredBooks() {
      if (!this.searchText) return this.sachList;
      const term = this.searchText.toLowerCase();
      return this.sachList.filter((s) => {
        const ma = (s.maSach || "").toLowerCase();
        const ten = (s.tenSach || "").toLowerCase();
        return ma.includes(term) || ten.includes(term);
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

    async fetchBooks() {
      console.log("[DEBUG QUANLYSACH] Fetching books via SachService.getAll()...");
      try {
        const res = await SachService.getAll();
        console.log("[DEBUG QUANLYSACH] Fetch books success response:", res);
        this.sachList = Array.isArray(res) ? res : (res.data || []);
      } catch (error) {
        console.error("[DEBUG QUANLYSACH ERROR] Fetch books error:", error.response?.data || error);
      }
    },

    openModalToAdd() {
      this.isEditing = false;
      this.currentSach = {
        _id: "",
        maSach: "S" + Math.floor(100 + Math.random() * 900),
        tenSach: "",
        donGia: 0,
        soQuyen: 1,
        namXuatBan: new Date().getFullYear(),
        maNXB: "",
        tacGia: ""
      };
      this.getModal().show();
    },

    openModalToEdit(sach) {
      this.isEditing = true;
      this.currentSach = {
        _id: sach._id || "",
        maSach: sach.maSach || "",
        tenSach: sach.tenSach || "",
        donGia: sach.donGia ?? 0,
        soQuyen: sach.soQuyen ?? 1,
        namXuatBan: sach.namXuatBan || new Date().getFullYear(),
        maNXB: sach.maNXB || "",
        tacGia: sach.tacGia || ""
      };
      this.getModal().show();
    },

    closeModal() { this.getModal().hide(); },

    getModal() {
      if (!this.modalInstance) {
        this.modalInstance = new bootstrap.Modal(this.$refs.sachModalRef);
      }
      return this.modalInstance;
    },

    async saveSach() {
      const tenVal = (this.currentSach.tenSach || "").trim();

      if (!tenVal) {
        this.showPopUp("Lỗi Nhập Liệu", "Tên sách không được để trống!", "error");
        return;
      }

      this.loading = true;
      console.log(`[DEBUG QUANLYSACH] Saving book (isEditing: ${this.isEditing}). Form Data:`, this.currentSach);

      try {
        if (this.isEditing) {
          const updatePayload = {
            tenSach: tenVal,
            donGia: Number(this.currentSach.donGia || 0),
            soQuyen: Number(this.currentSach.soQuyen || 0),
            namXuatBan: Number(this.currentSach.namXuatBan || 2026),
            maNXB: this.currentSach.maNXB || "",
            tacGia: this.currentSach.tacGia || ""
          };
          const targetId = this.currentSach.maSach || this.currentSach._id;
          console.log(`[DEBUG QUANLYSACH] Updating book ID: ${targetId} | Payload:`, updatePayload);
          const res = await SachService.update(targetId, updatePayload);
          console.log("[DEBUG QUANLYSACH] Update book success response:", res);
          this.showPopUp("Thành Công", "Cập nhật thông tin sách thành công!", "success");
        } else {
          const createPayload = {
            maSach: (this.currentSach.maSach || "").trim(),
            tenSach: tenVal,
            donGia: Number(this.currentSach.donGia || 0),
            soQuyen: Number(this.currentSach.soQuyen || 0),
            namXuatBan: Number(this.currentSach.namXuatBan || 2026),
            maNXB: this.currentSach.maNXB || "",
            tacGia: this.currentSach.tacGia || ""
          };
          console.log("[DEBUG QUANLYSACH] Creating book Payload:", createPayload);
          const res = await SachService.create(createPayload);
          console.log("[DEBUG QUANLYSACH] Create book success response:", res);
          this.showPopUp("Thành Công", "Thêm sách mới thành công!", "success");
        }
        this.closeModal();
        await this.fetchBooks();
      } catch (error) {
        console.error("[DEBUG QUANLYSACH ERROR] Save book error:", error.response?.data || error);
        const errMsg = error.response?.data?.message || error.message || "Lỗi khi lưu thông tin sách!";
        this.showPopUp("Lỗi Hệ Thống", errMsg, "error");
      } finally {
        this.loading = false;
      }
    },

    confirmDeleteSach(sach) {
      this.pendingDeleteSach = sach;
      this.deletingSachName = sach.tenSach || "";

      if (!this.deleteModalInstance) {
        this.deleteModalInstance = new bootstrap.Modal(this.$refs.deleteModalRef);
      }
      this.deleteModalInstance.show();
    },

    async executeDeleteSach() {
      if (this.deleteModalInstance) {
        this.deleteModalInstance.hide();
      }

      if (!this.pendingDeleteSach) return;

      const targetId = this.pendingDeleteSach.maSach || this.pendingDeleteSach._id;
      console.log("[DEBUG QUANLYSACH] Executing delete book ID:", targetId);

      try {
        const res = await SachService.delete(targetId);
        console.log("[DEBUG QUANLYSACH] Delete book success response:", res);
        this.showPopUp("Thành Công", "Đã xóa sách khỏi hệ thống!", "success");
        await this.fetchBooks();
      } catch (error) {
        console.error("[DEBUG QUANLYSACH ERROR] Delete book error:", error.response?.data || error);
        const errMsg = error.response?.data?.message || "Lỗi khi xóa sách!";
        this.showPopUp("Lỗi Xóa", errMsg, "error");
      }
    },

    formatCurrency(val) {
      if (!val) return "0 VNĐ";
      return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
    }
  },
  mounted() { this.fetchBooks(); }
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