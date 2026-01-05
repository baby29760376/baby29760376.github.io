// 管理員相關函數

// 獲取管理員資料
async function fetchAdminData() {
  if (!state.user) return;
  
  try {
    const adminRes = await fetch(`${SUPABASE_URL}/rest/v1/admins?user_id=eq.${state.user.id}&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${state.user.token}`
      }
    });
    
    if (adminRes.ok) {
      const adminData = await adminRes.json();
      state.adminData = adminData[0];
    }

    await fetchAllProvidersWithStats();
    render();
  } catch (error) {
    console.error('獲取管理員資料失敗:', error);
  }
}

// 獲取所有托育人員及其統計
async function fetchAllProvidersWithStats() {
  if (!state.user) return;
  
  try {
    const providersRes = await fetch(`${SUPABASE_URL}/rest/v1/child_care_providers?select=*&order=name`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${state.user.token}`
      }
    });
    
    if (!providersRes.ok) return;
    
    const providers = await providersRes.json();
    
    const statsRes = await fetch(`${SUPABASE_URL}/rest/v1/provider_evaluation_stats?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${state.user.token}`
      }
    });
    
    let stats = [];
    if (statsRes.ok) {
      stats = await statsRes.json();
    }
    
    state.allProviders = providers.map(provider => {
      const stat = stats.find(s => s.provider_id === provider.id);
      return {
        ...provider,
        stats: stat || {
          total_hearts: 0,
          total_parents: 0,
          communication_hearts: 0,
          activity_hearts: 0,
          routine_hearts: 0,
          relationship_hearts: 0
        }
      };
    });
    
    await fetchParentStats();
    await fetchCommentCounts();
  } catch (error) {
    console.error('獲取托育人員統計失敗:', error);
  }
}

// 獲取家長統計
async function fetchParentStats() {
  if (!state.user) return;
  
  try {
    const parentsRes = await fetch(`${SUPABASE_URL}/rest/v1/parents?select=user_id`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${state.user.token}`
      }
    });
    
    let totalParents = 0;
    let evaluatedParents = 0;
    
    if (parentsRes.ok) {
      const parents = await parentsRes.json();
      totalParents = parents.length;
      
      const evaluationsRes = await fetch(`${SUPABASE_URL}/rest/v1/evaluations?select=parent_user_id`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${state.user.token}`
        }
      });
      
      if (evaluationsRes.ok) {
        const evaluations = await evaluationsRes.json();
        const uniqueParents = new Set(evaluations.map(e => e.parent_user_id));
        evaluatedParents = uniqueParents.size;
      }
    }
    
    state.adminStats.totalParents = totalParents;
    state.adminStats.evaluatedParents = evaluatedParents;
    render();
  } catch (error) {
    console.error('獲取家長統計失敗:', error);
  }
}

// 獲取每位托育人員的留言數量
async function fetchCommentCounts() {
  if (!state.user) return;
  
  try {
    const commentsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/parent_comments?select=provider_id`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${state.user.token}`
        }
      }
    );
    
    if (commentsRes.ok) {
      const comments = await commentsRes.json();
      const commentCounts = {};
      
      comments.forEach(comment => {
        commentCounts[comment.provider_id] = (commentCounts[comment.provider_id] || 0) + 1;
      });
      
      setTimeout(() => {
        state.allProviders.forEach(provider => {
          const count = commentCounts[provider.id] || 0;
          const el = document.getElementById(`comment-count-${provider.id}`);
          if (el) el.textContent = count;
        });
      }, 100);
    }
  } catch (error) {
    console.error('獲取留言數量失敗:', error);
  }
}

// 獲取特定托育人員的詳細評價
async function fetchProviderDetailForAdmin(providerId) {
  if (!state.user) return;
  
  try {
    const evaluationsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/evaluations?provider_id=eq.${providerId}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${state.user.token}`
        }
      }
    );
    
    if (!evaluationsRes.ok) return;
    
    const evaluations = await evaluationsRes.json();
    
    const commentsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/parent_comments?provider_id=eq.${providerId}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${state.user.token}`
        }
      }
    );
    
    let comments = [];
    if (commentsRes.ok) {
      comments = await commentsRes.json();
    }
    
    const parentIds = [...new Set([
      ...evaluations.map(e => e.parent_user_id),
      ...comments.map(c => c.parent_user_id)
    ])];
    
    if (parentIds.length > 0) {
      const parentsRes = await fetch(
        `${SUPABASE_URL}/rest/v1/parents?user_id=in.(${parentIds.join(',')})&select=*`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${state.user.token}`
          }
        }
      );
      
      if (parentsRes.ok) {
        const parents = await parentsRes.json();
        
        state.providerEvaluationsDetail = evaluations.map(evaluation => {
          const parent = parents.find(p => p.user_id === evaluation.parent_user_id);
          const comment = comments.find(c => c.parent_user_id === evaluation.parent_user_id);
          return {
            ...evaluation,
            parent_name: parent ? parent.name : '未知家長',
            comment: comment ? comment.comment : null,
            comment_id: comment ? comment.id : null
          };
        });
        
        comments.forEach(comment => {
          const hasEvaluation = evaluations.some(e => e.parent_user_id === comment.parent_user_id);
          if (!hasEvaluation) {
            const parent = parents.find(p => p.user_id === comment.parent_user_id);
            state.providerEvaluationsDetail.push({
              parent_user_id: comment.parent_user_id,
              parent_name: parent ? parent.name : '未知家長',
              comment: comment.comment,
              comment_id: comment.id,
              updated_at: comment.updated_at,
              communication_1: false,
              communication_2: false,
              communication_3: false,
              communication_4: false,
              communication_5: false,
              activity_1: false,
              activity_2: false,
              activity_3: false,
              activity_4: false,
              activity_5: false,
              routine_1: false,
              routine_2: false,
              routine_3: false,
              routine_4: false,
              routine_5: false,
              relationship_1: false,
              relationship_2: false,
              relationship_3: false,
              relationship_4: false,
              relationship_5: false
            });
          }
        });
      }
    } else {
      state.providerEvaluationsDetail = [];
    }
    
    render();
  } catch (error) {
    console.error('獲取評價詳細資料失敗:', error);
  }
}

// 選擇托育人員（管理員視角）
async function selectProviderForAdmin(provider) {
  state.selectedProviderForAdmin = provider;
  await fetchProviderDetailForAdmin(provider.id);
  state.currentPage = 'admin-provider-detail';
  render();
}

// 計算家長給的愛心數
function calculateParentHearts(evaluation) {
  const categories = ['communication', 'activity', 'routine', 'relationship'];
  const result = {};
  
  categories.forEach(category => {
    const items = EVALUATION_ITEMS[category];
    let count = 0;
    items.forEach(item => {
      if (evaluation[item.key]) count++;
    });
    result[category] = count;
  });
  
  result.total = result.communication + result.activity + result.routine + result.relationship;
  return result;
}

// 切換評分細項顯示
function toggleEvaluationDetail(evalId) {
  const element = document.getElementById(`eval-detail-${evalId}`);
  if (element) {
    element.classList.toggle('hidden');
  }
}

// 渲染管理員總覽頁面
function renderAdminDashboard() {
  if (!state.user || state.userRole !== 'admin') {
    navigateTo('login');
    return '';
  }

  if (state.allProviders.length === 0) {
    return `
      <div class="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-12 text-center">
        <div class="animate-spin w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-gray-600">載入中...</p>
      </div>
    `;
  }

  return `
    <div class="max-w-6xl mx-auto">
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 px-8 py-6">
          <h2 class="text-3xl font-bold text-white flex items-center gap-3">
            <span>📊</span>
            托育人員管理總覽
          </h2>
          <p class="text-purple-100 mt-2">查看所有托育人員的評價統計</p>
        </div>

        <div class="p-8">
          <div class="grid md:grid-cols-3 gap-6 mb-8">
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200 text-center">
              <p class="text-sm font-semibold text-gray-600 mb-2">托育人員總數</p>
              <p class="text-5xl font-bold text-blue-500">${state.allProviders.length}</p>
              <p class="text-xs text-gray-500 mt-2">位托育人員</p>
            </div>
            <div class="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200 text-center">
              <p class="text-sm font-semibold text-gray-600 mb-2">家長總數</p>
              <p class="text-5xl font-bold text-green-500">${state.adminStats.totalParents}</p>
              <p class="text-xs text-gray-500 mt-2">位家長</p>
            </div>
            <div class="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200 text-center">
              <p class="text-sm font-semibold text-gray-600 mb-2">已評價的家長人數</p>
              <p class="text-5xl font-bold text-purple-500">${state.adminStats.evaluatedParents}</p>
              <p class="text-xs text-gray-500 mt-2">位已給予評價</p>
            </div>
          </div>

          <div class="space-y-4">
            <h3 class="text-xl font-bold text-gray-800 mb-4">托育人員列表</h3>
            ${state.allProviders.map(provider => `
              <div class="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-6 border-2 border-yellow-200 hover:border-yellow-400 hover:shadow-lg transition cursor-pointer"
                   onclick="selectProviderForAdmin(${JSON.stringify(provider).replace(/"/g, '&quot;')})">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
                      <span class="text-3xl">${provider.gender === '男' ? '👨‍🏫' : '👩‍🏫'}</span>
                    </div>
                    <div>
                      <h4 class="text-xl font-bold text-gray-800">${provider.name}</h4>
                      <p class="text-sm text-gray-600">${provider.gender} · @${provider.account}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-6">
                    <div class="text-center">
                      <p class="text-3xl font-bold text-red-500">${provider.stats.total_hearts || 0}</p>
                      <p class="text-xs text-gray-500">總愛心</p>
                    </div>
                    <div class="text-center">
                      <p class="text-3xl font-bold text-blue-500">${provider.stats.total_parents || 0}</p>
                      <p class="text-xs text-gray-500">評價人數</p>
                    </div>
                    <div class="text-center">
                      <p class="text-3xl font-bold text-orange-500" id="comment-count-${provider.id}">-</p>
                      <p class="text-xs text-gray-500">留言</p>
                    </div>
                    <button class="px-6 py-2 bg-gradient-to-r from-yellow-400 to-amber-400 text-white font-semibold rounded-lg hover:from-yellow-500 hover:to-amber-500 transition">
                      查看詳情 →
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

// 渲染管理員查看托育人員詳細頁面
function renderAdminProviderDetail() {
  if (!state.selectedProviderForAdmin) {
    navigateTo('admin-dashboard');
    return '';
  }

  const provider = state.selectedProviderForAdmin;
  const stats = provider.stats;

  return `
    <div class="max-w-5xl mx-auto">
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="bg-gradient-to-r from-purple-400 to-pink-400 px-8 py-8">
          <button onclick="navigateTo('admin-dashboard')" class="text-white hover:text-purple-100 mb-4 flex items-center gap-2">
            ← 返回總覽
          </button>
          <div class="flex items-center gap-6">
            <div class="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
              <span class="text-5xl">${provider.gender === '男' ? '👨‍🏫' : '👩‍🏫'}</span>
            </div>
            <div>
              <h2 class="text-3xl font-bold text-white mb-2">${provider.name}</h2>
              <p class="text-purple-100">${provider.gender} · @${provider.account}</p>
            </div>
          </div>
        </div>

        <!-- 修改評分說明 -->
        <div class="bg-blue-50 border-b-2 border-blue-200 px-8 py-4">
          <div class="flex items-start gap-3">
            <span class="text-2xl">ℹ️</span>
            <div class="flex-1">
              <p class="text-blue-800 font-semibold mb-2">評分修改說明</p>
              <p class="text-sm text-blue-700">
                評價資料由系統自動鎖定，若家長需要修改評分，請聯絡居托中心協助處理：<br>
                <strong>電話：02-29760376</strong> ｜ <strong>Email：baby29760376@gmail.com</strong>
              </p>
            </div>
          </div>
        </div>

        <div class="p-8 space-y-8">
          <div class="grid md:grid-cols-2 gap-6">
            <div class="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-xl border-2 border-red-200 text-center">
              <p class="text-sm font-semibold text-gray-600 mb-2">總愛心數</p>
              <p class="text-5xl font-bold text-red-500">${stats.total_hearts || 0}</p>
              <p class="text-xs text-gray-500 mt-2">共獲得的肯定</p>
            </div>
            
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200 text-center">
              <p class="text-sm font-semibold text-gray-600 mb-2">評價人數</p>
              <p class="text-5xl font-bold text-blue-500">${stats.total_parents || 0}</p>
              <p class="text-xs text-gray-500 mt-2">位家長給予評價</p>
            </div>
          </div>

          <div class="bg-gray-50 rounded-xl p-6">
            <h4 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>📊</span>
              四大主題獲得愛心數
            </h4>
            <div class="grid md:grid-cols-2 gap-4">
              <div class="bg-white p-4 rounded-lg border-2 border-purple-200">
                <div class="flex justify-between items-center">
                  <span class="font-semibold text-gray-700">一、保親溝通</span>
                  <span class="text-2xl font-bold text-purple-500">${stats.communication_hearts || 0}</span>
                </div>
              </div>

              <div class="bg-white p-4 rounded-lg border-2 border-green-200">
                <div class="flex justify-between items-center">
                  <span class="font-semibold text-gray-700">二、托育活動安排</span>
                  <span class="text-2xl font-bold text-green-500">${stats.activity_hearts || 0}</span>
                </div>
              </div>

              <div class="bg-white p-4 rounded-lg border-2 border-blue-200">
                <div class="flex justify-between items-center">
                  <span class="font-semibold text-gray-700">三、作息安排與生活習慣</span>
                  <span class="text-2xl font-bold text-blue-500">${stats.routine_hearts || 0}</span>
                </div>
              </div>

              <div class="bg-white p-4 rounded-lg border-2 border-pink-200">
                <div class="flex justify-between items-center">
                  <span class="font-semibold text-gray-700">四、保親關係</span>
                  <span class="text-2xl font-bold text-pink-500">${stats.relationship_hearts || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl border-2 border-gray-200">
            <div class="bg-gradient-to-r from-yellow-100 to-amber-100 px-6 py-4 border-b-2 border-yellow-200">
              <h4 class="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span>👥</span>
                家長評價明細
              </h4>
            </div>
            
            <div class="p-6">
              ${state.providerEvaluationsDetail.length === 0 ? `
                <div class="text-center py-12">
                  <div class="text-6xl mb-4">📋</div>
                  <p class="text-gray-500 text-lg">尚未有家長評價</p>
                </div>
              ` : `
                <div class="space-y-6">
                  ${state.providerEvaluationsDetail.map((evaluation, index) => {
                    const hearts = calculateParentHearts(evaluation);
                    const hasComment = evaluation.comment && evaluation.comment.trim() !== '';
                    return `
                      <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200">
                        <div class="flex items-center justify-between mb-4">
                          <div class="flex items-center gap-3">
                            <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow">
                              <span class="text-2xl">👤</span>
                            </div>
                            <div>
                              <h5 class="text-lg font-bold text-gray-800">${evaluation.parent_name}</h5>
                              <p class="text-xs text-gray-500">評價時間：${new Date(evaluation.updated_at).toLocaleDateString('zh-TW')}</p>
                            </div>
                          </div>
                          <div class="flex items-center gap-3">
                            <button onclick="toggleEvaluationDetail('${evaluation.id || index}')" 
                                    class="px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition flex items-center gap-2">
                              📝 查看評分細項
                            </button>
                            ${hasComment ? `
                              <button onclick="toggleComment('comment-${evaluation.id}')" 
                                      class="px-4 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition flex items-center gap-2">
                                💬 查看留言
                              </button>
                            ` : ''}
                            <div class="text-center bg-white px-4 py-2 rounded-lg border-2 border-red-200">
                              <p class="text-3xl font-bold text-red-500">${hearts.total}/20</p>
                              <p class="text-xs text-gray-500">總愛心</p>
                            </div>
                          </div>
                        </div>
                        
                        <!-- 留言區塊 -->
                        ${hasComment ? `
                          <div id="comment-${evaluation.id}" class="hidden mt-4 p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
                            <div class="flex items-start gap-2 mb-2">
                              <span class="text-lg">💬</span>
                              <div class="flex-1">
                                <p class="text-sm font-bold text-orange-800 mb-1">家長留言：</p>
                                <p class="text-gray-700 whitespace-pre-wrap">${evaluation.comment}</p>
                              </div>
                            </div>
                          </div>
                        ` : ''}
                        
                        <!-- 評分細項（預設隱藏） -->
                        <div id="eval-detail-${evaluation.id || index}" class="hidden mt-4 space-y-4 bg-white p-4 rounded-lg border-2 border-blue-200">
                          <h6 class="font-bold text-gray-800 mb-3">詳細評分項目</h6>
                          
                          <!-- 一、保親溝通 -->
                          <div>
                            <p class="font-semibold text-purple-700 mb-2">一、保親溝通 (${hearts.communication}/5)</p>
                            <div class="space-y-1 pl-4">
                              ${EVALUATION_ITEMS.communication.map(item => `
                                <div class="flex items-center gap-2 text-sm">
                                  <span class="text-lg">${evaluation[item.key] ? '❤️' : '🤍'}</span>
                                  <span class="${evaluation[item.key] ? 'text-gray-800' : 'text-gray-400'}">${item.text}</span>
                                </div>
                              `).join('')}
                            </div>
                          </div>
                          
                          <!-- 二、托育活動安排 -->
                          <div>
                            <p class="font-semibold text-green-700 mb-2">二、托育活動安排 (${hearts.activity}/5)</p>
                            <div class="space-y-1 pl-4">
                              ${EVALUATION_ITEMS.activity.map(item => `
                                <div class="flex items-center gap-2 text-sm">
                                  <span class="text-lg">${evaluation[item.key] ? '❤️' : '🤍'}</span>
                                  <span class="${evaluation[item.key] ? 'text-gray-800' : 'text-gray-400'}">${item.text}</span>
                                </div>
                              `).join('')}
                            </div>
                          </div>
                          
                          <!-- 三、作息安排與生活習慣 -->
                          <div>
                            <p class="font-semibold text-blue-700 mb-2">三、作息安排與生活習慣 (${hearts.routine}/5)</p>
                            <div class="space-y-1 pl-4">
                              ${EVALUATION_ITEMS.routine.map(item => `
                                <div class="flex items-center gap-2 text-sm">
                                  <span class="text-lg">${evaluation[item.key] ? '❤️' : '🤍'}</span>
                                  <span class="${evaluation[item.key] ? 'text-gray-800' : 'text-gray-400'}">${item.text}</span>
                                </div>
                              `).join('')}
                            </div>
                          </div>
                          
                          <!-- 四、保親關係 -->
                          <div>
                            <p class="font-semibold text-pink-700 mb-2">四、保親關係 (${hearts.relationship}/5)</p>
                            <div class="space-y-1 pl-4">
                              ${EVALUATION_ITEMS.relationship.map(item => `
                                <div class="flex items-center gap-2 text-sm">
                                  <span class="text-lg">${evaluation[item.key] ? '❤️' : '🤍'}</span>
                                  <span class="${evaluation[item.key] ? 'text-gray-800' : 'text-gray-400'}">${item.text}</span>
                                </div>
                              `).join('')}
                            </div>
                          </div>
                        </div>
                        
                        <!-- 四大主題統計 -->
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div class="bg-white p-3 rounded-lg text-center border border-purple-200">
                            <p class="text-xs text-gray-600 mb-1">保親溝通</p>
                            <p class="text-2xl font-bold text-purple-500">${hearts.communication}/5</p>
                            <p class="text-xs text-gray-500">${'❤️'.repeat(hearts.communication)}${'🤍'.repeat(5-hearts.communication)}</p>
                          </div>
                          <div class="bg-white p-3 rounded-lg text-center border border-green-200">
                            <p class="text-xs text-gray-600 mb-1">托育活動</p>
                            <p class="text-2xl font-bold text-green-500">${hearts.activity}/5</p>
                            <p class="text-xs text-gray-500">${'❤️'.repeat(hearts.activity)}${'🤍'.repeat(5-hearts.activity)}</p>
                          </div>
                          <div class="bg-white p-3 rounded-lg text-center border border-blue-200">
                            <p class="text-xs text-gray-600 mb-1">作息習慣</p>
                            <p class="text-2xl font-bold text-blue-500">${hearts.routine}/5</p>
                            <p class="text-xs text-gray-500">${'❤️'.repeat(hearts.routine)}${'🤍'.repeat(5-hearts.routine)}</p>
                          </div>
                          <div class="bg-white p-3 rounded-lg text-center border border-pink-200">
                            <p class="text-xs text-gray-600 mb
