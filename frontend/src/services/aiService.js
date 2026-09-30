import api from './api'

const aiService = {
  async analyzeProblem(problem, location = '') {
    const response = await api.post('/ai/help', { problem, location })
    return response.data
  },

  async getPriceEstimate(serviceId, details = '') {
    const response = await api.post('/ai/estimate', { service_id: serviceId, details })
    return response.data
  },
}

export default aiService
