<template>
  <div class="container py-4">
    <!-- Khung Bọc Trong Suốt Giúp Nổi Bật Nội Dung Trang Chủ -->
    <div class="page-wrapper p-4 p-md-5 rounded-4 shadow-lg border">
      
      <!-- Thanh Tìm Kiếm -->
      <div class="row mb-4 justify-content-center">
        <div class="col-md-7 col-lg-6">
          <div class="input-group shadow-sm rounded-pill overflow-hidden border">
            <input 
              type="text" 
              v-model="searchQuery" 
              class="form-control border-0 py-2.5 px-4 bg-white" 
              placeholder="Nhập tên sách, tác giả..." 
            />
            <button class="btn btn-navy px-4 fw-bold shadow-sm" type="button">
              <i class="fas fa-search me-1"></i> Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      <!-- Danh Sách Card Sách Có Bìa -->
      <div class="row g-4" v-if="filteredBooks.length > 0">
        <div 
          v-for="sach in filteredBooks" 
          :key="getBookId(sach)" 
          class="col-12 col-sm-6 col-md-4 col-lg-3"
        >
          <div class="card h-100 shadow-sm border-0 bg-white rounded-4 overflow-hidden hover-card">
            
            <!-- BÌA SÁCH TRÊN CÙNG CARD -->
            <div class="book-cover-wrapper bg-light d-flex align-items-center justify-content-center p-3 position-relative">
              <img 
                :src="sach.hinhAnh || sach.HinhAnh || 'https://placehold.co/300x450?text=No+Cover'" 
                :alt="sach.tenSach || sach.TenSach"
                class="book-card-img rounded-2"
                @error="handleImageError"
              />
              <!-- Badge trạng thái còn sách -->
              <span 
                :class="['position-absolute top-0 end-0 m-2 badge rounded-pill shadow-sm px-2.5 py-1.5 fw-bold', (sach.soQuyen ?? sach.SoQuyen ?? 0) > 0 ? 'bg-success' : 'bg-danger']"
              >
                {{ (sach.soQuyen ?? sach.SoQuyen ?? 0) > 0 ? `Còn ${sach.soQuyen ?? sach.SoQuyen}` : 'Hết sách' }}
              </span>
            </div>

            <!-- NỘI DUNG THÔNG TIN SÁCH -->
            <div class="card-body p-3 d-flex flex-column justify-content-between">
              <div>
                <h6 class="card-title text-dark fw-bold mb-1 text-truncate-2" :title="sach.tenSach || sach.TenSach">
                  {{ sach.tenSach || sach.TenSach }}
                </h6>
                <p class="card-text mb-2 text-navy small fw-semibold text-truncate">
                  {{ sach.tacGia || sach.TacGia || 'Chưa cập nhật' }}
                </p>
                <div class="text-danger fw-bold fs-6 mb-2">
                  {{ formatCurrency(sach.donGia || sach.DonGia) }}
                </div>
              </div>

              <!-- Nút Hành Động -->
              <div class="d-flex gap-2 pt-2 border-top">
                <!-- Nút Xem Chi Tiết -->
                <button 
                  @click="goToDetail(sach)" 
                  class="btn btn-outline-secondary btn-sm flex-fill rounded-pill fw-semibold py-1.5 d-flex align-items-center justify-content-center gap-1"
                >
                  <i class="fas fa-info-circle"></i>
                  <span>Chi tiết</span>
                </button>

                <!-- Nút Mượn Sách -->
                <button 
                  @click="openBorrowModal(sach)" 
                  class="btn btn-navy btn-sm flex-fill rounded-pill fw-bold py-1.5 d-flex align-items-center justify-content-center gap-1 shadow-sm"
                  :disabled="(sach.soQuyen ?? sach.SoQuyen ?? 0) <= 0"
                >
                  <i class="fas fa-bookmark"></i>
                  <span>Mượn</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="text-center py-5 bg-white rounded-4 shadow-sm border" v-else>
        <i class="fas fa-book-open fa-3x text-muted mb-3 opacity-50"></i>
        <h5 class="text-secondary fw-semibold">Không tìm thấy cuốn sách nào phù hợp!</h5>
      </div>

    </div>

    <!-- 1. MODAL POP-UP XÁC NHẬN MƯỢN SÁCH -->
    <div class="modal fade" id="borrowModal" tabindex="-1" aria-hidden="true" ref="borrowModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow-lg bg-white">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold text-navy">Xác nhận mượn sách</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body py-3" v-if="selectedBook._id || selectedBook.maSach || selectedBook.MaSach">
            <div class="d-flex align-items-center gap-3 mb-3">
              <img 
                :src="selectedBook.hinhAnh || selectedBook.HinhAnh || 'https://placehold.co/300x450?text=No+Cover'" 
                style="width: 70px; height: 100px; object-fit: contain;" 
                class="rounded border bg-light shadow-sm"
              />
              <div>
                <h6 class="fw-bold mb-1 text-navy">{{ selectedBook.tenSach || selectedBook.TenSach }}</h6>
                <p class="text-muted small mb-1">Tác giả: {{ selectedBook.tacGia || selectedBook.TacGia || 'Đang cập nhật' }}</p>
                <span class="badge bg-light text-dark border">
                  Còn lại: {{ selectedBook.soQuyen ?? selectedBook.SoQuyen ?? 0 }} quyển
                </span>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold small text-muted">Hẹn trả ngày:</label>
              <input 
                type="date" 
                v-model="ngayTraDuKien" 
                class="form-control rounded-3 text-navy fw-semibold"
                :min="minDate"
                required
              />
            </div>
          </div>
          <div class="modal-footer border-0 pt-0">
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

    <!-- 2. MODAL POP-UP THÔNG BÁO THÀNH CÔNG -->
    <div class="modal fade" id="successModal" tabindex="-1" aria-hidden="true" ref="successModal">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content rounded-4 border-0 shadow text-center p-3 bg-white">
          <div class="modal-body">
            <div class="text-success mb-3">
              <i class="fas fa-check-circle fa-4x"></i>
            </div>
            <h5 class="fw-bold text-dark mb-2">Gửi Yêu Cầu Thành Công!</h5>
            <p class="text-muted small mb-4">
              Yêu cầu mượn sách của bạn đã được ghi nhận. Vui lòng chờ thủ thư phê duyệt.
            </p>
            <button 
              type="button" 
              class="btn btn-success rounded-pill w-100 fw-bold py-2 shadow-sm" 
              @click="redirectToHistory"
            >
              Xem Lịch Sử Mượn
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { Modal } from "bootstrap";
import SachService from "@/services/sach.service";
import MuonSachService from "@/services/muonSach.service";
import AuthService from "@/services/auth.service";

export default {
  name: "HomeView",
  data() {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return {
      dsSach: [],
      searchQuery: "",
      selectedBook: {},
      loading: false,
      borrowModalInstance: null,
      successModalInstance: null,
      minDate: today.toISOString().split("T")[0],
      ngayTraDuKien: nextWeek.toISOString().split("T")[0]
    };
  },
  computed: {
    filteredBooks() {
      if (!this.searchQuery.trim()) return this.dsSach;
      const q = this.searchQuery.toLowerCase();
      return this.dsSach.filter((sach) => {
        const title = (sach.tenSach || sach.TenSach || "").toLowerCase();
        const author = (sach.tacGia || sach.TacGia || "").toLowerCase();
        return title.includes(q) || author.includes(q);
      });
    },
  },
  mounted() {
    this.fetchBooks();
  },
  methods: {
    async fetchBooks() {
      try {
        const data = await SachService.getAll();
        this.dsSach = Array.isArray(data) ? data : (data.data || []);
      } catch (error) {
        console.error("[DEBUG FRONTEND - HOMEVIEW] Fetch Books Error:", error);
      }
    },

    getBookId(sach) {
      if (!sach) return "";
      return sach._id || sach.maSach || sach.MaSach || sach.id || "";
    },

    getBookCode(sach) {
      if (!sach) return "";
      return sach.maSach || sach.MaSach || sach._id || "";
    },

    formatCurrency(val) {
      return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val || 0);
    },

    handleImageError(e) {
      e.target.src = "https://placehold.co/300x450?text=No+Cover";
    },

    goToDetail(sach) {
      const id = this.getBookId(sach);
      if (!id) return;
      this.$router.push({ name: "reader.sach.detail", params: { id } });
    },

    openBorrowModal(sach) {
      this.selectedBook = sach;
      if (!this.borrowModalInstance) {
        this.borrowModalInstance = new Modal(this.$refs.borrowModal);
      }
      this.borrowModalInstance.show();
    },

    async confirmBorrow() {
      const user = AuthService.getCurrentUser() || {};
      const targetMaDocGia = user.maDocGia || user.MaDocGia || user.MSNV || user._id;
      const targetMaSach = this.getBookCode(this.selectedBook);

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

      try {
        await MuonSachService.create(payload);

        if (this.borrowModalInstance) {
          this.borrowModalInstance.hide();
        }

        if (!this.successModalInstance) {
          this.successModalInstance = new Modal(this.$refs.successModal);
        }
        this.successModalInstance.show();

        this.fetchBooks();
      } catch (error) {
        console.error("[DEBUG FRONTEND] Borrow Request Error:", error);
      } finally {
        this.loading = false;
      }
    },

    redirectToHistory() {
      if (this.successModalInstance) {
        this.successModalInstance.hide();
      }
      this.$router.push({ name: "reader.lichsu" });
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
  border-color: rgba(229, 231, 235, 0.8) !important;
}

.hover-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.12) !important;
}

.book-cover-wrapper {
  height: 200px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #f1f3f5;
}

.book-card-img {
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
  filter: drop-shadow(0px 3px 6px rgba(0, 0, 0, 0.12));
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 2.6em;
  line-height: 1.3em;
}
</style>