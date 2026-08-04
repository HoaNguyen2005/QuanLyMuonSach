<template>
  <ul class="list-group">
    <li
      class="list-group-item d-flex justify-content-between align-items-center"
      v-for="(item, index) in borrows"
      :key="item._id"
      :class="{ active: index === activeIndex }"
      @click="updateActiveIndex(index)"
      style="cursor: pointer;"
    >
      <div>
        <h6 class="mb-1">
          <strong>Độc giả:</strong> {{ item.maDocGia || item.MaDocGia }} | 
          <strong>Sách:</strong> {{ item.maSach || item.MaSach }}
        </h6>
        <small>
          Ngày mượn: {{ formatDate(item.ngayMuon || item.NgayMuon) }}
        </small>
      </div>

      <div>
        <span v-if="item.ngayTra || item.NgayTra" class="badge bg-success me-2">
          Đã trả
        </span>
        <span v-else class="badge bg-warning text-dark me-2">
          Đang mượn
        </span>

        <button
          v-if="!(item.ngayTra || item.NgayTra)"
          class="btn btn-sm btn-outline-danger ms-2"
          @click.stop="$emit('return:borrow', item._id)"
        >
          Trả sách
        </button>
        <button
          v-if="!(item.ngayTra || item.NgayTra || item.ngayTraThucTe) && (item.soLanGiaHan === undefined || item.soLanGiaHan < 1)"
          class="btn btn-sm btn-outline-primary ms-2"
          @click.stop="$emit('extend:borrow', item._id)"
        >
          Gia hạn
        </button>
      </div>
    </li>
  </ul>
</template>

<script>
export default {
  name: "MuonSachList",
  props: {
    borrows: { type: Array, default: () => [] },
    activeIndex: { type: Number, default: -1 }
  },
  emits: ["update:activeIndex", "return:borrow", "extend:borrow"],
  methods: {
    updateActiveIndex(index) {
      console.log("[DEBUG FRONTEND - MuonSachList] Selected index:", index);
      this.$emit("update:activeIndex", index);
    },
    formatDate(dateStr) {
      if (!dateStr) return "---";
      return new Date(dateStr).toLocaleDateString("vi-VN");
    }
  }
};
</script>