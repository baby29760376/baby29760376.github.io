// 首次登入改密碼頁面

function renderChangePasswordPage() {
  return `
    <div class="max-w-md mx-auto">
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="bg-gradient-to-r from-yellow-400 to-amber-400 px-8 py-6 text-center">
          <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span class="text-4xl">🔑</span>
          </div>
          <h2 class="text-2xl font-bold text-white">請設定您的新密碼</h2>
          <p class="text-yellow-100 mt-2">首次登入需變更密碼才能使用系統</p>
        </div>

        <div class="p-8">
          <div class="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
            <p class="text-yellow-800 text-sm flex items-start gap-2">
              <span class="text-lg">⚠️</span>
              <span>為了保護您的帳號安全，請設定一個新密碼。密碼設定後即可正常使用系統。</span>
            </p>
          </div>

          ${state.error ? `
            <div class="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              ${state.error}
            </div>
          ` : ''}

          <div class="space-y-5">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">新密碼</label>
              <div class="relative">
                <input type="password" id="newPassword" placeholder="請輸入新密碼（至少8個字元）"
                       class="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none transition"
                       onkeydown="if(event.key==='Enter') document.getElementById('confirmPassword').focus()">
                <button type="button" onclick="togglePasswordVisibility('newPassword')"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition p-1">
                  ${EYE_ICONS.closed}
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">確認新密碼</label>
              <div class="relative">
                <input type="password" id="confirmPassword" placeholder="請再次輸入新密碼"
                       class="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none transition"
                       onkeydown="if(event.key==='Enter') handleChangePassword()">
                <button type="button" onclick="togglePasswordVisibility('confirmPassword')"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition p-1">
                  ${EYE_ICONS.closed}
                </button>
              </div>
            </div>

            <button onclick="handleChangePassword()"
                    class="w-full py-3 bg-gradient-to-r from-yellow-400 to-amber-400 text-white font-bold rounded-lg hover:from-yellow-500 hover:to-amber-500 transition shadow-lg transform hover:scale-105">
              確認設定新密碼
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function handleChangePassword() {
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (!newPassword || !confirmPassword) {
    state.error = '請填寫所有欄位';
    render();
    return;
  }

  if (newPassword.length < 8) {
    state.error = '密碼長度至少需要 8 個字元';
    render();
    return;
  }

  if (newPassword !== confirmPassword) {
    state.error = '兩次輸入的密碼不一致，請重新確認';
    render();
    return;
  }

  state.error = '';

  try {
    // 1. 呼叫 Supabase Auth 更新密碼
    const updateResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: 'PUT',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${state.user.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password: newPassword })
    });

    if (!updateResponse.ok) {
      const err = await updateResponse.json();
      console.error('密碼更新失敗:', err);
      state.error = '密碼更新失敗，請稍後再試';
      render();
      return;
    }

    // 2. 更新資料表的 password_changed = true
    const table = state.userRole === 'provider' ? 'child_care_providers' : 'parents';
    const markResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/${table}?user_id=eq.${state.user.id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${state.user.token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ password_changed: true })
      }
    );

    if (!markResponse.ok) {
      console.error('標記 password_changed 失敗');
    }

    // 3. 更新 state 並導向正確頁面
    state.user.password_changed = true;
    sessionStorage.setItem('childcare_user', JSON.stringify(state.user));

    alert('✅ 密碼設定成功！歡迎使用系統。');

    if (state.userRole === 'provider') {
      state.currentPage = 'profile';
      await fetchProviderData();
    } else if (state.userRole === 'parent') {
      state.currentPage = 'evaluate';
      await fetchParentData();
    }

  } catch (error) {
    console.error('改密碼錯誤:', error);
    state.error = '系統錯誤，請稍後再試';
    render();
  }
}
