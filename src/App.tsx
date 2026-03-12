import { Layout, Menu } from 'antd'
import { DashboardOutlined, AlertOutlined, LineChartOutlined } from '@ant-design/icons'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import AlertRules from './pages/AlertRules'
import MarketPrices from './pages/MarketPrices'

const { Sider, Content, Header } = Layout

const navItems = [
  { key: '/', icon: <DashboardOutlined />, label: <Link to="/">Dashboard</Link> },
  { key: '/rules', icon: <AlertOutlined />, label: <Link to="/rules">预警规则</Link> },
  { key: '/prices', icon: <LineChartOutlined />, label: <Link to="/prices">市场行情</Link> },
]

export default function App() {
  const { pathname } = useLocation()

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark" width={200}>
        <div style={{
          height: 64, display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 700, letterSpacing: 2,
        }}>
          Market Monitor
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={navItems}
        />
      </Sider>

      <Layout>
        <Header style={{
          background: '#fff', padding: '0 24px',
          display: 'flex', alignItems: 'center',
          borderBottom: '1px solid #f0f0f0',
          color: '#666', fontSize: 13,
        }}>
          Market Monitor实时市场预警系统
        </Header>

        <Content style={{ background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/rules" element={<AlertRules />} />
            <Route path="/prices" element={<MarketPrices />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}
