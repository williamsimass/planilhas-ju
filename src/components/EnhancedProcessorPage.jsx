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
  Badge,
  notification,
  Statistic,
  Divider,
  Switch
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
  RocketOutlined,
  EyeOutlined,
  BulbOutlined,
  MoonOutlined,
  SunOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  HeartOutlined
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import DataPreview from './DataPreview';
import { useTheme } from './ThemeProvider';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

function EnhancedProcessorPage() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [oldData, setOldData] = useState([]);
  const [newData, setNewData] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [oldFileName, setOldFileName] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewFileName, setPreviewFileName] = useState('');
  const [stats, setStats] = useState({
    duplicatesRemoved: 0,
    responsibleAdded: 0,
    pendingAdded: 0,
    processingTime: 0
  });

  // Função para validar arquivo Excel
  const validateExcelFile = (file) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    const validExtensions = ['.xlsx', '.xls'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type) && !validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
      notification.error({
        message: 'Formato Inválido',
        description: 'Por favor, selecione um arquivo Excel (.xlsx ou .xls)',
        icon: <SafetyOutlined style={{ color: '#ef4444' }} />
      });
      return false;
    }

    if (file.size > maxSize) {
      notification.error({
        message: 'Arquivo Muito Grande',
        description: 'O arquivo deve ter no máximo 10MB',
        icon: <SafetyOutlined style={{ color: '#ef4444' }} />
      });
      return false;
    }

    return true;
  };

  // Função para ler arquivo Excel com validação
  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          
          if (workbook.SheetNames.length === 0) {
            throw new Error('Planilha vazia ou sem abas');
          }
          
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          if (jsonData.length === 0) {
            throw new Error('Planilha não contém dados');
          }
          
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsBinaryString(file);
    });
  };

  // Upload da planilha antiga com validação aprimorada
  const handleOldFileUpload = async (file) => {
    if (!validateExcelFile(file)) return false;
    
    setLoading(true);
    setProcessingProgress(0);
    
    try {
      const data = await readExcelFile(file);
      setOldData(data);
      setOldFileName(file.name);
      
      notification.success({
        message: 'Planilha Carregada!',
        description: `${file.name} foi carregada com sucesso (${data.length} registros)`,
        icon: <CheckCircleOutlined style={{ color: '#10b981' }} />
      });
      
      if (newData.length > 0) {
        setCurrentStep(1);
      }
    } catch (error) {
      notification.error({
        message: 'Erro ao Carregar Planilha',
        description: error.message || 'Erro ao ler a planilha antiga',
        icon: <SafetyOutlined style={{ color: '#ef4444' }} />
      });
      console.error(error);
    }
    setLoading(false);
    return false;
  };

  // Upload da planilha atual com validação aprimorada
  const handleNewFileUpload = async (file) => {
    if (!validateExcelFile(file)) return false;
    
    setLoading(true);
    setProcessingProgress(0);
    
    try {
      const data = await readExcelFile(file);
      setNewData(data);
      setNewFileName(file.name);
      
      notification.success({
        message: 'Planilha Carregada!',
        description: `${file.name} foi carregada com sucesso (${data.length} registros)`,
        icon: <CheckCircleOutlined style={{ color: '#10b981' }} />
      });
      
      if (oldData.length > 0) {
        setCurrentStep(1);
      }
    } catch (error) {
      notification.error({
        message: 'Erro ao Carregar Planilha',
        description: error.message || 'Erro ao ler a planilha atual',
        icon: <SafetyOutlined style={{ color: '#ef4444' }} />
      });
      console.error(error);
    }
    setLoading(false);
    return false;
  };

  // Função principal de processamento com progress
  const processData = async () => {
    if (oldData.length === 0 || newData.length === 0) {
      notification.warning({
        message: 'Dados Incompletos',
        description: 'Por favor, carregue ambas as planilhas antes de processar',
        icon: <BulbOutlined style={{ color: '#f59e0b' }} />
      });
      return;
    }

    setLoading(true);
    setCurrentStep(2);
    setProcessingProgress(0);
    const startTime = Date.now();

    try {
      // Simular progresso de processamento
      const updateProgress = (progress) => {
        setProcessingProgress(progress);
      };

      updateProgress(10);
      await new Promise(resolve => setTimeout(resolve, 300));

      const processNumberColumn = findProcessNumberColumn(newData);
      if (!processNumberColumn) {
        throw new Error('Coluna de número do processo não encontrada');
      }

      updateProgress(30);
      await new Promise(resolve => setTimeout(resolve, 300));

      const uniqueNewData = removeDuplicates(newData, processNumberColumn);
      updateProgress(60);
      await new Promise(resolve => setTimeout(resolve, 300));

      const dataWithResponsible = uniqueNewData.map(row => ({
        ...row,
        'Responsável': ''
      }));
      updateProgress(80);
      await new Promise(resolve => setTimeout(resolve, 300));

      const finalData = compareAndAddPending(dataWithResponsible, oldData, processNumberColumn);
      updateProgress(100);

      const processingTime = (Date.now() - startTime) / 1000;

      setProcessedData(finalData);
      setStats({
        duplicatesRemoved: newData.length - uniqueNewData.length,
        responsibleAdded: finalData.length,
        pendingAdded: finalData.filter(row => row.Pendente === 'Sim').length,
        processingTime: processingTime
      });

      setCurrentStep(3);
      
      notification.success({
        message: 'Processamento Concluído!',
        description: `Dados processados com sucesso em ${processingTime.toFixed(1)}s`,
        icon: <ThunderboltOutlined style={{ color: '#10b981' }} />,
        duration: 4
      });
    } catch (error) {
      notification.error({
        message: 'Erro no Processamento',
        description: error.message || 'Erro durante o processamento dos dados',
        icon: <SafetyOutlined style={{ color: '#ef4444' }} />
      });
      console.error(error);
    }
    setLoading(false);
  };

  // Funções de processamento (mantidas inalteradas)
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

  // Preview de dados
  const showPreview = (data, title, fileName) => {
    setPreviewData(data);
    setPreviewTitle(title);
    setPreviewFileName(fileName);
    setPreviewVisible(true);
  };

  const downloadProcessedFile = () => {
    if (processedData.length === 0) {
      notification.warning({
        message: 'Nenhum Dado',
        description: 'Nenhum dado processado disponível para download',
        icon: <BulbOutlined style={{ color: '#f59e0b' }} />
      });
      return;
    }

    try {
      const worksheet = XLSX.utils.json_to_sheet(processedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados Processados');
      
      const fileName = `planilha_processada_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      notification.success({
        message: 'Download Concluído!',
        description: `Arquivo ${fileName} baixado com sucesso`,
        icon: <DownloadOutlined style={{ color: '#10b981' }} />
      });
    } catch (error) {
      notification.error({
        message: 'Erro no Download',
        description: 'Erro ao gerar o arquivo Excel',
        icon: <SafetyOutlined style={{ color: '#ef4444' }} />
      });
    }
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
            <Tag 
              color={text === 'Sim' ? 'orange' : 'green'} 
              className="font-medium"
              style={{ borderRadius: '6px', fontWeight: '600' }}
            >
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
          render: (text) => (
            <Text type={text ? 'default' : 'secondary'} style={{ fontStyle: text ? 'normal' : 'italic' }}>
              {text || 'Não definido'}
            </Text>
          ),
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
              <Tooltip title={text} placement="topLeft">
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
    setProcessingProgress(0);
    setStats({ duplicatesRemoved: 0, responsibleAdded: 0, pendingAdded: 0, processingTime: 0 });
    
    notification.info({
      message: 'Processo Reiniciado',
      description: 'Todos os dados foram limpos. Você pode começar novamente.',
      icon: <DeleteOutlined style={{ color: '#06b6d4' }} />
    });
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section com Toggle de Tema */}
        <div className="hero-section">
          <Card className={`hero-card ${isDarkMode ? 'dark-card' : ''}`}>
            <div className="flex justify-between items-start mb-6">
              <div className="text-center flex-1">
                <RocketOutlined className="hero-icon" />
                <Title level={2} className="hero-title">
                  Transforme suas Planilhas em Insights
                </Title>
                <Paragraph className="hero-description">
                  Compare, analise e processe suas planilhas Excel de forma inteligente e automatizada
                </Paragraph>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <Tooltip title={isDarkMode ? 'Modo Claro' : 'Modo Escuro'}>
                  <Switch
                    checked={isDarkMode}
                    onChange={toggleTheme}
                    checkedChildren={<MoonOutlined />}
                    unCheckedChildren={<SunOutlined />}
                    size="default"
                    style={{
                      background: isDarkMode ? '#1f2937' : '#e5e7eb'
                    }}
                  />
                </Tooltip>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {isDarkMode ? 'Escuro' : 'Claro'}
                </Text>
              </div>
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

            {loading && currentStep === 2 && (
              <div style={{ marginTop: '24px' }}>
                <Progress 
                  percent={processingProgress} 
                  status="active"
                  strokeColor={{
                    '0%': '#3b82f6',
                    '100%': '#10b981',
                  }}
                  style={{ marginBottom: '8px' }}
                />
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  Processando dados... {processingProgress}%
                </Text>
              </div>
            )}
          </Card>
        </div>

        {/* Etapa 1: Upload das Planilhas */}
        {currentStep === 0 && (
          <Row gutter={[24, 24]} className="upload-section">
            <Col xs={24} lg={12}>
              <Card className={`upload-card ${isDarkMode ? 'dark-card' : ''}`} hoverable>
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
                  disabled={loading}
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
                  <div style={{ marginTop: '16px' }}>
                    <Alert 
                      message={`✅ ${oldFileName}`}
                      type="success" 
                      showIcon 
                      className="upload-success"
                      action={
                        <Button 
                          size="small" 
                          type="link" 
                          icon={<EyeOutlined />}
                          onClick={() => showPreview(oldData, 'Planilha Antiga', oldFileName)}
                        >
                          Preview
                        </Button>
                      }
                    />
                  </div>
                )}
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card className={`upload-card ${isDarkMode ? 'dark-card' : ''}`} hoverable>
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
                  disabled={loading}
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
                  <div style={{ marginTop: '16px' }}>
                    <Alert 
                      message={`✅ ${newFileName}`}
                      type="success" 
                      showIcon 
                      className="upload-success"
                      action={
                        <Button 
                          size="small" 
                          type="link" 
                          icon={<EyeOutlined />}
                          onClick={() => showPreview(newData, 'Planilha Atual', newFileName)}
                        >
                          Preview
                        </Button>
                      }
                    />
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        )}

        {/* Botão de Processar */}
        {currentStep === 1 && (
          <Card className={`process-card ${isDarkMode ? 'dark-card' : ''}`}>
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
              <Col xs={24} sm={6}>
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
                    strokeColor="#ef4444"
                    className="stats-progress"
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
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
                    strokeColor="#3b82f6"
                    className="stats-progress"
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
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
                    strokeColor="#f59e0b"
                    className="stats-progress"
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card className="stats-card time">
                  <div className="stats-content">
                    <div className="stats-icon">⚡</div>
                    <div className="stats-info">
                      <Title level={2} className="stats-number">
                        {stats.processingTime.toFixed(1)}s
                      </Title>
                      <Text className="stats-label">Tempo de Processamento</Text>
                    </div>
                  </div>
                  <Progress 
                    percent={100} 
                    showInfo={false} 
                    strokeColor="#8b5cf6"
                    className="stats-progress"
                  />
                </Card>
              </Col>
            </Row>

            <Card 
              className={`results-table-card ${isDarkMode ? 'dark-card' : ''}`}
              title={
                <div className="table-header">
                  <BarChartOutlined className="table-icon" />
                  <span>Dados Processados</span>
                  <Badge count={processedData.length} style={{ backgroundColor: '#3b82f6' }} />
                </div>
              }
              extra={
                <Space>
                  <Button 
                    icon={<EyeOutlined />}
                    onClick={() => showPreview(processedData, 'Dados Processados', 'resultado_processamento.xlsx')}
                  >
                    Preview
                  </Button>
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

        {/* Loading overlay melhorado */}
        {loading && (
          <div className="loading-overlay">
            <Card className="loading-card">
              <div className="loading-content">
                <Spin size="large" className="loading-spinner" />
                <Title level={4} className="loading-title">
                  {currentStep === 2 ? 'Processando suas planilhas...' : 'Carregando dados...'}
                </Title>
                <Text className="loading-text">
                  {currentStep === 2 
                    ? 'Aguarde enquanto analisamos e comparamos os dados' 
                    : 'Lendo e validando o arquivo Excel'
                  }
                </Text>
                {currentStep === 2 && (
                  <Progress 
                    percent={processingProgress} 
                    showInfo={false} 
                    strokeColor={{
                      '0%': '#3b82f6',
                      '100%': '#10b981',
                    }}
                    className="loading-progress"
                  />
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Modal de Preview */}
        <DataPreview
          visible={previewVisible}
          onClose={() => setPreviewVisible(false)}
          data={previewData}
          fileName={previewFileName}
          title={previewTitle}
        />
      </div>
    </div>
  );
}

export default EnhancedProcessorPage;

