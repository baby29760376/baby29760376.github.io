
// API 呼叫函數

// 獲取最新消息
async function fetchNews() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/news?select=*&order=published_date.desc`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    if (response.ok) {
      state.news = await response.json();
      render();
    }
  } catch (error) {
    console.error('獲取消息失敗:', error);
  }
}

// 獲取評價統計
async function fetchEvaluationStats() {
  if (!state.providerData) return;
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/provider_evaluation_stats?provider_id=eq.${state.providerData.id}&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${state.user.token}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      state.evaluationStats = data[0] || null;
      render();
    }
  } catch (error) {
    console.error('獲取評價統計失敗:', error);
  }
}

// 獲取評價記錄
async function fetchEvaluation(providerId) {
  if (!state.user) return;
  
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/evaluations?parent_user_id=eq.${state.user.id}&provider_id=eq.${providerId}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${state.user.token}`
        }
      }
    );
    if (response.ok) {
      const data = await response.json();
      state.currentEvaluation = data[0] || null;
      render();
    }
  } catch (error) {
    console.error('獲取評價失敗:', error);
  }
}

// 獲取留言
async function fetchComment(providerId) {
  if (!state.user) return;
  
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/parent_comments?parent_user_id=eq.${state.user.id}&provider_id=eq.${providerId}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${state.user.token}`
        }
      }
    );
    if (response.ok) {
      const data = await response.json();
      state.currentComment = data.length > 0 ? data[0] : null;
    }
  } catch (error) {
    console.error('獲取留言失敗:', error);
  }
}

// 儲存評價
async function saveEvaluation(providerId, evaluationData) {
  if (!state.user) return;
  
  if (state.currentEvaluation && state.currentEvaluation.id) {
    alert('您已經提交過評價，無法重複提交或修改');
    return;
  }
  
  if (!confirm('確定要提交評價嗎？\n\n⚠️ 評價提交後將無法修改，請確認所有項目都已正確勾選。')) {
    return;
  }
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/evaluations`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${state.user.token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        ...evaluationData,
        parent_user_id: state.user.id,
        provider_id: providerId
      })
    });

    if (response.ok) {
      alert('評價已成功提交！\n\n評價內容已鎖定，無法修改。');
      await fetchEvaluation(providerId);
      render();
    } else {
      const errorText = await response.text();
      if (errorText.includes('duplicate') || errorText.includes('unique')) {
        alert('您已經提交過評價了！');
        await fetchEvaluation(providerId);
        render();
      } else {
        alert('儲存失敗：' + errorText);
      }
    }
  } catch (error) {
    console.error('儲存評價失敗:', error);
    alert('儲存失敗，請稍後再試');
  }
}

// 儲存留言
async function saveComment(providerId) {
  if (!state.user) return;
  
  if (state.currentComment) {
    alert('您已提交過留言，無法重複提交或修改');
    return;
  }
  
  const commentText = document.getElementById('parentComment').value.trim();
  
  if (!commentText) {
    alert('請輸入留言內容');
    return;
  }
  
  if (!confirm('確定要提交留言嗎？\n\n留言提交後將無法修改或刪除，請確認內容無誤。')) {
    return;
  }
  
  try {
    const createRes = await fetch(
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
          comment: commentText
        })
      }
    );
    
    if (createRes.ok) {
      alert('留言已成功提交給管理員！\n\n留言內容已鎖定，無法修改。');
      await fetchComment(providerId);
      render();
    } else {
      const errorText = await createRes.text();
      if (errorText.includes('duplicate') || errorText.includes('unique')) {
        alert('您已經提交過留言了！');
        await fetchComment(providerId);
        render();
      } else {
        alert('提交留言失敗，請稍後再試');
      }
    }
  } catch (error) {
    console.error('儲存留言失敗:', error);
    alert('系統錯誤，請稍後再試');
  }
}

// 工具函數：切換頁面
function navigateTo(page) {
  state.currentPage = page;
  state.error = '';
  state.selectedProvider = null;
  state.currentEvaluation = null;
  render();
}

// 工具函數：切換留言顯示
function toggleComment(commentId) {
  const element = document.getElementById(commentId);
  if (element) {
    element.classList.toggle('hidden');
  }
}

// 工具函數：處理評價表單提交
function handleSubmitEvaluation(event, providerId) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const evaluationData = {};
  
  Object.values(EVALUATION_ITEMS).flat().forEach(item => {
    evaluationData[item.key] = formData.has(item.key);
  });

  saveEvaluation(providerId, evaluationData);
}
