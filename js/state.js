// 全域狀態管理
let state = {
  user: null,
  userRole: null,
  providerData: null,
  parentData: null,
  adminData: null,
  adminStats: {
    totalParents: 0,
    evaluatedParents: 0
  },
  assignedProviders: [],
  allProviders: [],
  selectedProviderForAdmin: null,
  providerEvaluationsDetail: [],
  currentEvaluation: null,
  currentComment: null,
  selectedProvider: null,
  evaluationStats: null,
  currentPage: 'home',
  error: ''
};
