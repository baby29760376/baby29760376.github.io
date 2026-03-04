// 忘記密碼頁面

function renderForgotPasswordPage() {
  return `
    <div class="max-w-md mx-auto">
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="bg-gradient-to-r from-yellow-400 to-amber-400 px-8 py-6 text-center">
          <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span class="text-4xl">📧</span>
          </div>
          <h2 class="text-2xl font-bold text-white">忘記密碼</h2>
          <p class="text-yellow-100 mt-2">輸入您的電子郵件，我們將寄送重置連結</p>
        </div>

        <div class="p-8">
          ${state.forgotPasswordSuccess ? `
            <div class="text-center py-8">
              <div class="text-6xl mb-4">✅</div>
              <h3 class="text-xl font-bold text-green-700 mb-2">郵件已寄出！</h3>
              <p class="text-gray-600 mb-2">請檢查您的信箱，點擊信件中的「重置密碼」按鈕。</p>
              <p class="text-gray-500 text-sm mb-6">若未收到，請確認信箱是否正確，或檢查垃圾郵件資料夾。</p>
              <button onclick="navigateTo('login')"
                      class="w-full py-3 bg-gradient-to-r from-yellow-400 to-amber-400 text-white font-bold rounded-lg hover:from-yellow-500 hover:to-amber-500 transition">
                返回登入頁面
              </button>
            </div>
          ` : `
            <div class="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <p class="text-blue-800 text-sm flex items-start gap-2">
                <span class="text-lg">ℹ️</span>
                <span>請輸入您申請帳號時提供的電子郵件，系統將寄送密碼重置連結至該信箱。</span>
              </p>
            </div>

            ${state.error ? `
              <div class="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                ${state.error}
              </div>
            ` : ''}

            <div class="space-y-5">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">電子郵件</label>
                <input type="email" id="forgotEmail" placeholder="請輸入您的電子郵件"
                       class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none transition"
                       onkeydown="if(event.key==='Enter') handleForgotPassword()">
              </div>

              <button onclick="handleForgotPassword()"
                      id="forgotBtn"
                      class="w-full py-3 bg-gradient-to-r from-yellow-400 to-amber-400 text-white font-bold rounded-lg hover:from-yellow-500 hover:to-amber-500 transition shadow-lg">
                寄送重置連結
              </button>

              <button onclick="navigateTo('login')"
                      class="w-full py-3 bg-gray-100 text-gray-600 font-semibold rounded-lg hover:bg-gray-200 transition">
                ← 返回登入
              </button>
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}

async function handleForgotPassword() {
  const email = document.getElementById('forgotEmail').value.trim();

  if (!email) {
    state.error = '請輸入電子郵件';
    render();
    return;
  }

  // 簡單的 email 格式檢查
  if (!email.includes('@')) {
    state.error = '請輸入正確的電子郵件格式';
    render();
    return;
  }

  state.error = '';

  // 按鈕改為載入中狀態
  const btn = document.getElementById('forgotBtn');
  if (btn) {
    btn.textContent = '寄送中...';
    btn.disabled = true;
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        gotrue_meta_security: {}
      })
    });

    // Supabase 的 recover API 不管 email 存不存在都回傳 200
    // 這是為了防止惡意人士探測哪些 email 有帳號
    // 所以我們統一顯示成功訊息
    state.forgotPasswordSuccess = true;
    state.error = '';
    render();

  } catch (error) {
    console.error('忘記密碼錯誤:', error);
    state.error = '系統錯誤，請稍後再試';
    render();
  }
}
