// 家長頁面渲染

function renderEvaluatePage() {
  if (!state.user || state.userRole !== 'parent') {
    navigateTo('login');
    return '';
  }

  // 如果家長資料還在載入中
  if (!state.parentData) {
    return `
      <div class="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-12 text-center">
        <div class="animate-spin w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-gray-600">載入中...</p>
      </div>
    `;
  }

  if (state.assignedProviders.length === 0) {
    return `
      <div class="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-12 text-center">
        <div class="text-6xl mb-4">👶</div>
        <h3 class="text-2xl font-bold text-gray-800 mb-2">尚未分配托育人員</h3>
        <p class="text-gray-600">請聯絡管理員為您分配可評價的托育人員</p>
      </div>
    `;
  }

  return `
    <div class="max-w-5xl mx-auto space-y-6">
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

      <!-- 家長個人資訊卡片 -->
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="bg-gradient-to-r from-blue-400 to-indigo-400 px-8 py-6">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-white rounded-full shadow-lg overflow-hidden">
              <img src="images/parent-avatar.png" alt="家長" class="block w-full h-full object-cover">
            </div>
            <div>
              <h2 class="text-2xl font-bold text-white">${escapeHtml(state.parentData.name)}</h2>
              <p class="text-blue-100">${escapeHtml(state.parentData.email)}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 原有的托育人員列表 -->
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="bg-gradient-to-r from-yellow-400 to-amber-400 px-8 py-6">
          <h2 class="text-lg md:text-3xl font-bold text-white flex items-center gap-3 break-words">
            <span>❤️</span>
            評價托育人員
          </h2>
          <p class="text-yellow-100 mt-2">點選托育人員進行評價</p>
        </div>

        <div class="p-8">
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${state.assignedProviders.map(provider => `
              <div class="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border-2 border-yellow-200 hover:border-yellow-400 hover:shadow-lg transition cursor-pointer"
                   onclick="selectProvider('${safeId(provider.id)}')">
                <div class="flex flex-col items-center text-center">
                  <div class="w-24 h-24 bg-white rounded-full mb-4 shadow-md overflow-hidden">
                    <img src="images/provider-avatar.png" alt="托育人員" class="block w-full h-full object-cover transform scale-110">
                  </div>
                  <h3 class="text-xl font-bold text-gray-800 mb-3">${escapeHtml(provider.name)}</h3>
                  <button class="px-6 py-2 bg-gradient-to-r from-yellow-400 to-amber-400 text-white font-semibold rounded-lg hover:from-yellow-500 hover:to-amber-500 transition">
                    開始評價
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

// 只接收經 safeId() 驗證的 ID，再從 state 取回完整資料（不把整個物件序列化進 onclick）
async function selectProvider(providerId) {
  const provider = state.assignedProviders.find(p => String(p.id) === providerId);
  if (!provider) return;
  state.selectedProvider = provider;
  await fetchEvaluation(provider.id);
  await fetchComment(provider.id);
  state.currentPage = 'evaluate-detail';
  render();
}

function renderEvaluateDetailPage() {
  if (!state.selectedProvider) {
    navigateTo('evaluate');
    return '';
  }

  const provider = state.selectedProvider;
  const evaluation = state.currentEvaluation || {};
  
  const hasEvaluated = evaluation.id && Object.keys(evaluation).some(key => 
    key.startsWith('communication_') || 
    key.startsWith('activity_') || 
    key.startsWith('routine_') || 
    key.startsWith('relationship_')
  );

  const hearts = calculateParentHearts(evaluation);

  return `
    <div class="max-w-4xl mx-auto">
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        ${renderProviderHeader(provider, hasEvaluated)}
        ${hasEvaluated ? renderEvaluatedBanner() : renderNotEvaluatedBanner()}
        ${hasEvaluated ? renderParentStats(hearts) : ''}
        <div class="p-8">
          ${hasEvaluated ? renderEvaluationReadOnly(evaluation) : renderEvaluationForm(provider.id, evaluation)}
          ${renderCommentSection(provider.id)}
        </div>
      </div>
    </div>
  `;
}

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

function renderProviderHeader(provider, hasEvaluated) {
  return `
    <div class="bg-gradient-to-r from-yellow-400 to-amber-400 px-8 py-8">
      <button onclick="navigateTo('evaluate')" class="text-white hover:text-yellow-100 mb-4 flex items-center gap-2">
        ← 返回列表
      </button>
      <div class="flex items-center gap-6">
        <div class="w-28 h-28 bg-white rounded-full shadow-lg overflow-hidden">
          <img src="images/provider-avatar.png" alt="托育人員" class="block w-full h-full object-cover transform scale-110">
        </div>
        <div>
          <h2 class="text-3xl font-bold text-white mb-2">${escapeHtml(provider.name)}</h2>
          <p class="text-yellow-100">${hasEvaluated ? '您已完成評價' : '正在評價這位托育人員'}</p>
        </div>
      </div>
    </div>
  `;
}

function renderEvaluatedBanner() {
  return `
    <div class="bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-4 border-b-2 border-green-200">
      <p class="text-green-800 flex items-center gap-2 font-semibold">
        <span>✅</span>
        您已提交評價，評價內容已鎖定無法修改
      </p>
      <p class="text-green-700 text-sm mt-2">
        如需修改評價，請撥打三重居托中心電話：<a href="tel:${CENTER_INFO.phone}" class="font-bold underline hover:text-green-900">${CENTER_INFO.phone}</a>
      </p>
    </div>
  `;
}

function renderNotEvaluatedBanner() {
  return `
    <div class="bg-yellow-50 px-8 py-4 border-b-2 border-yellow-200">
      <p class="text-yellow-800 flex items-center gap-2">
        <span>⚠️</span>
        <strong>請注意：評價只能提交一次，提交後將無法修改，請謹慎填寫。</strong>
      </p>
      <p class="text-yellow-700 text-sm mt-2">
        如需修改評價，請撥打三重居托中心電話：<a href="tel:${CENTER_INFO.phone}" class="font-bold underline hover:text-yellow-900">${CENTER_INFO.phone}</a>
      </p>
    </div>
  `;
}

function renderParentStats(hearts) {
  return `
    <div class="bg-gradient-to-r from-pink-50 to-red-50 px-8 py-6 border-b-2 border-pink-200">
      <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span>❤️</span>
        您給予的評價統計
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="bg-white p-4 rounded-lg text-center border-2 border-purple-200">
          <p class="text-sm text-gray-600 mb-1">保親溝通</p>
          <p class="text-2xl font-bold text-purple-500">${hearts.communication}/5</p>
          <p class="text-xs text-gray-500 mt-1">${'❤️'.repeat(hearts.communication)}${'🤍'.repeat(5-hearts.communication)}</p>
        </div>
        <div class="bg-white p-4 rounded-lg text-center border-2 border-green-200">
          <p class="text-sm text-gray-600 mb-1">托育活動</p>
          <p class="text-2xl font-bold text-green-500">${hearts.activity}/5</p>
          <p class="text-xs text-gray-500 mt-1">${'❤️'.repeat(hearts.activity)}${'🤍'.repeat(5-hearts.activity)}</p>
        </div>
        <div class="bg-white p-4 rounded-lg text-center border-2 border-blue-200">
          <p class="text-sm text-gray-600 mb-1">作息習慣</p>
          <p class="text-2xl font-bold text-blue-500">${hearts.routine}/5</p>
          <p class="text-xs text-gray-500 mt-1">${'❤️'.repeat(hearts.routine)}${'🤍'.repeat(5-hearts.routine)}</p>
        </div>
        <div class="bg-white p-4 rounded-lg text-center border-2 border-pink-200">
          <p class="text-sm text-gray-600 mb-1">保親關係</p>
          <p class="text-2xl font-bold text-pink-500">${hearts.relationship}/5</p>
          <p class="text-xs text-gray-500 mt-1">${'❤️'.repeat(hearts.relationship)}${'🤍'.repeat(5-hearts.relationship)}</p>
        </div>
        <div class="bg-gradient-to-br from-red-100 to-pink-100 p-4 rounded-lg text-center border-2 border-red-300">
          <p class="text-sm text-gray-600 mb-1">總愛心數</p>
          <p class="text-3xl font-bold text-red-500">${hearts.total}/20</p>
          <p class="text-xs text-gray-500 mt-1">💝 ${Math.round(hearts.total/20*100)}%</p>
        </div>
      </div>
    </div>
  `;
}

function renderEvaluationReadOnly(evaluation) {
  return `
    <div class="space-y-6 opacity-75">
      ${renderEvaluationSectionReadOnly('一、保親溝通', 'communication', EVALUATION_ITEMS.communication, evaluation)}
      ${renderEvaluationSectionReadOnly('二、托育活動安排', 'activity', EVALUATION_ITEMS.activity, evaluation)}
      ${renderEvaluationSectionReadOnly('三、作息安排與生活習慣', 'routine', EVALUATION_ITEMS.routine, evaluation)}
      ${renderEvaluationSectionReadOnly('四、保親關係', 'relationship', EVALUATION_ITEMS.relationship, evaluation)}
    </div>
    
    <div class="mt-8 text-center py-8 bg-green-50 rounded-xl border-2 border-green-200">
      <div class="text-6xl mb-4">✅</div>
      <p class="text-xl font-bold text-green-700 mb-2">評價已提交</p>
      <p class="text-gray-600">您的評價內容已鎖定，無法修改</p>
      <p class="text-sm text-green-700 mt-3">如需修改評價，請聯絡三重居托中心</p>
    </div>
  `;
}

function renderEvaluationSectionReadOnly(title, category, items, evaluation) {
  return `
    <div class="mb-8">
      <h3 class="text-lg font-bold text-gray-700 mb-4 pb-2 border-b-2 border-gray-200">${title}</h3>
      <div class="space-y-3">
        ${items.map(item => `
          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span class="text-2xl">${evaluation[item.key] ? '❤️' : '🤍'}</span>
            <label class="flex-1 text-gray-600 cursor-not-allowed">
              ${item.text}
            </label>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderEvaluationForm(providerId, evaluation) {
  return `
    <form id="evaluationForm" onsubmit="handleSubmitEvaluation(event, '${safeId(providerId)}')">
      ${renderEvaluationSection('一、保親溝通', 'communication', EVALUATION_ITEMS.communication, evaluation)}
      ${renderEvaluationSection('二、托育活動安排', 'activity', EVALUATION_ITEMS.activity, evaluation)}
      ${renderEvaluationSection('三、作息安排與生活習慣', 'routine', EVALUATION_ITEMS.routine, evaluation)}
      ${renderEvaluationSection('四、保親關係', 'relationship', EVALUATION_ITEMS.relationship, evaluation)}

      <div class="mt-8 space-y-4">
        <button type="submit" class="w-full py-4 bg-gradient-to-r from-yellow-400 to-amber-400 text-white font-bold text-lg rounded-lg hover:from-yellow-500 hover:to-amber-500 transition shadow-lg">
          提交評價（僅此一次）
        </button>
        
        <button type="button" onclick="navigateTo('evaluate')" class="w-full px-8 py-4 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition">
          取消
        </button>
        
        <p class="text-center text-sm text-red-600">
          ⚠️ 提交後將無法修改，請確認所有評價項目都已正確勾選
        </p>
      </div>
    </form>
  `;
}

function renderEvaluationSection(title, category, items, evaluation) {
  return `
    <div class="mb-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200">
      <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span class="text-2xl">💝</span>
        ${title}
      </h3>
      <div class="space-y-3">
        ${items.map(item => `
          <div class="bg-white p-4 rounded-lg border border-gray-200 hover:border-yellow-400 transition">
            <label class="flex items-center gap-4 cursor-pointer">
              <input type="checkbox" 
                     name="${item.key}" 
                     class="heart-checkbox"
                     ${evaluation[item.key] ? 'checked' : ''}>
              <span class="text-gray-700 flex-1">${item.text}</span>
            </label>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderCommentSection(providerId) {
  return `
    <div class="mt-8 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border-2 border-orange-200">
      <h3 class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
        <span>💬</span>
        給三重居托中心管理員的文字留言（選填）
      </h3>
      <p class="text-sm text-gray-600 mb-4">
        如果您有任何建議或認為需要改善的地方，可以在此留言給管理員。<br>
        <strong class="text-orange-700">此留言只有三重居托中心管理人員能看到，托育人員不會看到您的留言內容。</strong>
        ${state.currentComment ? '<br><strong class="text-red-600">留言提交後無法修改，請謹慎填寫。</strong>' : '<br><strong class="text-red-600">⚠️ 留言只能提交一次，提交後無法修改，請謹慎填寫。</strong>'}
      </p>
      
      ${state.currentComment ? renderSubmittedComment() : renderCommentInput(providerId)}
    </div>
  `;
}

function renderSubmittedComment() {
  return `
    <div class="bg-white border-2 border-orange-300 rounded-lg p-4 mb-4">
      <div class="flex items-start gap-2 mb-2">
        <span class="text-lg">💬</span>
        <div class="flex-1">
          <p class="text-sm font-bold text-green-700 mb-2">您已提交留言給管理員：</p>
          <p class="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded">${escapeHtml(state.currentComment.comment)}</p>
          <p class="text-xs text-gray-500 mt-2">提交時間：${new Date(state.currentComment.created_at).toLocaleString('zh-TW')}</p>
        </div>
      </div>
    </div>
    <div class="text-center py-4 bg-green-50 rounded-lg border-2 border-green-200">
      <p class="text-green-700 font-semibold">✅ 留言已提交，無法修改</p>
      <p class="text-xs text-gray-600 mt-1">三重居托中心人員會查看您的留言並進行處理</p>
      <p class="text-xs text-green-700 mt-2">如需修改留言，請聯絡三重居托中心：<a href="tel:${CENTER_INFO.phone}" class="font-bold underline hover:text-green-900">${CENTER_INFO.phone}</a></p>
    </div>
  `;
}

function renderCommentInput(providerId) {
  return `
    <textarea id="parentComment" 
              rows="5" 
              placeholder="請輸入您的建議或意見..."
              class="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:border-orange-400 focus:outline-none transition resize-none"></textarea>
    
    <button onclick="saveComment('${safeId(providerId)}')" 
            class="mt-4 w-full py-3 bg-gradient-to-r from-orange-400 to-red-400 text-white font-bold rounded-lg hover:from-orange-500 hover:to-red-500 transition shadow-lg">
      📨 提交留言給管理員（僅此一次）
    </button>
    
    <p class="text-xs text-gray-500 mt-2 text-center">
      ⚠️ 請注意：留言提交後將無法修改或刪除
    </p>
  `;
}

function handleSubmitEvaluation(event, providerId) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const evaluationData = {};
  
  Object.values(EVALUATION_ITEMS).flat().forEach(item => {
    evaluationData[item.key] = formData.has(item.key);
  });

  saveEvaluation(providerId, evaluationData);
}
