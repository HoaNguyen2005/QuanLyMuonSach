<template>
  <div class="landing-container min-vh-100 d-flex flex-column justify-content-between">
    
    <!-- 1. HEADER NAVBAR (Màu Navy Blue) -->
    <header class="bg-navy shadow-md py-3 px-4 px-lg-5 sticky-top border-bottom border-navy-light">
      <div class="container-fluid d-flex align-items-center justify-content-between">
        
        <!-- Logo & Thương Hiệu -->
        <router-link to="/" class="d-flex align-items-center gap-2 text-decoration-none">
          <div class="brand-icon bg-white text-navy rounded-3 d-flex align-items-center justify-content-center shadow-sm">
            <i class="fas fa-book-reader fs-5"></i>
          </div>
          <span class="fw-bold fs-5 text-white text-uppercase tracking-wide">LibManage</span>
        </router-link>

        <!-- Menu Điều Hướng Ở Giữa -->
        <nav class="d-none d-lg-flex align-items-center gap-4 fw-bold text-uppercase fs-7">
          <router-link to="/" class="nav-link-custom active">Trang Chủ</router-link>
          <a href="#about" class="nav-link-custom">Giới Thiệu</a>
          <a href="#services" class="nav-link-custom">Dịch Vụ</a>
          <a href="#books" class="nav-link-custom">Kho Sách</a>
          <a href="#contact" class="nav-link-custom">Liên Hệ</a>
        </nav>

        <!-- Nút Hành Động Bên Phải -->
        <div class="d-flex align-items-center gap-2">
          <router-link to="/login" class="btn btn-outline-light rounded-1 px-3 py-1.5 fw-bold fs-7">
            Đăng Nhập
          </router-link>
          <router-link to="/register" class="btn btn-white-accent rounded-1 px-3 py-1.5 fw-bold fs-7 d-none d-sm-inline-block shadow-sm">
            Đăng Ký
          </router-link>
        </div>

      </div>
    </header>

    <!-- 2. HERO BANNER CENTER (Nằm trên nền giá sách toàn màn hình) -->
    <main class="hero-section flex-grow-1 d-flex align-items-center justify-content-center text-center text-white px-3 py-5">
      <div class="container max-w-4xl py-4">
        
        <!-- Tiêu đề lớn giữa màn hình -->
        <h1 class="hero-title fw-bold mb-3 tracking-tight text-shadow">
          Hệ Thống Quản Lý Thư Viện
        </h1>

        <!-- Dòng mô tả -->
        <p class="hero-subtitle text-white-90 fs-5 max-w-2xl mx-auto mb-4 fw-normal leading-relaxed text-shadow-sm">
          Chúng tôi cung cấp giải pháp tra cứu, mượn trả sách trực tuyến tiên tiến và thân thiện nhất cho độc giả.
        </p>

        <!-- 2 Nút Bấm Center -->
        <div class="d-flex flex-column flex-sm-row align-items-center justify-content-center gap-3">
          <router-link to="/register" class="btn btn-outline-light rounded-1 px-4 py-2.5 fw-bold fs-6 border-2 text-uppercase shadow-sm w-sm-auto">
            Tạo Tài Khoản Mới
          </router-link>
          <router-link to="/login" class="btn btn-navy-accent rounded-1 px-4 py-2.5 fw-bold fs-6 text-uppercase shadow-lg w-sm-auto">
            Bắt Đầu Mượn Sách
          </router-link>
        </div>

      </div>
    </main>

    <!-- 3. FEATURE BOTTOM BAR (Đã chuyển sang nền Navy Blue) -->
    <section class="bg-navy text-white py-4 border-top border-navy-light shadow-lg">
      <div class="container">
        <div class="row g-4 text-start">
          
          <!-- Cột 1 -->
          <div class="col-md-4">
            <div class="d-flex align-items-start gap-3">
              <div class="feature-icon-wrapper text-white flex-shrink-0">
                <i class="fas fa-search-plus fa-2x"></i>
              </div>
              <div>
                <h6 class="fw-bold text-white text-uppercase mb-1">Tra Cứu Nhanh Chóng</h6>
                <p class="text-white-75 small mb-0 leading-sm">
                  Chúng tôi mong muốn mang lại trải nghiệm tìm kiếm đầu sách dễ dàng và chính xác nhất.
                </p>
              </div>
            </div>
          </div>

          <!-- Cột 2 -->
          <div class="col-md-4">
            <div class="d-flex align-items-start gap-3">
              <div class="feature-icon-wrapper text-white flex-shrink-0">
                <i class="fas fa-book-reader fa-2x"></i>
              </div>
              <div>
                <h6 class="fw-bold text-white text-uppercase mb-1">Đặt Mượn Trực Tuyến</h6>
                <p class="text-white-75 small mb-0 leading-sm">
                  Tự hào cung cấp quy trình đặt giữ sách tự động, tiết kiệm thời gian cho bạn.
                </p>
              </div>
            </div>
          </div>

          <!-- Cột 3 -->
          <div class="col-md-4">
            <div class="d-flex align-items-start gap-3">
              <div class="feature-icon-wrapper text-white flex-shrink-0">
                <i class="fas fa-shield-alt fa-2x"></i>
              </div>
              <div>
                <h6 class="fw-bold text-white text-uppercase mb-1">Quản Lý Minh Bạch</h6>
                <p class="text-white-75 small mb-0 leading-sm">
                  Cố gắng duy trì các tiêu chuẩn lưu trữ dữ liệu mượn trả chuẩn xác và an toàn.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- 4. FOOTER -->
    <footer class="bg-dark text-white-50 text-center py-3 fs-xs border-top border-navy-light">
      <div class="container">
        <span>&copy; 2026 Hệ Thống Quản Lý Thư Viện. All rights reserved.</span>
      </div>
    </footer>

  </div>
</template>

<script>
export default {
  name: "LandingView"
};
</script>

<style scoped>
/* Định nghĩa màu Navy Chuẩn */
.text-navy { color: #1a2b4c !important; }
.bg-navy { background-color: #1a2b4c !important; }
.bg-navy-dark { background-color: #121e36 !important; }
.border-navy-light { border-color: rgba(255, 255, 255, 0.15) !important; }

.btn-white-accent {
  background-color: #ffffff;
  color: #1a2b4c;
  border: 1px solid #ffffff;
  transition: all 0.3s ease;
}
.btn-white-accent:hover {
  background-color: #e2e8f0;
  color: #121e36;
}

/* Nút bấm Hero */
.btn-navy-accent {
  background-color: #1a2b4c;
  color: #ffffff;
  border: 1px solid #2a4365;
  transition: all 0.3s ease;
}
.btn-navy-accent:hover {
  background-color: #121e36;
  color: #ffffff;
  border-color: #121e36;
}

/* Nav Link */
.nav-link-custom {
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  transition: color 0.2s ease;
}
.nav-link-custom:hover,
.nav-link-custom.active {
  color: #ffffff;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
}

/* Background Hero Section */
.hero-section {
  background: linear-gradient(rgba(15, 23, 42, 0.55), rgba(15, 23, 42, 0.55));
}

.brand-icon {
  width: 36px;
  height: 36px;
}

.hero-title {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 3.2rem;
  line-height: 1.25;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.2rem;
  }
}

.text-shadow {
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
}
.text-shadow-sm {
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
}

.text-white-90 { color: rgba(255, 255, 255, 0.9); }
.text-white-75 { color: rgba(255, 255, 255, 0.75); }

.fs-7 { font-size: 0.85rem; }
.fs-xs { font-size: 0.75rem; }
.tracking-wide { letter-spacing: 0.05em; }
.max-w-4xl { max-width: 900px; }
.max-w-2xl { max-width: 680px; }
.leading-sm { line-height: 1.4; }

.feature-icon-wrapper {
  margin-top: 2px;
}
</style>