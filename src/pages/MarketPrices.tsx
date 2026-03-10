import { useState } from 'react'
import { Card, Col, Input, Row, Select, Spin, Tag, Typography } from 'antd'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { marketApi } from '../api'
import type { AssetType } from '../types'

const { Title } = Typography

export default function MarketPrices() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<AssetType | 'ALL'>('ALL')

  const { data: prices = [], isLoading } = useQuery({
    queryKey: ['market-prices'],
    queryFn: marketApi.getAll,
    refetchInterval: 15000,
  })

  const filtered = prices.filter(p => {
    const matchType = typeFilter === 'ALL' || p.assetType === typeFilter
    const matchSearch = p.symbol.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  return (
    <div style={{ padding: 24 }}>
      <Title level={3} style={{ marginBottom: 16 }}>市场行情</Title>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <Input.Search
          placeholder="搜索 symbol..."
          style={{ width: 240 }}
          value={search}
          onChange={e => setSearch(e.target.value)}
          allowClear
        />
        <Select
          value={typeFilter}
          onChange={setTypeFilter}
          style={{ width: 140 }}
          options={[
            { value: 'ALL', label: '全部类型' },
            { value: 'CRYPTO', label: '加密货币' },
            { value: 'STOCK', label: '股票' },
          ]}
        />
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#999', padding: 60 }}>暂无缓存价格数据（需要有启用的预警规则才会拉取价格）</div>
      ) : (
        <Row gutter={[16, 16]}>
          {filtered.map(p => (
            <Col key={`${p.symbol}-${p.assetType}`} xs={24} sm={12} md={8} lg={6}>
              <Card hoverable>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace' }}>
                    {p.symbol.toUpperCase()}
                  </span>
                  <Tag color={p.assetType === 'CRYPTO' ? 'purple' : 'blue'}>{p.assetType}</Tag>
                </div>
                <div style={{ fontSize: 28, fontFamily: 'monospace', margin: '12px 0 4px' }}>
                  ${Number(p.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: 12, color: '#999' }}>
                  更新于 {dayjs(p.fetchedAt).format('HH:mm:ss')}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}
