<template>
  <div class="container-fluid py-4 px-md-5">
    <div class="page-wrapper p-4 p-md-5 rounded-4 shadow-lg border">
      
      <!-- Header Section -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 class="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <i class="fas fa-building text-navy"></i>
            <span>Quản Lý Nhà Xuất Bản</span>
          </h3>
          <p class="text-muted small mb-0">Quản lý danh sách, địa chỉ và thông tin đối tác xuất bản.</p>
        </div>
        <button class="btn btn-navy rounded-pill px-4 py-2 shadow-sm fw-bold d-flex align-items-center gap-2" @click="openModalToAdd">
          <i class="fas fa-plus-circle"></i>
          <span>Thêm NXB Mới</span>
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
                  placeholder="Tìm kiếm theo mã, tên NXB hoặc địa chỉ..."
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
                <th class="ps-4 py-3">Mã NXB</th>
                <th class="py-3">Tên Nhà Xuất Bản</th>
                <th class="py-3">Địa Chỉ</th>
                <th class="text-end pe-4 py-3">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredNXB.length === 0">
                <td colspan="4" class="text-center py-5 text-muted">
                  <i class="fas fa-building-circle-xmark fa-3x mb-3 text-secondary opacity-50 d-block"></i>
                  Chưa có dữ liệu nhà xuất bản nào!
                </td>
              </tr>
              <tr v-for="nxb in filteredNXB" :key="nxb._id || nxb.maNXB">
                <td class="ps-4">
                  <span class="badge bg-navy-subtle text-navy fw-bold px-2.5 py-1.5 rounded-pill border border-navy-subtle">
                    {{ nxb.maNXB }}
                  </span>
                </td>
                <td class="fw-bold text-dark">{{ nxb.tenNXB }}</td>
                <td class="text-secondary small">{{ nxb.diaChi || 'N/A' }}</td>
                <td class="text-end pe-4">
                  <div class="d-inline-flex gap-2">
                    <button class="btn btn-sm btn-outline-warning rounded-3 px-2.5 py-1 fw-bold" @click="openModalToEdit(nxb)">
                      <i class="fas fa-edit me-1"></i>Sửa
                    </button>
                    <button class="btn btn-sm btn-outline-danger rounded-3 px-2.5 py-1 fw-bold" @click="confirmDeleteNXB(nxb)">
                      <i class="fas fa-trash-alt me-1"></i>Xóa
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card-footer bg-white border-0 py-3 px-4">
          <span class="text-muted fs-xs">Tổng số: {{ filteredNXB.length }} nhà xuất bản</span>
        </div>
      </div>

    </div>

    <!-- 1. MODAL FORM THÊM / SỬA NXB -->
    <div class="modal fade" id="nxbModal" tabindex="-1" ref="nxbModalRef" data-bs-backdrop="static">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden bg-white">
          <div class="modal-header bg-navy text-white py-3 border-0">
            <h5 class="modal-title fw-bold">
              <i :class="isEditing ? 'fas fa-edit' : 'fas fa-plus-circle'" class="me-2"></i>
              {{ isEditing ? 'Chỉnh Sửa Nhà Xuất Bản' : 'Thêm NXB Mới' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <div class="modal-body p-4">
            <form @submit.prevent="saveNXB">
              <div class="mb-3">
                <label class="form-label small fw-bold text-secondary">Mã NXB <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control rounded-3"
                  v-model="currentNXB.maNXB"
                  placeholder="VD: NXB001"
                  :disabled="isEditing"
                  required
                />
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold text-secondary">Tên Nhà Xuất Bản <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control rounded-3"
                  v-model="currentNXB.tenNXB"
                  placeholder="VD: NXB Kim Đồng"
                  required
                />
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold text-secondary">Địa Chỉ</label>
                <input
                  type="text"
                  class="form-control rounded-3"
                  v-model="currentNXB.diaChi"
                  placeholder="Nhập địa chỉ NXB"
                />
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

    <!-- 3. MODAL XÁC NHẬN XÓA NXB -->
    <div class="modal fade" id="deleteConfirmModal" tabindex="-1" aria-hidden="true" ref="deleteModalRef">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content rounded-4 border-0 shadow text-center p-3 bg-white">
          <div class="modal-body">
            <div class="text-warning mb-3">
              <i class="fas fa-exclamation-triangle fa-4x"></i>
            </div>
            <h5 class="fw-bold text-dark mb-2">Xác Nhận Xóa</h5>
            <p class="text-muted small mb-4">Bạn có chắc chắn muốn xóa NXB <strong>{{ deletingNXBName }}</strong>?</p>
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-light rounded-pill flex-fill fw-bold border" data-bs-dismiss="modal">Hủy</button>
              <button type="button" class="btn btn-danger rounded-pill flex-fill fw-bold text-white shadow-sm" @click="executeDeleteNXB">Xóa</button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import NXBService from "@/services/nxb.service";
import * as bootstrap from "bootstrap";

export default {
  name: "QuanLyNXB",
  data() {
    return {
      nxbList: [],
      searchQuery: "",
      isEditing: false,
      loading: false,
      modalInstance: null,
      statusModalInstance: null,
      deleteModalInstance: null,
      statusModalTitle: "",
      statusModalMessage: "",
      statusModalType: "success",
      pendingDeleteNXB: null,
      deletingNXBName: "",
      currentNXB: {
        _id: "",
        maNXB: "",
        tenNXB: "",
        diaChi: ""
      }
    };
  },
  computed: {
    filteredNXB() {
      if (!this.searchQuery.trim()) return this.nxbList;
      const q = this.searchQuery.toLowerCase();
      return this.nxbList.filter(n => 
        (n.maNXB || "").toLowerCase().includes(q) ||
        (n.tenNXB || "").toLowerCase().includes(q) ||
        (n.diaChi || "").toLowerCase().includes(q)
      );
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

    async fetchNXB() {
      console.log("[DEBUG QUANLYNXB] Calling NXBService.getAll()...");
      try {
        const res = await NXBService.getAll();
        console.log("[DEBUG QUANLYNXB] Fetch NXB success response:", res);
        this.nxbList = Array.isArray(res) ? res : (res.data || []);
      } catch (error) {
        console.error("[DEBUG QUANLYNXB ERROR] Fetch NXB error:", error.response?.data || error);
      }
    },

    openModalToAdd() {
      this.isEditing = false;
      this.currentNXB = {
        _id: "",
        maNXB: "NXB" + Math.floor(100 + Math.random() * 900),
        tenNXB: "",
        diaChi: ""
      };
      this.getModal().show();
    },

    openModalToEdit(nxb) {
      this.isEditing = true;
      this.currentNXB = {
        _id: nxb._id || "",
        maNXB: nxb.maNXB || "",
        tenNXB: nxb.tenNXB || "",
        diaChi: nxb.diaChi || ""
      };
      this.getModal().show();
    },

    closeModal() { this.getModal().hide(); },

    getModal() {
      if (!this.modalInstance) {
        this.modalInstance = new bootstrap.Modal(this.$refs.nxbModalRef);
      }
      return this.modalInstance;
    },

    async saveNXB() {
      const maVal = (this.currentNXB.maNXB || "").trim();
      const tenVal = (this.currentNXB.tenNXB || "").trim();
      const diaChiVal = (this.currentNXB.diaChi || "").trim();

      if (!maVal || !tenVal) {
        this.showPopUp("Lỗi Nhập Liệu", "Mã NXB và Tên NXB không được để trống!", "error");
        return;
      }

      this.loading = true;
      console.log(`[DEBUG QUANLYNXB] Saving NXB (isEditing: ${this.isEditing}). Data:`, this.currentNXB);

      try {
        if (this.isEditing) {
          const updatePayload = { tenNXB: tenVal, diaChi: diaChiVal };
          const targetId = this.currentNXB.maNXB || this.currentNXB._id;
          console.log(`[DEBUG QUANLYNXB] Updating NXB ID: ${targetId} | Payload:`, updatePayload);
          const res = await NXBService.update(targetId, updatePayload);
          console.log("[DEBUG QUANLYNXB] Update NXB success response:", res);
          this.showPopUp("Thành Công", "Cập nhật thông tin NXB thành công!", "success");
        } else {
          const createPayload = { maNXB: maVal, tenNXB: tenVal, diaChi: diaChiVal };
          console.log("[DEBUG QUANLYNXB] Creating NXB Payload:", createPayload);
          const res = await NXBService.create(createPayload);
          console.log("[DEBUG QUANLYNXB] Create NXB success response:", res);
          this.showPopUp("Thành Công", "Thêm nhà xuất bản mới thành công!", "success");
        }
        this.closeModal();
        await this.fetchNXB();
      } catch (error) {
        console.error("[DEBUG QUANLYNXB ERROR] Save NXB Error:", error.response?.data || error);
        const errMsg = error.response?.data?.message || error.message || "Lỗi khi lưu NXB!";
        this.showPopUp("Lỗi Hệ Thống", errMsg, "error");
      } finally {
        this.loading = false;
      }
    },

    confirmDeleteNXB(nxb) {
      this.pendingDeleteNXB = nxb;
      this.deletingNXBName = nxb.tenNXB || "";

      if (!this.deleteModalInstance) {
        this.deleteModalInstance = new bootstrap.Modal(this.$refs.deleteModalRef);
      }
      this.deleteModalInstance.show();
    },

    async executeDeleteNXB() {
      if (this.deleteModalInstance) {
        this.deleteModalInstance.hide();
      }

      if (!this.pendingDeleteNXB) return;

      const targetId = this.pendingDeleteNXB.maNXB || this.pendingDeleteNXB._id;
      console.log("[DEBUG QUANLYNXB] Executing delete NXB for ID:", targetId);

      try {
        const res = await NXBService.delete(targetId);
        console.log("[DEBUG QUANLYNXB] Delete NXB success response:", res);
        this.showPopUp("Thành Công", "Đã xóa nhà xuất bản khỏi hệ thống!", "success");
        await this.fetchNXB();
      } catch (error) {
        console.error("[DEBUG QUANLYNXB ERROR] Delete NXB error:", error.response?.data || error);
        const errMsg = error.response?.data?.message || "Lỗi khi xóa nhà xuất bản!";
        this.showPopUp("Lỗi Xóa", errMsg, "error");
      }
    }
  },
  mounted() { this.fetchNXB(); }
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