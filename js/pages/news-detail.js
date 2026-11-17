// 消息詳細頁面渲染（支援圖片顯示）

function renderNewsDetailPage() {
  const news = state.news.find(n => n.id === state.selectedNewsId);
  
  if (!news) {
    return `
      <div class="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-12 text-center">
        <div class="text-6xl mb-4">📰</div>
        <h3 class="text-2xl font-bold text-gray-800 mb-2">消息不存在</h3>
        <button onclick="navigateTo('home')" class="mt-4 px-6 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500">
          返回首頁
        </button>
      </div>
    `;
  }

  // 只允許 https: 圖片網址，其他（javascript:、data: 等）直接不顯示圖片
  const imageUrl = safeImageUrl(news.image_url);

  return `
    <div class="max-w-4xl mx-auto">
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <!-- 頁首 -->
        <div class="bg-gradient-to-r from-yellow-400 to-amber-400 px-8 py-6">
          <button onclick="navigateTo('home')" class="text-white hover:text-yellow-100 mb-4 flex items-center gap-2">
            ← 返回首頁
          </button>
          <h1 class="text-lg md:text-3xl font-bold text-white mb-2 break-words">${escapeHtml(news.title)}</h1>
          <p class="text-yellow-100">
            📅 ${new Date(news.published_date).toLocaleDateString('zh-TW', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <!-- 封面圖片 -->
        ${imageUrl ? `
          <div class="px-8 pt-8">
            <img src="${escapeHtml(imageUrl)}" 
                 alt="${escapeHtml(news.title)}" 
                 class="w-full max-h-96 object-contain rounded-xl shadow-lg"
                 onerror="this.parentElement.style.display='none'">
          </div>
        ` : ''}

        <!-- 內容 -->
        <div class="p-8">
          <div class="prose max-w-none text-gray-700 leading-relaxed space-y-4">
            ${news.content_html ? sanitizeHtml(news.content_html) : `<p>${escapeHtml(news.content)}</p>`}
          </div>
        </div>

        <!-- 底部返回按鈕 -->
        <div class="px-8 pb-8">
          <button onclick="navigateTo('home')" class="w-full py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition">
            返回首頁
          </button>
        </div>
      </div>
    </div>
  `;
}
