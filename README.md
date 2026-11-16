# childcare-system

托育人員鼓勵機制系統的前端（純靜態網頁，可部署於 GitHub Pages）。

後端（Supabase 資料表、權限設定、本機測試帳號）請見 [childcare-supabase](https://github.com/baby29760376/childcare-supabase)。

## 部署前必填設定

公開版的 `js/config.js` 只放佔位值。未設定時，頁面頂端會顯示「系統尚未設定」。

1. **Supabase 連線**：把 `SUPABASE_URL` 與 `SUPABASE_ANON_KEY` 換成自己專案的值（Supabase Dashboard > Project Settings > API）。
   - 只能填 **anon (public) key**。`service_role` key 能略過所有權限，絕對不可放進前端或提交到 repository。
   - anon key 本來就會出現在瀏覽器端，資料安全靠資料庫的 RLS 與權限設定，請依後端 README 的「部署安全檢查清單」逐項設定。
2. **單位聯絡資訊**：把 `CENTER_INFO` 改成自己單位的名稱、簡稱、地址、電話、Email。`fax`、`website`、`facebook` 留空字串即不顯示。

## 本機開發

連本機 Supabase 時不必修改 `js/config.js`：

```bash
cp js/config.local.example.js js/config.local.js   # 連本機 Supabase（此檔已被 gitignore）
python3 -m http.server 3000                         # 開啟 http://localhost:3000
```

`js/config.local.js` 只在 `localhost` / `127.0.0.1` 載入，其他網域不會讀取。本機 Supabase 的啟動方式與測試帳號見後端 README。
