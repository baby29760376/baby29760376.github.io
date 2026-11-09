// 登入/登出相關函數

// ── 登入狀態保存 ────────────────────────────────────────────────
// sessionStorage 只保存 access token。使用者 id、角色與是否已改密碼
// 每次載入頁面都向伺服器重新查詢，不在瀏覽器端保存。
const SESSION_TOKEN_KEY = 'childcare_token';
const LEGACY_SESSION_KEY = 'childcare_user';

function saveSessionToken(token) {
  try {
    sessionStorage.setItem(SESSION_TOKEN_KEY, token);
  } catch (error) {
    console.error('無法保存登入狀態:', error);
  }
}

function readSessionToken() {
  try {
    return sessionStorage.getItem(SESSION_TOKEN_KEY);
  } catch (error) {
    return null;
  }
}

function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    sessionStorage.removeItem(LEGACY_SESSION_KEY);
  } catch (error) {
    // 無法存取 sessionStorage 時不需處理
  }
}

// 依 token 向伺服器查詢使用者身分，回傳 state.user 物件；token 無效或查無身分時回傳 null
async function loadUserContext(userId, token) {
  const role = await determineUserRole(userId, token);
  if (!role) return null;

  // 檢查是否已改過密碼（管理員不需要）
  let passwordChanged = true;
  if (role === 'provider' || role === 'parent') {
    passwordChanged = await checkPasswordChanged(userId, token, role);
  }

  return {
    id: userId,
    token: token,
    role: role,
    password_changed: passwordChanged
  };
}

// 依使用者狀態導向對應頁面並載入資料
async function enterApp(defaultPages) {
  if (!state.user.password_changed) {
    state.currentPage = 'change-password';
    render();
    return;
  }

  if (state.userRole === 'provider') {
    if (defaultPages) state.currentPage = 'profile';
    await fetchProviderData();
  } else if (state.userRole === 'parent') {
    if (defaultPages) state.currentPage = 'evaluate';
    await fetchParentData();
  } else if (state.userRole === 'admin') {
    if (defaultPages) state.currentPage = 'admin-dashboard';
    await fetchAdminData();
  }
}

// 重新載入頁面時，用保存的 token 還原登入狀態
async function checkUser() {
  // 移除舊版保存的完整使用者物件
  try {
    sessionStorage.removeItem(LEGACY_SESSION_KEY);
  } catch (error) {
    // 無法存取 sessionStorage 時不需處理
  }

  const token = readSessionToken();
  if (!token) return;

  try {
    // 向 Supabase Auth 驗證 token 並取得使用者 id
    const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`
      }
    });

    if (!userResponse.ok) {
      // token 過期或無效
      clearSession();
      render();
      return;
    }

    const authUser = await userResponse.json();
    const user = await loadUserContext(authUser.id, token);
    if (!user) {
      clearSession();
      render();
      return;
    }

    state.user = user;
    state.userRole = user.role;
    await enterApp(false);
  } catch (error) {
    console.error('還原登入狀態失敗:', error);
  }
}

// 登入
async function handleLogin(email, password) {
  state.error = '';
  if (!email || !password) {
    state.error = '請輸入帳號和密碼';
    render();
    return;
  }

  try {
    const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const authData = await authResponse.json();

    if (!authData.access_token) {
      state.error = '帳號或密碼錯誤';
      render();
      return;
    }

    const token = authData.access_token;
    const user = await loadUserContext(authData.user.id, token);

    if (!user) {
      state.error = '此帳號未註冊為托育人員、家長或管理員';
      render();
      return;
    }

    state.user = user;
    state.userRole = user.role;
    saveSessionToken(token);

    // 尚未改密碼 → 強制跳到改密碼頁；已改密碼 → 正常進入系統
    await enterApp(true);

  } catch (error) {
    console.error('登入錯誤:', error);
    state.error = '登入失敗，請稍後再試';
    render();
  }
}

// 查詢使用者是否已改過密碼
async function checkPasswordChanged(userId, token, role) {
  try {
    const table = role === 'provider' ? 'child_care_providers' : 'parents';
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${table}?user_id=eq.${userId}&select=password_changed`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.length > 0) {
        return data[0].password_changed === true;
      }
    }
  } catch (error) {
    console.error('檢查 password_changed 失敗:', error);
  }

  // 查詢失敗時預設為尚未改密碼（保守處理）
  return false;
}

// 判斷使用者身份
async function determineUserRole(userId, token) {
  // 檢查是否為托育人員
  const providerCheck = await fetch(
    `${SUPABASE_URL}/rest/v1/child_care_providers?user_id=eq.${userId}&select=id`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (providerCheck.ok) {
    const providerData = await providerCheck.json();
    if (providerData.length > 0) return 'provider';
  }

  // 檢查是否為家長
  const parentCheck = await fetch(
    `${SUPABASE_URL}/rest/v1/parents?user_id=eq.${userId}&select=id`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (parentCheck.ok) {
    const parentData = await parentCheck.json();
    if (parentData.length > 0) return 'parent';
  }

  // 檢查是否為管理員
  const adminCheck = await fetch(
    `${SUPABASE_URL}/rest/v1/admins?user_id=eq.${userId}&select=id`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (adminCheck.ok) {
    const adminData = await adminCheck.json();
    if (adminData.length > 0) return 'admin';
  }

  return null;
}

// 登出
function handleLogout() {
  resetState();
  clearSession();
  render();
}
