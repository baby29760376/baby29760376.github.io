// 複製為 js/config.local.js 即連本機 Supabase（npx supabase start）；刪除或改名即連回正式環境。
// 此 key 為 Supabase CLI 公開的本機 demo key。
window.SUPABASE_OVERRIDE = {
  url: 'http://127.0.0.1:54321',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
};
