// 家長相關函數

// 獲取家長被分配的托育人員列表
async function fetchAssignedProviders() {
  if (!state.user) return;

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/parent_provider_assignments?parent_user_id=eq.${state.user.id}&select=provider_id,child_care_providers(*)`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${state.user.token}`
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      state.assignedProviders = data.map(item => item.child_care_providers);
      render();
    }
  } catch (error) {
    console.error('獲取托育人員列表失敗:', error);
  }
}

// 獲取評價記錄
async function fetchEvaluation(providerId) {
  if (!state.user) return null;

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/evaluations?parent_user_id=eq.${state.user.id}&provider_id=eq.${providerId}`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${state.user.token}`
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data[0] || null;
    }
  } catch (error) {
    console.error('獲取評價失敗:', error);
  }
  return null;
}

// 獲取留言記錄
async function fetchComment(providerId) {
  if (!state.user) return null;

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/parent_comments?parent_user_id=eq.${state.user.id}&provider_id=eq.${providerId}`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${state.user.token}`
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data[0] || null;
    }
  } catch (error) {
    console.error('獲取留言失敗:', error);
  }
  return null;
}

// 獲取托育人員統計（家長查看用）
async function fetchProviderStatsForParent(providerId) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/provider_evaluation_stats?provider_id=eq.${providerId}`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${state.user.token}`
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data[0] || null;
    }
  } catch (error) {
    console.error('獲取統計失敗:', error);
  }
  return null;
}

// 選擇托育人員進行評價
async function selectProvider(providerId) {
  state.selectedProvider = state.assignedProviders.find(p => p.id === providerId);
  state.currentEvaluation = await fetchEvaluation(providerId);
  state.currentComment = await fetchComment(providerId);
  state.evaluationStats = await fetchProviderStatsForParent(providerId);
  navigateTo('evaluate-detail');
}

// 儲存評價
async function saveEvaluation(providerId, evaluationData, comment) {
  if (!state.user) return;

  // 確認對話框
  if (!confirm('評價提交後將無法修改，確定要提交嗎？')) {
    return;
  }

  try {
    // 儲存評價
    const evalResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/evaluations`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${state.user.token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          parent_user_id: state.user.id,
          provider_id: providerId,
          ...evaluationData
        })
      }
    );

    if (!evalResponse.ok) {
      const error = await evalResponse.json();
      throw new Error(error.message || '評價提交失敗');
    }

    // 如果有留言，儲存留言
    if (comment && comment.trim()) {
      const commentResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/parent_comments`,
        {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${state.user.token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            parent_user_id: state.user.id,
            provider_id: providerId,
            comment: comment.trim()
          })
        }
      );

      if (!commentResponse.ok) {
        console.error('留言提交失敗');
      }
    }

    alert('評價提交成功！');
    
    // 重新載入評價資料
    state.currentEvaluation = await fetchEvaluation(providerId);
    state.currentComment = await fetchComment(providerId);
    state.evaluationStats = await fetchProviderStatsForParent(providerId);
    render();

  } catch (error) {
    console.error('提交失敗:', error);
    alert('評價提交失敗：' + error.message);
  }
}

// 渲染家長的托育人員列表頁面
function renderParentProviderList() {
  if (state.assignedProviders.length === 0) {
