import api from './api'

const paymentService = {
  async createPayment(data) {
    const response = await api.post('/payments', data)
    return response.data
  },

  async getMyPaymentHistory() {
    const response = await api.get('/payments/my-history')
    return response.data
  },

  async getPaymentByBooking(bookingId) {
    const response = await api.get(`/payments/booking/${bookingId}`)
    return response.data
  },

  async getReceipt(paymentId) {
    const response = await api.get(`/payments/${paymentId}/receipt`)
    return response.data
  },

  async getPayment(paymentId) {
    const response = await api.get(`/payments/${paymentId}`)
    return response.data
  },
}

export default paymentService
