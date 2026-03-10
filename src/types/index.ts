export type AssetType = 'CRYPTO' | 'STOCK'
export type ConditionType = 'ABOVE' | 'BELOW'
export type NotifyChannel = 'EMAIL' | 'DINGTALK'

export interface AlertRule {
  id: number
  name: string
  assetType: AssetType
  symbol: string
  conditionType: ConditionType
  thresholdPrice: number
  notifyChannel: NotifyChannel
  notifyTarget: string
  enabled: boolean
  cooldownMinutes: number
  lastTriggeredAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AlertRuleRequest {
  name: string
  assetType: AssetType
  symbol: string
  conditionType: ConditionType
  thresholdPrice: number
  notifyChannel: NotifyChannel
  notifyTarget: string
  cooldownMinutes?: number
}

export interface MarketPrice {
  symbol: string
  assetType: AssetType
  price: number
  fetchedAt: string
}
