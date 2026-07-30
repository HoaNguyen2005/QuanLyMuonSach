<template>
  <div class="modal fade" id="phatModal" tabindex="-1" ref="phatModalRef" data-bs-backdrop="static">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
        <div class="modal-header bg-danger text-white py-3 border-0">
          <h5 class="modal-title fw-bold">
            <i class="fas fa-exclamation-triangle me-2"></i>Thanh Toán Tiền Phạt Quá Hạn
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
        </div>

        <div class="modal-body p-4 text-center">
          <div class="text-secondary small mb-1">Mã Phiếu Mượn: <strong>{{ phieuMuonInfo.maPhieu || 'PM001' }}</strong></div>
          <p class="text-muted mb-2">Sách mượn đã quá hạn <strong class="text-danger">{{ soNgayQuaHan }}</strong> ngày</p>
          <h3 class="fw-bold text-danger mb-3">{{ formatCurrency(tongTienPhat) }}</h3>

          <!-- Mã VietQR Tạo Động Tự Tự Động -->
          <div class="qr-container p-3 bg-light rounded-4 d-inline-block border mb-3">
            <img :src="qrCodeUrl" class="img-fluid rounded-3" alt="Mã QR Thanh Toán" style="max-width: 220px;" />
            <p class="fs-xs text-muted mt-2 mb-0">Quét mã bằng App Ngân hàng / MoMo để nộp phạt</p>
          </div>

          <div class="alert alert-warning py-2 px-3 fs-xs rounded-3 text-start mb-0">
            <div><strong>Nội dung CK:</strong> <code>{{ noiDungCK }}</code></div>
            <div><strong>Mức phạt:</strong> 5.000 VNĐ / ngày trễ</div>
          </div>
        </div>

        <div class="modal-footer bg-light border-0 py-3 px-4 d-flex justify-content-between">
          <button type="button" class="btn btn-light rounded-pill px-4" @click="closeModal">Hủy / Đóng</button>
          <button type="button" class="btn btn-success rounded-pill px-4 fw-semibold" @click="confirmPayment">
            <i class="fas fa-check-circle me-1"></i> Xác Nhận Đã Nhận Tiền
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as bootstrap from "bootstrap";

export default {
  name: "ModalPhatTien",
  props: {
    phieuMuonInfo: {
      type: Object,
      default: () => ({
        maDocGia: "",
        maSach: "",
        ngayTraDuKien: new Date()
      })
    }
  },
  data() {
    return {
      modalInstance: null,
      BANK_ID: "MB", // Mã ngân hàng (MB, VCB, TCB,...)
      ACCOUNT_NO: "0123456789" // Số tài khoản ngân hàng thư viện
    };
  },
  computed: {
    // Tính số ngày quá hạn ngay trên Frontend
    soNgayQuaHan() {
      if (!this.phieuMuonInfo.ngayTraDuKien) return 0;
      const ngayDuKien = new Date(this.phieuMuonInfo.ngayTraDuKien);
      const ngayHienTai = new Date();
      
      const diffTime = ngayHienTai - ngayDuKien;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    },

    // Tính tổng tiền phạt (5.000đ / ngày)
    tongTienPhat() {
      return this.soNgayQuaHan * 5000;
    },

    noiDungCK() {
      const maDG = this.phieuMuonInfo.maDocGia || "DG";
      const maS = this.phieuMuonInfo.maSach || "SACH";
      return `NOP PHAT ${maDG} ${maS}`.toUpperCase();
    },

    // Generates QR Code động từ API VietQR công khai (Không cần backend)
    qrCodeUrl() {
      const amount = this.tongTienPhat;
      const addInfo = encodeURIComponent(this.noiDungCK);
      return `https://img.vietqr.io/image/${this.BANK_ID}-${this.ACCOUNT_NO}-compact2.png?amount=${amount}&addInfo=${addInfo}`;
    }
  },
  methods: {
    showModal() {
      if (!this.modalInstance) {
        this.modalInstance = new bootstrap.Modal(this.$refs.phatModalRef);
      }
      this.modalInstance.show();
    },
    closeModal() {
      if (this.modalInstance) this.modalInstance.hide();
    },
    confirmPayment() {
      this.$emit("payment-completed", this.phieuMuonInfo);
      this.closeModal();
    },
    formatCurrency(val) {
      return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val || 0);
    }
  }
};
</script>

<style scoped>
.fs-xs { font-size: 0.78rem; }
</style>