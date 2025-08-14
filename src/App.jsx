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
  ScissorOutlined,
  SafetyCertificateOutlined,
  FunctionOutlined
} from '@ant-design/icons';
import { ThemeProvider } from './components/ThemeProvider';
import EnhancedProcessorPage from './components/EnhancedProcessorPage';
import DivisionPage from './components/DivisionPage';
import NewAutomationPage from './components/NewAutomationPage'; // Importar o novo componente
import './App-enhanced.css';

const { Header, Footer } = Layout;
const { Title, Text } = Typography;

function App() {
  const [activeTab, setActiveTab] = useState('processor');

  const tabItems = [
    {
      key: 'processor',
      label: (
        <span className="flex items-center space-x-2">
          <FileExcelOutlined />
          <span>Processador de Planilhas</span>
          <Badge status="success" />
        </span>
      ),
      children: <EnhancedProcessorPage />
    },
    {
      key: 'division',
      label: (
        <span className="flex items-center space-x-2">
          <ScissorOutlined />
          <span>Divisão de Planilha</span>
          <Badge status="success" />
        </span>
      ),
      children: <DivisionPage />
    },
    {
      key: 'new_automation',
      label: (
        <span className="flex items-center space-x-2">
          <FunctionOutlined />
          <span>Nova Automação Excel</span>
          <Badge status="processing" />
        </span>
      ),
      children: <NewAutomationPage />
    }
  ];

  return (
    <ThemeProvider>
      <Layout className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header className="header-modern">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="header-icon">
              <FileExcelOutlined className="text-2xl text-white" />
            </div>
            <div>
              <Title level={3} className="!mb-0 !text-white font-bold">
                • Sistema inteligente de Planilhas • 
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
            <strong>Desenvolvido por William Simas</strong> • Sistema de Processamento de Planilhas 
          </Text>
          <br />
          <Text type="secondary" className="footer-subtext">
            © 2025 • Todos os direitos reservados
          </Text>
        </div>
      </Footer>
    </Layout>
    </ThemeProvider>
  );
}

export default App;


