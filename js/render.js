// 主渲染函數

function render() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    ${renderNavBar()}
    
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      ${renderCurrentPage()}
    </main>
    
    ${renderFooter()}
  `;
}

// 渲染導航列
function renderNavBar() {
  return `
    <nav class="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-20">
          <div class="flex items-center space-x-3 cursor-pointer" onclick="navigateTo('home')">
            <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
              <span class="text-2xl">👶</span>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-white drop-shadow-md">托育人員鼓勵機制試辦計畫</h1>
              <p class="text-xs text-yellow-100">Child Care Provider Incentive Pilot Program</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            ${state.user ? `
              <button onclick="navigateTo('home')" class="flex items-center space-x-2 px-4 py-2 rounded-lg transition ${state.currentPage === 'home' ? 'bg-white text-yellow-600' : 'text-white hover:bg-yellow-500'}">
                ${icons.home}
                <span class="hidden sm:inline">首頁</span>
              </button>
              ${state.userRole === 'provider' ? `
                <button onclick="navigateTo('profile')" class="flex items-center space-x-2 px-4 py-2 rounded-lg transition ${state.currentPage === 'profile' ? 'bg-white text-yellow-600' : 'text-white hover:bg-yellow-500'}">
                  ${icons.user}
                  <span class="hidden sm:inline">個人資料</span>
                </button>
              ` : ''}
              ${state.userRole === 'parent' ? `
                <button onclick="navigateTo('evaluate')" class="flex items-center space-x-2 px-4 py-2 rounded-lg transition ${state.currentPage.startsWith('evaluate') ? 'bg-white text-yellow-600' : 'text-white hover:bg-yellow-500'}">
                  ${icons.heart}
                  <span class="hidden sm:inline">評價托育人員</span>
                </button>
              ` : ''}
              ${state.userRole === 'admin' ? `
                <button onclick="navigateTo('admin-dashboard')" class="flex items-center space-x-2 px-4 py-2 rounded-lg transition ${state.currentPage.startsWith('admin') ? 'bg-white text-yellow-600' : 'text-white hover:bg-yellow-500'}">
                  ${icons.star}
                  <span class="hidden sm:inline">管理總覽</span>
                </button>
              ` : ''}
              <button onclick="handleLogout()" class="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                ${icons.logout}
                <span class="hidden sm:inline">登出</span>
              </button>
            ` : `
              <button onclick="navigateTo('home')" class="flex items-center space-x-2 px-4 py-2 rounded-lg transition ${state.currentPage === 'home' ? 'bg-white text-yellow-600' : 'text-white hover:bg-yellow-500'}">
                ${icons.home}
                <span>首頁</span>
              </button>
              <button onclick="navigateTo('login')" class="px-6 py-2 bg-white text-yellow-600 rounded-lg font-semibold hover:bg-yellow-50 transition shadow-md">
                登入
              </button>
            `}
          </div>
        </div>
      </div>
    </nav>
  `;
}

// 渲染當前頁面內容
function renderCurrentPage() {
  switch (state.currentPage) {
    case 'home':
      return renderHomePage();
    case 'login':
      return renderLoginPage();
    case 'profile':
      return renderProviderProfile();
    case 'evaluate':
      return renderEvaluatePage();
    case 'evaluate-detail':
      return renderEvaluateDetailPage();
    case 'admin-dashboard':
      return renderAdminDashboard();
    case 'admin-provider-detail':
      return renderAdminProviderDetail();
    default:
      return renderHomePage();
  }
}

// 渲染首頁
function renderHomePage() {
  // 如果已登入，自動跳轉到對應頁面
  if (state.user && state.userRole) {
    if (state.userRole === 'provider') {
      state.currentPage = 'profile';
      render();
      return '';
    } else if (state.userRole === 'parent') {
      state.currentPage = 'evaluate';
      render();
      return '';
    } else if (state.userRole === 'admin') {
      state.currentPage = 'admin-dashboard';
      render();
      return '';
    }
  }

  const latestNews = state.news.filter(n => n.category === '最新消息');
  const policies = state.news.filter(n => n.category === '政策宣導');
  
  return `
    <div class="space-y-8">
      <div class="bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 rounded-2xl shadow-xl p-8 md:p-12 text-center">
        <h2 class="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">歡迎來到托育人員鼓勵機制試辦計畫</h2>
        <p class="text-lg md:text-xl text-yellow-50 mb-6">提供專業的托育服務資訊與管理平台</p>
        ${!state.user ? `
          <button onclick="navigateTo('login')" class="px-8 py-3 bg-white text-yellow-600 rounded-full font-bold text-lg hover:bg-yellow-50 transition shadow-lg transform hover:scale-105">
            立即登入 →
          </button>
        ` : ''}
      </div>

      <div class="grid md:grid-cols-2 gap-8">
        <div class="bg-white rounded-2xl shadow-lg overflow-hidden border-t-4 border-yellow-400">
          <div class="bg-gradient-to-r from-yellow-400 to-amber-400 px-6 py-4 flex items-center space-x-3">
            <div class="text-white">${icons.news}</div>
            <h3 class="text-2xl font-bold text-white">最新消息</h3>
          </div>
          <div class="p-6 space-y-4">
            ${latestNews.length === 0 ? '<p class="text-gray-500 text-center py-8">目前沒有最新消息</p>' : ''}
            ${latestNews.map(news => `
              <div class="border-l-4 border-yellow-400 pl-4 py-2 hover:bg-yellow-50 transition rounded">
                <h4 class="font-semibold text-gray-800 mb-1">${news.title}</h4>
                <p class="text-sm text-gray-600 mb-2">${news.content}</p>
                <p class="text-xs text-gray-400">${new Date(news.published_date).toLocaleDateString('zh-TW')}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-lg overflow-hidden border-t-4 border-amber-500">
          <div class="bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-4 flex items-center space-x-3">
            <div class="text-white">${icons.megaphone}</div>
            <h3 class="text-2xl font-bold text-white">政策宣導</h3>
          </div>
          <div class="p-6 space-y-4">
            ${policies.length === 0 ? '<p class="text-gray-500 text-center py-8">目前沒有政策宣導</p>' : ''}
            ${policies.map(news => `
              <div class="border-l-4 border-amber-500 pl-4 py-2 hover:bg-amber-50 transition rounded">
                <h4 class="font-semibold text-gray-800 mb-1">${news.title}</h4>
                <p class="text-sm text-gray-600 mb-2">${news.content}</p>
                <p class="text-xs text-gray-400">${new Date(news.published_date).toLocaleDateString('zh-TW')}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

// 渲染登入頁面
function renderLoginPage() {
  return `
    <div class="max-w-md mx-auto">
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="bg-gradient-to-r from-yellow-400 to-amber-400 px-8 py-6 text-center">
          <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span class="text-4xl">🔐</span>
          </div>
          <h2 class="text-3xl font-bold text-white">登入系統</h2>
          <p class="text-yellow-100 mt-2">請輸入您的帳號密碼</p>
        </div>
        
        <div class="p-8">
          ${state.error ? `
            <div class="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              ${state.error}
            </div>
          ` : ''}
          
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">電子郵件</label>
              <input type="email" id="email" placeholder="請輸入電子郵件"
                     class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none transition">
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">密碼</label>
              <input type="password" id="password" placeholder="請輸入密碼"
                     class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none transition">
            </div>
            
            <button onclick="handleLogin(document.getElementById('email').value, document.getElementById('password').value)"
                    class="w-full py-3 bg-gradient-to-r from-yellow-400 to-amber-400 text-white font-bold rounded-lg hover:from-yellow-500 hover:to-amber-500 transition shadow-lg transform hover:scale-105">
              登入
            </button>
          </div>
          
          <div class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p class="text-sm text-gray-600 mb-3">
              <strong class="text-yellow-700">測試帳號：</strong>
            </p>
            <div class="text-xs text-gray-600 space-y-1">
              <p><strong>托育人員：</strong> provider1@example.com / password123</p>
              <p><strong>家長：</strong> parent1@example.com / password123</p>
              <p><strong>管理員：</strong> admin@example.com / password123</p>
              <p class="text-yellow-700 mt-2">系統會自動判斷您的身份</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// 渲染頁尾
function renderFooter() {
  return `
    <footer class="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 mt-20">
      <div class="max-w-7xl mx-auto px-4 py-8 text-center text-white">
        <p class="text-sm">© 2024 托育人員鼓勵機制試辦計畫 | Child Care Provider Incentive Pilot Program</p>
        <p class="text-xs mt-2 text-yellow-100">提供專業、安全、溫馨的托育服務</p>
      </div>
    </footer>
  `;
}
