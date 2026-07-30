<template>
  <div class="container py-5 d-flex justify-content-center" v-if="sach._id || sach.maSach || sach.MaSach">
    <div class="card border-0 shadow-sm rounded-4 p-4 p-md-5 book-detail-wrapper bg-white">
      <div class="row g-4 align-items-center">
        
        <!-- CỘT 1: BÌA SÁCH BÊN TRÁI -->
        <div class="col-12 col-md-5 d-flex justify-content-center justify-content-md-start">
          <div class="book-cover-container shadow-sm rounded-3 overflow-hidden">
            <img 
              :src="sach.hinhAnh || sach.HinhAnh || 'https://placehold.co/300x450?text=No+Cover'" 
              :alt="sach.tenSach || sach.TenSach"
              class="img-fluid book-cover-img"
              @error="handleImageError"
            />
          </div>
        </div>

        <!-- CỘT 2: THÔNG TIN VÀ FORM MƯỢN SÁCH BÊN PHẢI -->
        <div class="col-12 col-md-7">
          
          <!-- Tiêu Đề & Tác Giả -->
          <h2 class="fw-bold text-dark mb-1 fs-3">{{ sach.tenSach || sach.TenSach }}</h2>
          <p class="text-primary fw-semibold mb-3">
            Tác giả: {{ sach.tacGia || sach.TacGia || sach.nguonGoc || sach.NguonGoc || 'Chưa cập nhật' }}
          </p>

          <!-- Badges Thông Tin (Mã sách & Năm xuất bản) -->
          <div class="d-flex flex-wrap gap-2 mb-3">
            <span class="badge bg-light text-secondary border fw-normal py-2 px-3 rounded-2 d-flex align-items-center gap-1 fs-xs">
              <i class="fas fa-tag me-1"></i>
              <strong>Mã Sách:</strong> {{ getBookCode(sach) }}
            </span>
            <span class="badge bg-light text-secondary border fw-normal py-2 px-3 rounded-2 d-flex align-items-center gap-1 fs-xs">
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

          <!-- Box Trạng Thái Kho (Màu xám bo tròn) -->
          <div class="bg-light-gray rounded-4 p-3 mb-4 d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-baseline gap-2">
              <span class="fs-3 fw-bold text-primary lh-1">{{ getAvailableQuantity(sach) }}</span>
              <span class="text-muted small">Quyển có sẵn</span>
            </div>
            <div class="text-end">
              <div class="text-muted fs-xs mb-1 d-flex align-items-center justify-content-end gap-1">
                <i class="fas fa-info-circle"></i> Trạng thái kho
              </div>
              <span :class="['badge rounded-pill px-3 py-1.5 fw-semibold', getAvailableQuantity(sach) > 0 ? 'bg-success' : 'bg-danger']">
                {{ getAvailableQuantity(sach) > 0 ? 'Còn Sách' : 'Hết Sách' }}
              </span>
            </div>
          </div>

          <!-- Form Đặt Lịch Hẹn Trả & Nút Mượn -->
          <form @submit.prevent="submitBorrow">
            <div class="row align-items-center mb-3 g-2">
              <div class="col-auto">
                <label class="fw-bold text-dark small mb-0">Hẹn trả ngày:</label>
              </div>
              <div class="col-sm-6 col-md-7">
                <input 
                  type="date" 
                  v-model="ngayTraDuKien" 
                  class="form-control form-control-sm rounded-3 text-primary fw-semibold px-3 py-2 border-opacity-50"
                  :min="minDate"
                  required
                />
              </div>
            </div>

            <!-- Nút Yêu Cầu Mượn Ngay (Pill Shape Button) -->
            <button 
              type="submit" 
              class="btn btn-primary w-100 py-2.5 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 mt-2"
              :disabled="getAvailableQuantity(sach) <= 0 || loading"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm"></span>
              <i v-else class="fas fa-shopping-basket"></i>
              <span>{{ loading ? 'Đang gửi yêu cầu...' : 'Yêu Cầu Mượn Ngay' }}</span>
            </button>
          </form>

        </div>

      </div>
    </div>
  </div>

  <!-- Loading State -->
  <div class="container py-5 text-center" v-else>
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Đang tải...</span>
    </div>
    <p class="text-muted mt-2">Đang tải thông tin sách...</p>
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
      loading: false,
      minDate: today.toISOString().split('T')[0],
      ngayTraDuKien: nextWeek.toISOString().split('T')[0]
    };
  },
  mounted() {
    this.fetchDetail();
  },
  methods: {
    async fetchDetail() {
      const id = this.$route.params.id;
      console.log("[DEBUG FRONTEND - SachDetailView] Loading book detail for ID:", id);
      if (!id) return;

      try {
        const response = await fetch(`http://localhost:3000/api/sach/${id}`);
        if (!response.ok) throw new Error("Không thể tải thông tin sách");
        const data = await response.json();
        this.sach = data.data || data;
        console.log("[DEBUG FRONTEND - SachDetailView] Book Data Received:", JSON.stringify(this.sach, null, 2));
      } catch (error) {
        console.error("[DEBUG FRONTEND - SachDetailView] Fetch Detail Error:", error);
      }
    },

    // Lấy mã sách chuẩn ưu tiên maSach -> MaSach -> _id
    getBookCode(sach) {
      if (!sach) return "";
      return sach.maSach || sach.MaSach || sach._id || "";
    },

    // Lấy số lượng sách tồn kho chuẩn theo Controller
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

    handleImageError(e) {
      e.target.src = "https://placehold.co/300x450?text=No+Cover";
    },

    async submitBorrow() {
      const currentQty = this.getAvailableQuantity(this.sach);
      if (currentQty <= 0) {
        alert("Sách này hiện tại đã hết!");
        return;
      }

      this.loading = true;

      // Trích xuất thông tin User đăng nhập
      const userStr = localStorage.getItem("user") || sessionStorage.getItem("user") || "{}";
      const user = JSON.parse(userStr);

      const targetMaDocGia = user.maDocGia || user.MaDocGia || user.MSNV || user._id;
      const targetMaSach = this.getBookCode(this.sach);

      console.log("================ [DEBUG FRONTEND - SUBMIT BORROW] ================");
      console.log("[DEBUG FRONTEND] Current Logged User Object:", user);
      console.log("[DEBUG FRONTEND] Extracted maDocGia:", targetMaDocGia);
      console.log("[DEBUG FRONTEND] Current Book Object:", this.sach);
      console.log("[DEBUG FRONTEND] Extracted maSach:", targetMaSach);
      console.log("[DEBUG FRONTEND] ngayTraDuKien:", this.ngayTraDuKien);
      console.log("==================================================================");

      if (!targetMaDocGia) {
        alert("Không tìm thấy thông tin tài khoản! Vui lòng đăng nhập lại.");
        this.loading = false;
        this.$router.push("/login");
        return;
      }

      if (!targetMaSach) {
        alert("Lỗi: Không tìm thấy Mã sách hợp lệ!");
        this.loading = false;
        return;
      }

      const payload = {
        maDocGia: targetMaDocGia,
        maSach: targetMaSach,
        ngayMuon: new Date().toISOString().split("T")[0],
        ngayTraDuKien: this.ngayTraDuKien
      };

      console.log("[DEBUG FRONTEND] Sending Payload To Backend:", JSON.stringify(payload, null, 2));

      try {
        // ĐIỀU CHỈNH CHÍNH XÁC ROUTE: /api/muon-sach
        const response = await fetch("http://localhost:3000/api/muon-sach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const resData = await response.json();
        console.log("[DEBUG FRONTEND] Response from Backend Status:", response.status, resData);

        if (response.ok) {
          alert("Gửi yêu cầu mượn sách thành công! Vui lòng chờ thủ thư phê duyệt.");
          this.$router.push("/lich-su-muon");
        } else {
          alert(resData.message || "Gửi yêu cầu mượn sách thất bại!");
        }
      } catch (error) {
        console.error("[DEBUG FRONTEND] Error sending borrow request:", error);
        alert("Lỗi kết nối máy chủ khi mượn sách!");
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.book-detail-wrapper {
  max-width: 900px;
  width: 100%;
}

.book-cover-container {
  width: 100%;
  max-width: 280px;
  aspect-ratio: 2 / 3;
  background-color: #f8f9fa;
}

.book-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bg-light-gray {
  background-color: #f8f9fa;
}

.fs-xs {
  font-size: 0.78rem;
}

.description-text {
  color: #6c757d;
  font-size: 0.9rem;
}

.btn-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
  font-size: 0.95rem;
}

.btn-primary:hover {
  background-color: #0b5ed7;
  border-color: #0a58ca;
}
</style>