import axios from 'axios'
import type { AlertRule, AlertRuleRequest, MarketPrice } from '../types'

const http = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
})

// Alert Rules
export const alertRuleApi = {
  list: () => http.get<AlertRule[]>('/alert-rules').then(r => r.data),
  getById: (id: number) => http.get<AlertRule>(`/alert-rules/${id}`).then(r => r.data),
  create: (data: AlertRuleRequest) => http.post<AlertRule>('/alert-rules', data).then(r => r.data),
  update: (id: number, data: AlertRuleRequest) => http.put<AlertRule>(`/alert-rules/${id}`, data).then(r => r.data),
  toggle: (id: number) => http.patch<AlertRule>(`/alert-rules/${id}/toggle`).then(r => r.data),
  delete: (id: number) => http.delete(`/alert-rules/${id}`),
}

// Market Data
export const marketApi = {
  getAll: () => http.get<MarketPrice[]>('/market-data/all').then(r => r.data),
  getPrice: (symbol: string, type: string) =>
    http.get<MarketPrice>('/market-data', { params: { symbol, type } }).then(r => r.data),
}
