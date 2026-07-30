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

    <!-- MAIN CARD THÔNG TIN SÁCH (KÍNH MỜ TRONG SUỐT) -->
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

    <!-- POP-UP / MODAL XÁC NHẬN MƯỢN SÁCH -->
    <div class="modal fade show d-block backdrop-blur" tabindex="-1" v-if="showModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow-lg bg-white">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold text-navy">
              <i class="fas fa-book-reader me-2"></i>Xác Nhận Mượn Sách
            </h5>
            <button type="button" class="btn-close" @click="showModal = false"></button>
          </div>
          <div class="modal-body py-3">
            <div class="alert alert-light border rounded-3 p-3 mb-3">
              <p class="mb-1 fw-bold text-dark">{{ sach.tenSach || sach.TenSach }}</p>
              <p class="mb-0 text-muted small">Mã sách: <strong>{{ getBookCode(sach) }}</strong></p>
            </div>
            
            <ul class="list-group list-group-flush small">
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
            <button type="button" class="btn btn-light rounded-pill px-4 fw-semibold border" @click="showModal = false">
              Hủy
            </button>
            <button type="button" class="btn btn-navy rounded-pill px-4 fw-bold shadow-sm" @click="confirmBorrow" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
              {{ loading ? 'Đang gửi...' : 'Xác Nhận Mượn' }}
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
      showModal: false,
      minDate: today.toISOString().split('T')[0],
      ngayTraDuKien: nextWeek.toISOString().split('T')[0]
    };
  },
  watch: {
    '$route.params.id': function (newId) {
      if (newId) {
        this.fetchDetail();
      }
    }
  },
  mounted() {
    this.fetchDetail();
    this.fetchAllBooks();
  },
  methods: {
    async fetchDetail() {
      const id = this.$route.params.id;
      if (!id) return;

      try {
        const response = await fetch(`http://localhost:3000/api/sach/${id}`);
        if (!response.ok) throw new Error("Không thể tải thông tin sách");
        const data = await response.json();
        this.sach = data.data || data;
      } catch (error) {
        console.error("[DEBUG FRONTEND ERROR] Fetch Detail Error:", error);
      }
    },

    async fetchAllBooks() {
      try {
        const response = await fetch("http://localhost:3000/api/sach");
        if (response.ok) {
          const data = await response.json();
          this.allBooks = data.data || data;
        }
      } catch (error) {
        console.error("[DEBUG FRONTEND ERROR] Fetch All Books Error:", error);
      }
    },

    goBack() {
      this.$router.push("/");
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
        this.$router.push(`/sach/${targetId}`);
      }
    },

    openBorrowModal() {
      const currentQty = this.getAvailableQuantity(this.sach);
      if (currentQty <= 0) {
        alert("Sách này hiện tại đã hết!");
        return;
      }
      this.showModal = true;
    },

    async confirmBorrow() {
      this.loading = true;

      const userStr = localStorage.getItem("user") || sessionStorage.getItem("user") || "{}";
      const user = JSON.parse(userStr);

      const targetMaDocGia = user.maDocGia || user.MaDocGia || user.MSNV || user._id;
      const targetMaSach = this.getBookCode(this.sach);

      if (!targetMaDocGia) {
        alert("Không tìm thấy thông tin tài khoản! Vui lòng đăng nhập lại.");
        this.loading = false;
        this.showModal = false;
        this.$router.push("/login");
        return;
      }

      const payload = {
        maDocGia: targetMaDocGia,
        maSach: targetMaSach,
        ngayMuon: new Date().toISOString().split("T")[0],
        ngayTraDuKien: this.ngayTraDuKien
      };

      try {
        const response = await fetch("http://localhost:3000/api/muon-sach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const resData = await response.json();

        if (response.ok) {
          this.showModal = false;
          alert("Gửi yêu cầu mượn sách thành công! Vui lòng chờ thủ thư phê duyệt.");
          this.$router.push("/lich-su-muon");
        } else {
          alert(resData.message || "Gửi yêu cầu mượn sách thất bại!");
        }
      } catch (error) {
        console.error("[DEBUG FRONTEND ERROR] Submit borrow error:", error);
        alert("Lỗi kết nối máy chủ khi mượn sách!");
      } finally {
        this.loading = false;
      }
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

.backdrop-blur {
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}
</style>