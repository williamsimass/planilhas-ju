import React from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Button,
  Space,
  Divider,
  Badge
} from 'antd';
import {
  FileExcelOutlined,
  BarChartOutlined,
  SafetyCertificateOutlined,
  RocketOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CloudUploadOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

function HomePage({ onNavigateToProcessor }) {
  const features = [
    {
      icon: <FileExcelOutlined className="text-4xl text-blue-500" />,
      title: "Processamento de Planilhas",
      description: "Compare duas planilhas Excel, remova duplicatas e identifique pendências automaticamente.",
      status: "Disponível",
      statusColor: "success",
      available: true
    },
    {
      icon: <BarChartOutlined className="text-4xl text-orange-500" />,
      title: "Análise de Dados",
      description: "Gere relatórios detalhados e visualizações dos dados processados.",
      status: "Em desenvolvimento",
      statusColor: "processing",
      available: false
    },
    {
      icon: <SyncOutlined className="text-4xl text-purple-500" />,
      title: "Sincronização Automática",
      description: "Sincronize dados entre diferentes sistemas e planilhas automaticamente.",
      status: "Em desenvolvimento",
      statusColor: "processing",
      available: false
    },
    {
      icon: <SafetyCertificateOutlined className="text-4xl text-green-500" />,
      title: "Auditoria e Compliance",
      description: "Monitore alterações e mantenha histórico completo de todas as operações.",
      status: "Em desenvolvimento",
      statusColor: "processing",
      available: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="hero-section">
        <Card className="hero-card">
          <div className="text-center">
            <RocketOutlined className="hero-icon" />
            <Title level={1} className="hero-title">
              Processador de Planilhas Excel
            </Title>
            <Paragraph className="hero-description text-lg">
              Sistema inteligente para processamento, análise e gestão de planilhas Excel.
              Automatize suas tarefas e transforme dados em insights valiosos.
            </Paragraph>
            
            <Space size="large" className="mt-8">
              <Button 
                type="primary" 
                size="large" 
                icon={<ArrowRightOutlined />}
                onClick={onNavigateToProcessor}
                className="process-button"
              >
                Começar Agora
              </Button>
              <Button 
                size="large"
                icon={<FileExcelOutlined />}
                className="secondary-button"
              >
                Ver Demonstração
              </Button>
            </Space>
          </div>
        </Card>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <Title level={2} className="mb-4">
            Funcionalidades Disponíveis
          </Title>
          <Paragraph className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore nossas ferramentas poderosas para processamento e análise de dados Excel
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {features.map((feature, index) => (
            <Col xs={24} md={12} lg={6} key={index}>
              <Card 
                className="feature-card h-full hover:shadow-lg transition-all duration-300"
                hoverable={feature.available}
              >
                <div className="text-center">
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <Title level={4} className="mb-3">
                    {feature.title}
                  </Title>
                  <Paragraph className="text-gray-600 mb-4">
                    {feature.description}
                  </Paragraph>
                  <Badge 
                    status={feature.statusColor} 
                    text={feature.status}
                    className="mb-4"
                  />
                  {feature.available && (
                    <Button 
                      type="primary" 
                      block
                      icon={<ArrowRightOutlined />}
                      onClick={onNavigateToProcessor}
                    >
                      Usar Agora
                    </Button>
                  )}
                  {!feature.available && (
                    <Button 
                      block
                      disabled
                      icon={<SyncOutlined />}
                    >
                      Em Breve
                    </Button>
                  )}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Benefits Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <Title level={2} className="mb-4">
              Por que escolher nosso sistema?
            </Title>
          </div>
          
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} lg={12}>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CheckCircleOutlined className="text-green-500 text-xl mt-1" />
                  <div>
                    <Title level={4} className="mb-2">Interface Intuitiva</Title>
                    <Text className="text-gray-600">
                      Design moderno e fácil de usar, sem necessidade de treinamento complexo.
                    </Text>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <CheckCircleOutlined className="text-green-500 text-xl mt-1" />
                  <div>
                    <Title level={4} className="mb-2">Processamento Rápido</Title>
                    <Text className="text-gray-600">
                      Processe milhares de registros em segundos com nossa tecnologia otimizada.
                    </Text>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <CheckCircleOutlined className="text-green-500 text-xl mt-1" />
                  <div>
                    <Title level={4} className="mb-2">Segurança Garantida</Title>
                    <Text className="text-gray-600">
                      Seus dados são processados localmente, garantindo total privacidade e segurança.
                    </Text>
                  </div>
                </div>
              </div>
            </Col>
            
            <Col xs={24} lg={12}>
              <Card className="stats-showcase">
                <div className="text-center">
                  <CloudUploadOutlined className="text-6xl text-blue-500 mb-4" />
                  <Title level={3} className="mb-2">Pronto para começar?</Title>
                  <Paragraph className="text-gray-600 mb-6">
                    Faça upload de suas planilhas e veja a mágica acontecer
                  </Paragraph>
                  <Button 
                    type="primary" 
                    size="large"
                    icon={<RocketOutlined />}
                    onClick={onNavigateToProcessor}
                    className="process-button"
                  >
                    Iniciar Processamento
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
}

export default HomePage;

