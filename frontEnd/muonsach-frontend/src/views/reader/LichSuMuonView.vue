<template>
  <div class="container my-5">
    <h3 class="fw-bold text-primary mb-4">
      <i class="fas fa-history me-2"></i> Lịch Sử Đặt Mượn Sách
    </h3>

    <!-- State Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted">Đang tải lịch sử mượn sách...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!historyList || historyList.length === 0" class="alert alert-info text-center py-4 rounded-4 shadow-sm">
      <p class="mb-3 fs-5">Bạn chưa đăng ký mượn cuốn sách nào!</p>
      <router-link to="/" class="btn btn-primary fw-semibold px-4">
        Khám Phá Sách Ngay
      </router-link>
    </div>

    <!-- Table Danh Sách Mượn -->
    <div v-else class="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-primary text-nowrap">
            <tr>
              <th scope="col" class="ps-4">STT</th>
              <th scope="col">Mã Sách</th>
              <th scope="col">Ngày Mượn</th>
              <th scope="col">Ngày Trả Dự Kiến</th>
              <th scope="col">Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in historyList" :key="item._id || index">
              <td class="ps-4 fw-bold">{{ index + 1 }}</td>
              <td>
                <span class="badge bg-light text-dark border">
                  {{ item.maSach || item.MaSach || 'N/A' }}
                </span>
              </td>
              <td>{{ formatDate(item.ngayMuon || item.NgayMuon) }}</td>
              <td>{{ formatDate(item.ngayTraDuKien || item.NgayTraDuKien || item.ngayTra) }}</td>
              <td>
                <span :class="getStatusBadgeClass(item.trangThai || item.TrangThai)">
                  {{ getStatusText(item.trangThai || item.TrangThai) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import MuonSachService from "@/services/muonSach.service";

export default {
  name: "LichSuMuonView",
  data() {
    return {
      historyList: [],
      loading: true
    };
  },
  async mounted() {
    await this.fetchBorrowHistory();
  },
  methods: {
    async fetchBorrowHistory() {
      console.log("\n==================================================");
      console.log("[DEBUG FRONTEND - LichSuMuonView] Bắt đầu lấy lịch sử mượn...");

      const rawUserData = localStorage.getItem("user") || localStorage.getItem("docgia") || localStorage.getItem("userDocGia");
      
      if (!rawUserData) {
        console.warn("[DEBUG FRONTEND] Chưa đăng nhập!");
        this.loading = false;
        return;
      }

      const user = JSON.parse(rawUserData);
      console.log("[DEBUG FRONTEND] User Data trong LocalStorage:", user);

      const maDocGia = user.maDocGia || user.MaDocGia || user._id;

      console.log(`[DEBUG FRONTEND] Mã Độc Giả dùng để query API: '${maDocGia}'`);

      if (!maDocGia) {
        console.error("[DEBUG FRONTEND ERROR] Không tìm thấy mã độc giả!");
        this.loading = false;
        return;
      }

      this.loading = true;
      try {
        const response = await MuonSachService.getLichSuByDocGia(maDocGia);
        console.log("[DEBUG FRONTEND SUCCESS] API Response Raw:", response);

        this.historyList = Array.isArray(response) ? response : (response.data || []);
        console.log(`[DEBUG FRONTEND SUCCESS] Đã render ${this.historyList.length} bản ghi.`);
        console.log("==================================================\n");
      } catch (error) {
        console.error("[DEBUG FRONTEND ERROR] Lỗi API fetch history:", error);
        console.log("==================================================\n");
      } finally {
        this.loading = false;
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return "Chưa xác định";
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("vi-VN");
    },

    getStatusBadgeClass(status) {
      if (!status || status === "Chờ duyệt") return "badge bg-warning text-dark";
      if (status === "Đã duyệt") return "badge bg-info text-dark";
      if (status === "Đã trả") return "badge bg-success";
      if (status === "Từ chối") return "badge bg-danger";
      return "badge bg-secondary";
    },

    getStatusText(trangThai) {
      if (!trangThai) return "Chờ duyệt";
      
      const status = String(trangThai).toUpperCase().trim();
      
      switch (status) {
        case "CHO_DUYET":
        case "CHỜ DUYỆT":
        case "CHO DUYET":
          return "Chờ duyệt";
        case "DA_DUYET":
        case "ĐÃ DUYỆT":
        case "DA DUYET":
          return "Đã duyệt";
        case "DA_TRA":
        case "ĐÃ TRẢ":
        case "DA TRA":
          return "Đã trả";
        case "TU_CHOI":
        case "TỪ CHỐI":
          return "Từ chối";
        default:
          return trangThai;
      }
    }
  }
};
</script>