// 登入協助頁面（忘記密碼／首次登入的聯絡方式）

function renderLoginHelpPage() {
  return `
    <div class="max-w-md mx-auto">
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="bg-gradient-to-r from-yellow-400 to-amber-400 px-8 py-6 text-center">
          <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span class="text-4xl">🔒</span>
          </div>
          <h2 class="text-2xl font-bold text-white">忘記密碼／首次登入</h2>
          <p class="text-yellow-100 mt-2">請聯絡${escapeHtml(CENTER_INFO.shortName)}取得密碼</p>
        </div>

        <div class="p-8">
          <div class="mb-6 p-5 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
            <p class="text-yellow-800 text-sm flex items-start gap-2">
              <span class="text-lg">ℹ️</span>
              <span>首次登入請使用中心提供給您的預設密碼，登入後系統會引導您設定新密碼。</span>
            </p>
          </div>

          <div class="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-6 text-center space-y-4">
            <p class="text-gray-700 font-semibold">如需取得或重置密碼，請聯絡：</p>

            <div class="text-2xl font-bold text-orange-600">
              📞 <a href="tel:${escapeHtml(CENTER_INFO.phone)}" class="hover:text-orange-800 transition">${escapeHtml(CENTER_INFO.phone)}</a>
            </div>

            <p class="text-gray-500 text-sm">${escapeHtml(CENTER_INFO.name)}</p>

            <div class="pt-2 space-y-2 text-sm text-gray-500">
              <p>📧 <a href="mailto:${escapeHtml(CENTER_INFO.email)}" class="text-yellow-600 hover:underline">${escapeHtml(CENTER_INFO.email)}</a></p>
              <p>📍 ${escapeHtml(CENTER_INFO.address)}</p>
            </div>
          </div>

          <button onclick="navigateTo('login')"
                  class="mt-6 w-full py-3 bg-gray-100 text-gray-600 font-semibold rounded-lg hover:bg-gray-200 transition">
            ← 返回登入
          </button>
        </div>
      </div>
    </div>
  `;
}
