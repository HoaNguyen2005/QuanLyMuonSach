<template>
  <div id="app" class="d-flex flex-column min-vh-100">
    <AppHeader v-if="!isAuthPage" />
    <main class="flex-grow-1 position-relative">
      <router-view />
      
      <!-- Khung thông báo tài khoản bị khóa -->
      <div 
        v-if="isAccountLocked" 
        class="position-fixed bottom-0 end-0 p-3 mb-5" 
        style="z-index: 9999; max-width: 350px;"
      >
        <div class="toast show bg-danger text-white border-0 shadow-lg rounded-3" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="toast-header bg-danger text-white border-bottom border-light border-opacity-25 py-2">
            <i class="fas fa-user-lock me-2 fs-5"></i>
            <strong class="me-auto fs-6">Tài khoản bị khóa</strong>
            <button type="button" class="btn-close btn-close-white" @click="isAccountLocked = false" aria-label="Close"></button>
          </div>
          <div class="toast-body py-3">
            Tài khoản của bạn hiện đang bị khóa do trễ hạn trả sách hoặc nợ tiền phạt. Hãy liên hệ nhân viên thư viện để biết chi tiết.
          </div>
        </div>
      </div>
    </main>
    <footer 
      v-if="!isAuthPage" 
      class="bg-dark text-white text-center py-3 mt-auto border-top border-secondary border-opacity-25"
    >
      <div class="container">
        <small>&copy; 2026 Hệ Thống Quản Lý Thư Viện. All rights reserved.</small>
      </div>
    </footer>
  </div>
</template>

<script>
import AppHeader from "@/components/AppHeader.vue";
import AuthService from "@/services/auth.service";
import DocGiaService from "@/services/docGia.service";

export default {
  name: "App",
  components: {
    AppHeader,
  },
  data() {
    return {
      isAccountLocked: false
    };
  },
  computed: {
    isAuthPage() {
      const hiddenRoutes = ["landing", "login", "register"];
      const currentRouteName = String(this.$route.name || "").toLowerCase();
      const currentPath = String(this.$route.path || "").toLowerCase();

      return (
        hiddenRoutes.includes(currentRouteName) ||
        currentPath === "/landing" ||
        currentPath.includes("/login") ||
        currentPath.includes("/register")
      );
    }
  },
  watch: {
    '$route'() {
      this.checkAccountStatus();
    }
  },
  mounted() {
    this.checkAccountStatus();
  },
  methods: {
    async checkAccountStatus() {
      const user = AuthService.getCurrentUser();
      if (!user || user.role !== 'docgia') {
        this.isAccountLocked = false;
        return;
      }

      try {
        const docGia = await DocGiaService.get(user.maDocGia);
        if (docGia && docGia.trangThaiTaiKhoan === 3) {
          this.isAccountLocked = true;
          // Update localStorage so other parts of the app know
          user.trangThaiTaiKhoan = 3;
          localStorage.setItem("user", JSON.stringify(user));
        } else {
          this.isAccountLocked = false;
        }
      } catch (error) {
        console.error("Lỗi kiểm tra trạng thái khóa tài khoản", error);
        // Fallback to local storage if API fails
        this.isAccountLocked = user.trangThaiTaiKhoan === 3;
      }
    }
  }
};
</script>

<style>
html, body {
  min-height: 100vh;
  margin: 0 !important;
  padding: 0 !important;
  overflow-x: hidden;
  background-image: url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1920') !important;
  background-size: cover !important;
  background-position: center center !important;
  background-repeat: no-repeat !important;
  background-attachment: fixed !important;
}

#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: transparent !important; 
  min-height: 100vh;
}

.page {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
</style>