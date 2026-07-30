<template>
  <div class="container-fluid py-4 px-md-5">
    <!-- Header Section -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
      <div>
        <h3 class="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
          <i class="fas fa-building text-primary"></i>
          <span>Quản Lý Nhà Xuất Bản</span>
        </h3>
        <p class="text-muted small mb-0">Quản lý danh sách, địa chỉ và thông tin đối tác xuất bản.</p>
      </div>
      <button class="btn btn-primary rounded-pill px-4 py-2 shadow-sm fw-semibold d-flex align-items-center gap-2" @click="openModalToAdd">
        <i class="fas fa-plus-circle"></i>
        <span>Thêm NXB Mới</span>
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
          <thead class="table-light text-secondary text-uppercase fs-xs">
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
            <tr v-for="nxb in filteredNXB" :key="nxb._id || nxb.MaNXB || nxb.maNXB">
              <td class="ps-4">
                <span class="badge bg-primary bg-opacity-10 text-primary fw-bold px-2.5 py-1.5 rounded-pill">
                  {{ nxb.MaNXB || nxb.maNXB }}
                </span>
              </td>
              <td class="fw-bold text-dark">{{ nxb.TenNXB || nxb.tenNXB }}</td>
              <td class="text-secondary small">{{ nxb.DiaChi || nxb.diaChi || 'N/A' }}</td>
              <td class="text-end pe-4">
                <div class="d-inline-flex gap-2">
                  <button class="btn btn-sm btn-outline-warning rounded-3 px-2.5 py-1" @click="openModalToEdit(nxb)">
                    <i class="fas fa-edit me-1"></i>Sửa
                  </button>
                  <button class="btn btn-sm btn-outline-danger rounded-3 px-2.5 py-1" @click="deleteNXB(nxb)">
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

    <!-- Modal Form Thêm / Sửa NXB -->
    <div class="modal fade" id="nxbModal" tabindex="-1" ref="nxbModalRef" data-bs-backdrop="static">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-header bg-primary text-white py-3 border-0">
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
                  v-model="currentNXB.MaNXB"
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
                  v-model="currentNXB.TenNXB"
                  placeholder="VD: NXB Trẻ"
                  required
                />
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold text-secondary">Địa Chỉ</label>
                <input
                  type="text"
                  class="form-control rounded-3"
                  v-model="currentNXB.DiaChi"
                  placeholder="Nhập địa chỉ NXB"
                />
              </div>

              <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                <button type="button" class="btn btn-light rounded-pill px-4" @click="closeModal">Hủy</button>
                <button type="submit" class="btn btn-primary rounded-pill px-4 fw-semibold" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                  <i v-else class="fas fa-save me-1"></i> Lưu Thông Tin
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
      currentNXB: { MaNXB: "", TenNXB: "", DiaChi: "" }
    };
  },
  computed: {
    filteredNXB() {
      if (!this.searchQuery.trim()) return this.nxbList;
      const q = this.searchQuery.toLowerCase();
      return this.nxbList.filter(n => 
        (n.MaNXB || n.maNXB || "").toLowerCase().includes(q) ||
        (n.TenNXB || n.tenNXB || "").toLowerCase().includes(q) ||
        (n.DiaChi || n.diaChi || "").toLowerCase().includes(q)
      );
    }
  },
  methods: {
    async fetchNXB() {
      try {
        this.nxbList = await NXBService.getAll();
      } catch (error) {
        console.error("Error loading NXB:", error);
      }
    },
    openModalToAdd() {
      this.isEditing = false;
      this.currentNXB = { MaNXB: "", TenNXB: "", DiaChi: "" };
      this.getModal().show();
    },
    openModalToEdit(nxb) {
      this.isEditing = true;
      this.currentNXB = {
        _id: nxb._id,
        MaNXB: nxb.MaNXB || nxb.maNXB || "",
        TenNXB: nxb.TenNXB || nxb.tenNXB || "",
        DiaChi: nxb.DiaChi || nxb.diaChi || ""
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
      this.loading = true;
      try {
        if (this.isEditing) {
          const targetId = this.currentNXB.MaNXB || this.currentNXB._id;
          await NXBService.update(targetId, this.currentNXB);
        } else {
          await NXBService.create(this.currentNXB);
        }
        this.closeModal();
        await this.fetchNXB();
      } catch (error) {
        alert(error.response?.data?.message || "Lỗi khi lưu NXB!");
      } finally {
        this.loading = false;
      }
    },
    async deleteNXB(nxb) {
      const id = nxb.MaNXB || nxb.maNXB || nxb._id;
      const ten = nxb.TenNXB || nxb.tenNXB || "";
      if (confirm(`Bạn có chắc muốn xóa NXB '${ten}' (${id})?`)) {
        try {
          await NXBService.delete(id);
          await this.fetchNXB();
        } catch (error) {
          alert("Lỗi khi xóa NXB!");
        }
      }
    }
  },
  mounted() { this.fetchNXB(); }
};
</script>

<style scoped>
.search-box .form-control:focus { box-shadow: none; background-color: #f8f9fa; }
.custom-table { font-size: 0.9rem; }
.custom-table thead th { font-weight: 600; letter-spacing: 0.03em; border-bottom: 1px solid #f1f5f9; }
.custom-table tbody tr:hover { background-color: #f8fafc; }
.fs-xs { font-size: 0.78rem; }
</style>