const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export const API = {
  VOTINGS: {
    ACTIVE: `${BASE_URL}/votings/active`,
    CREATE: `${BASE_URL}/votings`,
    // 其他接口...
  }
}
