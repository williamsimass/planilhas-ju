import React, { useState } from 'react';
import {
  Modal,
  Table,
  Typography,
  Space,
  Tag,
  Button,
  Statistic,
  Row,
  Col,
  Card,
  Divider
} from 'antd';
import {
  EyeOutlined,
  FileTextOutlined,
  BarChartOutlined,
  CloseOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const DataPreview = ({ visible, onClose, data, fileName, title }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  if (!data || data.length === 0) {
    return (
      <Modal
        title={
          <Space>
            <EyeOutlined />
            <span>Preview - {title}</span>
          </Space>
        }
        open={visible}
        onCancel={onClose}
        footer={[
          <Button key="close" onClick={onClose} icon={<CloseOutlined />}>
            Fechar
          </Button>
        ]}
        width={800}
        centered
      >
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <FileTextOutlined style={{ fontSize: '48px', color: '#d1d5db', marginBottom: '16px' }} />
          <Title level={4} type="secondary">Nenhum dado disponível</Title>
          <Text type="secondary">Carregue uma planilha para visualizar os dados</Text>
        </div>
      </Modal>
    );
  }

  // Estatísticas dos dados
  const totalRows = data.length;
  const totalColumns = Object.keys(data[0] || {}).length;
  const columns = Object.keys(data[0] || {});

  // Detectar tipos de dados
  const getColumnType = (columnName) => {
    const sampleValues = data.slice(0, 10).map(row => row[columnName]).filter(val => val != null);
    if (sampleValues.length === 0) return 'text';
    
    const numericCount = sampleValues.filter(val => !isNaN(val) && val !== '').length;
    const dateCount = sampleValues.filter(val => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && val.toString().includes('/') || val.toString().includes('-');
    }).length;
    
    if (numericCount > sampleValues.length * 0.7) return 'number';
    if (dateCount > sampleValues.length * 0.7) return 'date';
    return 'text';
  };

  // Configurar colunas da tabela
  const tableColumns = columns.map(col => {
    const type = getColumnType(col);
    return {
      title: (
        <Space direction="vertical" size={0}>
          <Text strong>{col}</Text>
          <Tag 
            size="small" 
            color={type === 'number' ? 'blue' : type === 'date' ? 'green' : 'default'}
          >
            {type === 'number' ? 'Número' : type === 'date' ? 'Data' : 'Texto'}
          </Tag>
        </Space>
      ),
      dataIndex: col,
      key: col,
      ellipsis: true,
      width: 200,
      render: (text) => {
        if (text == null || text === '') {
          return <Text type="secondary" italic>Vazio</Text>;
        }
        if (typeof text === 'string' && text.length > 50) {
          return (
            <Text title={text}>
              {text.substring(0, 50)}...
            </Text>
          );
        }
        return text;
      }
    };
  });

  return (
    <Modal
      title={
        <Space>
          <EyeOutlined />
          <span>Preview - {title}</span>
          <Tag color="blue">{fileName}</Tag>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose} icon={<CloseOutlined />}>
          Fechar
        </Button>
      ]}
      width="90%"
      style={{ maxWidth: '1200px' }}
      centered
      bodyStyle={{ padding: '24px' }}
    >
      {/* Estatísticas */}
      <Card 
        size="small" 
        style={{ 
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          border: 'none'
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Statistic
              title="Total de Linhas"
              value={totalRows}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#3b82f6', fontSize: '20px', fontWeight: 'bold' }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Total de Colunas"
              value={totalColumns}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#10b981', fontSize: '20px', fontWeight: 'bold' }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Página Atual"
              value={currentPage}
              suffix={`/ ${Math.ceil(totalRows / pageSize)}`}
              valueStyle={{ color: '#f59e0b', fontSize: '20px', fontWeight: 'bold' }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Registros/Página"
              value={pageSize}
              valueStyle={{ color: '#8b5cf6', fontSize: '20px', fontWeight: 'bold' }}
            />
          </Col>
        </Row>
      </Card>

      <Divider orientation="left">
        <Space>
          <FileTextOutlined />
          <Text strong>Dados da Planilha</Text>
        </Space>
      </Divider>

      {/* Tabela de dados */}
      <Table
        columns={tableColumns}
        dataSource={data}
        rowKey={(record, index) => index}
        scroll={{ x: true, y: 400 }}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalRows,
          onChange: setCurrentPage,
          showSizeChanger: false,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} de ${total} registros`,
          style: { marginTop: '16px' }
        }}
        size="small"
        bordered
        style={{
          background: 'white',
          borderRadius: '12px',
          overflow: 'hidden'
        }}
      />
    </Modal>
  );
};

export default DataPreview;

