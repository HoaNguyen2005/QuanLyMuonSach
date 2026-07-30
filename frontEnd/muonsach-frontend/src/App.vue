<template>
  <div id="app" class="d-flex flex-column min-vh-100">
    <AppHeader v-if="!isAuthPage" />
    <main class="flex-grow-1">
      <router-view />
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

export default {
  name: "App",
  components: {
    AppHeader,
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