import api from './api'

const authService = {
  async register(data) {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  async login(email, password) {
    const response = await api.post('/auth/login', {
      username: email.trim(),
      email: email.trim(),
      password,
    })
    return response.data
  },


  async getMe() {
    const response = await api.get('/auth/me')
    return response.data
  },

  logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
  },
}

export default authService
