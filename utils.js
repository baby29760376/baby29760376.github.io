// 工具函數

// ── 眼睛圖示（顯示/隱藏密碼） ────────────────────────────────────
const EYE_ICONS = {
  // 眼睛張開（密碼可見時顯示，點擊可隱藏）
  open: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>`,
  // 眼睛關閉（密碼隱藏時顯示，點擊可顯示）
  closed: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>`
};

// 切換密碼顯示/隱藏
function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  const btn = input ? input.nextElementSibling : null;
  if (!input || !btn) return;

  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = EYE_ICONS.open;
  } else {
    input.type = 'password';
    btn.innerHTML = EYE_ICONS.closed;
  }
}
