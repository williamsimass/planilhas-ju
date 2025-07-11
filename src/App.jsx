import React, { useState } from 'react';
import {
  Layout,
  Tabs,
  Typography,
  Badge
} from 'antd';
import {
  FileExcelOutlined,
  HomeOutlined,
  BarChartOutlined,
  SyncOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import HomePage from './components/HomePage';
import ProcessorPage from './components/ProcessorPage';
import DevelopmentPage from './components/DevelopmentPage';
import './App.css';

const { Header, Footer } = Layout;
const { Title, Text } = Typography;

function App() {
  const [activeTab, setActiveTab] = useState('home');

  const handleNavigateToProcessor = () => {
    setActiveTab('processor');
  };

  const handleBackToHome = () => {
    setActiveTab('home');
  };

  const tabItems = [
    {
      key: 'home',
      label: (
        <span className="flex items-center space-x-2">
          <HomeOutlined />
          <span>Início</span>
        </span>
      ),
      children: <HomePage onNavigateToProcessor={handleNavigateToProcessor} />
    },
    {
      key: 'processor',
      label: (
        <span className="flex items-center space-x-2">
          <FileExcelOutlined />
          <span>Processamento</span>
          <Badge status="success" />
        </span>
      ),
      children: <ProcessorPage />
    },
    {
      key: 'analysis',
      label: (
        <span className="flex items-center space-x-2">
          <BarChartOutlined />
          <span>Análise de Dados</span>
          <Badge status="processing" text="Em breve" />
        </span>
      ),
      children: (
        <DevelopmentPage
          title="Análise de Dados"
          description="Gere relatórios detalhados e visualizações dos dados processados com gráficos interativos e insights automáticos."
          icon={<BarChartOutlined />}
          onBackToHome={handleBackToHome}
        />
      )
    },
    {
      key: 'sync',
      label: (
        <span className="flex items-center space-x-2">
          <SyncOutlined />
          <span>Sincronização</span>
          <Badge status="processing" text="Em breve" />
        </span>
      ),
      children: (
        <DevelopmentPage
          title="Sincronização Automática"
          description="Sincronize dados entre diferentes sistemas e planilhas automaticamente, mantendo tudo sempre atualizado."
          icon={<SyncOutlined />}
          onBackToHome={handleBackToHome}
        />
      )
    },
    {
      key: 'audit',
      label: (
        <span className="flex items-center space-x-2">
          <SafetyCertificateOutlined />
          <span>Auditoria</span>
          <Badge status="processing" text="Em breve" />
        </span>
      ),
      children: (
        <DevelopmentPage
          title="Auditoria e Compliance"
          description="Monitore alterações, mantenha histórico completo de operações e garanta conformidade com regulamentações."
          icon={<SafetyCertificateOutlined />}
          onBackToHome={handleBackToHome}
        />
      )
    }
  ];

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header className="header-modern">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="header-icon">
              <FileExcelOutlined className="text-2xl text-white" />
            </div>
            <div>
              <Title level={3} className="!mb-0 !text-white font-bold">
                Processador de Planilhas Excel
              </Title>
              <Text className="text-blue-100 text-sm"></Text>
            </div>
          </div>
          <Badge count="" className="badge-pro">
            <SafetyCertificateOutlined className="text-white text-xl" />
          </Badge>
        </div>
      </Header>

      <div className="flex-1">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="main-tabs"
          size="large"
          tabBarStyle={{
            background: 'white',
            margin: 0,
            padding: '0 24px',
            borderBottom: '1px solid #f0f0f0'
          }}
        />
      </div>

      <Footer className="modern-footer">
        <div className="max-w-7xl mx-auto text-center">
          <Text className="footer-text">
            <strong>Desenvolvido por William Simas</strong> • Sistema de Processamento de Planilhas Excel
          </Text>
          <br />
          <Text type="secondary" className="footer-subtext">
            © 2025 • Todos os direitos reservados
          </Text>
        </div>
      </Footer>
    </Layout>
  );
}

export default App;

