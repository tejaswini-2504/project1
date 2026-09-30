import api from './api'

const bookingService = {
  async createBooking(data) {
    const response = await api.post('/bookings', data)
    return response.data
  },

  async getMyBookings(params = {}) {
    const response = await api.get('/bookings', { params })
    return response.data
  },

  async getBookingById(id) {
    const response = await api.get(`/bookings/${id}`)
    return response.data
  },

  async updateBookingStatus(id, status, note = '') {
    const response = await api.put(`/bookings/${id}/status`, { status, note })
    return response.data
  },
}

export default bookingService
