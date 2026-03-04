// 登入頁面渲染

function renderLoginPage() {
  return `
    <div class="max-w-md mx-auto">
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="bg-gradient-to-r from-yellow-400 to-amber-400 px-8 py-6 text-center">
          <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span class="text-4xl">🔐</span>
          </div>
          <h2 class="text-lg md:text-3xl font-bold text-white break-words">登入系統</h2>
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
                     class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none transition"
                     onkeydown="if(event.key==='Enter') document.getElementById('password').focus()">
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">密碼</label>
              <div class="relative">
                <input type="password" id="password" placeholder="請輸入密碼"
                       class="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none transition"
                       onkeydown="if(event.key==='Enter') handleLogin(document.getElementById('email').value, document.getElementById('password').value)">
                <button type="button" onclick="togglePasswordVisibility('password')"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition p-1">
                  ${EYE_ICONS.closed}
                </button>
              </div>

              <!-- 忘記密碼連結 -->
              <div class="text-right mt-2">
                <button onclick="navigateTo('forgot-password')"
                        class="text-sm text-yellow-600 hover:text-yellow-800 hover:underline transition">
                  忘記密碼／首次登入？
                </button>
              </div>
            </div>
            
            <button onclick="handleLogin(document.getElementById('email').value, document.getElementById('password').value)"
                    class="w-full py-3 bg-gradient-to-r from-yellow-400 to-amber-400 text-white font-bold rounded-lg hover:from-yellow-500 hover:to-amber-500 transition shadow-lg transform hover:scale-105">
              登入
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}
