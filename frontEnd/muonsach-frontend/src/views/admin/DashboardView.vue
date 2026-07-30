<template>
  <div class="container-fluid py-4 px-md-5">
    <!-- Header Section -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
      <div>
        <h3 class="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
          <i class="fas fa-tasks text-primary"></i>
          <span>Bảng Điều Khiển Quản Lý Mượn Trả</span>
        </h3>
        <p class="text-muted small mb-0">Duyệt các yêu cầu mượn sách từ độc giả và ghi nhận trả sách.</p>
      </div>
    </div>

    <!-- Main Card Container -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
      <!-- Nav Tabs Top -->
      <div class="card-header bg-white pt-3 px-4 border-bottom">
        <ul class="nav nav-pills gap-2">
          <li class="nav-item">
            <button 
              class="nav-link rounded-pill px-4 fw-semibold" 
              :class="tab === 'requests' ? 'btn-primary active text-white shadow-sm' : 'text-secondary bg-light'" 
              @click="tab = 'requests'"
            >
              <i class="fas fa-clock me-1.5"></i> Yêu cầu chờ duyệt ({{ pendingRequests.length }})
            </button>
          </li>
          <li class="nav-item">
            <button 
              class="nav-link rounded-pill px-4 fw-semibold" 
              :class="tab === 'borrowed' ? 'btn-primary active text-white shadow-sm' : 'text-secondary bg-light'" 
              @click="tab = 'borrowed'"
            >
              <i class="fas fa-book-reader me-1.5"></i> Sách đang mượn ({{ activeBorrows.length }})
            </button>
          </li>
        </ul>
      </div>

      <!-- Bảng Duyệt Yêu Cầu Mượn -->
      <div class="table-responsive" v-if="tab === 'requests'">
        <table class="table table-hover align-middle mb-0 custom-table">
          <thead class="table-light text-secondary text-uppercase fs-xs">
            <tr>
              <th class="ps-4 py-3">STT</th>
              <th class="py-3">Mã Độc Giả</th>
              <th class="py-3">Mã Sách</th>
              <th class="py-3">Ngày Yêu Cầu</th>
              <th class="py-3">Trạng Thái</th>
              <th class="text-end pe-4 py-3">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="pendingRequests.length === 0">
              <td colspan="6" class="text-center text-muted py-5">
                <i class="fas fa-check-circle fa-3x mb-3 text-secondary opacity-50 d-block"></i>
                Không có yêu cầu nào đang chờ duyệt.
              </td>
            </tr>
            <tr v-for="(item, index) in pendingRequests" :key="item._id || index">
              <td class="ps-4 text-muted fw-bold">{{ index + 1 }}</td>
              <td><span class="badge bg-primary bg-opacity-10 text-primary fw-bold px-2.5 py-1.5 rounded-pill">{{ item.maDocGia || '---' }}</span></td>
              <td><span class="badge bg-secondary bg-opacity-10 text-secondary fw-medium px-2.5 py-1.5 rounded-3">{{ item.maSach || '---' }}</span></td>
              <td class="text-secondary small">{{ formatDate(item.ngayMuon) }}</td>
              <td><span class="badge bg-warning bg-opacity-10 text-warning fw-semibold px-2.5 py-1.5 rounded-pill"><i class="fas fa-hourglass-half fs-xs me-1"></i>Chờ Duyệt</span></td>
              <td class="text-end pe-4">
                <div class="d-inline-flex gap-2">
                  <button class="btn btn-sm btn-outline-success rounded-3 px-2.5 py-1" @click="approveBorrow(item._id)">
                    <i class="fas fa-check me-1"></i>Duyệt
                  </button>
                  <button class="btn btn-sm btn-outline-danger rounded-3 px-2.5 py-1" @click="openRejectConfirmModal(item._id)">
                    <i class="fas fa-times me-1"></i>Từ chối
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Bảng Xác Nhận Trả Sách -->
      <div class="table-responsive" v-if="tab === 'borrowed'">
        <table class="table table-hover align-middle mb-0 custom-table">
          <thead class="table-light text-secondary text-uppercase fs-xs">
            <tr>
              <th class="ps-4 py-3">STT</th>
              <th class="py-3">Mã Độc Giả</th>
              <th class="py-3">Mã Sách</th>
              <th class="py-3">Ngày Mượn</th>
              <th class="py-3">Ngày Trả Dự Kiến</th>
              <th class="py-3">Trạng Thái</th>
              <th class="text-end pe-4 py-3">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="activeBorrows.length === 0">
              <td colspan="7" class="text-center text-muted py-5">
                <i class="fas fa-box-open fa-3x mb-3 text-secondary opacity-50 d-block"></i>
                Không có sách nào đang trong trạng thái mượn.
              </td>
            </tr>
            <tr v-for="(item, index) in activeBorrows" :key="item._id || index">
              <td class="ps-4 text-muted fw-bold">{{ index + 1 }}</td>
              <td><span class="badge bg-primary bg-opacity-10 text-primary fw-bold px-2.5 py-1.5 rounded-pill">{{ item.maDocGia || '---' }}</span></td>
              <td><span class="badge bg-secondary bg-opacity-10 text-secondary fw-medium px-2.5 py-1.5 rounded-3">{{ item.maSach || '---' }}</span></td>
              <td class="text-secondary small">{{ formatDate(item.ngayMuon) }}</td>
              <td class="text-secondary small">{{ formatDate(item.ngayTraDuKien) }}</td>
              
              <!-- TRẠNG THÁI MƯỢN TRẢ -->
              <td>
                <span v-if="isWaitingReturn(item)" class="badge bg-warning bg-opacity-10 text-warning fw-semibold px-2.5 py-1.5 rounded-pill">
                  <i class="fas fa-exclamation-circle fs-xs me-1"></i>Yêu cầu trả sách
                </span>
                <span v-else class="badge bg-info bg-opacity-10 text-info fw-semibold px-2.5 py-1.5 rounded-pill">
                  <i class="fas fa-book-open fs-xs me-1"></i>Đang Mượn
                </span>
              </td>

              <!-- KHÓA NÚT KHI CHƯA YÊU CẦU TRẢ SÁCH -->
              <td class="text-end pe-4">
                <button 
                  class="btn btn-sm rounded-3 px-2.5 py-1" 
                  :class="canReturn(item) ? 'btn-outline-primary' : 'btn-outline-secondary disabled opacity-50'"
                  :disabled="!canReturn(item)"
                  @click="confirmReturn(item._id)"
                  :title="!canReturn(item) ? 'Độc giả chưa mang sách tới trả / chưa gửi yêu cầu trả' : 'Xác nhận thu hồi sách'"
                >
                  <i class="fas fa-undo me-1"></i>
                  <span>{{ canReturn(item) ? 'Xác nhận trả sách' : 'Chưa trả sách' }}</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL THÔNG BÁO TỔNG HỢP -->
    <div class="modal fade" id="statusModal" tabindex="-1" aria-hidden="true" ref="statusModal">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content rounded-4 border-0 shadow text-center p-3">
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

    <!-- MODAL XÁC NHẬN TỪ CHỐI -->
    <div class="modal fade" id="rejectConfirmModal" tabindex="-1" aria-hidden="true" ref="rejectConfirmModal">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content rounded-4 border-0 shadow text-center p-3">
          <div class="modal-body">
            <div class="text-warning mb-3">
              <i class="fas fa-exclamation-triangle fa-4x"></i>
            </div>
            <h5 class="fw-bold text-dark mb-2">Xác Nhận Từ Chối</h5>
            <p class="text-muted small mb-4">Bạn có chắc chắn muốn TỪ CHỐI yêu cầu mượn sách này?</p>
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-light rounded-pill flex-fill fw-bold" data-bs-dismiss="modal">
                Hủy
              </button>
              <button type="button" class="btn btn-danger rounded-pill flex-fill fw-bold text-white" @click="confirmRejectAction">
                Từ Chối
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { Modal } from "bootstrap";
import MuonSachService from "@/services/muonSach.service";

export default {
  name: "AdminDashboard",
  data() {
    return {
      tab: "requests",
      borrows: [],
      statusModalInstance: null,
      rejectConfirmModalInstance: null,
      statusModalTitle: "",
      statusModalMessage: "",
      statusModalType: "success",
      pendingRejectId: null
    };
  },
  computed: {
    pendingRequests() {
      return this.borrows.filter(b => {
        if (!b.trangThai) return true;
        const status = String(b.trangThai).toUpperCase().trim();
        return status === "CHO_DUYET" || status === "CHỜ_DUYỆT" || status === "CHO DUYET" || status === "CHỜ DUYỆT";
      });
    },
    activeBorrows() {
      return this.borrows.filter(b => {
        if (b.ngayTra || b.ngayTraThucTe) return false;
        const status = String(b.trangThai || '').toUpperCase().trim();
        return status === "DA_DUYET" || status === "ĐÃ_DUYỆT" || status === "ĐÃ DUYỆT" || 
               status === "DANG_MUON" || status === "ĐANG_MƯỢN" ||
               status === "YEU_CAU_TRA" || status === "YÊU_CẦU_TRẢ" || status === "YÊU CẦU TRẢ";
      });
    }
  },
  async mounted() {
    await this.loadBorrows();
  },
  methods: {
    // Kiểm tra xem độc giả đã phát lệnh trả sách hay chưa
    isWaitingReturn(item) {
      if (!item || !item.trangThai) return false;
      const status = String(item.trangThai).toUpperCase().trim();
      return status === "YEU_CAU_TRA" || status === "YÊU_CẦU_TRẢ" || status === "YÊU CẦU TRẢ" || item.requestReturn === true;
    },

    // Quyết định nút 'Xác nhận trả sách' có được bấm hay bị khóa (Disabled)
    canReturn(item) {
      // Nếu hệ thống bạn cho phép Admin chủ động nhận trả sách bất kỳ lúc nào, trả về true.
      // Nếu bắt buộc Độc giả phải bấm 'Trả sách' trước (trạng thái YEU_CAU_TRA / requestReturn):
      return this.isWaitingReturn(item);
    },

    showPopUp(title, message, type = "success") {
      this.statusModalTitle = title;
      this.statusModalMessage = message;
      this.statusModalType = type;

      console.log(`[DEBUG FRONTEND - ADMIN] Showing Pop-up: [${type.toUpperCase()}] ${title} - ${message}`);

      if (!this.statusModalInstance) {
        this.statusModalInstance = new Modal(this.$refs.statusModal);
      }
      this.statusModalInstance.show();
    },

    async loadBorrows() {
      console.log("================ [DEBUG FRONTEND - ADMIN LOAD BORROWS] ================");
      try {
        const response = await MuonSachService.getAll();
        console.log("[DEBUG FRONTEND - ADMIN] Raw Borrows Data Loaded:", JSON.stringify(response, null, 2));
        this.borrows = Array.isArray(response) ? response : (response.data || []);
      } catch (error) {
        console.error("[DEBUG FRONTEND - ADMIN] Error loading borrows:", error);
        this.showPopUp("Lỗi Hệ Thống", "Không thể tải danh sách mượn sách!", "error");
      }
    },

    async approveBorrow(id) {
      console.log("================ [DEBUG FRONTEND - ADMIN APPROVE] ================");
      console.log("[DEBUG FRONTEND - ADMIN] Target Borrow ID:", id);
      if (!id) return;

      try {
        if (typeof MuonSachService.updateStatus === "function") {
          await MuonSachService.updateStatus(id, "DA_DUYET");
        } else if (typeof MuonSachService.duyetMuon === "function") {
          await MuonSachService.duyetMuon(id);
        }
        console.log("[DEBUG FRONTEND - ADMIN] Approved successfully for ID:", id);
        this.showPopUp("Thành Công", "Đã duyệt yêu cầu mượn sách thành công!", "success");
        await this.loadBorrows();
      } catch (error) {
        console.error("[DEBUG FRONTEND - ADMIN] Approve Error:", error);
        this.showPopUp("Lỗi Cập Nhật", "Không thể duyệt yêu cầu mượn sách!", "error");
      }
    },

    openRejectConfirmModal(id) {
      this.pendingRejectId = id;
      console.log("[DEBUG FRONTEND - ADMIN] Opening reject confirmation modal for ID:", id);
      if (!this.rejectConfirmModalInstance) {
        this.rejectConfirmModalInstance = new Modal(this.$refs.rejectConfirmModal);
      }
      this.rejectConfirmModalInstance.show();
    },

    async confirmRejectAction() {
      const id = this.pendingRejectId;
      console.log("================ [DEBUG FRONTEND - ADMIN REJECT CONFIRMED] ================");
      console.log("[DEBUG FRONTEND - ADMIN] Rejecting Borrow ID:", id);

      if (this.rejectConfirmModalInstance) {
        this.rejectConfirmModalInstance.hide();
      }

      if (!id) return;

      try {
        if (typeof MuonSachService.updateStatus === "function") {
          await MuonSachService.updateStatus(id, "TU_CHOI");
        } else if (typeof MuonSachService.tuChoiMuon === "function") {
          await MuonSachService.tuChoiMuon(id);
        }
        console.log("[DEBUG FRONTEND - ADMIN] Rejected successfully for ID:", id);
        this.showPopUp("Đã Từ Chối", "Đã từ chối yêu cầu mượn sách!", "success");
        await this.loadBorrows();
      } catch (error) {
        console.error("[DEBUG FRONTEND - ADMIN] Reject Error:", error);
        this.showPopUp("Lỗi Cập Nhật", "Không thể từ chối yêu cầu mượn sách!", "error");
      }
    },

    async confirmReturn(id) {
      console.log("================ [DEBUG FRONTEND - ADMIN CONFIRM RETURN] ================");
      console.log("[DEBUG FRONTEND - ADMIN] Target Return ID:", id);
      if (!id) return;

      try {
        const payload = { 
          ngayTraThucTe: new Date().toISOString().split("T")[0],
          trangThai: "DA_TRA"
        };
        console.log("[DEBUG FRONTEND - ADMIN] Sending Return Payload:", payload);
        await MuonSachService.traSach(id, payload);
        console.log("[DEBUG FRONTEND - ADMIN] Returned successfully for ID:", id);
        this.showPopUp("Thành Công", "Đã xác nhận trả sách thành công!", "success");
        await this.loadBorrows();
      } catch (error) {
        console.error("[DEBUG FRONTEND - ADMIN] Return Error:", error);
        this.showPopUp("Lỗi Cập Nhật", "Không thể xác nhận trả sách!", "error");
      }
    },

    formatDate(d) {
      if (!d) return "---";
      try {
        return new Date(d).toLocaleDateString("vi-VN");
      } catch (e) {
        return d;
      }
    }
  }
};
</script>

<style scoped>
.custom-table { font-size: 0.9rem; }
.custom-table thead th { font-weight: 600; letter-spacing: 0.03em; border-bottom: 1px solid #f1f5f9; }
.custom-table tbody tr:hover { background-color: #f8fafc; }
.fs-xs { font-size: 0.78rem; }
</style>