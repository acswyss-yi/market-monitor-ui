import { useState } from 'react'
import {
  Button, Drawer, Form, Input, InputNumber, message,
  Popconfirm, Select, Switch, Table, Tag, Tooltip, Typography,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { alertRuleApi } from '../api'
import type { AlertRule, AlertRuleRequest } from '../types'

const { Title } = Typography

export default function AlertRules() {
  const queryClient = useQueryClient()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<AlertRule | null>(null)
  const [form] = Form.useForm<AlertRuleRequest>()

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['alert-rules'],
    queryFn: alertRuleApi.list,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['alert-rules'] })

  const createMutation = useMutation({
    mutationFn: alertRuleApi.create,
    onSuccess: () => { message.success('规则已创建'); closeDrawer(); invalidate() },
    onError: () => message.error('创建失败'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AlertRuleRequest }) => alertRuleApi.update(id, data),
    onSuccess: () => { message.success('规则已更新'); closeDrawer(); invalidate() },
    onError: () => message.error('更新失败'),
  })

  const toggleMutation = useMutation({
    mutationFn: alertRuleApi.toggle,
    onSuccess: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: alertRuleApi.delete,
    onSuccess: () => { message.success('规则已删除'); invalidate() },
  })

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    setDrawerOpen(true)
  }

  const openEdit = (rule: AlertRule) => {
    setEditing(rule)
    form.setFieldsValue(rule)
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditing(null)
    form.resetFields()
  }

  const onSubmit = (values: AlertRuleRequest) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: values })
    } else {
      createMutation.mutate(values)
    }
  }

  const notifyChannel = Form.useWatch('notifyChannel', form)
  const assetType = Form.useWatch('assetType', form)

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>预警规则</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新建规则</Button>
      </div>

      <Table
        dataSource={rules}
        rowKey="id"
        loading={isLoading}
        columns={[
          { title: '名称', dataIndex: 'name', width: 160 },
          {
            title: '资产',
            width: 140,
            render: (_, r) => (
              <>
                <Tag color={r.assetType === 'CRYPTO' ? 'purple' : 'blue'}>{r.assetType}</Tag>
                <span style={{ fontFamily: 'monospace' }}>{r.symbol.toUpperCase()}</span>
              </>
            ),
          },
          {
            title: '触发条件',
            width: 180,
            render: (_, r) => (
              <Tag color={r.conditionType === 'ABOVE' ? 'red' : 'green'}>
                {r.conditionType === 'ABOVE' ? '价格高于' : '价格低于'} ${Number(r.thresholdPrice).toLocaleString()}
              </Tag>
            ),
          },
          {
            title: '联系方式',
            dataIndex: 'notifyTarget',
            width: 200,
            render: (v: string, r: AlertRule) => {
              const maskToken = (url: string) => {
                return url.replace(/(access_token=)([^&]+)/, (_, prefix, token) => {
                  const tail = token.slice(-6)
                  return `${prefix}****${tail}`
                })
              }
              const display = r.notifyChannel === 'DINGTALK' ? maskToken(v) : v
              return (
                <Tooltip title={display}>
                  <span style={{
                    display: 'inline-block', maxWidth: 180,
                    overflow: 'hidden', textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap', verticalAlign: 'bottom',
                    fontFamily: 'monospace', fontSize: 12,
                  }}>
                    {display}
                  </span>
                </Tooltip>
              )
            },
          },
          {
            title: '通知方式',
            dataIndex: 'notifyChannel',
            width: 100,
            render: (v: string) => <Tag>{v}</Tag>,
          },
          {
            title: '冷却',
            dataIndex: 'cooldownMinutes',
            width: 80,
            render: (v: number) => `${v}min`,
          },
          {
            title: '上次触发',
            dataIndex: 'lastTriggeredAt',
            width: 140,
            render: (v: string | null) => v ? dayjs(v).format('MM-DD HH:mm') : '—',
          },
          {
            title: '启用',
            width: 80,
            render: (_, r) => (
              <Switch
                checked={r.enabled}
                loading={toggleMutation.isPending}
                onChange={() => toggleMutation.mutate(r.id)}
              />
            ),
          },
          {
            title: '操作',
            width: 120,
            render: (_, r) => (
              <>
                <Button type="link" size="small" onClick={() => openEdit(r)}>编辑</Button>
                <Popconfirm title="确认删除该规则？" onConfirm={() => deleteMutation.mutate(r.id)}>
                  <Button type="link" size="small" danger>删除</Button>
                </Popconfirm>
              </>
            ),
          },
        ]}
      />

      <Drawer
        title={editing ? '编辑规则' : '新建规则'}
        open={drawerOpen}
        onClose={closeDrawer}
        width={480}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={closeDrawer} style={{ marginRight: 8 }}>取消</Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={createMutation.isPending || updateMutation.isPending}
            >
              保存
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <Form.Item name="name" label="规则名称" rules={[{ required: true }]}>
            <Input placeholder="例如：BTC跌破8万预警" />
          </Form.Item>

          <Form.Item name="assetType" label="资产类型" rules={[{ required: true }]}>
            <Select options={[{ value: 'CRYPTO', label: '加密货币' }, { value: 'STOCK', label: '股票' }]} />
          </Form.Item>

          <Form.Item name="symbol" label="Symbol" rules={[{ required: true }]}
            help={assetType === 'CRYPTO' ? '使用 CoinGecko ID，如 bitcoin、ethereum' : '使用股票代码，如 AAPL、TSLA'}
          >
            <Input placeholder="bitcoin / AAPL" />
          </Form.Item>

          <Form.Item name="conditionType" label="触发条件" rules={[{ required: true }]}>
            <Select options={[{ value: 'ABOVE', label: '价格高于阈值' }, { value: 'BELOW', label: '价格低于阈值' }]} />
          </Form.Item>

          <Form.Item name="thresholdPrice" label="阈值价格 ($)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} precision={2} placeholder="80000" />
          </Form.Item>

          <Form.Item name="notifyChannel" label="通知方式" rules={[{ required: true }]}>
            <Select options={[{ value: 'EMAIL', label: '邮件' }, { value: 'DINGTALK', label: '钉钉' }]} />
          </Form.Item>

          <Form.Item
            name="notifyTarget"
            label={notifyChannel === 'DINGTALK' ? '钉钉 Webhook URL' : '邮箱地址'}
            rules={[{ required: true }]}
          >
            <Input placeholder={notifyChannel === 'DINGTALK' ? 'https://oapi.dingtalk.com/robot/send?access_token=...' : 'user@example.com'} />
          </Form.Item>

          <Form.Item name="cooldownMinutes" label="冷却时间（分钟）">
            <InputNumber style={{ width: '100%' }} min={1} placeholder="60" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}
