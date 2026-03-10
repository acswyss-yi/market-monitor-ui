import { useQuery } from '@tanstack/react-query'
import { Card, Col, Row, Statistic, Table, Tag, Typography } from 'antd'
import { AlertOutlined, CheckCircleOutlined, StockOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { alertRuleApi, marketApi } from '../api'

const { Title } = Typography

export default function Dashboard() {
  const { data: rules = [] } = useQuery({
    queryKey: ['alert-rules'],
    queryFn: alertRuleApi.list,
    refetchInterval: 30000,
  })

  const { data: prices = [] } = useQuery({
    queryKey: ['market-prices'],
    queryFn: marketApi.getAll,
    refetchInterval: 15000,
  })

  const activeRules = rules.filter(r => r.enabled).length
  const triggeredToday = rules.filter(r => r.lastTriggeredAt &&
    dayjs(r.lastTriggeredAt).isAfter(dayjs().startOf('day'))
  ).length

  const recentTriggered = rules
    .filter(r => r.lastTriggeredAt)
    .sort((a, b) => dayjs(b.lastTriggeredAt!).valueOf() - dayjs(a.lastTriggeredAt!).valueOf())
    .slice(0, 5)

  return (
    <div style={{ padding: 24 }}>
      <Title level={3} style={{ marginBottom: 24 }}>Dashboard</Title>

      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="活跃规则"
              value={activeRules}
              suffix={`/ ${rules.length}`}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="今日触发"
              value={triggeredToday}
              prefix={<AlertOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="监控资产"
              value={prices.length}
              prefix={<StockOutlined style={{ color: '#1677ff' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Price Cards */}
      {prices.length > 0 && (
        <>
          <Title level={5} style={{ marginBottom: 12 }}>实时价格</Title>
          <Row gutter={12} style={{ marginBottom: 24 }}>
            {prices.map(p => (
              <Col key={`${p.symbol}-${p.assetType}`} span={6}>
                <Card size="small">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>{p.symbol.toUpperCase()}</span>
                    <Tag color={p.assetType === 'CRYPTO' ? 'purple' : 'blue'}>{p.assetType}</Tag>
                  </div>
                  <div style={{ fontSize: 20, fontFamily: 'monospace', marginTop: 8 }}>
                    ${Number(p.price).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                    {dayjs(p.fetchedAt).format('HH:mm:ss')}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}

      {/* Recent Triggered */}
      <Title level={5} style={{ marginBottom: 12 }}>最近触发</Title>
      <Table
        dataSource={recentTriggered}
        rowKey="id"
        size="small"
        pagination={false}
        columns={[
          { title: '规则名称', dataIndex: 'name' },
          { title: '资产', dataIndex: 'symbol', render: (v: string) => v.toUpperCase() },
          {
            title: '条件',
            render: (_, r) => (
              <Tag color={r.conditionType === 'ABOVE' ? 'red' : 'green'}>
                {r.conditionType === 'ABOVE' ? '高于' : '低于'} ${r.thresholdPrice}
              </Tag>
            ),
          },
          {
            title: '上次触发',
            dataIndex: 'lastTriggeredAt',
            render: (v: string) => dayjs(v).format('MM-DD HH:mm'),
          },
        ]}
      />
    </div>
  )
}
