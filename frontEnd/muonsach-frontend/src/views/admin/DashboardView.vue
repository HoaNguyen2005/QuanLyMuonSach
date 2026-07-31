<template>
  <div class="container-fluid py-4 px-md-5">
    <!-- Khung Bọc Trong Suốt Tách Biệt Nền Global -->
    <div class="page-wrapper p-4 p-md-5 rounded-4 shadow-lg border">
      
      <!-- Header Section -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 class="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <i class="fas fa-tasks text-navy"></i>
            <span>Bảng Điều Khiển Quản Lý Mượn Trả</span>
          </h3>
          <p class="text-muted small mb-0">Duyệt yêu cầu mượn, xác nhận trả sách và đối soát tiền phạt nộp qua chuyển khoản.</p>
        </div>
      </div>

      <!-- Main Card Container -->
      <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <!-- Nav Tabs Top -->
        <div class="card-header bg-white pt-3 px-4 border-bottom">
          <ul class="nav nav-pills gap-2">
            <li class="nav-item">
              <button 
                class="nav-link rounded-pill px-4 fw-semibold" 
                :class="tab === 'requests' ? 'nav-tab-active shadow-sm' : 'text-secondary bg-light'" 
                @click="tab = 'requests'"
              >
                <i class="fas fa-clock me-1.5"></i> Yêu cầu chờ duyệt ({{ pendingRequests.length }})
              </button>
            </li>
            <li class="nav-item">
              <button 
                class="nav-link rounded-pill px-4 fw-semibold" 
                :class="tab === 'borrowed' ? 'nav-tab-active shadow-sm' : 'text-secondary bg-light'" 
                @click="tab = 'borrowed'"
              >
                <i class="fas fa-book-reader me-1.5"></i> Sách đang mượn ({{ activeBorrows.length }})
              </button>
            </li>
            <li class="nav-item">
              <button 
                class="nav-link rounded-pill px-4 fw-semibold position-relative" 
                :class="tab === 'fines' ? 'nav-tab-active shadow-sm' : 'text-secondary bg-light'" 
                @click="tab = 'fines'"
              >
                <i class="fas fa-receipt me-1.5"></i> Duyệt Nộp Phạt
                <span v-if="pendingFines.length > 0" class="badge bg-warning text-dark rounded-circle ms-1.5">
                  {{ pendingFines.length }}
                </span>
              </button>
            </li>
          </ul>
        </div>

        <!-- 1. Bảng Duyệt Yêu Cầu Mượn -->
        <div class="table-responsive" v-if="tab === 'requests'">
          <table class="table table-hover align-middle mb-0 custom-table">
            <thead class="bg-navy text-white text-uppercase fs-xs">
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
                <td><span class="badge bg-navy-subtle text-navy fw-bold px-2.5 py-1.5 rounded-pill border border-navy-subtle">{{ item.maDocGia || '---' }}</span></td>
                <td><span class="badge bg-secondary bg-opacity-10 text-secondary fw-medium px-2.5 py-1.5 rounded-3">{{ item.maSach || '---' }}</span></td>
                <td class="text-secondary small">{{ formatDate(item.ngayMuon) }}</td>
                <td><span class="badge bg-warning bg-opacity-10 text-warning fw-semibold px-2.5 py-1.5 rounded-pill"><i class="fas fa-hourglass-half fs-xs me-1"></i>Chờ Duyệt</span></td>
                <td class="text-end pe-4">
                  <div class="d-inline-flex gap-2">
                    <button class="btn btn-sm btn-outline-success rounded-3 px-2.5 py-1 fw-bold" @click="approveBorrow(item._id)">
                      <i class="fas fa-check me-1"></i>Duyệt
                    </button>
                    <button class="btn btn-sm btn-outline-danger rounded-3 px-2.5 py-1 fw-bold" @click="openRejectConfirmModal(item._id)">
                      <i class="fas fa-times me-1"></i>Từ chối
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 2. Bảng Xác Nhận Trả Sách -->
        <div class="table-responsive" v-if="tab === 'borrowed'">
          <table class="table table-hover align-middle mb-0 custom-table">
            <thead class="bg-navy text-white text-uppercase fs-xs">
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
                <td><span class="badge bg-navy-subtle text-navy fw-bold px-2.5 py-1.5 rounded-pill border border-navy-subtle">{{ item.maDocGia || '---' }}</span></td>
                <td><span class="badge bg-secondary bg-opacity-10 text-secondary fw-medium px-2.5 py-1.5 rounded-3">{{ item.maSach || '---' }}</span></td>
                <td class="text-secondary small">{{ formatDate(item.ngayMuon) }}</td>
                <td class="text-secondary small">{{ formatDate(item.ngayTraDuKien) }}</td>
                
                <td>
                  <span v-if="isWaitingReturn(item)" class="badge bg-warning bg-opacity-10 text-warning fw-semibold px-2.5 py-1.5 rounded-pill">
                    <i class="fas fa-exclamation-circle fs-xs me-1"></i>Yêu cầu trả sách
                  </span>
                  <span v-else class="badge bg-info bg-opacity-10 text-info fw-semibold px-2.5 py-1.5 rounded-pill">
                    <i class="fas fa-book-open fs-xs me-1"></i>Đang Mượn
                  </span>
                </td>

                <td class="text-end pe-4">
                  <button 
                    class="btn btn-sm rounded-3 px-2.5 py-1 fw-bold" 
                    :class="canReturn(item) ? 'btn-outline-navy' : 'btn-outline-secondary disabled opacity-50'"
                    :disabled="!canReturn(item)"
                    @click="confirmReturn(item._id)"
                  >
                    <i class="fas fa-undo me-1"></i>
                    <span>{{ canReturn(item) ? 'Xác nhận trả sách' : 'Chưa trả sách' }}</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 3. BẢNG DUYỆT NỘP PHẠT -->
        <div class="table-responsive" v-if="tab === 'fines'">
          <table class="table table-hover align-middle mb-0 custom-table">
            <thead class="bg-navy text-white text-uppercase fs-xs">
              <tr>
                <th class="ps-4 py-3">STT</th>
                <th class="py-3">Mã Độc Giả</th>
                <th class="py-3">Mã Phiếu Mượn</th>
                <th class="py-3">Trễ Hạn</th>
                <th class="py-3">Tiền Phạt</th>
                <th class="py-3">Cú Pháp CK Cần Kiểm Tra</th>
                <th class="text-end pe-4 py-3">Thao Tác Đối Soát</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="pendingFines.length === 0">
                <td colspan="7" class="text-center text-muted py-5">
                  <i class="fas fa-hand-holding-usd fa-3x mb-3 text-secondary opacity-50 d-block"></i>
                  Không có khoản nộp phạt nào đang chờ thủ thư xác nhận.
                </td>
              </tr>
              <tr v-for="(item, index) in pendingFines" :key="item._id || index">
                <td class="ps-4 text-muted fw-bold">{{ index + 1 }}</td>
                <td><span class="badge bg-navy-subtle text-navy fw-bold px-2.5 py-1.5 rounded-pill border border-navy-subtle">{{ item.maDocGia }}</span></td>
                <td><span class="badge bg-secondary bg-opacity-10 text-secondary fw-medium px-2.5 py-1.5 rounded-3">{{ (item.maPhieuMuon || '').slice(-6) }}</span></td>
                <td>
                  <span class="badge bg-danger bg-opacity-10 text-danger border border-danger-subtle px-2.5 py-1.5 rounded-pill fw-semibold">
                    <i class="fas fa-clock me-1"></i>{{ item.soNgayTre }} ngày
                  </span>
                </td>
                <td class="fw-bold text-danger fs-6">{{ formatCurrency(item.soTienPhat) }}</td>
                <td>
                  <code class="text-navy fw-bold px-2 py-1 bg-light rounded border">
                    {{ item.noiDungChuyenKhoan }}
                  </code>
                </td>
                <td class="text-end pe-4">
                  <button 
                    class="btn btn-sm btn-success text-white rounded-pill px-3 py-1 fw-bold shadow-sm"
                    @click="approveFinePayment(item._id)"
                  >
                    <i class="fas fa-check-circle me-1"></i> Xác Nhận Đã Nhận Tiền
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>

    <!-- MODAL THÔNG BÁO TỔNG HỢP -->
    <div class="modal fade" id="statusModal" tabindex="-1" aria-hidden="true" ref="statusModal">
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

    <!-- MODAL XÁC NHẬN TỪ CHỐI -->
    <div class="modal fade" id="rejectConfirmModal" tabindex="-1" aria-hidden="true" ref="rejectConfirmModal">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content rounded-4 border-0 shadow text-center p-3 bg-white">
          <div class="modal-body">
            <div class="text-warning mb-3">
              <i class="fas fa-exclamation-triangle fa-4x"></i>
            </div>
            <h5 class="fw-bold text-dark mb-2">Xác Nhận Từ Chối</h5>
            <p class="text-muted small mb-4">Bạn có chắc chắn muốn TỪ CHỐI yêu cầu mượn sách này?</p>
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-light rounded-pill flex-fill fw-bold border" data-bs-dismiss="modal">
                Hủy
              </button>
              <button type="button" class="btn btn-danger rounded-pill flex-fill fw-bold text-white shadow-sm" @click="confirmRejectAction">
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
import PhieuPhatService from "@/services/phieuPhat.service";

export default {
  name: "AdminDashboard",
  data() {
    return {
      tab: "requests",
      borrows: [],
      phieuPhatList: [],
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
    },
    pendingFines() {
      return this.phieuPhatList.filter(item => item.trangThai === "CHO_XAC_NHAN");
    }
  },
  async mounted() {
    console.log("[DEBUG DASHBOARD] Initializing Admin Dashboard component...");
    await this.loadAllData();
  },
  methods: {
    async loadAllData() {
      console.log("[DEBUG DASHBOARD] Executing loadAllData() at:", new Date().toISOString());
      await Promise.all([this.loadBorrows(), this.loadPhieuPhat()]);
    },

    async loadPhieuPhat() {
      console.log("[DEBUG DASHBOARD] Fetching fine receipts via PhieuPhatService.getAll()...");
      try {
        const res = await PhieuPhatService.getAll();
        console.log("[DEBUG DASHBOARD] PhieuPhatService.getAll() Response Data:", res);
        this.phieuPhatList = Array.isArray(res) ? res : (res.data || []);
      } catch (error) {
        console.error("[DEBUG DASHBOARD ERROR] Error in loadPhieuPhat():", error.response?.data || error);
        this.phieuPhatList = [];
      }
    },

    async approveFinePayment(phieuPhatId) {
      console.log("[DEBUG DASHBOARD] Approving fine payment ID:", phieuPhatId);
      try {
        const res = await PhieuPhatService.approve(phieuPhatId);
        console.log("[DEBUG DASHBOARD] PhieuPhatService.approve() Success Response:", res);
        this.showPopUp("Thành Công", "Đã xác nhận tiền phạt thành công!", "success");
        await this.loadPhieuPhat();
      } catch (error) {
        console.error("[DEBUG DASHBOARD ERROR] Failed to approve fine payment:", error.response?.data || error);
        this.showPopUp("Lỗi Duyệt Phạt", "Không thể xác nhận tiền phạt!", "error");
      }
    },

    isWaitingReturn(item) {
      if (!item || !item.trangThai) return false;
      const status = String(item.trangThai).toUpperCase().trim();
      return status === "YEU_CAU_TRA" || status === "YÊU_CẦU_TRẢ" || status === "YÊU CẦU TRẢ" || item.requestReturn === true;
    },

    canReturn(item) {
      return this.isWaitingReturn(item);
    },

    showPopUp(title, message, type = "success") {
      this.statusModalTitle = title;
      this.statusModalMessage = message;
      this.statusModalType = type;

      if (!this.statusModalInstance) {
        this.statusModalInstance = new Modal(this.$refs.statusModal);
      }
      this.statusModalInstance.show();
    },

    async loadBorrows() {
      console.log("[DEBUG DASHBOARD] Fetching all borrow requests via MuonSachService.getAll()...");
      try {
        const response = await MuonSachService.getAll();
        console.log("[DEBUG DASHBOARD] MuonSachService.getAll() Response:", response);
        this.borrows = Array.isArray(response) ? response : (response.data || []);
      } catch (error) {
        console.error("[DEBUG DASHBOARD ERROR] Error loading borrows:", error.response?.data || error);
        this.showPopUp("Lỗi Hệ Thống", "Không thể tải danh sách mượn sách!", "error");
      }
    },

    async approveBorrow(id) {
      console.log("[DEBUG DASHBOARD] Approving borrow request ID:", id);
      if (!id) return;
      try {
        let res;
        if (typeof MuonSachService.updateStatus === "function") {
          res = await MuonSachService.updateStatus(id, "DA_DUYET");
        } else if (typeof MuonSachService.duyetMuon === "function") {
          res = await MuonSachService.duyetMuon(id);
        }
        console.log("[DEBUG DASHBOARD] Approve borrow success response:", res);
        this.showPopUp("Thành Công", "Đã duyệt yêu cầu mượn sách thành công!", "success");
        await this.loadBorrows();
      } catch (error) {
        console.error("[DEBUG DASHBOARD ERROR] Approve borrow failed:", error.response?.data || error);
        this.showPopUp("Lỗi Cập Nhật", "Không thể duyệt yêu cầu mượn sách!", "error");
      }
    },

    openRejectConfirmModal(id) {
      console.log("[DEBUG DASHBOARD] Opening reject confirmation modal for ID:", id);
      this.pendingRejectId = id;
      if (!this.rejectConfirmModalInstance) {
        this.rejectConfirmModalInstance = new Modal(this.$refs.rejectConfirmModal);
      }
      this.rejectConfirmModalInstance.show();
    },

    async confirmRejectAction() {
      const id = this.pendingRejectId;
      console.log("[DEBUG DASHBOARD] Confirming rejection for ID:", id);
      if (this.rejectConfirmModalInstance) {
        this.rejectConfirmModalInstance.hide();
      }
      if (!id) return;

      try {
        let res;
        if (typeof MuonSachService.updateStatus === "function") {
          res = await MuonSachService.updateStatus(id, "TU_CHOI");
        } else if (typeof MuonSachService.tuChoiMuon === "function") {
          res = await MuonSachService.tuChoiMuon(id);
        }
        console.log("[DEBUG DASHBOARD] Reject borrow success response:", res);
        this.showPopUp("Đã Từ Chối", "Đã từ chối yêu cầu mượn sách!", "success");
        await this.loadBorrows();
      } catch (error) {
        console.error("[DEBUG DASHBOARD ERROR] Reject borrow failed:", error.response?.data || error);
        this.showPopUp("Lỗi Cập Nhật", "Không thể từ chối yêu cầu mượn sách!", "error");
      }
    },

    async confirmReturn(id) {
      console.log("[DEBUG DASHBOARD] Confirming book return for ID:", id);
      if (!id) return;
      try {
        const payload = { 
          ngayTraThucTe: new Date().toISOString().split("T")[0],
          trangThai: "DA_TRA"
        };
        console.log("[DEBUG DASHBOARD] TraSach Payload:", payload);
        const res = await MuonSachService.traSach(id, payload);
        console.log("[DEBUG DASHBOARD] TraSach success response:", res);
        this.showPopUp("Thành Công", "Đã xác nhận trả sách thành công!", "success");
        await this.loadBorrows();
      } catch (error) {
        console.error("[DEBUG DASHBOARD ERROR] Confirm return failed:", error.response?.data || error);
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
    },

    formatCurrency(val) {
      return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val || 0);
    }
  }
};
</script>

<style scoped>
.text-navy { color: #1a2b4c !important; }
.bg-navy { background-color: #1a2b4c !important; }
.bg-navy-subtle { background-color: rgba(26, 43, 76, 0.1) !important; }
.border-navy-subtle { border-color: rgba(26, 43, 76, 0.2) !important; }

.nav-pills .nav-link.nav-tab-active,
.nav-pills .show > .nav-link,
.nav-tab-active {
  background-color: #1a2b4c !important;
  color: #ffffff !important;
  border-color: #1a2b4c !important;
}

.btn-outline-navy {
  color: #1a2b4c;
  border-color: #1a2b4c;
  background-color: transparent;
  transition: all 0.3s ease;
}
.btn-outline-navy:hover {
  background-color: #1a2b4c;
  color: #ffffff;
}

.page-wrapper {
  background-color: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(8px);
  border-color: rgba(229, 231, 235, 0.8) !important;
}

.custom-table { font-size: 0.9rem; }
.custom-table thead th { font-weight: 600; letter-spacing: 0.03em; border-bottom: 1px solid #f1f5f9; }
.custom-table tbody tr:hover { background-color: #f8fafc; }
.fs-xs { font-size: 0.78rem; }
</style>