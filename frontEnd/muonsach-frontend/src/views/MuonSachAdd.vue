<template>
  <div class="page m-3">
    <h4>Tạo Phiếu Mượn Sách Mới</h4>
    <p v-if="message" class="alert alert-info">{{ message }}</p>
    <MuonSachForm
      :borrow="newBorrow"
      @submit:borrow="createBorrow"
      @cancel="goBack"
    />
  </div>
</template>

<script>
import MuonSachForm from "@/components/MuonSachForm.vue";
import MuonSachService from "@/services/muonSach.service";
import AuthService from "@/services/auth.service";

export default {
  name: "MuonSachAdd",
  components: { MuonSachForm },
  data() {
    return {
      newBorrow: {
        maDocGia: "",
        maSach: "",
        ngayMuon: new Date().toISOString().split("T")[0],
        ngayTraDuKien: ""
      },
      message: ""
    };
  },
  methods: {
    async createBorrow(data) {
      // 1. Lấy thông tin nhân viên đang thực hiện tạo phiếu mượn
      const currentUser = AuthService.getCurrentUser() || {};
      const staffId = currentUser.MSNV || currentUser.msnv || null;

      const payload = {
        ...data,
        MSNV: staffId, // Đính kèm MSNV
        msnv: staffId
      };

      console.log("[DEBUG FRONTEND - MuonSachAdd] Creating borrow payload with MSNV:", JSON.stringify(payload, null, 2));
      
      try {
        const response = await MuonSachService.create(payload);
        console.log("[DEBUG FRONTEND - MuonSachAdd] Response:", response);
        alert(response.message || "Tạo phiếu mượn thành công!");
        this.$router.push({ name: "muonsach" });
      } catch (error) {
        console.error("[DEBUG FRONTEND - MuonSachAdd] Error:", error);
        this.message = error.response?.data?.message || "Đã xảy ra lỗi khi tạo phiếu mượn!";
      }
    },
    goBack() {
      this.$router.push({ name: "muonsach" });
    }
  }
};
</script>