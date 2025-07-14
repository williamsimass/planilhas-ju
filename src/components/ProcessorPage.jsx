import React, { useState } from 'react';
import {
  Card,
  Upload,
  Button,
  Table,
  message,
  Space,
  Typography,
  Row,
  Col,
  Steps,
  Alert,
  Tag,
  Spin,
  Tooltip,
  Progress,
  Badge
} from 'antd';
import {
  UploadOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  DeleteOutlined,
  CloudUploadOutlined,
  BarChartOutlined,
  RocketOutlined
} from '@ant-design/icons';
import * as XLSX from 'xlsx';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

function ProcessorPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [oldData, setOldData] = useState([]);
  const [newData, setNewData] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [oldFileName, setOldFileName] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [stats, setStats] = useState({
    duplicatesRemoved: 0,
    responsibleAdded: 0,
    pendingAdded: 0
  });

  // Função para ler arquivo Excel
  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsBinaryString(file);
    });
  };

  // Upload da planilha antiga
  const handleOldFileUpload = async (file) => {
    setLoading(true);
    try {
      const data = await readExcelFile(file);
      setOldData(data);
      setOldFileName(file.name);
      message.success(`Planilha antiga carregada: ${file.name}`);
      if (newData.length > 0) {
        setCurrentStep(1);
      }
    } catch (error) {
      message.error('Erro ao ler a planilha antiga');
      console.error(error);
    }
    setLoading(false);
    return false;
  };

  // Upload da planilha atual
  const handleNewFileUpload = async (file) => {
    setLoading(true);
    try {
      const data = await readExcelFile(file);
      setNewData(data);
      setNewFileName(file.name);
      message.success(`Planilha atual carregada: ${file.name}`);
      if (oldData.length > 0) {
        setCurrentStep(1);
      }
    } catch (error) {
      message.error('Erro ao ler a planilha atual');
      console.error(error);
    }
    setLoading(false);
    return false;
  };

  // Função principal de processamento
  const processData = () => {
    if (oldData.length === 0 || newData.length === 0) {
      message.error('Por favor, carregue ambas as planilhas');
      return;
    }

    setLoading(true);
    setCurrentStep(2);

    try {
      const processNumberColumn = findProcessNumberColumn(newData);
      if (!processNumberColumn) {
        message.error('Coluna de número do processo não encontrada');
        setLoading(false);
        return;
      }

      const uniqueNewData = removeDuplicates(newData, processNumberColumn);
      const dataWithResponsible = uniqueNewData.map(row => ({
        ...row,
        'Responsável': ''
      }));
      const finalData = compareAndAddPending(dataWithResponsible, oldData, processNumberColumn);

      setProcessedData(finalData);
      setStats({
        duplicatesRemoved: newData.length - uniqueNewData.length,
        responsibleAdded: finalData.length,
        pendingAdded: finalData.filter(row => row.Pendente === 'Sim').length
      });

      setCurrentStep(3);
      message.success('Processamento concluído com sucesso!');
    } catch (error) {
      message.error('Erro durante o processamento');
      console.error(error);
    }
    setLoading(false);
  };

  const findProcessNumberColumn = (data) => {
    if (data.length === 0) return null;
    const firstRow = data[0];
    const possibleColumns = Object.keys(firstRow).filter(key => 
      key.toLowerCase().includes('processo') || 
      key.toLowerCase().includes('number') ||
      key.toLowerCase().includes('numero')
    );
    return possibleColumns[0] || Object.keys(firstRow)[0];
  };

  const removeDuplicates = (data, processColumn) => {
    const seen = new Set();
    return data.filter(row => {
      const processNumber = row[processColumn];
      if (seen.has(processNumber)) {
        return false;
      }
      seen.add(processNumber);
      return true;
    });
  };

  const compareAndAddPending = (newData, oldData, processColumn) => {
    const oldProcessMap = new Map(oldData.map(row => [row[processColumn], row]));

    return newData.map(row => {
      const processNumber = row[processColumn];
      const oldRow = oldProcessMap.get(processNumber);
      const isPending = !!oldRow;

      return {
        ...row,
        'Pendente': isPending ? 'Sim' : 'Não',
        'Responsável': isPending && oldRow['Responsável'] ? oldRow['Responsável'] : ''
      };
    });
  };

  const downloadProcessedFile = () => {
    if (processedData.length === 0) {
      message.error('Nenhum dado processado para download');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(processedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados Processados');
    
    const fileName = `planilha_processada_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    message.success('Arquivo baixado com sucesso!');
  };

  const getTableColumns = () => {
    if (processedData.length === 0) return [];
    
    const firstRow = processedData[0];
    return Object.keys(firstRow).map(key => {
      if (key === 'Pendente') {
        return {
          title: key,
          dataIndex: key,
          key: key,
          fixed: 'right',
          render: (text) => (
            <Tag color={text === 'Sim' ? 'orange' : 'green'} className="font-medium">
              {text}
            </Tag>
          ),
          width: 120,
          ellipsis: true,
        };
      }
      if (key === 'Responsável') {
        return {
          title: key,
          dataIndex: key,
          key: key,
          render: (text) => <Text type="secondary">{text || 'Não definido'}</Text>,
          width: 150,
          ellipsis: true,
        };
      }
      if (key === 'Texto L=100') {
        return {
          title: key,
          dataIndex: key,
          key: key,
          render: (text) => {
            const maxLength = 51;
            const truncatedText = typeof text === 'string' && text.length > maxLength 
                                  ? text.substring(0, maxLength) + '...' 
                                  : text;
            return (
              <Tooltip title={text}>
                <span>{truncatedText}</span>
              </Tooltip>
            );
          },
        };
      }
      
      return {
        title: key,
        dataIndex: key,
        key: key,
        ellipsis: true,
        width: 200,
      };
    });
  };

  const resetProcess = () => {
    setCurrentStep(0);
    setOldData([]);
    setNewData([]);
    setProcessedData([]);
    setOldFileName('');
    setNewFileName('');
    setStats({ duplicatesRemoved: 0, responsibleAdded: 0, pendingAdded: 0 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="hero-section">
          <Card className="hero-card">
            <div className="text-center">
              <RocketOutlined className="hero-icon" />
              <Title level={2} className="hero-title">
                Transforme suas Planilhas em Insights
              </Title>
              <Paragraph className="hero-description">
                Compare, analise e processe suas planilhas Excel de forma inteligente e automatizada
              </Paragraph>
            </div>
            
            <Steps current={currentStep} className="modern-steps">
              <Step 
                title="Upload" 
                description="Carregue suas planilhas"
                icon={<CloudUploadOutlined />} 
              />
              <Step 
                title="Processamento" 
                description="Análise automática"
                icon={<SyncOutlined />} 
              />
              <Step 
                title="Resultados" 
                description="Dados processados"
                icon={<BarChartOutlined />} 
              />
            </Steps>
          </Card>
        </div>

        {/* Etapa 1: Upload das Planilhas */}
        {currentStep === 0 && (
          <Row gutter={[24, 24]} className="upload-section">
            <Col xs={24} lg={12}>
              <Card className="upload-card" hoverable>
                <div className="upload-header">
                  <div className="upload-icon old-file">📋</div>
                  <div>
                    <Title level={4} className="!mb-1">Planilha Antiga</Title>
                    <Text type="secondary">Arquivo de referência para comparação</Text>
                  </div>
                  {oldData.length > 0 && (
                    <Badge status="success" text="Carregada" className="upload-badge" />
                  )}
                </div>
                
                <Upload.Dragger
                  accept=".xlsx,.xls"
                  beforeUpload={handleOldFileUpload}
                  showUploadList={false}
                  className="modern-upload"
                >
                  <div className="upload-content">
                    <FileExcelOutlined className="upload-icon-large" />
                    <Title level={4} className="upload-title">
                      Arraste ou clique para carregar
                    </Title>
                    <Text className="upload-hint">
                      Suporte para arquivos .xlsx e .xls (máx. 10MB)
                    </Text>
                  </div>
                </Upload.Dragger>
                
                {oldFileName && (
                  <Alert 
                    message={`✅ ${oldFileName}`}
                    type="success" 
                    showIcon 
                    className="upload-success"
                  />
                )}
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card className="upload-card" hoverable>
                <div className="upload-header">
                  <div className="upload-icon new-file">📊</div>
                  <div>
                    <Title level={4} className="!mb-1">Planilha Atual</Title>
                    <Text type="secondary">Arquivo para processar e analisar</Text>
                  </div>
                  {newData.length > 0 && (
                    <Badge status="success" text="Carregada" className="upload-badge" />
                  )}
                </div>
                
                <Upload.Dragger
                  accept=".xlsx,.xls"
                  beforeUpload={handleNewFileUpload}
                  showUploadList={false}
                  className="modern-upload"
                >
                  <div className="upload-content">
                    <FileExcelOutlined className="upload-icon-large" />
                    <Title level={4} className="upload-title">
                      Arraste ou clique para carregar
                    </Title>
                    <Text className="upload-hint">
                      Suporte para arquivos .xlsx e .xls (máx. 10MB)
                    </Text>
                  </div>
                </Upload.Dragger>
                
                {newFileName && (
                  <Alert 
                    message={`✅ ${newFileName}`}
                    type="success" 
                    showIcon 
                    className="upload-success"
                  />
                )}
              </Card>
            </Col>
          </Row>
        )}

        {/* Botão de Processar */}
        {currentStep === 1 && (
          <Card className="process-card">
            <div className="text-center">
              <CheckCircleOutlined className="process-icon" />
              <Title level={3} className="process-title">
                Pronto para Processar!
              </Title>
              <Paragraph className="process-description">
                Ambas as planilhas foram carregadas com sucesso. O sistema realizará as seguintes operações:
              </Paragraph>
              
              <div className="process-features">
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={6}>
                    <div className="feature-item">
                      <div className="feature-icon">🔍</div>
                      <Text strong>Detectar Duplicatas</Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="feature-item">
                      <div className="feature-icon">👤</div>
                      <Text strong>Adicionar Responsável</Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="feature-item">
                      <div className="feature-icon">⚖️</div>
                      <Text strong>Comparar Dados</Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="feature-item">
                      <div className="feature-icon">📋</div>
                      <Text strong>Marcar Pendências</Text>
                    </div>
                  </Col>
                </Row>
              </div>
              
              <Space size="large" className="process-actions">
                <Button 
                  type="primary" 
                  size="large" 
                  onClick={processData}
                  loading={loading}
                  icon={<RocketOutlined />}
                  className="process-button"
                >
                  Iniciar Processamento
                </Button>
                <Button 
                  size="large"
                  onClick={resetProcess} 
                  icon={<DeleteOutlined />}
                  className="reset-button"
                >
                  Recomeçar
                </Button>
              </Space>
            </div>
          </Card>
        )}

        {/* Etapa 3: Resultados */}
        {currentStep === 3 && (
          <div className="results-section">
            <Row gutter={[24, 24]} className="stats-row">
              <Col xs={24} sm={8}>
                <Card className="stats-card duplicates">
                  <div className="stats-content">
                    <div className="stats-icon">🗑️</div>
                    <div className="stats-info">
                      <Title level={2} className="stats-number">
                        {stats.duplicatesRemoved}
                      </Title>
                      <Text className="stats-label">Duplicatas Removidas</Text>
                    </div>
                  </div>
                  <Progress 
                    percent={stats.duplicatesRemoved > 0 ? 100 : 0} 
                    showInfo={false} 
                    strokeColor="#ff4d4f"
                    className="stats-progress"
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card className="stats-card processed">
                  <div className="stats-content">
                    <div className="stats-icon">📊</div>
                    <div className="stats-info">
                      <Title level={2} className="stats-number">
                        {stats.responsibleAdded}
                      </Title>
                      <Text className="stats-label">Registros Processados</Text>
                    </div>
                  </div>
                  <Progress 
                    percent={100} 
                    showInfo={false} 
                    strokeColor="#1890ff"
                    className="stats-progress"
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card className="stats-card pending">
                  <div className="stats-content">
                    <div className="stats-icon">⏳</div>
                    <div className="stats-info">
                      <Title level={2} className="stats-number">
                        {stats.pendingAdded}
                      </Title>
                      <Text className="stats-label">Marcados como Pendentes</Text>
                    </div>
                  </div>
                  <Progress 
                    percent={stats.pendingAdded > 0 ? (stats.pendingAdded / stats.responsibleAdded) * 100 : 0} 
                    showInfo={false} 
                    strokeColor="#fa8c16"
                    className="stats-progress"
                  />
                </Card>
              </Col>
            </Row>

            <Card 
              className="results-table-card"
              title={
                <div className="table-header">
                  <BarChartOutlined className="table-icon" />
                  <span>Dados Processados</span>
                </div>
              }
              extra={
                <Space>
                  <Button 
                    type="primary" 
                    icon={<DownloadOutlined />}
                    onClick={downloadProcessedFile}
                    className="download-button"
                  >
                    Baixar Excel
                  </Button>
                  <Button 
                    onClick={resetProcess} 
                    icon={<DeleteOutlined />}
                    className="reset-button"
                  >
                    Nova Análise
                  </Button>
                </Space>
              }
            >
              <Table
                columns={getTableColumns()}
                dataSource={processedData}
                rowKey={(record, index) => index}
                scroll={{ x: true, y: 600 }}
                pagination={{ 
                  pageSize: 50,
                  showSizeChanger: true,
                  pageSizeOptions: ["10", "20", "50", "100", "250"],
                  showQuickJumper: true,
                  showTotal: (total) => `Total: ${total} registros`,
                  className: "modern-pagination"
                }}
                className="modern-table"
              />
            </Card>
          </div>
        )}

        {loading && (
          <div className="loading-overlay">
            <Card className="loading-card">
              <div className="loading-content">
                <Spin size="large" className="loading-spinner" />
                <Title level={4} className="loading-title">
                  Processando suas planilhas...
                </Title>
                <Text className="loading-text">
                  Aguarde enquanto analisamos e comparamos os dados
                </Text>
                <Progress 
                  percent={currentStep * 33.33} 
                  showInfo={false} 
                  strokeColor="#1890ff"
                  className="loading-progress"
                />
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProcessorPage;

