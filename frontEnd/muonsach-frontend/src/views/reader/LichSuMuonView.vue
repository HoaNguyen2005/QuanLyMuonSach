<template>
  <div class="container my-4">
    <!-- Khung Bọc Toàn Trang Để Tách Biệt Nền -->
    <div class="page-wrapper p-4 p-md-5 rounded-4 shadow-lg border">
      
      <!-- Tiêu Đề Nổi Bật -->
      <div class="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
        <h3 class="fw-bold text-navy m-0 d-flex align-items-center gap-2">
          <i class="fas fa-history text-navy"></i> 
          <span>Lịch Sử Đặt Mượn Sách</span>
        </h3>
        <span class="badge bg-navy-subtle text-navy border border-navy-subtle px-3 py-2 rounded-pill fw-bold">
          Tổng số: {{ historyList.length }} lượt mượn
        </span>
      </div>

      <!-- Cảnh Báo Khóa Tài Khoản Nếu Quá 30 Ngày Chưa Nộp Phạt -->
      <div v-if="isAccountLocked" class="alert alert-danger rounded-4 shadow-sm p-4 mb-4 border-2 border-danger">
        <div class="d-flex align-items-center">
          <i class="fas fa-user-lock fa-3x me-3 text-danger"></i>
          <div>
            <h5 class="fw-bold mb-1">Tài Khoản Đang Bị Tạm Khóa!</h5>
            <p class="mb-0 small">
              Bạn có khoản mượn sách trễ hạn quá 30 ngày chưa hoàn tất nộp phạt. Vui lòng thanh toán tiền phạt bên dưới để Thủ thư xác nhận mở khóa.
            </p>
          </div>
        </div>
      </div>

      <!-- State Loading -->
      <div v-if="loading" class="text-center py-5 bg-white rounded-4 shadow-sm">
        <div class="spinner-border text-navy" role="status"></div>
        <p class="mt-2 text-muted fw-medium mb-0">Đang tải lịch sử mượn sách...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!historyList || historyList.length === 0" class="text-center py-5 bg-white rounded-4 shadow-sm border">
        <i class="fas fa-book-open fa-3x text-muted mb-3 opacity-50"></i>
        <h5 class="fw-bold text-dark mb-2">Bạn chưa đăng ký mượn cuốn sách nào!</h5>
        <p class="text-muted small mb-4">Hãy khám phá kho sách của thư viện và chọn cho mình cuốn sách yêu thích nhé.</p>
        <router-link to="/" class="btn btn-navy fw-bold px-4 py-2 rounded-pill shadow-sm">
          <i class="fas fa-search me-1"></i> Khám Phá Sách Ngay
        </router-link>
      </div>

      <!-- Table Danh Sách Mượn -->
      <div v-else class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-navy text-white text-nowrap">
              <tr>
                <th scope="col" class="ps-4 py-3">STT</th>
                <th scope="col" class="py-3">Mã Sách</th>
                <th scope="col" class="py-3">Ngày Mượn</th>
                <th scope="col" class="py-3">Ngày Trả Dự Kiến</th>
                <th scope="col" class="py-3">Ngày Trả Thực Tế</th>
                <th scope="col" class="py-3">Trạng Thái</th>
                <th scope="col" class="text-end pe-4 py-3">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in historyList" :key="item._id || index">
                <td class="ps-4 fw-bold text-secondary">{{ index + 1 }}</td>
                <td>
                  <span class="badge bg-light text-dark border px-2.5 py-1.5 fw-semibold">
                    {{ item.maSach || item.MaSach || 'N/A' }}
                  </span>
                </td>
                <td class="fw-medium text-dark">{{ formatDate(item.ngayMuon || item.NgayMuon) }}</td>
                <td class="fw-medium text-dark">{{ formatDate(item.ngayTraDuKien || item.NgayTraDuKien || item.ngayTra) }}</td>
                
                <!-- CỘT NGÀY TRẢ THỰC TẾ & CẢNH BÁO TRỄ HẠN -->
                <td>
                  <!-- 1. Đã trả sách -->
                  <div v-if="item.ngayTraThucTe || item.NgayTraThucTe">
                    <span class="text-success fw-bold d-block">
                      {{ formatDate(item.ngayTraThucTe || item.NgayTraThucTe) }}
                    </span>
                    <!-- Cảnh báo trễ hạn -->
                    <span 
                      v-if="tinhSoNgayTre(item.ngayTraDuKien || item.NgayTraDuKien || item.ngayTra, item.ngayTraThucTe || item.NgayTraThucTe) > 0" 
                      :class="tinhSoNgayTre(item.ngayTraDuKien || item.NgayTraDuKien || item.ngayTra, item.ngayTraThucTe || item.NgayTraThucTe) > 30 ? 'bg-danger text-white' : 'bg-danger bg-opacity-10 text-danger border border-danger-subtle'"
                      class="badge fs-xs mt-1 fw-bold"
                    >
                      <i class="fas fa-clock me-1"></i>
                      Trả trễ {{ tinhSoNgayTre(item.ngayTraDuKien || item.NgayTraDuKien || item.ngayTra, item.ngayTraThucTe || item.NgayTraThucTe) }} ngày
                    </span>
                  </div>

                  <!-- 2. Chưa trả nhưng đã quá hạn -->
                  <span 
                    v-else-if="checkTreHan(item.ngayTraDuKien || item.NgayTraDuKien || item.ngayTra, item.trangThai || item.TrangThai) > 0" 
                    class="badge bg-danger text-white px-2.5 py-1.5 fw-bold shadow-sm"
                  >
                    <i class="fas fa-exclamation-circle me-1"></i> 
                    Trễ hạn ({{ checkTreHan(item.ngayTraDuKien || item.NgayTraDuKien || item.ngayTra, item.trangThai || item.TrangThai) }} ngày)
                  </span>

                  <!-- 3. Chưa trả & trong hạn -->
                  <span v-else class="badge bg-light text-muted border fw-normal">Chưa trả</span>
                </td>

                <!-- CỘT TRẠNG THÁI -->
                <td>
                  <span :class="getStatusBadgeClass(item.trangThai || item.TrangThai)">
                    {{ getStatusText(item.trangThai || item.TrangThai) }}
                  </span>
                </td>

                <!-- THAO TÁC TRẢ SÁCH / NỘP PHẠT -->
                <td class="text-end pe-4">
                  <!-- 1. CHỜ THỦ THƯ XÁC NHẬN CHUYỂN KHOẢN -->
                  <span v-if="getPhatStatus(item) === 'CHO_XAC_NHAN'" class="badge bg-warning bg-opacity-10 text-warning-emphasis border border-warning-subtle rounded-pill px-3 py-1.5 text-nowrap fw-bold">
                    <i class="fas fa-hourglass-half me-1"></i> Chờ Xác Nhận Tiền
                  </span>

                  <!-- 2. ĐÃ NỘP PHẠT XONG -->
                  <span v-else-if="getPhatStatus(item) === 'DA_THANH_TOAN'" class="badge bg-success bg-opacity-10 text-success border border-success-subtle rounded-pill px-3 py-1.5 text-nowrap fw-bold">
                    <i class="fas fa-check-circle me-1"></i> Đã Nộp Phạt
                  </span>

                  <!-- 3. CẦN NỘP PHẠT -> Hiện nút Nộp Phạt -->
                  <button 
                    v-else-if="isNeedPayment(item)"
                    class="btn btn-sm btn-danger rounded-pill px-3 fw-bold shadow-sm"
                    @click="openModalNopPhat(item, tinhSoNgayTre(item.ngayTraDuKien || item.NgayTraDuKien || item.ngayTra, item.ngayTraThucTe || item.NgayTraThucTe))"
                  >
                    <i class="fas fa-qrcode me-1"></i> Nộp Phạt
                  </button>

                  <!-- 4. Đã duyệt & chưa trả -> Hiện nút Trả Sách -->
                  <button 
                    v-else-if="isCanTraSach(item.trangThai || item.TrangThai, item.ngayTraThucTe || item.NgayTraThucTe) && !isAccountLocked" 
                    class="btn btn-sm btn-outline-navy rounded-pill px-3 fw-bold"
                    @click="handleTraSach(item)"
                  >
                    <i class="fas fa-undo me-1"></i> Trả Sách
                  </button>

                  <!-- 5. Trường hợp khác -->
                  <span v-else class="text-muted fs-xs">---</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- 1. MODAL NỘP PHẠT VIETQR -->
    <div class="modal fade" id="phatModal" tabindex="-1" ref="phatModalRef" data-bs-backdrop="static">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-header bg-danger text-white py-3 border-0">
            <h5 class="modal-title fw-bold">
              <i class="fas fa-exclamation-triangle me-2"></i>Thanh Toán Tiền Phạt Quá Hạn
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closePhatModal" :disabled="submitting"></button>
          </div>

          <div class="modal-body p-4 text-center bg-white">
            <p class="text-muted mb-1">Sách mượn đã quá hạn <strong class="text-danger">{{ selectedTreDays }}</strong> ngày.</p>
            <div class="fs-xs text-secondary mb-2">(Mức phạt: 5.000 VNĐ / ngày)</div>
            <h3 class="fw-bold text-danger mb-3">{{ formatCurrency(selectedTreDays * 5000) }}</h3>

            <!-- Mã VietQR -->
            <div class="qr-container p-3 bg-light rounded-4 d-inline-block border mb-3">
              <img :src="qrCodeUrl" class="img-fluid rounded-3 shadow-sm" alt="Mã VietQR" style="max-width: 220px;" />
              <p class="fs-xs text-muted mt-2 mb-0">Quét mã VietQR bằng ứng dụng Ngân hàng hoặc MoMo</p>
            </div>

            <div class="alert alert-warning py-2 px-3 fs-xs rounded-3 text-start mb-0">
              <div><strong>Nội dung CK:</strong> <code class="text-danger fw-bold fs-6">{{ noiDungCK }}</code></div>
              <div class="mt-1"><strong>Ngân hàng:</strong> {{ BANK_ID }} - {{ ACCOUNT_NO }}</div>
              <div class="mt-1 text-muted fs-xs">* Sau khi chuyển khoản xong, ấn nút xác nhận bên dưới.</div>
            </div>
          </div>

          <div class="modal-footer bg-light border-0 py-3 px-4 d-flex justify-content-between">
            <button type="button" class="btn btn-light rounded-pill px-4" @click="closePhatModal" :disabled="submitting">Hủy</button>
            <button type="button" class="btn btn-success rounded-pill px-4 fw-semibold text-white shadow-sm" @click="xacNhanDaChuyenKhoan" :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="fas fa-check-circle me-1"></i>
              {{ submitting ? 'Đang Gửi...' : 'Tôi Đã Chuyển Khoản' }}
            </button>
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

  </div>
</template>

<script>
import MuonSachService from "@/services/muonSach.service";
import PhieuPhatService from "@/services/phieuPhat.service";
import * as bootstrap from "bootstrap";

export default {
  name: "LichSuMuonView",
  data() {
    return {
      historyList: [],
      phieuPhatList: [],
      loading: true,
      submitting: false,
      selectedItem: null,
      selectedTreDays: 0,
      currentMaDocGia: "",
      phatModalInstance: null,
      statusModalInstance: null,
      statusModalTitle: "",
      statusModalMessage: "",
      statusModalType: "success",
      
      BANK_ID: "VCB",
      ACCOUNT_NO: "1034260179"
    };
  },
  computed: {
    noiDungCK() {
      if (!this.selectedItem) return "NOPPHAT";
      const maDG = (this.currentMaDocGia || "DG").replace(/[^a-zA-Z0-9]/g, "");
      const targetId = (this.selectedItem._id || this.selectedItem.maPhieuMuon || "PM").slice(-6);
      return `NOPPHAT ${maDG} ${targetId}`.toUpperCase();
    },

    qrCodeUrl() {
      const amount = this.selectedTreDays * 5000;
      const addInfo = encodeURIComponent(this.noiDungCK);
      return `https://img.vietqr.io/image/${this.BANK_ID}-${this.ACCOUNT_NO}-compact2.png?amount=${amount}&addInfo=${addInfo}`;
    },

    isAccountLocked() {
      return this.historyList.some(item => {
        const ngayDuKien = item.ngayTraDuKien || item.NgayTraDuKien || item.ngayTra;
        const ngayThucTe = item.ngayTraThucTe || item.NgayTraThucTe;
        
        let days = 0;
        if (ngayThucTe) {
          days = this.tinhSoNgayTre(ngayDuKien, ngayThucTe);
        } else {
          days = this.checkTreHan(ngayDuKien, item.trangThai || item.TrangThai);
        }

        return days > 30 && this.getPhatStatus(item) !== "DA_THANH_TOAN";
      });
    }
  },
  async mounted() {
    await this.fetchData();
  },
  methods: {
    async fetchData() {
      await Promise.all([this.fetchBorrowHistory(), this.fetchPhieuPhat()]);
    },

    async fetchBorrowHistory() {
      const rawUserData = localStorage.getItem("user") || localStorage.getItem("docgia") || localStorage.getItem("userDocGia");
      if (!rawUserData) {
        this.loading = false;
        return;
      }

      const user = JSON.parse(rawUserData);
      const maDocGia = user.maDocGia || user.MaDocGia || user._id;
      this.currentMaDocGia = maDocGia;

      if (!maDocGia) {
        this.loading = false;
        return;
      }

      this.loading = true;
      try {
        const response = await MuonSachService.getLichSuByDocGia(maDocGia);
        this.historyList = Array.isArray(response) ? response : (response.data || []);
      } catch (error) {
        // Suppress API error
      } finally {
        this.loading = false;
      }
    },

    async fetchPhieuPhat() {
      try {
        const res = await PhieuPhatService.getAll();
        this.phieuPhatList = Array.isArray(res) ? res : (res.data || []);
      } catch (error) {
        this.phieuPhatList = [];
      }
    },

    getPhatStatus(item) {
      const targetId = String(item._id || item.maPhieuMuon);
      const found = this.phieuPhatList.find(p => String(p.maPhieuMuon) === targetId);
      return found ? found.trangThai : null;
    },

    isNeedPayment(item) {
      const ngayThucTe = item.ngayTraThucTe || item.NgayTraThucTe;
      const ngayDuKien = item.ngayTraDuKien || item.NgayTraDuKien || item.ngayTra;
      const treDays = this.tinhSoNgayTre(ngayDuKien, ngayThucTe);

      const status = this.getPhatStatus(item);
      return ngayThucTe && treDays > 0 && !status;
    },

    showPopUp(title, message, type = "success") {
      this.statusModalTitle = title;
      this.statusModalMessage = message;
      this.statusModalType = type;

      if (!this.statusModalInstance) {
        this.statusModalInstance = new bootstrap.Modal(this.$refs.statusModalRef);
      }
      this.statusModalInstance.show();
    },

    openModalNopPhat(item, treDays) {
      this.selectedItem = item;
      this.selectedTreDays = treDays;
      if (!this.phatModalInstance) {
        this.phatModalInstance = new bootstrap.Modal(this.$refs.phatModalRef);
      }
      this.phatModalInstance.show();
    },

    tinhSoNgayTre(ngayDuKienStr, ngayTraThucTeStr) {
      if (!ngayDuKienStr || !ngayTraThucTeStr) return 0;
      
      const ngayDuKien = new Date(ngayDuKienStr);
      const ngayTraThucTe = new Date(ngayTraThucTeStr);
      
      ngayDuKien.setHours(0, 0, 0, 0);
      ngayTraThucTe.setHours(0, 0, 0, 0);
      
      const diffTime = ngayTraThucTe - ngayDuKien;
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays > 0 ? diffDays : 0;
    },

    checkTreHan(ngayTraDuKien, trangThai) {
      if (!ngayTraDuKien) return 0;
      const st = String(trangThai || "").toUpperCase();
      if (st.includes("DA_TRA") || st.includes("ĐÃ TRẢ")) return 0;

      const ngayDuKien = new Date(ngayTraDuKien);
      const ngayHienTai = new Date();
      
      ngayDuKien.setHours(0, 0, 0, 0);
      ngayHienTai.setHours(0, 0, 0, 0);

      const diffTime = ngayHienTai - ngayDuKien;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    },

    isCanTraSach(trangThai, ngayTraThucTe) {
      if (ngayTraThucTe) return false;
      const st = String(trangThai || "").toUpperCase();
      return st.includes("DA_DUYET") || st.includes("ĐÃ DUYỆT");
    },

    handleTraSach(item) {
      if (this.isAccountLocked) {
        this.showPopUp("Tài Khoản Bị Khóa", "Bạn có khoản nộp phạt trễ quá 30 ngày chưa thanh toán!", "error");
        return;
      }

      const ngayDuKien = item.ngayTraDuKien || item.NgayTraDuKien || item.ngayTra;
      const treDays = this.checkTreHan(ngayDuKien, item.trangThai || item.TrangThai);

      this.selectedItem = item;

      if (treDays > 0) {
        this.openModalNopPhat(item, treDays);
      } else {
        this.executeTraSach(item);
      }
    },

    closePhatModal() {
      if (this.phatModalInstance) this.phatModalInstance.hide();
    },

    async xacNhanDaChuyenKhoan() {
      this.submitting = true;
      try {
        const targetId = this.selectedItem._id || this.selectedItem.maPhieuMuon;
        
        await PhieuPhatService.create({
          maPhieuMuon: targetId,
          maDocGia: this.currentMaDocGia,
          soNgayTre: this.selectedTreDays,
          soTienPhat: this.selectedTreDays * 5000,
          noiDungChuyenKhoan: this.noiDungCK
        });

        this.closePhatModal();
        this.showPopUp(
          "Đã Gửi Yêu Cầu", 
          "Yêu cầu nộp phạt đã lưu vào hệ thống! Vui lòng chờ Thủ thư kiểm tra và duyệt.", 
          "success"
        );
        await this.fetchData();
      } catch (error) {
        const msg = error.response?.data?.message || "Không thể gửi yêu cầu nộp phạt!";
        this.showPopUp("Lỗi Gửi Yêu Cầu", msg, "error");
      } finally {
        this.submitting = false;
      }
    },

    async executeTraSach(item) {
      const targetId = item._id || item.maPhieuMuon;
      try {
        await MuonSachService.traSach(targetId, {
          ngayTraThucTe: new Date()
        });
        this.showPopUp("Thành Công", "Đã trả sách thành công!", "success");
        await this.fetchData();
      } catch (error) {
        const errMsg = error.response?.data?.message || "Lỗi khi trả sách!";
        this.showPopUp("Lỗi Xử Lý", errMsg, "error");
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return "Chưa xác định";
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("vi-VN");
    },

    formatCurrency(val) {
      return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val || 0);
    },

    getStatusBadgeClass(trangThai) {
      if (!trangThai) return "badge bg-warning text-dark fw-bold px-3 py-1.5 rounded-pill shadow-sm";
      const status = String(trangThai).toUpperCase().trim();
      if (status === "CHO_DUYET" || status === "CHỜ DUYỆT" || status === "WAITING") return "badge bg-warning text-dark fw-bold px-3 py-1.5 rounded-pill shadow-sm";
      if (status === "DA_DUYET" || status === "ĐÃ DUYỆT" || status === "APPROVED") return "badge bg-navy fw-bold px-3 py-1.5 rounded-pill shadow-sm";
      if (status === "DA_TRA" || status === "ĐÃ TRẢ" || status === "RETURNED") return "badge bg-success fw-bold px-3 py-1.5 rounded-pill shadow-sm";
      if (status === "TU_CHOI" || status === "TỪ CHỐI" || status === "REJECTED") return "badge bg-danger fw-bold px-3 py-1.5 rounded-pill shadow-sm";
      return "badge bg-secondary fw-bold px-3 py-1.5 rounded-pill shadow-sm";
    },

    getStatusText(trangThai) {
      if (!trangThai) return "Chờ duyệt";
      const status = String(trangThai).toUpperCase().trim();
      switch (status) {
        case "CHO_DUYET": case "CHỜ DUYỆT": return "Chờ duyệt";
        case "DA_DUYET": case "ĐÃ DUYỆT": return "Đã duyệt";
        case "DA_TRA": case "ĐÃ TRẢ": return "Đã trả";
        case "TU_CHOI": case "TỪ CHỐI": return "Từ chối";
        default: return trangThai;
      }
    }
  }
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

.fs-xs {
  font-size: 0.78rem;
}

.table > :not(caption) > * > * {
  padding-top: 0.9rem;
  padding-bottom: 0.9rem;
}
</style>