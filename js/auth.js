// 認證相關函數

// 檢查登入狀態
function checkUser() {
  const storedUser = sessionStorage.getItem('childcare_user');
  if (storedUser) {
    state.user = JSON.parse(storedUser);
    state.userRole = state.user.role;
    if (state.userRole === 'provider') {
      fetchProviderData();
    } else if (state.userRole === 'parent') {
      fetchParentData();
    } else if (state.userRole === 'admin') {
      fetchAdminData();
    }
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
    console.log('=== 開始登入流程 ===');
    
    // 步驟 1: 進行身份驗證
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

    const userId = authData.user.id;
    const token = authData.access_token;

    // 步驟 2: 判斷使用者身份
    let userRole = null;
    
    // 檢查是否為托育人員
    const providerCheck = await fetch(`${SUPABASE_URL}/rest/v1/child_care_providers?user_id=eq.${userId}&select=id`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (providerCheck.ok) {
      const providerData = await providerCheck.json();
      if (providerData.length > 0) {
        userRole = 'provider';
      }
    }

    // 檢查是否為家長
    if (!userRole) {
      const parentCheck = await fetch(`${SUPABASE_URL}/rest/v1/parents?user_id=eq.${userId}&select=id`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (parentCheck.ok) {
        const parentData = await parentCheck.json();
        if (parentData.length > 0) {
          userRole = 'parent';
        }
      }
    }

    // 檢查是否為管理員
    if (!userRole) {
      const adminCheck = await fetch(`${SUPABASE_URL}/rest/v1/admins?user_id=eq.${userId}&select=id`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (adminCheck.ok) {
        const adminData = await adminCheck.json();
        if (adminData.length > 0) {
          userRole = 'admin';
        }
      }
    }

    if (!userRole) {
      state.error = '此帳號未註冊為托育人員、家長或管理員';
      render();
      return;
    }

    // 步驟 3: 儲存登入狀態
    state.user = { 
      id: userId, 
      email: authData.user.email, 
      token: token,
      role: userRole
    };
    state.userRole = userRole;
    sessionStorage.setItem('childcare_user', JSON.stringify(state.user));
    
    // 步驟 4: 導向對應頁面並獲取資料
    if (userRole === 'provider') {
      await fetchProviderData();
      state.currentPage = 'profile';
    } else if (userRole === 'parent') {
      await fetchParentData();
      state.currentPage = 'evaluate';
    } else if (userRole === 'admin') {
      await fetchAdminData();
      state.currentPage = 'admin-dashboard';
    }
    
    render();
    console.log('=== 登入流程完成 ===');
  } catch (error) {
    console.error('登入錯誤:', error);
    state.error = '登入失敗，請稍後再試';
    render();
  }
}

// 登出
function handleLogout() {
  state.user = null;
  state.userRole = null;
  state.providerData = null;
  state.parentData = null;
  state.adminData = null;
  state.adminStats = {
    totalParents: 0,
    evaluatedParents: 0
  };
  state.assignedProviders = [];
  state.allProviders = [];
  state.selectedProviderForAdmin = null;
  state.providerEvaluationsDetail = [];
  state.currentEvaluation = null;
  state.selectedProvider = null;
  state.currentPage = 'home';
  sessionStorage.removeItem('childcare_user');
  render();
}
