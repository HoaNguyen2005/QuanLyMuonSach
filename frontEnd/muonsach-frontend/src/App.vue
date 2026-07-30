<template>
  <div id="app" class="d-flex flex-column min-vh-100">
    <!-- Header Navbar phân quyền (Độc Giả / Admin / Khách) -->
    <AppHeader />

    <!-- Nơi render nội dung các Trang (Views) -->
    <main class="flex-grow-1 d-flex flex-column justify-content-center">
      <router-view />
    </main>

    <!-- Footer dính sát đáy trang -->
    <footer class="bg-dark text-white text-center py-3 mt-auto border-top border-secondary border-opacity-25">
      <div class="container">
        <small>&copy; 2026 Hệ Thống Quản Lý Thư Viện. All rights reserved.</small>
      </div>
    </footer>
  </div>
</template>

<script>
import AppHeader from "@/components/AppHeader.vue";

export default {
  name: "App",
  components: {
    AppHeader,
  },
};
</script>

<style>
/* Reset và CSS dùng chung cho toàn bộ ứng dụng */
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.page {
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
</style>