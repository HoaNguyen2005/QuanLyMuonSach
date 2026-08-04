<template>
  <div class="container py-4 d-flex flex-column align-items-center" v-if="sach._id || sach.maSach || sach.MaSach">
    
    <!-- THANH ĐIỀU HƯỚNG TRÊN CÙNG -->
    <div class="book-detail-wrapper mb-3 d-flex justify-content-between align-items-center w-100">
      <button class="btn btn-light border btn-sm rounded-pill px-3 shadow-sm d-flex align-items-center gap-1 fw-semibold text-dark" @click="goBack">
        <i class="fas fa-arrow-left"></i> Quay lại
      </button>

      <div class="d-flex gap-2">
        <button 
          class="btn btn-light btn-sm rounded-pill px-3 border shadow-sm d-flex align-items-center gap-1 fw-semibold text-dark" 
          @click="navigateBook('prev')"
          :disabled="navigating"
        >
          <i class="fas fa-chevron-left"></i> Sách trước
        </button>
        <button 
          class="btn btn-light btn-sm rounded-pill px-3 border shadow-sm d-flex align-items-center gap-1 fw-semibold text-dark" 
          @click="navigateBook('next')"
          :disabled="navigating"
        >
          Sách tiếp <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- MAIN CARD THÔNG TIN SÁCH -->
    <div class="card border border-light-subtle shadow-lg rounded-4 p-4 p-md-5 book-detail-wrapper page-wrapper position-relative">
      <div class="row g-4 align-items-center">
        
        <!-- CỘT 1: BÌA SÁCH BÊN TRÁI -->
        <div class="col-12 col-md-5 d-flex justify-content-center">
          <div class="book-cover-container shadow-sm rounded-3 overflow-hidden d-flex align-items-center justify-content-center">
            <img 
              :src="sach.hinhAnh || sach.HinhAnh || 'https://placehold.co/300x450?text=No+Cover'" 
              :alt="sach.tenSach || sach.TenSach"
              class="book-cover-img"
              @error="handleImageError"
            />
          </div>
        </div>

        <!-- CỘT 2: THÔNG TIN VÀ FORM MƯỢN SÁCH BÊN PHẢI -->
        <div class="col-12 col-md-7">
          
          <!-- Tiêu Đề & Tác Giả -->
          <h2 class="fw-bold text-dark mb-1 fs-3">{{ sach.tenSach || sach.TenSach }}</h2>
          <p class="text-navy fw-semibold mb-3">
            Tác giả: {{ sach.tacGia || sach.TacGia || sach.nguonGoc || sach.NguonGoc || 'Chưa cập nhật' }}
          </p>

          <!-- Badges Thông Tin -->
          <div class="d-flex flex-wrap gap-2 mb-3">
            <span class="badge bg-white text-secondary border fw-normal py-2 px-3 rounded-2 d-flex align-items-center gap-1 fs-xs shadow-sm">
              <i class="fas fa-tag me-1"></i>
              <strong>Mã Sách:</strong> {{ getBookCode(sach) }}
            </span>
            <span class="badge bg-white text-secondary border fw-normal py-2 px-3 rounded-2 d-flex align-items-center gap-1 fs-xs shadow-sm">
              <i class="far fa-calendar-alt me-1"></i>
              <strong>Xuất bản:</strong> {{ sach.namXuatBan || sach.NamXuatBan || 'N/A' }}
            </span>
          </div>

          <!-- Đơn Giá -->
          <div class="text-danger fw-bold fs-4 mb-3">
            {{ formatCurrency(sach.donGia ?? sach.DonGia) }}
          </div>

          <!-- Đoạn Mô Tả Giới Thiệu -->
          <p class="text-secondary small lh-base mb-4 description-text">
            Cuốn sách này thuộc NXB: <strong>{{ getPublisherName(sach) }}</strong>. Đây là một tài liệu vô cùng quý giá mà thư viện đã dày công sưu tầm. Vui lòng bảo quản cẩn thận trong quá trình mượn.
          </p>

          <hr class="my-4 text-muted opacity-25" />

          <!-- Box Trạng Thái Kho -->
          <div class="bg-light rounded-4 p-3 mb-4 d-flex align-items-center justify-content-between border">
            <div class="d-flex align-items-baseline gap-2">
              <span class="fs-3 fw-bold text-navy lh-1">{{ getAvailableQuantity(sach) }}</span>
              <span class="text-muted small">Quyển có sẵn</span>
            </div>
            <div class="text-end">
              <div class="text-muted fs-xs mb-1 d-flex align-items-center justify-content-end gap-1">
                <i class="fas fa-info-circle"></i> Trạng thái kho
              </div>
              <span :class="['badge rounded-pill px-3 py-1.5 fw-semibold shadow-sm', getAvailableQuantity(sach) > 0 ? 'bg-success' : 'bg-danger']">
                {{ getAvailableQuantity(sach) > 0 ? 'Còn Sách' : 'Hết Sách' }}
              </span>
            </div>
          </div>

          <!-- Form Chọn Ngày & Mượn -->
          <form @submit.prevent="openBorrowModal">
            <div class="row align-items-center mb-3 g-2">
              <div class="col-auto">
                <label class="fw-bold text-dark small mb-0">Hẹn trả ngày:</label>
              </div>
              <div class="col-sm-6 col-md-7">
                <input 
                  type="date" 
                  v-model="ngayTraDuKien" 
                  class="form-control form-control-sm rounded-3 text-navy fw-semibold px-3 py-2 border-opacity-50"
                  :min="minDate"
                  required
                />
              </div>
            </div>

            <!-- Nút Yêu Cầu Mượn Ngay -->
            <button 
              type="submit" 
              class="btn btn-navy w-100 py-2.5 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 mt-2"
              :disabled="getAvailableQuantity(sach) <= 0 || loading"
            >
              <i class="fas fa-shopping-basket"></i>
              <span>Yêu Cầu Mượn Ngay</span>
            </button>
          </form>

        </div>

      </div>
    </div>

    <!-- 1. MODAL POP-UP XÁC NHẬN MƯỢN SÁCH (DÙNG BOOTSTRAP INSTANCE) -->
    <div class="modal fade" id="borrowModal" tabindex="-1" aria-hidden="true" ref="borrowModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow-lg bg-white">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold text-navy">
              <i class="fas fa-book-reader me-2"></i>Xác nhận mượn sách
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body py-3">
            <div class="d-flex align-items-center gap-3 mb-3 p-2 bg-light rounded-3 border">
              <img 
                :src="sach.hinhAnh || sach.HinhAnh || 'https://placehold.co/300x450?text=No+Cover'" 
                style="width: 60px; height: 85px; object-fit: contain;" 
                class="rounded border bg-white shadow-sm"
              />
              <div>
                <h6 class="fw-bold mb-1 text-navy">{{ sach.tenSach || sach.TenSach }}</h6>
                <p class="text-muted small mb-1">Mã sách: <strong>{{ getBookCode(sach) }}</strong></p>
                <span class="badge bg-white text-dark border">
                  Còn lại: {{ getAvailableQuantity(sach) }} quyển
                </span>
              </div>
            </div>

            <ul class="list-group list-group-flush small border-top pt-2">
              <li class="list-group-item d-flex justify-content-between align-items-center bg-transparent px-0">
                <span class="text-muted">Ngày mượn:</span>
                <span class="fw-bold">{{ formatDate(minDate) }}</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center bg-transparent px-0">
                <span class="text-muted">Hẹn trả ngày:</span>
                <span class="fw-bold text-danger">{{ formatDate(ngayTraDuKien) }}</span>
              </li>
            </ul>
            <p class="text-muted fs-xs mt-3 mb-0 text-center">
              * Vui lòng trả sách đúng thời hạn để tránh các khoản phí phạt phát sinh.
            </p>
          </div>
          <div class="modal-footer border-0 pt-0 gap-2">
            <button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Hủy</button>
            <button 
              type="button" 
              class="btn btn-navy rounded-pill px-4 fw-bold shadow-sm" 
              @click="confirmBorrow" 
              :disabled="loading"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
              <span>{{ loading ? 'Đang gửi...' : 'Xác nhận mượn' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. MODAL POP-UP THÔNG BÁO TỔNG HỢP (DÙNG BOOTSTRAP INSTANCE) -->
    <div class="modal fade" id="statusModal" tabindex="-1" aria-hidden="true" ref="statusModal">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content rounded-4 border-0 shadow text-center p-3 bg-white">
          <div class="modal-body">
            <div :class="statusModalType === 'success' ? 'text-success' : 'text-danger'" class="mb-3">
              <i :class="statusModalType === 'success' ? 'fas fa-check-circle fa-4x' : 'fas fa-times-circle fa-4x'"></i>
            </div>
            <h5 class="fw-bold text-dark mb-2">{{ statusModalTitle }}</h5>
            <p class="text-muted small mb-4">
              {{ statusModalMessage }}
            </p>
            <button 
              type="button" 
              :class="statusModalType === 'success' ? 'btn-success' : 'btn-danger'" 
              class="btn rounded-pill w-100 fw-bold py-2 shadow-sm text-white" 
              @click="handleStatusClose"
            >
              {{ statusModalType === 'success' ? 'Xem Lịch Sử Mượn' : 'Đóng' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. MODAL CẢNH BÁO QUÁ 7 NGÀY (DÙNG BOOTSTRAP INSTANCE) -->
    <div class="modal fade" id="warningModal" tabindex="-1" aria-hidden="true" ref="warningModal">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content rounded-4 border-0 shadow text-center p-3 bg-white">
          <div class="modal-body">
            <div class="text-warning mb-3">
              <i class="fas fa-exclamation-triangle fa-4x"></i>
            </div>
            <h5 class="fw-bold text-dark mb-2">Quá Thời Gian!</h5>
            <p class="text-muted small mb-4">
              Thời gian mượn không được quá 7 ngày.
            </p>
            <button 
              type="button" 
              class="btn btn-warning rounded-pill w-100 fw-bold py-2 shadow-sm text-white" 
              data-bs-dismiss="modal"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>

  <!-- Loading State -->
  <div class="container py-5 text-center" v-else>
    <div class="page-wrapper p-5 rounded-4 shadow-sm d-inline-block">
      <div class="spinner-border text-navy" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
      <p class="text-muted mt-2 mb-0">Đang tải thông tin sách...</p>
    </div>
  </div>
</template>

<script>
import { Modal } from "bootstrap";
import SachService from "@/services/sach.service";
import MuonSachService from "@/services/muonSach.service";
import AuthService from "@/services/auth.service";

export default {
  name: "SachDetailView",
  data() {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return {
      sach: {},
      allBooks: [],
      loading: false,
      navigating: false,
      borrowModalInstance: null,
      statusModalInstance: null,
      warningModalInstance: null,
      statusModalTitle: "",
      statusModalMessage: "",
      statusModalType: "success",
      minDate: today.toISOString().split('T')[0],
      ngayTraDuKien: nextWeek.toISOString().split('T')[0]
    };
  },
  watch: {
    '$route.params.id': function (newId) {
      if (newId) {
        this.fetchDetail();
      }
    },
    ngayTraDuKien(newVal) {
      if (!newVal) return;
      const borrowDate = new Date(this.minDate);
      const returnDate = new Date(newVal);
      const diffTime = returnDate - borrowDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 7) {
        if (!this.warningModalInstance) {
          this.warningModalInstance = new Modal(this.$refs.warningModal);
        }
        this.warningModalInstance.show();

        const maxReturnDate = new Date(borrowDate);
        maxReturnDate.setDate(maxReturnDate.getDate() + 7);
        this.ngayTraDuKien = maxReturnDate.toISOString().split('T')[0];
      }
    }
  },
  mounted() {
    console.log("[DEBUG SACH_DETAIL] Component mounted for ID:", this.$route.params.id);
    this.fetchDetail();
    this.fetchAllBooks();
  },
  methods: {
    async fetchDetail() {
      const id = this.$route.params.id;
      if (!id) return;

      console.log(`[DEBUG SACH_DETAIL] Fetching book detail for ID: ${id}...`);
      try {
        const data = await SachService.get(id);
        this.sach = data.data || data;
        console.log("[DEBUG SACH_DETAIL] Book detail loaded:", this.sach);
      } catch (error) {
        console.error("[DEBUG SACH_DETAIL ERROR] Fetch Detail Error:", error);
      }
    },

    async fetchAllBooks() {
      try {
        const data = await SachService.getAll();
        this.allBooks = data.data || data;
      } catch (error) {
        console.error("[DEBUG SACH_DETAIL ERROR] Fetch All Books Error:", error);
      }
    },

    goBack() {
      this.$router.push({ name: "reader.home" });
    },

    navigateBook(direction) {
      if (!this.allBooks.length) return;
      
      const currentId = this.$route.params.id;
      const currentIndex = this.allBooks.findIndex(
        b => b._id === currentId || b.maSach === currentId || b.MaSach === currentId
      );

      if (currentIndex === -1) return;

      let targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

      if (targetIndex >= this.allBooks.length) targetIndex = 0;
      if (targetIndex < 0) targetIndex = this.allBooks.length - 1;

      const targetBook = this.allBooks[targetIndex];
      const targetId = targetBook._id || targetBook.maSach || targetBook.MaSach;

      if (targetId) {
        this.$router.push({ name: "reader.sach.detail", params: { id: targetId } });
      }
    },

    // Mở Modal mượn sách chuẩn Bootstrap Instance
    openBorrowModal() {
      const currentQty = this.getAvailableQuantity(this.sach);
      if (currentQty <= 0) return;

      const borrowDate = new Date(this.minDate);
      const returnDate = new Date(this.ngayTraDuKien);
      const diffTime = returnDate - borrowDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 7) {
        if (!this.warningModalInstance) {
          this.warningModalInstance = new Modal(this.$refs.warningModal);
        }
        this.warningModalInstance.show();

        const maxReturnDate = new Date(borrowDate);
        maxReturnDate.setDate(maxReturnDate.getDate() + 7);
        this.ngayTraDuKien = maxReturnDate.toISOString().split('T')[0];
        
        return; // Chặn việc mở modal xác nhận mượn sách
      }

      console.log("[DEBUG SACH_DETAIL] Opening borrow modal via Bootstrap Instance...");
      if (!this.borrowModalInstance) {
        this.borrowModalInstance = new Modal(this.$refs.borrowModal);
      }
      this.borrowModalInstance.show();
    },

    async confirmBorrow() {
      const user = AuthService.getCurrentUser() || {};
      const targetMaDocGia = user.maDocGia || user.MaDocGia || user.MSNV || user._id;
      const targetMaSach = this.getBookCode(this.sach);

      console.log("[DEBUG SACH_DETAIL] Confirming borrow for user:", targetMaDocGia, "and book:", targetMaSach);

      if (!targetMaDocGia) {
        if (this.borrowModalInstance) this.borrowModalInstance.hide();
        this.$router.push({ name: "login" });
        return;
      }

      if (!targetMaSach) return;

      this.loading = true;
      const payload = {
        maDocGia: targetMaDocGia,
        maSach: targetMaSach,
        ngayMuon: new Date().toISOString().split("T")[0],
        ngayTraDuKien: this.ngayTraDuKien
      };

      console.log("[DEBUG SACH_DETAIL] Sending payload to backend:", payload);

      try {
        await MuonSachService.create(payload);

        // Hide borrow modal
        if (this.borrowModalInstance) {
          this.borrowModalInstance.hide();
        }

        // Show success modal via Bootstrap Instance
        this.showPopUp("Gửi Yêu Cầu Thành Công!", "Yêu cầu mượn sách của bạn đã được ghi nhận. Vui lòng chờ thủ thư phê duyệt.", "success");

        this.fetchDetail();
      } catch (error) {
        console.error("[DEBUG SACH_DETAIL ERROR] Borrow Request Failed:", error);
        
        if (this.borrowModalInstance) {
          this.borrowModalInstance.hide();
        }
        
        const errMsg = error.response?.data?.message || "Đã xảy ra lỗi khi yêu cầu mượn sách!";
        this.showPopUp("Lỗi Yêu Cầu", errMsg, "error");
      } finally {
        this.loading = false;
      }
    },

    handleStatusClose() {
      if (this.statusModalInstance) {
        this.statusModalInstance.hide();
      }
      if (this.statusModalType === 'success') {
        this.$router.push({ name: "reader.lichsu" });
      }
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

    getBookCode(sach) {
      if (!sach) return "";
      return sach.maSach || sach.MaSach || sach._id || "";
    },

    getAvailableQuantity(sach) {
      if (!sach) return 0;
      const qty = sach.soQuyen !== undefined ? sach.soQuyen : sach.SoQuyen;
      return qty !== undefined && qty !== null ? Number(qty) : 0;
    },

    getPublisherName(sach) {
      if (!sach) return 'Chưa rõ';
      if (typeof sach.maNXB === 'object' && sach.maNXB !== null) {
        return sach.maNXB.tenNXB || sach.maNXB.TenNXB || sach.maNXB.maNXB || 'Chưa rõ';
      }
      return sach.tenNXB || sach.TenNXB || sach.maNXB || sach.MaNXB || 'Chưa rõ';
    },

    formatCurrency(val) {
      return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val || 0);
    },

    formatDate(dateStr) {
      if (!dateStr) return '';
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    },

    handleImageError(e) {
      e.target.src = "https://placehold.co/300x450?text=No+Cover";
    }
  }
};
</script>

<style scoped>
.text-navy { color: #1a2b4c !important; }
.bg-navy { background-color: #1a2b4c !important; }

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
}

.book-detail-wrapper {
  max-width: 900px;
  width: 100%;
}

.book-cover-container {
  width: 100%;
  max-width: 280px;
  aspect-ratio: 2 / 3;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  transition: transform 0.2s ease;
}

.book-cover-img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain; 
  image-rendering: -webkit-optimize-contrast; 
  filter: drop-shadow(0px 2px 6px rgba(0, 0, 0, 0.15));
}

.book-cover-container:hover {
  transform: scale(1.03);
}

.fs-xs {
  font-size: 0.78rem;
}

.description-text {
  color: #6c757d;
  font-size: 0.9rem;
}
</style>