import React, { useState } from 'react';
import {
  Card,
  Upload,
  Button,
  message,
  Space,
  Typography,
  Row,
  Col,
  Steps,
  Radio,
  InputNumber,
  Input,
  Table,
  Select,
  Divider,
  Alert,
  Progress,
  Tag,
  Tooltip
} from 'antd';
import {
  UploadOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  ScissorOutlined,
  TeamOutlined,
  PercentageOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  PlusOutlined
} from '@ant-design/icons';
import * as XLSX from 'xlsx';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { Option } = Select;

function DivisionPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [originalData, setOriginalData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [divisionType, setDivisionType] = useState('equal');
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [people, setPeople] = useState([]);
  const [criteriaColumn, setCriteriaColumn] = useState('');
  const [dividedData, setDividedData] = useState([]);
  const [stats, setStats] = useState({});

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

  // Upload da planilha
  const handleFileUpload = async (file) => {
    setLoading(true);
    try {
      const data = await readExcelFile(file);
      setOriginalData(data);
      setFileName(file.name);
      message.success(`Planilha carregada: ${file.name} (${data.length} registros)`);
      setCurrentStep(1);
      initializePeople();
    } catch (error) {
      message.error('Erro ao ler a planilha');
      console.error(error);
    }
    setLoading(false);
    return false;
  };

  // Inicializar lista de pessoas
  const initializePeople = () => {
    const initialPeople = Array.from({ length: numberOfPeople }, (_, index) => ({
      id: index + 1,
      name: `Pessoa ${index + 1}`,
      weight: divisionType === 'weighted' ? Math.round(100 / numberOfPeople) : 0
    }));
    setPeople(initialPeople);
  };

  // Atualizar número de pessoas
  const updateNumberOfPeople = (value) => {
    setNumberOfPeople(value);
    if (divisionType === 'weighted') {
      const newWeight = Math.round(100 / value);
      const newPeople = Array.from({ length: value }, (_, index) => ({
        id: index + 1,
        name: people[index]?.name || `Pessoa ${index + 1}`,
        weight: newWeight
      }));
      setPeople(newPeople);
    } else {
      const newPeople = Array.from({ length: value }, (_, index) => ({
        id: index + 1,
        name: people[index]?.name || `Pessoa ${index + 1}`,
        weight: 0
      }));
      setPeople(newPeople);
    }
  };

  // Atualizar tipo de divisão
  const updateDivisionType = (value) => {
    setDivisionType(value);
    if (value === 'weighted') {
      const weight = Math.round(100 / numberOfPeople);
      setPeople(people.map(person => ({ ...person, weight })));
    } else {
      setPeople(people.map(person => ({ ...person, weight: 0 })));
    }
  };

  // Atualizar dados de uma pessoa
  const updatePerson = (id, field, value) => {
    setPeople(people.map(person => 
      person.id === id ? { ...person, [field]: value } : person
    ));
  };

  // Divisão igualitária
  const divideEqually = (data, numPeople) => {
    const itemsPerPerson = Math.ceil(data.length / numPeople);
    const result = [];
    
    for (let i = 0; i < numPeople; i++) {
      const start = i * itemsPerPerson;
      const end = Math.min(start + itemsPerPerson, data.length);
      const personData = data.slice(start, end);
      
      if (personData.length > 0) {
        result.push({
          person: people[i] || { name: `Pessoa ${i + 1}` },
          data: personData,
          count: personData.length
        });
      }
    }
    
    return result;
  };

  // Divisão com pesos
  const divideByWeight = (data, peopleWithWeights) => {
    const totalWeight = peopleWithWeights.reduce((sum, person) => sum + person.weight, 0);
    
    if (totalWeight !== 100) {
      message.error('A soma dos pesos deve ser igual a 100%');
      return [];
    }
    
    const result = [];
    let currentIndex = 0;
    
    peopleWithWeights.forEach((person, index) => {
      const itemsForPerson = Math.round((data.length * person.weight) / 100);
      const personData = data.slice(currentIndex, currentIndex + itemsForPerson);
      
      if (personData.length > 0) {
        result.push({
          person,
          data: personData,
          count: personData.length
        });
      }
      
      currentIndex += itemsForPerson;
    });
    
    // Distribuir itens restantes
    if (currentIndex < data.length) {
      const remaining = data.slice(currentIndex);
      remaining.forEach((item, index) => {
        const targetIndex = index % result.length;
        result[targetIndex].data.push(item);
        result[targetIndex].count++;
      });
    }
    
    return result;
  };

  // Divisão por critérios
  const divideByCriteria = (data, column, numPeople) => {
    if (!column) {
      message.error('Selecione uma coluna para critério de divisão');
      return [];
    }
    
    // Agrupar por critério
    const groups = {};
    data.forEach(item => {
      const criteriaValue = item[column] || 'Sem categoria';
      if (!groups[criteriaValue]) {
        groups[criteriaValue] = [];
      }
      groups[criteriaValue].push(item);
    });
    
    const criteriaKeys = Object.keys(groups);
    const result = Array.from({ length: numPeople }, (_, index) => ({
      person: people[index] || { name: `Pessoa ${index + 1}` },
      data: [],
      count: 0,
      criteria: []
    }));
    
    // Distribuir critérios entre pessoas
    criteriaKeys.forEach((criteria, index) => {
      const personIndex = index % numPeople;
      result[personIndex].data.push(...groups[criteria]);
      result[personIndex].count += groups[criteria].length;
      result[personIndex].criteria.push(criteria);
    });
    
    return result;
  };

  // Processar divisão
  const processDivision = () => {
    if (originalData.length === 0) {
      message.error('Nenhuma planilha carregada');
      return;
    }
    
    setLoading(true);
    setCurrentStep(2);
    
    try {
      let result = [];
      
      switch (divisionType) {
        case 'equal':
          result = divideEqually(originalData, numberOfPeople);
          break;
        case 'weighted':
          result = divideByWeight(originalData, people);
          break;
        case 'criteria':
          result = divideByCriteria(originalData, criteriaColumn, numberOfPeople);
          break;
        default:
          result = divideEqually(originalData, numberOfPeople);
      }
      
      setDividedData(result);
      setStats({
        totalRecords: originalData.length,
        totalPeople: result.length,
        averagePerPerson: Math.round(originalData.length / result.length)
      });
      
      setCurrentStep(3);
      message.success('Divisão realizada com sucesso!');
    } catch (error) {
      message.error('Erro durante a divisão');
      console.error(error);
    }
    setLoading(false);
  };

  // Download dos arquivos divididos
  const downloadDividedFiles = () => {
    if (dividedData.length === 0) {
      message.error('Nenhuma divisão realizada');
      return;
    }
    
    dividedData.forEach((division, index) => {
      if (division.data.length > 0) {
        const worksheet = XLSX.utils.json_to_sheet(division.data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');
        
        const personName = division.person.name.replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `${personName}_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);
      }
    });
    
    message.success(`${dividedData.length} arquivos baixados com sucesso!`);
  };

  // Download da planilha consolidada com responsáveis
  const downloadConsolidatedFile = () => {
    if (dividedData.length === 0) {
      message.error('Nenhuma divisão realizada');
      return;
    }
    
    // Criar dados consolidados com coluna de responsável
    const consolidatedData = [];
    
    dividedData.forEach((division) => {
      division.data.forEach((row) => {
        consolidatedData.push({
          ...row,
          'Responsável': division.person.name
        });
      });
    });
    
    // Gerar arquivo Excel
    const worksheet = XLSX.utils.json_to_sheet(consolidatedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Planilha Consolidada');
    
    const fileName = `planilha_consolidada_com_responsaveis_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    message.success('Planilha consolidada baixada com sucesso!');
  };

  // Reset do processo
  const resetProcess = () => {
    setCurrentStep(0);
    setOriginalData([]);
    setFileName('');
    setDividedData([]);
    setStats({});
    setPeople([]);
  };

  // Obter colunas disponíveis
  const getAvailableColumns = () => {
    if (originalData.length === 0) return [];
    return Object.keys(originalData[0]);
  };

  // Colunas da tabela de resultados
  const getResultColumns = () => [
    {
      title: 'Pessoa',
      dataIndex: ['person', 'name'],
      key: 'person',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Quantidade',
      dataIndex: 'count',
      key: 'count',
      render: (count) => <Tag color="blue">{count} registros</Tag>
    },
    {
      title: 'Percentual',
      key: 'percentage',
      render: (_, record) => {
        const percentage = ((record.count / stats.totalRecords) * 100).toFixed(1);
        return <Text>{percentage}%</Text>;
      }
    },
    ...(divisionType === 'criteria' ? [{
      title: 'Critérios',
      dataIndex: 'criteria',
      key: 'criteria',
      render: (criteria) => (
        <div>
          {criteria?.map((c, index) => (
            <Tag key={index} color="green" className="mb-1">{c}</Tag>
          ))}
        </div>
      )
    }] : [])
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <Card className="hero-card mb-8">
          <div className="text-center">
            <ScissorOutlined className="hero-icon" />
            <Title level={2} className="hero-title">
              Divisão de Planilhas
            </Title>
            <Paragraph className="hero-description">
              Divida suas planilhas de forma inteligente entre equipes ou pessoas
            </Paragraph>
          </div>
          
          <Steps current={currentStep} className="modern-steps">
            <Step 
              title="Upload" 
              description="Carregue sua planilha"
              icon={<UploadOutlined />} 
            />
            <Step 
              title="Configuração" 
              description="Defina a divisão"
              icon={<TeamOutlined />} 
            />
            <Step 
              title="Processamento" 
              description="Dividindo dados"
              icon={<ScissorOutlined />} 
            />
            <Step 
              title="Resultados" 
              description="Baixar arquivos"
              icon={<DownloadOutlined />} 
            />
          </Steps>
        </Card>

        {/* Etapa 1: Upload */}
        {currentStep === 0 && (
          <Card className="upload-card">
            <div className="text-center mb-6">
              <FileExcelOutlined className="text-6xl text-blue-500 mb-4" />
              <Title level={3}>Carregar Planilha para Divisão</Title>
              <Text type="secondary">
                Faça upload da planilha que deseja dividir entre pessoas ou equipes
              </Text>
            </div>
            
            <Upload.Dragger
              accept=".xlsx,.xls"
              beforeUpload={handleFileUpload}
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
            
            {fileName && (
              <Alert 
                message={`✅ ${fileName} (${originalData.length} registros)`}
                type="success" 
                showIcon 
                className="upload-success mt-4"
              />
            )}
          </Card>
        )}

        {/* Etapa 2: Configuração */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <Card title="Tipo de Divisão" className="config-card">
              <Radio.Group 
                value={divisionType} 
                onChange={(e) => updateDivisionType(e.target.value)}
                className="w-full"
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={8}>
                    <Radio.Button value="equal" className="w-full h-auto p-4">
                      <div className="text-center">
                        <TeamOutlined className="text-2xl text-blue-500 mb-2" />
                        <div className="font-semibold">Divisão Igualitária</div>
                        <div className="text-sm text-gray-500">
                          Divide igualmente entre todas as pessoas
                        </div>
                      </div>
                    </Radio.Button>
                  </Col>
                  <Col xs={24} md={8}>
                    <Radio.Button value="weighted" className="w-full h-auto p-4">
                      <div className="text-center">
                        <PercentageOutlined className="text-2xl text-orange-500 mb-2" />
                        <div className="font-semibold">Divisão com Pesos</div>
                        <div className="text-sm text-gray-500">
                          Define percentual para cada pessoa
                        </div>
                      </div>
                    </Radio.Button>
                  </Col>
                  <Col xs={24} md={8}>
                    <Radio.Button value="criteria" className="w-full h-auto p-4">
                      <div className="text-center">
                        <FilterOutlined className="text-2xl text-green-500 mb-2" />
                        <div className="font-semibold">Divisão por Critérios</div>
                        <div className="text-sm text-gray-500">
                          Agrupa por valores de uma coluna
                        </div>
                      </div>
                    </Radio.Button>
                  </Col>
                </Row>
              </Radio.Group>
            </Card>

            <Card title="Configurações da Divisão" className="config-card">
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <div className="mb-4">
                    <Text strong>Número de Pessoas/Grupos:</Text>
                    <InputNumber
                      min={2}
                      max={50}
                      value={numberOfPeople}
                      onChange={updateNumberOfPeople}
                      className="w-full mt-2"
                      size="large"
                    />
                  </div>
                </Col>
                
                {divisionType === 'criteria' && (
                  <Col xs={24} md={12}>
                    <div className="mb-4">
                      <Text strong>Coluna para Critério:</Text>
                      <Select
                        value={criteriaColumn}
                        onChange={setCriteriaColumn}
                        className="w-full mt-2"
                        size="large"
                        placeholder="Selecione uma coluna"
                      >
                        {getAvailableColumns().map(column => (
                          <Option key={column} value={column}>{column}</Option>
                        ))}
                      </Select>
                    </div>
                  </Col>
                )}
              </Row>

              <Divider />

              <div className="space-y-4">
                <Text strong>Configurar Pessoas/Grupos:</Text>
                {people.map((person, index) => (
                  <Row key={person.id} gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={divisionType === 'weighted' ? 8 : 12}>
                      <Input
                        value={person.name}
                        onChange={(e) => updatePerson(person.id, 'name', e.target.value)}
                        placeholder={`Nome da pessoa ${index + 1}`}
                        prefix={<TeamOutlined />}
                      />
                    </Col>
                    {divisionType === 'weighted' && (
                      <Col xs={24} sm={12} md={8}>
                        <InputNumber
                          min={0}
                          max={100}
                          value={person.weight}
                          onChange={(value) => updatePerson(person.id, 'weight', value)}
                          formatter={value => `${value}%`}
                          parser={value => value.replace('%', '')}
                          className="w-full"
                        />
                      </Col>
                    )}
                    <Col xs={24} sm={24} md={divisionType === 'weighted' ? 8 : 12}>
                      <Text type="secondary">
                        {divisionType === 'equal' && `~${Math.round(originalData.length / numberOfPeople)} registros`}
                        {divisionType === 'weighted' && `~${Math.round(originalData.length * person.weight / 100)} registros`}
                        {divisionType === 'criteria' && 'Baseado nos critérios'}
                      </Text>
                    </Col>
                  </Row>
                ))}
              </div>

              {divisionType === 'weighted' && (
                <Alert
                  message={`Total: ${people.reduce((sum, p) => sum + p.weight, 0)}%`}
                  type={people.reduce((sum, p) => sum + p.weight, 0) === 100 ? 'success' : 'warning'}
                  showIcon
                  className="mt-4"
                />
              )}
            </Card>

            <div className="text-center">
              <Space size="large">
                <Button 
                  type="primary" 
                  size="large" 
                  onClick={processDivision}
                  loading={loading}
                  icon={<ScissorOutlined />}
                  className="process-button"
                >
                  Dividir Planilha
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
          </div>
        )}

        {/* Etapa 3: Resultados */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={8}>
                <Card className="stats-card processed">
                  <div className="stats-content">
                    <div className="stats-icon">📊</div>
                    <div className="stats-info">
                      <Title level={2} className="stats-number">
                        {stats.totalRecords}
                      </Title>
                      <Text className="stats-label">Total de Registros</Text>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card className="stats-card pending">
                  <div className="stats-content">
                    <div className="stats-icon">👥</div>
                    <div className="stats-info">
                      <Title level={2} className="stats-number">
                        {stats.totalPeople}
                      </Title>
                      <Text className="stats-label">Pessoas/Grupos</Text>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card className="stats-card duplicates">
                  <div className="stats-content">
                    <div className="stats-icon">📈</div>
                    <div className="stats-info">
                      <Title level={2} className="stats-number">
                        {stats.averagePerPerson}
                      </Title>
                      <Text className="stats-label">Média por Pessoa</Text>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            <Card 
              title={
                <div className="table-header">
                  <ScissorOutlined className="table-icon" />
                  <span>Resultado da Divisão</span>
                </div>
              }
              extra={
                <Space>
                  <Button 
                    type="primary" 
                    icon={<DownloadOutlined />}
                    onClick={downloadDividedFiles}
                    className="download-button"
                    size="large"
                  >
                    Baixar Arquivos Separados
                  </Button>
                  <Button 
                    type="default" 
                    icon={<FileExcelOutlined />}
                    onClick={downloadConsolidatedFile}
                    className="download-button"
                    size="large"
                  >
                    Baixar Planilha Consolidada
                  </Button>
                </Space>
              }
              className="results-table-card"
            >
              <Table
                columns={getResultColumns()}
                dataSource={dividedData}
                rowKey={(record) => record.person.name}
                pagination={false}
                className="modern-table"
              />
            </Card>

            <div className="text-center">
              <Button 
                size="large"
                onClick={resetProcess} 
                icon={<DeleteOutlined />}
                className="reset-button"
              >
                Nova Divisão
              </Button>
            </div>
          </div>
        )}

        {loading && (
          <div className="loading-overlay">
            <Card className="loading-card">
              <div className="loading-content">
                <ScissorOutlined className="text-4xl text-blue-500 mb-4" />
                <Title level={4} className="loading-title">
                  Dividindo sua planilha...
                </Title>
                <Text className="loading-text">
                  Aguarde enquanto processamos a divisão dos dados
                </Text>
                <Progress 
                  percent={currentStep * 25} 
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

export default DivisionPage;

