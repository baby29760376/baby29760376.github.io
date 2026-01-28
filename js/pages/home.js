// 首頁渲染

function renderHomePage() {
  const latestNews = state.news.slice(0, 5); // 只顯示前 5 則
  
  return `
    <div class="space-y-8">
      <!-- 歡迎橫幅 -->
      <div class="bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 rounded-2xl shadow-xl p-8 md:p-12 text-center">
        <h2 class="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">歡迎來到托育人員鼓勵機制試辦計畫</h2>
        <p class="text-lg md:text-xl text-yellow-50 mb-6">提供專業的托育服務資訊與管理平台</p>
        ${!state.user ? `
          <button onclick="navigateTo('login')" class="px-8 py-3 bg-white text-yellow-600 rounded-full font-bold text-lg hover:bg-yellow-50 transition shadow-lg transform hover:scale-105">
            立即登入 →
          </button>
        ` : ''}
      </div>

      <!-- 最新消息 -->
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden border-t-4 border-yellow-400">
        <div class="bg-gradient-to-r from-yellow-400 to-amber-400 px-6 py-4 flex items-center space-x-3">
          <div class="text-white">${ICONS.news}</div>
          <h3 class="text-2xl font-bold text-white">最新消息</h3>
        </div>
        <div class="p-6 space-y-4">
          ${latestNews.length === 0 ? '<p class="text-gray-500 text-center py-8">目前沒有最新消息</p>' : ''}
          ${latestNews.map(news => `
            <div class="border-l-4 border-yellow-400 pl-4 py-2 hover:bg-yellow-50 transition rounded cursor-pointer"
                 onclick="viewNewsDetail('${news.id}')">
              <h4 class="font-semibold text-gray-800 mb-1">${news.title}</h4>
              <p class="text-xs text-gray-400">${new Date(news.published_date).toLocaleDateString('zh-TW')}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// 查看消息詳情
function viewNewsDetail(newsId) {
  state.selectedNewsId = newsId;
  navigateTo('news-detail');
}
