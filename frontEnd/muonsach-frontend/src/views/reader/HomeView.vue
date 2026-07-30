<template>
  <div class="container py-4">
    <!-- Thanh Tìm Kiếm -->
    <div class="row mb-4 justify-content-center">
      <div class="col-md-6">
        <div class="input-group shadow-sm rounded-3 overflow-hidden">
          <input 
            type="text" 
            v-model="searchQuery" 
            class="form-control border-end-0 py-2.5" 
            placeholder="Nhập tên sách, tác giả..." 
          />
          <button class="btn btn-primary px-4 fw-semibold" type="button">
            <i class="fas fa-search me-1"></i> Tìm kiếm
          </button>
        </div>
      </div>
    </div>

    <!-- Danh Sách Card Sách -->
    <div class="row g-4" v-if="filteredBooks.length > 0">
      <div 
        v-for="sach in filteredBooks" 
        :key="getBookId(sach)" 
        class="col-12 col-md-6 col-lg-4"
      >
        <div class="card h-100 shadow-sm border-0 bg-white rounded-4 overflow-hidden hover-card">
          <div class="card-body p-4 d-flex flex-column justify-content-between">
            <div>
              <h5 class="card-title text-primary fw-bold mb-2 text-truncate" :title="sach.tenSach || sach.TenSach">
                {{ sach.tenSach || sach.TenSach }}
              </h5>
              <p class="card-text mb-2 text-muted small">
                <strong>Tác giả:</strong> {{ sach.tacGia || sach.TacGia || 'Đang cập nhật' }}
              </p>
              <p class="card-text mb-2 text-danger fw-bold">
                Giá: {{ formatCurrency(sach.donGia || sach.DonGia) }}
              </p>
              <p class="card-text mb-0 small">
                Số quyển còn: 
                <span class="badge bg-success bg-opacity-10 text-success fw-bold px-2 py-1 rounded-pill">
                  {{ sach.soQuyen ?? sach.SoQuyen ?? 0 }}
                </span>
              </p>
            </div>

            <!-- Nút Hành Động -->
            <div class="card-footer bg-transparent border-0 d-flex gap-2 pt-3 px-0 pb-0 mt-3">
              <!-- Nút Xem Chi Tiết -->
              <button 
                @click="goToDetail(sach)" 
                class="btn btn-outline-info flex-fill rounded-3 fw-semibold py-2 d-flex align-items-center justify-content-center gap-1"
              >
                <i class="fas fa-info-circle"></i>
                <span>Chi tiết</span>
              </button>

              <!-- Nút Mượn Sách -->
              <button 
                @click="openBorrowModal(sach)" 
                class="btn btn-primary flex-fill rounded-3 fw-semibold py-2 d-flex align-items-center justify-content-center gap-1"
                :disabled="(sach.soQuyen ?? sach.SoQuyen ?? 0) <= 0"
              >
                <i class="fas fa-bookmark"></i>
                <span>Mượn sách</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div class="text-center py-5" v-else>
      <i class="fas fa-book-open fa-3x text-muted mb-3 opacity-50"></i>
      <h5 class="text-secondary fw-semibold">Không tìm thấy cuốn sách nào phù hợp!</h5>
    </div>

    <!-- 1. MODAL POP-UP XÁC NHẬN MƯỢN SÁCH -->
    <div class="modal fade" id="borrowModal" tabindex="-1" aria-hidden="true" ref="borrowModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold text-dark">Xác nhận mượn sách</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body py-3" v-if="selectedBook._id || selectedBook.maSach || selectedBook.MaSach">
            <div class="d-flex align-items-center gap-3 mb-3">
              <img 
                :src="selectedBook.hinhAnh || selectedBook.HinhAnh || 'https://placehold.co/300x450?text=No+Cover'" 
                style="width: 70px; height: 100px; object-fit: cover;" 
                class="rounded shadow-sm"
              />
              <div>
                <h6 class="fw-bold mb-1 text-primary">{{ selectedBook.tenSach || selectedBook.TenSach }}</h6>
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
                class="form-control rounded-3 text-primary fw-semibold"
                :min="minDate"
                required
              />
            </div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Hủy</button>
            <button 
              type="button" 
              class="btn btn-primary rounded-pill px-4 fw-bold" 
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

    <!-- 2. MODAL POP-UP THÔNG BÁO THÀNH CÔNG (XIN ĐẸP THAY CHO ALERT MẶC ĐỊNH) -->
    <div class="modal fade" id="successModal" tabindex="-1" aria-hidden="true" ref="successModal">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content rounded-4 border-0 shadow text-center p-3">
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
        const response = await fetch("http://localhost:3000/api/sach");
        if (!response.ok) throw new Error("Lỗi tải dữ liệu");
        const data = await response.json();
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

    goToDetail(sach) {
      const id = this.getBookId(sach);
      if (!id) return;

      if (this.$router.hasRoute("SachDetail")) {
        this.$router.push({ name: "SachDetail", params: { id } });
      } else {
        this.$router.push(`/sach/${id}`);
      }
    },

    openBorrowModal(sach) {
      this.selectedBook = sach;
      console.log("================ [DEBUG FRONTEND - OPEN BORROW MODAL] ================");
      console.log("[DEBUG FRONTEND] Selected Book Object:", JSON.stringify(sach, null, 2));

      if (!this.borrowModalInstance) {
        this.borrowModalInstance = new Modal(this.$refs.borrowModal);
      }
      this.borrowModalInstance.show();
    },

    async confirmBorrow() {
      const userStr = localStorage.getItem("user") || sessionStorage.getItem("user") || "{}";
      const user = JSON.parse(userStr);

      const targetMaDocGia = user.maDocGia || user.MaDocGia || user.MSNV || user._id;
      const targetMaSach = this.getBookCode(this.selectedBook);

      console.log("================ [DEBUG FRONTEND - SUBMIT HOME BORROW] ================");
      console.log("[DEBUG FRONTEND] User Raw Object:", user);
      console.log("[DEBUG FRONTEND] Extracted maDocGia:", targetMaDocGia);
      console.log("[DEBUG FRONTEND] Extracted maSach:", targetMaSach);
      console.log("[DEBUG FRONTEND] ngayTraDuKien:", this.ngayTraDuKien);

      if (!targetMaDocGia) {
        if (this.borrowModalInstance) this.borrowModalInstance.hide();
        this.$router.push("/login");
        return;
      }

      if (!targetMaSach) {
        return;
      }

      this.loading = true;
      const payload = {
        maDocGia: targetMaDocGia,
        maSach: targetMaSach,
        ngayMuon: new Date().toISOString().split("T")[0],
        ngayTraDuKien: this.ngayTraDuKien
      };

      console.log("[DEBUG FRONTEND] Sending Payload To Backend:", JSON.stringify(payload, null, 2));

      try {
        const response = await fetch("http://localhost:3000/api/muon-sach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const resData = await response.json();
        console.log("[DEBUG FRONTEND] Response from Backend:", response.status, resData);

        if (response.ok) {
          // Ẩn modal xác nhận mượn
          if (this.borrowModalInstance) {
            this.borrowModalInstance.hide();
          }

          // Hiển thị modal thông báo thành công
          if (!this.successModalInstance) {
            this.successModalInstance = new Modal(this.$refs.successModal);
          }
          this.successModalInstance.show();

          // Tải lại danh sách sách để cập nhật số lượng còn
          this.fetchBooks();
        } else {
          console.error("[DEBUG FRONTEND] Borrow failed:", resData.message);
        }
      } catch (error) {
        console.error("[DEBUG FRONTEND] Borrow Request Error:", error);
      } finally {
        this.loading = false;
      }
    },

    // Hàm chuyển hướng sang trang lịch sử mượn từ Pop-up thành công
    redirectToHistory() {
      if (this.successModalInstance) {
        this.successModalInstance.hide();
      }
      this.$router.push("/lich-su-muon");
    }
  }
};
</script>

<style scoped>
.hover-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.hover-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important;
}
</style>