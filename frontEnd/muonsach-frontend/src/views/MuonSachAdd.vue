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
      console.log("[DEBUG FRONTEND - MuonSachAdd] Creating borrow payload:", JSON.stringify(data, null, 2));
      try {
        const response = await MuonSachService.create(data);
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