// 主程式進入點

function init() {
  // 偵測是否從重置密碼信件來的
  const hash = window.location.hash;
  if (hash.includes('type=recovery') && hash.includes('access_token')) {
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get('access_token');

    if (accessToken) {
      // 把 token 存起來，跳到改密碼頁
      state.user = {
        id: null,
        email: null,
        token: accessToken,
        role: null,
        password_changed: false,
        isRecovery: true
      };
      state.currentPage = 'change-password';
      fetchNews();
      render();
      return;
    }
  }

  checkUser();
  fetchNews();
  render();
}

// 當 DOM 載入完成後執行初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
