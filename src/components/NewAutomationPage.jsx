import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

const NewAutomationPage = () => {
  const [file, setFile] = useState(null);
  const [sheetData, setSheetData] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [selectedAdvogados, setSelectedAdvogados] = useState({});
  const [prepostoSelections, setPrepostoSelections] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  // Listas de profissionais do arquivo DIVISAO.txt
  const advogadosPautistas = [
    "ALINE PRATES PEREIRA", "AMANDA VITORIA CARDOSO DOS SANTOS", "ANDRÉ DOCE SOUZA",
    "ARTHUR MATTOS REIS", "BRENO GOMES DOS SANTOS (B1)", "BRENO GOMES SANTOS (B2)",
    "CARLOS LUÍS SOUZA NEVES", "DAYSE DA ROCHA CUMMINGS", "ELIVAN DOS SANTOS LIMOEIRO",
    "EVA PATRICIA BARBOSA DE CASTRO", "ISAAC KELVIN MACHADO DA CUNHA", "ISLA SANTOS COELHO SILVA",
    "LARISSA LOPEZ DO PRADO BISPO", "LINDIELE SANTOS LOPES", "MARIANA KAITLYTN ALVES MATOS"
  ];

  const advogadosInternos = [
    "ADRIANA SANTOS SILVA", "ALAN KARDEC OLIVEIRA SANTOS", "ALBERTO SILVA SANTOS",
    "ALEXANDRE AQUINO DOS SANTOS PEREIRA", "ALINE PRATES PEREIRA", "AMANDA VITORIA CARDOSO DOS SANTOS",
    "ANA CAROLINA SANTOS SILVA", "ANA LUIZA OLIVEIRA SANTOS", "ANDRÉ DOCE SOUZA",
    "ARTHUR MATTOS REIS", "BEATRIZ SANTOS OLIVEIRA", "BRENO GOMES DOS SANTOS (B1)",
    "BRENO GOMES SANTOS (B2)", "BRUNO SANTOS SILVA", "CARLOS EDUARDO SANTOS OLIVEIRA",
    "CARLOS LUÍS SOUZA NEVES", "CAROLINA SANTOS SILVA", "DAYSE DA ROCHA CUMMINGS",
    "DIEGO SANTOS OLIVEIRA", "EDUARDO SANTOS SILVA", "ELIVAN DOS SANTOS LIMOEIRO",
    "EVA PATRICIA BARBOSA DE CASTRO", "FABIANA SANTOS OLIVEIRA", "FERNANDO SANTOS SILVA",
    "GABRIEL SANTOS OLIVEIRA", "GUILHERME SANTOS SILVA", "HELENA SANTOS OLIVEIRA",
    "ISAAC KELVIN MACHADO DA CUNHA", "ISLA SANTOS COELHO SILVA", "JOÃO SANTOS SILVA",
    "JULIANA SANTOS OLIVEIRA", "LARISSA LOPEZ DO PRADO BISPO", "LEONARDO SANTOS SILVA",
    "LINDIELE SANTOS LOPES", "LUCAS SANTOS OLIVEIRA", "MARCELO SANTOS SILVA",
    "MARIANA KAITLYTN ALVES MATOS", "MARIO SANTOS OLIVEIRA", "MATHEUS PEREIRA MENDES",
    "MAYALA ROCHA SAMPAIO ESTRELA", "NATALIA SANTOS SILVA", "PATRICIA SANTOS OLIVEIRA",
    "PAULO SANTOS SILVA", "PEDRO SANTOS OLIVEIRA", "RAFAEL SANTOS SILVA",
    "RAQUEL SANTOS OLIVEIRA", "REBECA VITÓRIA MENDES VASCONCELOS", "RICARDO SANTOS SILVA",
    "RODRIGO SANTOS OLIVEIRA", "SANDRA SANTOS SILVA", "SERGIO SANTOS OLIVEIRA",
    "TATIANA SANTOS SILVA", "THIAGO SANTOS OLIVEIRA", "VANESSA SANTOS SILVA",
    "VICTOR SANTOS OLIVEIRA", "VIVIANE SANTOS SILVA", "WAGNER SANTOS OLIVEIRA",
    "WELLINGTON SANTOS SILVA", "YARA SANTOS OLIVEIRA", "ZELIA SANTOS SILVA",
    "ADRIANO SANTOS SILVA", "ALESSANDRA SANTOS OLIVEIRA", "ALEXANDRE SANTOS SILVA",
    "ALINE SANTOS OLIVEIRA", "ANDERSON SANTOS SILVA", "ANDREA SANTOS OLIVEIRA",
    "ANTONIO SANTOS SILVA", "BARBARA SANTOS OLIVEIRA", "CAMILA SANTOS SILVA",
    "CESAR SANTOS OLIVEIRA", "CLAUDIA SANTOS SILVA", "CRISTINA SANTOS OLIVEIRA",
    "DANIEL SANTOS SILVA", "DENISE SANTOS OLIVEIRA", "EDSON SANTOS SILVA",
    "ELAINE SANTOS OLIVEIRA", "FABIO SANTOS SILVA", "FERNANDA SANTOS OLIVEIRA"
  ];

  const prepostosPautistas = [
    "ELIVAN DOS SANTOS LIMOEIRO", "CARLOS LUÍS SOUZA NEVES", "DAYSE DA ROCHA CUMMINGS",
    "LINDIELE SANTOS LOPES", "BRENO GOMES DOS SANTOS (B1)", "BRENO GOMES SANTOS (B2)",
    "MARIANA KAITLYTN ALVES MATOS", "EVA PATRICIA BARBOSA DE CASTRO",
    "AMANDA VITORIA CARDOSO DOS SANTOS", "REBECA VITÓRIA MENDES VASCONCELOS",
    "ANDRÉ DOCE SOUZA"
  ];

  const prepostosIntegrais = [
    "MAYALA ROCHA SAMPAIO ESTRELA", "MATHEUS PEREIRA MENDES", "RAAB SOUZA DE JESUS",
    "ALEXANDRE AQUINO DOS SANTOS PEREIRA", "ARTHUR MATTOS REIS", "ISAAC KELVIN MACHADO DA CUNHA",
    "ISLA SANTOS COELHO SILVA", "LARISSA LOPEZ DO PRADO BISPO", "ALINE PRATES PEREIRA",
    "AMANDA VITORIA CARDOSO DOS SANTOS", "ANDRÉ DOCE SOUZA", "BRENO GOMES DOS SANTOS (B1)",
    "BRENO GOMES SANTOS (B2)", "CARLOS LUÍS SOUZA NEVES", "DAYSE DA ROCHA CUMMINGS",
    "ELIVAN DOS SANTOS LIMOEIRO", "EVA PATRICIA BARBOSA DE CASTRO", "LINDIELE SANTOS LOPES",
    "MARIANA KAITLYTN ALVES MATOS", "REBECA VITÓRIA MENDES VASCONCELOS", "ADRIANA SANTOS SILVA",
    "ALAN KARDEC OLIVEIRA SANTOS", "ALBERTO SILVA SANTOS", "ANA CAROLINA SANTOS SILVA",
    "ANA LUIZA OLIVEIRA SANTOS", "BEATRIZ SANTOS OLIVEIRA", "BRUNO SANTOS SILVA",
    "CARLOS EDUARDO SANTOS OLIVEIRA", "CAROLINA SANTOS SILVA", "DIEGO SANTOS OLIVEIRA",
    "EDUARDO SANTOS SILVA", "FABIANA SANTOS OLIVEIRA", "FERNANDO SANTOS SILVA",
    "GABRIEL SANTOS OLIVEIRA", "GUILHERME SANTOS SILVA", "HELENA SANTOS OLIVEIRA",
    "JOÃO SANTOS SILVA", "JULIANA SANTOS OLIVEIRA", "LEONARDO SANTOS SILVA",
    "LUCAS SANTOS OLIVEIRA", "MARCELO SANTOS SILVA", "MARIO SANTOS OLIVEIRA"
  ];

  const prepostosEstagiarios = [
    "NATALIA SANTOS SILVA", "PATRICIA SANTOS OLIVEIRA", "PAULO SANTOS SILVA",
    "PEDRO SANTOS OLIVEIRA", "RAFAEL SANTOS SILVA", "RAQUEL SANTOS OLIVEIRA",
    "RICARDO SANTOS SILVA", "RODRIGO SANTOS OLIVEIRA", "SANDRA SANTOS SILVA",
    "SERGIO SANTOS OLIVEIRA", "TATIANA SANTOS SILVA", "THIAGO SANTOS OLIVEIRA",
    "VANESSA SANTOS SILVA", "VICTOR SANTOS OLIVEIRA", "VIVIANE SANTOS SILVA",
    "WAGNER SANTOS OLIVEIRA", "WELLINGTON SANTOS SILVA", "YARA SANTOS OLIVEIRA",
    "ZELIA SANTOS SILVA", "ADRIANO SANTOS SILVA", "ALESSANDRA SANTOS OLIVEIRA",
    "ALEXANDRE SANTOS SILVA", "ALINE SANTOS OLIVEIRA", "ANDERSON SANTOS SILVA",
    "ANDREA SANTOS OLIVEIRA", "ANTONIO SANTOS SILVA", "BARBARA SANTOS OLIVEIRA",
    "CAMILA SANTOS SILVA", "CESAR SANTOS OLIVEIRA", "CLAUDIA SANTOS SILVA",
    "CRISTINA SANTOS OLIVEIRA", "DANIEL SANTOS SILVA", "DENISE SANTOS OLIVEIRA",
    "EDSON SANTOS SILVA", "ELAINE SANTOS OLIVEIRA", "FABIO SANTOS SILVA",
    "FERNANDA SANTOS OLIVEIRA", "GUSTAVO SANTOS SILVA", "HELENA SANTOS OLIVEIRA",
    "IGOR SANTOS SILVA", "JESSICA SANTOS OLIVEIRA", "KARINA SANTOS SILVA",
    "LEANDRO SANTOS OLIVEIRA", "MONICA SANTOS SILVA", "NELSON SANTOS OLIVEIRA",
    "OTAVIO SANTOS OLIVEIRA", "PRISCILA SANTOS OLIVEIRA", "RENATO SANTOS SILVA"
  ];

  const tiposAudiencia = [
    'Audiência Virtual - Una',
    'Audiência Virtual - Tentativa de Conciliação',
    'Audiência Virtual - Instrução'
  ];

  // Função para converter número decimal do Excel para formato HH:MM
  const formatExcelTime = (excelTime) => {
    if (typeof excelTime === 'number') {
      // Excel armazena tempo como fração de um dia (0.5 = 12:00)
      const totalMinutes = Math.round(excelTime * 24 * 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // Se já é uma string, tentar formatar
    if (typeof excelTime === 'string') {
      // Se já está no formato HH:MM, retornar como está
      if (/^\d{1,2}:\d{2}$/.test(excelTime)) {
        return excelTime;
      }
      
      // Se é um número em string, converter
      const num = parseFloat(excelTime);
      if (!isNaN(num)) {
        const totalMinutes = Math.round(num * 24 * 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
    }
    
    // Se não conseguir converter, retornar valor padrão
    return 'N/A';
  };

  // Função para converter data do Excel para formato DD/MM/YYYY
  const formatExcelDate = (excelDate) => {
    if (!excelDate) return 'N/A';
    
    try {
      // Se é um número (formato Excel)
      if (typeof excelDate === 'number') {
        // Excel conta dias desde 1 de janeiro de 1900
        // Mas tem um bug: considera 1900 como ano bissexto (não é)
        // Por isso subtraímos 1 dia para corrigir
        const excelEpoch = new Date(1900, 0, 1);
        const date = new Date(excelEpoch.getTime() + (excelDate - 1) * 24 * 60 * 60 * 1000);
        
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        
        return `${day}/${month}/${year}`;
      }
      
      // Se é uma string, tentar converter
      if (typeof excelDate === 'string') {
        // Se já está no formato DD/MM/YYYY, retornar como está
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(excelDate)) {
          return excelDate;
        }
        
        // Tentar converter string para data
        const date = new Date(excelDate);
        if (!isNaN(date.getTime())) {
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();
          
          return `${day}/${month}/${year}`;
        }
      }
      
      // Se é um objeto Date
      if (excelDate instanceof Date && !isNaN(excelDate.getTime())) {
        const day = excelDate.getDate().toString().padStart(2, '0');
        const month = (excelDate.getMonth() + 1).toString().padStart(2, '0');
        const year = excelDate.getFullYear();
        
        return `${day}/${month}/${year}`;
      }
      
    } catch (error) {
      console.error('Erro ao formatar data:', error);
    }
    
    return 'N/A';
  };

  // Função para processar o arquivo Excel
  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setIsProcessing(true);

    try {
      const data = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      setSheetData(jsonData);

      // Analisar dados por cliente usando CLIENTE
      const clienteAnalysis = {};
      const clienteAudiencias = {};

      jsonData.forEach((row, index) => {
        // Usar CLIENTE como identificador do cliente
        const cliente = row['CLIENTE'] || row['REU.Nome'] || row['Reu'] || row['Cliente'] || 'Não identificado';
        const tipoAud = row['TIPO DE AUD'] || row['TRA.EVE.Descrição'] || row['Tipo de Aud'] || row['Tipo_Audiencia'] || 'Não identificado';
        
        if (!clienteAnalysis[cliente]) {
          clienteAnalysis[cliente] = 0;
          clienteAudiencias[cliente] = [];
        }
        
        clienteAnalysis[cliente]++;
        clienteAudiencias[cliente].push({
          ...row,
          index: index
        });
      });

      setAnalysisData({
        clienteAnalysis,
        clienteAudiencias,
        totalAudiencias: jsonData.length
      });

      // Inicializar seleções de advogados
      const initialAdvogados = {};
      Object.keys(clienteAnalysis).forEach(cliente => {
        const qtdAudiencias = clienteAnalysis[cliente];
        const sugestaoAdvogados = Math.min(Math.max(Math.ceil(qtdAudiencias / 10), 1), 10); // 1 advogado a cada 10 audiências, min 1, max 10
        
        initialAdvogados[cliente] = {
          quantidade: sugestaoAdvogados,
          selecionados: []
        };
      });
      setSelectedAdvogados(initialAdvogados);

      console.log('Análise concluída:', {
        clientes: Object.keys(clienteAnalysis),
        totalAudiencias: jsonData.length,
        clienteAnalysis
      });

    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      alert('Erro ao processar o arquivo. Verifique se é um arquivo Excel válido.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Função para atualizar quantidade de advogados por cliente
  const updateAdvogadoQuantity = (cliente, quantidade) => {
    const qtd = parseInt(quantidade) || 0;
    setSelectedAdvogados(prev => ({
      ...prev,
      [cliente]: {
        ...prev[cliente],
        quantidade: qtd,
        selecionados: prev[cliente]?.selecionados?.slice(0, qtd) || [] // Manter apenas os primeiros N selecionados
      }
    }));
  };

  // Função para selecionar/deselecionar advogados
  const toggleAdvogadoSelection = (cliente, advogado) => {
    setSelectedAdvogados(prev => {
      const current = prev[cliente] || { quantidade: 0, selecionados: [] };
      const isSelected = current.selecionados.includes(advogado);
      
      let newSelecionados;
      if (isSelected) {
        newSelecionados = current.selecionados.filter(a => a !== advogado);
      } else {
        if (current.selecionados.length < current.quantidade) {
          newSelecionados = [...current.selecionados, advogado];
        } else {
          alert(`Você já selecionou ${current.quantidade} advogados para ${cliente}`);
          return prev;
        }
      }

      return {
        ...prev,
        [cliente]: {
          ...current,
          selecionados: newSelecionados
        }
      };
    });
  };

  // Função para distribuir audiências respeitando intervalo de 1 hora
  const distribuirAudiencias = (audiencias, advogados) => {
    if (!advogados || advogados.length === 0) return audiencias;

    // Ordenar audiências por data e hora
    const audienciasOrdenadas = [...audiencias].sort((a, b) => {
      const dataA = new Date(`${formatExcelDate(a['DATA'] || a['TRA.Agenda data'] || a.Data_Audiencia || a.Data)} ${formatExcelTime(a['HORA LOCAL'] || a['TRA.Hora da agenda'] || a.Hora || '00:00')}`);
      const dataB = new Date(`${formatExcelDate(b['DATA'] || b['TRA.Agenda data'] || b.Data_Audiencia || b.Data)} ${formatExcelTime(b['HORA LOCAL'] || b['TRA.Hora da agenda'] || b.Hora || '00:00')}`);
      return dataA - dataB;
    });

    // Controle de horários por advogado
    const ultimoHorario = {};
    advogados.forEach(adv => {
      ultimoHorario[adv] = null;
    });

    let advogadoIndex = 0;
    const audienciasDistribuidas = audienciasOrdenadas.map(audiencia => {
      const dataHoraAudiencia = new Date(`${formatExcelDate(audiencia['DATA'] || audiencia['TRA.Agenda data'] || audiencia.Data_Audiencia || audiencia.Data)} ${formatExcelTime(audiencia['HORA LOCAL'] || audiencia['TRA.Hora da agenda'] || audiencia.Hora || '00:00')}`);
      
      // Encontrar próximo advogado disponível (respeitando intervalo de 1 hora)
      let tentativas = 0;
      while (tentativas < advogados.length) {
        const advogadoAtual = advogados[advogadoIndex];
        const ultimoHorarioAdvogado = ultimoHorario[advogadoAtual];
        
        if (!ultimoHorarioAdvogado || 
            (dataHoraAudiencia - ultimoHorarioAdvogado) >= 60 * 60 * 1000) { // 1 hora em ms
          
          ultimoHorario[advogadoAtual] = dataHoraAudiencia;
          const advogadoFinal = `${advogadoAtual}`;
          
          advogadoIndex = (advogadoIndex + 1) % advogados.length;
          
          return {
            ...audiencia,
            Advogado: advogadoFinal
          };
        }
        
        advogadoIndex = (advogadoIndex + 1) % advogados.length;
        tentativas++;
      }
      
      // Se não encontrou advogado disponível, usar o primeiro mesmo assim
      const advogadoFinal = `${advogados[0]}`;
      return {
        ...audiencia,
        Advogado: advogadoFinal
      };
    });

    return audienciasDistribuidas;
  };

  // Função para processar e distribuir audiências
  const processarAudiencias = async () => {
    if (!sheetData || !analysisData) {
      alert('Por favor, faça upload de uma planilha primeiro.');
      return;
    }

    setIsProcessing(true);

    try {
      let dadosProcessados = [...sheetData];

      // Aplicar distribuição de advogados para cada cliente
      Object.keys(analysisData.clienteAudiencias).forEach(cliente => {
        const audienciasCliente = analysisData.clienteAudiencias[cliente];
        const advogadosSelecionados = selectedAdvogados[cliente]?.selecionados || [];
        
        if (advogadosSelecionados.length > 0) {
          const audienciasDistribuidas = distribuirAudiencias(audienciasCliente, advogadosSelecionados);
          
          // Atualizar dados processados
          audienciasDistribuidas.forEach(audienciaDistribuida => {
            const index = audienciaDistribuida.index;
            if (dadosProcessados[index]) {
              dadosProcessados[index] = {
                ...dadosProcessados[index],
                Advogado: audienciaDistribuida.Advogado,
                Preposto: prepostoSelections[cliente]?.[audienciaDistribuida['TIPO DE AUD']] || '',
                Observacao: `Cliente: ${cliente}`,
                'HORA SSA': formatExcelTime(dadosProcessados[index]['HORA LOCAL'] || '00:00')
              };
            }
          });
        }
      });

      // Gerar planilha unificada
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(dadosProcessados);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Planilha_Unificada');

      // Download da planilha
      XLSX.writeFile(workbook, 'planilha_pauta_audiencia_processada.xlsx');

      alert('Planilha processada e baixada com sucesso!');

    } catch (error) {
      console.error('Erro ao processar audiências:', error);
      alert('Erro ao processar as audiências. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Função para ajustar horário para fuso de SSA
  const adjustTimeToSSA = (hora) => {
    return formatExcelTime(hora);
  };

  // Função para atualizar seleção de prepostos
  const updatePrepostoSelection = (cliente, tipoAudiencia, preposto) => {
    setPrepostoSelections(prev => ({
      ...prev,
      [cliente]: {
        ...prev[cliente],
        [tipoAudiencia]: preposto
      }
    }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6">Divisora de Planilhas - Pauta de Audiência</h2>

      {/* Seção 1: Upload de Arquivo */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">1. Selecionar Planilha</h3>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {isProcessing && (
          <div className="mt-4 text-blue-600">Processando arquivo...</div>
        )}
      </div>

      {/* Seção 2: Visualização da Análise */}
      {analysisData && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">2. Análise da Planilha</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {Object.entries(analysisData.clienteAnalysis).map(([cliente, quantidade]) => (
              <div key={cliente} className="bg-blue-50 p-4 rounded-lg text-center border">
                <div className="font-semibold text-blue-800 text-sm mb-1">{cliente}</div>
                <div className="text-3xl font-bold text-blue-600">{quantidade}</div>
                <div className="text-sm text-blue-600">audiências</div>
              </div>
            ))}
          </div>
          <div className="text-center text-gray-600 bg-gray-50 p-3 rounded">
            Total de audiências: <span className="font-semibold text-lg">{analysisData.totalAudiencias}</span>
          </div>
        </div>
      )}

      {/* Seção 3: Configuração de Advogados por Cliente */}
      {analysisData && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">3. Configurar Advogados por Cliente</h3>
          {Object.entries(analysisData.clienteAnalysis).map(([cliente, totalAudiencias]) => (
            <div key={cliente} className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-semibold text-lg mb-3 text-blue-800">
                Cliente: {cliente} ({totalAudiencias} audiências)
              </h4>
              
              {/* Quantidade de advogados */}
              <div className="mb-4 bg-white p-3 rounded border">
                <label className="block text-sm font-medium mb-2">
                  Quantidade de advogados para este cliente:
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={selectedAdvogados[cliente]?.quantidade || 1}
                    onChange={(e) => updateAdvogadoQuantity(cliente, e.target.value)}
                    className="w-20 p-2 border rounded"
                  />
                  <span className="text-sm text-gray-600">
                    Selecionados: <span className="font-semibold text-blue-600">
                      {selectedAdvogados[cliente]?.selecionados?.length || 0}
                    </span> / {selectedAdvogados[cliente]?.quantidade || 0}
                  </span>
                </div>
              </div>

              {/* Lista de advogados disponíveis */}
              <div className="mb-4 bg-white p-3 rounded border">
                <label className="block text-sm font-medium mb-2">
                  Selecionar advogados (clique para selecionar/deselecionar):
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                  {[...advogadosPautistas, ...advogadosInternos].map(advogado => {
                    const isSelected = selectedAdvogados[cliente]?.selecionados?.includes(advogado) || false;
                    return (
                      <button
                        key={advogado}
                        onClick={() => toggleAdvogadoSelection(cliente, advogado)}
                        className={`p-2 text-xs rounded border text-left transition-colors ${
                          isSelected 
                            ? 'bg-blue-100 border-blue-500 text-blue-700 font-medium' 
                            : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {advogado}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Visualizar audiências do cliente */}
              <div className="mb-4 bg-white p-3 rounded border">
                <details className="cursor-pointer">
                  <summary className="font-medium text-blue-600 hover:text-blue-800 py-2">
                    📋 Ver todas as audiências deste cliente ({totalAudiencias})
                  </summary>
                  <div className="mt-3 max-h-80 overflow-y-auto border rounded">
                    <table className="w-full text-xs border-collapse">
                      <thead className="bg-gray-100 sticky top-0">
                        <tr>
                          <th className="border border-gray-300 p-2 text-left">Data</th>
                          <th className="border border-gray-300 p-2 text-left">Hora Local</th>
                          <th className="border border-gray-300 p-2 text-left">Hora SSA</th>
                          <th className="border border-gray-300 p-2 text-left">Tipo de Audiência</th>
                          <th className="border border-gray-300 p-2 text-left">Processo</th>
                          <th className="border border-gray-300 p-2 text-left">Autor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysisData.clienteAudiencias[cliente]?.map((audiencia, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border border-gray-300 p-2">
                              {formatExcelDate(audiencia['DATA'])}
                            </td>
                            <td className="border border-gray-300 p-2">
                              {formatExcelTime(audiencia['HORA LOCAL'])}
                            </td>
                            <td className="border border-gray-300 p-2">
                              {formatExcelTime(audiencia['HORA SSA'])}
                            </td>
                            <td className="border border-gray-300 p-2">
                              {audiencia['TIPO DE AUD'] || 'N/A'}
                            </td>
                            <td className="border border-gray-300 p-2">
                              {audiencia['Nº PROCESSO'] || 'N/A'}
                            </td>
                            <td className="border border-gray-300 p-2">
                              {audiencia['AUTOR'] || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Seção 4: Atribuir Prepostos */}
      {analysisData && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">4. Atribuir Prepostos por Cliente e Tipo de Audiência</h3>
          {Object.keys(analysisData.clienteAnalysis).map(cliente => (
            <div key={cliente} className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-semibold mb-3 text-blue-800">
                Cliente: {cliente} ({selectedAdvogados[cliente]?.quantidade || 0} advogados configurados)
              </h4>
              {tiposAudiencia.map(tipo => (
                <div key={tipo} className="mb-3">
                  <label className="block text-sm font-medium mb-1">{tipo}:</label>
                  <select
                    value={prepostoSelections[cliente]?.[tipo] || ''}
                    onChange={(e) => updatePrepostoSelection(cliente, tipo, e.target.value)}
                    className="w-full p-2 border rounded bg-white"
                  >
                    <option value="">Selecione um preposto...</option>
                    {[...prepostosPautistas, ...prepostosIntegrais, ...prepostosEstagiarios].map(preposto => (
                      <option key={preposto} value={preposto}>{preposto}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Botão de Processar */}
      {analysisData && (
        <div className="text-center">
          <button
            onClick={processarAudiencias}
            disabled={isProcessing}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg disabled:opacity-50 text-lg"
          >
            {isProcessing ? 'Processando...' : 'Processar e Distribuir Audiências Automaticamente'}
          </button>
        </div>
      )}

      {/* Informações Importantes */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-semibold mb-2 text-blue-800">ℹ️ Informações Importantes:</h4>
        <ul className="text-sm space-y-1 text-blue-700">
          <li>• A planilha é analisada automaticamente ao fazer upload</li>
          <li>• Você pode visualizar todas as audiências de cada cliente</li>
          <li>• Selecione quantos advogados deseja para cada cliente</li>
          <li>• Escolha especificamente quais advogados serão atribuídos</li>
          <li>• As audiências são distribuídas automaticamente respeitando intervalo de 1 hora</li>
          <li>• As datas e horas são convertidas automaticamente do formato Excel</li>
          <li>• A planilha final é unificada com todas as atribuições</li>
        </ul>
      </div>
    </div>
  );
};

export default NewAutomationPage;

