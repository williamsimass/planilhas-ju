import React from 'react';
import {
  Card,
  Typography,
  Button,
  Space,
  Result
} from 'antd';
import {
  RocketOutlined,
  ToolOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

function DevelopmentPage({ title, description, icon, onBackToHome }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-6">
        <Card className="text-center p-8">
          <Result
            icon={<div className="text-6xl mb-4">{icon}</div>}
            title={
              <Title level={2} className="mb-4">
                {title}
              </Title>
            }
            subTitle={
              <div className="space-y-4">
                <Paragraph className="text-lg text-gray-600">
                  {description}
                </Paragraph>
                <div className="flex items-center justify-center space-x-2 text-orange-500">
                  <ClockCircleOutlined className="text-xl" />
                  <span className="font-medium">Em desenvolvimento</span>
                </div>
              </div>
            }
            extra={
              <Space size="large" className="mt-8">
                <Button 
                  type="primary" 
                  size="large"
                  icon={<RocketOutlined />}
                  onClick={onBackToHome}
                >
                  Voltar ao Início
                </Button>
                <Button 
                  size="large"
                  icon={<ToolOutlined />}
                  onClick={() => window.location.href = 'mailto:contato@exemplo.com'}
                >
                  Solicitar Acesso Antecipado
                </Button>
              </Space>
            }
          />
          
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <Title level={4} className="text-blue-800 mb-3">
              🚀 Novidades em breve!
            </Title>
            <Paragraph className="text-blue-700 mb-0">
              Esta funcionalidade está sendo desenvolvida com muito carinho pela nossa equipe. 
              Em breve você poderá desfrutar de mais uma ferramenta poderosa para otimizar seu trabalho.
            </Paragraph>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default DevelopmentPage;

