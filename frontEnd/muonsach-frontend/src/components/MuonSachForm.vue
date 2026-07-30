<template>
  <form @submit.prevent="submitForm">
    <!-- Hiển thị thông báo lỗi Validation nếu có -->
    <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
      <i class="fas fa-exclamation-triangle me-2"></i>{{ error }}
      <button type="button" class="btn-close" @click="error = ''"></button>
    </div>

    <div class="mb-3">
      <label for="maDocGia" class="form-label">Mã Độc Giả <span class="text-danger">*</span></label>
      <input
        id="maDocGia"
        type="text"
        class="form-control"
        v-model="borrowLocal.maDocGia"
        placeholder="VD: DG0001"
        required
      />
    </div>

    <div class="mb-3">
      <label for="maSach" class="form-label">Mã Sách <span class="text-danger">*</span></label>
      <input
        id="maSach"
        type="text"
        class="form-control"
        v-model="borrowLocal.maSach"
        placeholder="VD: S001"
        required
      />
    </div>

    <div class="mb-3">
      <label for="ngayMuon" class="form-label">Ngày Mượn <span class="text-danger">*</span></label>
      <input
        id="ngayMuon"
        type="date"
        class="form-control"
        v-model="borrowLocal.ngayMuon"
        required
      />
    </div>

    <div class="mb-3">
      <label for="ngayTraDuKien" class="form-label">Ngày Trả Dự Kiến <span class="text-danger">*</span></label>
      <input
        id="ngayTraDuKien"
        type="date"
        class="form-control"
        v-model="borrowLocal.ngayTraDuKien"
        :min="borrowLocal.ngayMuon" 
        required
      />
      <div class="form-text">Ngày trả dự kiến phải lớn hơn hoặc bằng ngày mượn.</div>
    </div>

    <div class="mb-3">
      <button class="btn btn-primary me-2" type="submit">
        <i class="fas fa-save me-1"></i> Lưu Phiếu Mượn
      </button>
      <button class="btn btn-secondary" type="button" @click="$emit('cancel')">
        Hủy
      </button>
    </div>
  </form>
</template>

<script>
export default {
  name: "MuonSachForm",
  props: {
    borrow: { type: Object, required: true }
  },
  emits: ["submit:borrow", "cancel"],
  data() {
    return {
      borrowLocal: { ...this.borrow },
      error: ""
    };
  },
  methods: {
    submitForm() {
      this.error = "";

      const ngayMuonDate = new Date(this.borrowLocal.ngayMuon);
      const ngayTraDuKienDate = new Date(this.borrowLocal.ngayTraDuKien);

      console.log("[DEBUG FRONTEND - MuonSachForm] Checking dates:", {
        ngayMuon: this.borrowLocal.ngayMuon,
        ngayTraDuKien: this.borrowLocal.ngayTraDuKien,
        isValid: ngayTraDuKienDate >= ngayMuonDate
      });

      // Kiểm tra logic Ngày trả dự kiến < Ngày mượn
      if (ngayTraDuKienDate < ngayMuonDate) {
        this.error = "Lỗi: Ngày trả dự kiến không được trước ngày mượn!";
        console.error("[DEBUG FRONTEND - MuonSachForm] Validation failed: ngayTraDuKien < ngayMuon");
        return;
      }

      console.log("[DEBUG FRONTEND - MuonSachForm] Validation passed. Emitting payload:", JSON.stringify(this.borrowLocal, null, 2));
      this.$emit("submit:borrow", this.borrowLocal);
    }
  }
};
</script>