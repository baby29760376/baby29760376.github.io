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

// ── XSS 防護 ─────────────────────────────────────────────────────
// 所有來自資料庫或使用者輸入的值，插入 innerHTML 樣板字串前都必須經過下列函數處理。

// 將文字轉為可安全放入 HTML 內文或「加引號的」屬性值的字串（& < > " '）
function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 只允許 UUID 或正整數 ID，供 onclick="fn('${safeId(id)}')" 與 id 屬性使用；
// 其餘一律回傳空字串（此字元集不含引號、反斜線或 HTML 特殊字元，可直接放入 JS 字串與屬性）
const SAFE_ID_PATTERN = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|\d{1,18})$/i;
function safeId(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  return SAFE_ID_PATTERN.test(str) ? str : '';
}

// 圖片網址只允許絕對 https: URL，其餘（javascript:、data:、http:、相對路徑等）回傳空字串；
// 回傳值仍須以 escapeHtml 放入屬性
function safeImageUrl(value) {
  if (typeof value !== 'string' || value.trim() === '') return '';
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' ? url.href : '';
  } catch (e) {
    return '';
  }
}

// 富文字 HTML（如 news.content_html）以 DOMPurify 清理；DOMPurify 未載入時退回跳脫，絕不輸出原始 HTML
const SANITIZE_CONFIG = {
  USE_PROFILES: { html: true },
  FORBID_TAGS: ['style', 'form', 'input', 'button', 'textarea', 'select', 'option']
};
function sanitizeHtml(html) {
  if (html === null || html === undefined) return '';
  const purifier = typeof window !== 'undefined' ? window.DOMPurify : undefined;
  if (purifier && purifier.isSupported && typeof purifier.sanitize === 'function') {
    return purifier.sanitize(String(html), SANITIZE_CONFIG);
  }
  console.warn('DOMPurify 未載入，富文字內容改以純文字顯示');
  return escapeHtml(html);
}
