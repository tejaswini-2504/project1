import api from './api'

const providerService = {
  async getProviders(params = {}) {
    const response = await api.get('/providers', { params })
    return response.data
  },

  async getProviderById(id) {
    const response = await api.get(`/providers/${id}`)
    return response.data
  },

  async createProviderProfile(data) {
    const response = await api.post('/providers', data)
    return response.data
  },

  async updateProviderProfile(id, data) {
    const response = await api.put(`/providers/${id}`, data)
    return response.data
  },

  async getProviderReviews(id) {
    const response = await api.get(`/providers/${id}/reviews`)
    return response.data
  },

  async getCategories() {
    const response = await api.get('/categories')
    return response.data
  },

  async getServices(params = {}) {
    const response = await api.get('/services', { params })
    return response.data
  },
}

export default providerService
