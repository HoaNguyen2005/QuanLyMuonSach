<template>
  <div class="page row m-3">
    <div class="col-md-10">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h4>Quản Lý Mượn Trả Sách</h4>
        <div>
          <button class="btn btn-sm btn-primary me-2" @click="refreshList">
            <i class="fas fa-redo me-1"></i> Làm mới
          </button>
          <button class="btn btn-sm btn-success" @click="goToAddBorrow">
            <i class="fas fa-plus me-1"></i> Thêm phiếu mượn
          </button>
        </div>
      </div>

      <MuonSachList
        v-if="borrows.length > 0"
        :borrows="borrows"
        v-model:activeIndex="activeIndex"
        @return:borrow="handleReturnBook"
      />
      <p v-else class="text-muted">Chưa có dữ liệu phiếu mượn nào.</p>
    </div>
  </div>
</template>

<script>
import MuonSachList from "@/components/MuonSachList.vue";
import MuonSachService from "@/services/muonSach.service";

export default {
  name: "MuonSachBook",
  components: { MuonSachList },
  data() {
    return {
      borrows: [],
      activeIndex: -1
    };
  },
  methods: {
    async retrieveBorrows() {
      console.log("[DEBUG FRONTEND - MuonSachBook] Fetching borrows list...");
      try {
        this.borrows = await MuonSachService.getAll();
        console.log("[DEBUG FRONTEND - MuonSachBook] Borrows loaded:", this.borrows);
      } catch (error) {
        console.error("[DEBUG FRONTEND - MuonSachBook] Error loading borrows:", error);
      }
    },
    refreshList() {
      this.activeIndex = -1;
      this.retrieveBorrows();
    },
    goToAddBorrow() {
      this.$router.push({ name: "muonsach.add" });
    },
    async handleReturnBook(id) {
      if (!confirm("Xác nhận trả sách cho phiếu mượn này?")) return;

      console.log(`[DEBUG FRONTEND - MuonSachBook] Processing return for ID: ${id}`);
      try {
        const payload = { ngayTraThucTe: new Date().toISOString().split("T")[0] };
        const res = await MuonSachService.traSach(id, payload);
        console.log("[DEBUG FRONTEND - MuonSachBook] Return success response:", res);
        alert(res.message || "Trả sách thành công!");
        this.refreshList();
      } catch (error) {
        console.error("[DEBUG FRONTEND - MuonSachBook] Error returning book:", error);
        alert(error.response?.data?.message || "Không thể xử lý trả sách!");
      }
    }
  },
  mounted() {
    this.refreshList();
  }
};
</script>