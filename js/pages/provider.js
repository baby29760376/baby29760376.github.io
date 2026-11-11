// 托育人員頁面渲染

function renderProfilePage() {
  if (!state.user || state.userRole !== 'provider') {
    navigateTo('login');
    return '';
  }
  
  if (!state.providerData) {
    return `
      <div class="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-12 text-center">
        <div class="animate-spin w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-gray-600">載入中...</p>
      </div>
    `;
  }

  const stats = state.evaluationStats;
  const hasEvaluations = stats && stats.total_parents > 0;
  
  return `
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- 系統關閉提示 -->
      <div class="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md">
        <div class="flex items-start gap-3">
          <div class="text-2xl">⚠️</div>
          <div>
            <p class="font-bold text-red-800 text-lg mb-1">系統使用期限提醒</p>
            <p class="text-red-700">本系統僅開放至 <strong class="text-red-900">2026年10月31日 23:59</strong>，之後將關閉登入功能。</p>
          </div>
        </div>
      </div>

      <!-- 個人資料卡片 -->
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="bg-gradient-to-r from-yellow-400 to-amber-400 px-8 py-12 text-center">
          <div class="w-40 h-40 bg-white rounded-full mx-auto mb-6 shadow-2xl border-2 border-yellow-200 overflow-hidden">
            <img src="images/provider-avatar.png" alt="托育人員" class="block w-full h-full object-cover transform scale-110">
          </div>
          <h2 class="text-4xl font-bold text-white mb-2">${escapeHtml(state.providerData.name)}</h2>
          <p class="text-yellow-100 text-lg">@${escapeHtml(state.providerData.account)}</p>
        </div>
        
        <div class="p-8 space-y-6">
          <div class="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-xl border-2 border-yellow-200">
            <p class="text-sm font-semibold text-gray-600 mb-2">帳號</p>
            <p class="text-2xl font-bold text-gray-800">${escapeHtml(state.providerData.account)}</p>
          </div>
          
          <div class="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-xl border-2 border-yellow-200">
            <p class="text-sm font-semibold text-gray-600 mb-3">個人簡介</p>
            <p class="text-gray-700 leading-relaxed text-lg">${escapeHtml(state.providerData.introduction)}</p>
          </div>
        </div>
      </div>

      <!-- 評價統計卡片 -->
      ${renderProviderStats(stats, hasEvaluations)}
    </div>
  `;
}

function renderProviderStats(stats, hasEvaluations) {
  return `
    <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div class="bg-gradient-to-r from-pink-400 to-red-400 px-8 py-6 text-center">
        <h3 class="text-3xl font-bold text-white flex items-center justify-center gap-3">
          <span class="text-4xl">❤️</span>
          家長評價統計
        </h3>
      </div>

      ${!hasEvaluations ? `
        <div class="p-12 text-center">
          <div class="text-6xl mb-4">📋</div>
          <p class="text-gray-500 text-lg">尚未有家長評價</p>
          <p class="text-gray-400 text-sm mt-2">等待家長填寫評價後，統計資料會顯示在這裡</p>
        </div>
      ` : `
        <div class="p-8 space-y-6">
          <!-- 總覽統計 -->
          <div class="grid md:grid-cols-2 gap-6">
            <div class="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-xl border-2 border-red-200 text-center">
              <p class="text-sm font-semibold text-gray-600 mb-2">總愛心數</p>
              <p class="text-5xl font-bold text-red-500">${escapeHtml(stats.total_hearts || 0)}</p>
              <p class="text-xs text-gray-500 mt-2">💝 共獲得的肯定</p>
            </div>
            
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200 text-center">
              <p class="text-sm font-semibold text-gray-600 mb-2">評價人數</p>
              <p class="text-5xl font-bold text-blue-500">${escapeHtml(stats.total_parents || 0)}</p>
              <p class="text-xs text-gray-500 mt-2">👥 位家長給予評價</p>
            </div>
          </div>

          <!-- 各主題統計 -->
          <div class="bg-gray-50 rounded-xl p-6">
            <h4 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>📊</span>
              各主題獲得愛心數
            </h4>
            <div class="grid md:grid-cols-2 gap-4">
              <div class="bg-white p-4 rounded-lg border-2 border-purple-200">
                <div class="flex justify-between items-center">
                  <span class="font-semibold text-gray-700">一、保親溝通</span>
                  <span class="text-2xl font-bold text-purple-500">${escapeHtml(stats.communication_hearts || 0)}</span>
                </div>
                <div class="mt-2 bg-purple-100 rounded-full h-2">
                  <div class="bg-purple-500 h-2 rounded-full" style="width: ${(stats.communication_hearts || 0) / (stats.total_parents * 5) * 100}%"></div>
                </div>
              </div>

              <div class="bg-white p-4 rounded-lg border-2 border-green-200">
                <div class="flex justify-between items-center">
                  <span class="font-semibold text-gray-700">二、托育活動安排</span>
                  <span class="text-2xl font-bold text-green-500">${escapeHtml(stats.activity_hearts || 0)}</span>
                </div>
                <div class="mt-2 bg-green-100 rounded-full h-2">
                  <div class="bg-green-500 h-2 rounded-full" style="width: ${(stats.activity_hearts || 0) / (stats.total_parents * 5) * 100}%"></div>
                </div>
              </div>

              <div class="bg-white p-4 rounded-lg border-2 border-blue-200">
                <div class="flex justify-between items-center">
                  <span class="font-semibold text-gray-700">三、作息安排與生活習慣</span>
                  <span class="text-2xl font-bold text-blue-500">${escapeHtml(stats.routine_hearts || 0)}</span>
                </div>
                <div class="mt-2 bg-blue-100 rounded-full h-2">
                  <div class="bg-blue-500 h-2 rounded-full" style="width: ${(stats.routine_hearts || 0) / (stats.total_parents * 5) * 100}%"></div>
                </div>
              </div>

              <div class="bg-white p-4 rounded-lg border-2 border-pink-200">
                <div class="flex justify-between items-center">
                  <span class="font-semibold text-gray-700">四、保親關係</span>
                  <span class="text-2xl font-bold text-pink-500">${escapeHtml(stats.relationship_hearts || 0)}</span>
                </div>
                <div class="mt-2 bg-pink-100 rounded-full h-2">
                  <div class="bg-pink-500 h-2 rounded-full" style="width: ${(stats.relationship_hearts || 0) / (stats.total_parents * 5) * 100}%"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <span class="text-2xl">ℹ️</span>
            <div class="text-sm text-blue-800">
              <p class="font-semibold mb-1">評價說明：</p>
              <p>家長的評價是匿名的，您只能看到統計數據，無法得知是哪位家長給予的評價。這是為了保護家長的隱私，並確保評價的客觀性。</p>
            </div>
          </div>
        </div>
      `}
    </div>
  `;
}
