import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

// Função para distribuir audiências entre advogados respeitando intervalo mínimo de 1 hora
const distribuirAudiencias = (audiencias, advogados) => {
  if (!advogados || advogados.length === 0) return audiencias;

  console.log(`Distribuindo ${audiencias.length} audiências entre ${advogados.length} advogados`);

  // Função para converter data/hora do Excel para objeto Date
  const parseDateTime = (audiencia) => {
    const data = audiencia['DATA'] || audiencia['TRA.Agenda data'] || audiencia.Data_Audiencia || audiencia.Data;
    const hora = audiencia['HORA SSA'] || audiencia['HORA LOCAL'] || audiencia['TRA.Hora da agenda'] || audiencia.Hora || 0;
    
    let dateObj;
    
    // Se data é um número (formato Excel)
    if (typeof data === 'number') {
      const excelEpoch = new Date(1900, 0, 1);
      dateObj = new Date(excelEpoch.getTime() + (data - 1) * 24 * 60 * 60 * 1000);
    } else if (data instanceof Date) {
      dateObj = new Date(data);
    } else {
      dateObj = new Date(data);
    }
    
    // Adicionar hora
    if (typeof hora === 'number') {
      const totalMinutes = Math.round(hora * 24 * 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      dateObj.setHours(hours, minutes, 0, 0);
    }
    
    return dateObj;
  };

  // Ordenar audiências por data e hora
  const audienciasOrdenadas = [...audiencias].sort((a, b) => {
    const dateA = parseDateTime(a);
    const dateB = parseDateTime(b);
    return dateA.getTime() - dateB.getTime();
  });

  // Controle de horários ocupados por cada advogado
  const agendaAdvogados = {};
  advogados.forEach(adv => {
    agendaAdvogados[adv] = []; // Array de horários ocupados por cada advogado
  });

  const audienciasDistribuidas = audienciasOrdenadas.map((audiencia, idx) => {
    const dataHoraAudiencia = parseDateTime(audiencia);
    
    console.log(`Processando audiência ${idx + 1}: ${dataHoraAudiencia.toLocaleString('pt-BR')}`);

    // Encontrar advogado disponível que respeite o intervalo de 1 hora
    let advogadoEscolhido = null;
    
    for (let i = 0; i < advogados.length; i++) {
      const advogado = advogados[i];
      const horariosOcupados = agendaAdvogados[advogado];
      
      // Verificar se este advogado pode pegar esta audiência
      let podeAtribuir = true;
      
      for (let horarioOcupado of horariosOcupados) {
        const diferencaMs = Math.abs(dataHoraAudiencia.getTime() - horarioOcupado.getTime());
        const diferencaMinutos = diferencaMs / (1000 * 60);
        
        // Se a diferença for menor que 60 minutos (1 hora), não pode atribuir
        if (diferencaMinutos < 60) {
          console.log(`Advogado ${advogado} não pode pegar audiência ${dataHoraAudiencia.toLocaleString('pt-BR')} - conflito com horário ${horarioOcupado.toLocaleString('pt-BR')} (diferença: ${diferencaMinutos.toFixed(1)} min)`);
          podeAtribuir = false;
          break;
        }
      }
      
      if (podeAtribuir) {
        advogadoEscolhido = advogado;
        agendaAdvogados[advogado].push(dataHoraAudiencia);
        console.log(`Audiência ${dataHoraAudiencia.toLocaleString('pt-BR')} atribuída para ${advogado}`);
        break;
      }
    }
    
    // Se nenhum advogado está disponível, forçar atribuição para o primeiro (situação de sobrecarga)
    if (!advogadoEscolhido) {
      advogadoEscolhido = advogados[0];
      agendaAdvogados[advogados[0]].push(dataHoraAudiencia);
      console.warn(`ATENÇÃO: Audiência ${dataHoraAudiencia.toLocaleString('pt-BR')} forçada para ${advogados[0]} - todos os advogados estavam ocupados`);
    }
    
    return {
      ...audiencia,
      AdvogadoAtribuido: advogadoEscolhido
    };
  });

  // Log final da distribuição
  console.log('Distribuição final:');
  advogados.forEach(adv => {
    console.log(`${adv}: ${agendaAdvogados[adv].length} audiências`);
  });

  return audienciasDistribuidas;
};

const NewAutomationPage = () => {
  const [file, setFile] = useState(null);
  const [sheetData, setSheetData] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [selectedAdvogados, setSelectedAdvogados] = useState({});
  const [prepostoSelections, setPrepostoSelections] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  // Listas de profissionais do arquivo DIVISAO.txt - CORRIGIDAS
  const advogadosPautistas = [
    "ALINE PRATES PEREIRA", "DANIEL ARAUJO DALTRO", "GLEYCE SAMARA DOS SANTOS FERREIRA",
    "GYZELLA PARANHOS DOS SANTOS SOUSA", "JANAINA ROCHA DA SILVA AKINTOYESE", "JOELMA COSTA LIMA GREGO",
    "MONIQUE FREITAS MENEZES", "VIVIAN DA SILVA CASTRO", "CAMILA GOMES DA SILVA LIMA",
    "FABRÍCIO ALVES MARIANO", "CAROLINE MOTA", "JULIE ANNE NOVAIS REGO MARQUES",
    "MILA BASTOS SAMPAIO ORRICO", "DÉBORA DE JESUS SANTOS", "MAIANE SANTOS CARVALHO"
  ];

  const advogadosInternos = [
    "ANA JULYA MUNIZ DA SILVA", "CARLOS ALBERTO PERRELLI FERNANDES FILHO", "REBECA MAIA HORTA",
    "VICTORIA MENDES ROCHA", "JULIANA DE JESUS SILVA", "THOMAZ JOSÉ DA SILVA BOMFIM",
    "VANESSA BARREIRA COUTO FERREIRA RIBEIRO", "SAADIA IRANI MACARIO BRANDÃO", "ADRIELLE SANTOS BRANDÃO",
    "ALICE NABUCO ABREU SOUSA", "ALINE KAREN SANTOS RIBEIRO", "AMANDA SOUZA MOINHOS",
    "AMANDA TANAJURA FLOR", "ANA PAULA SANTOS DE JESUS", "ANA VICTORIA MARBACK DOS SANTOS",
    "ANGELA KARINE DA SILVA FIGUEIREDO", "ANNA BEATRIZ DUPLAT ABREU", "ANTONIO LUCAS DINIZ GONÇALVES BATISTA",
    "CAROLINE PEREIRA CARVALHO", "CLEBERSON MACHADO PARENTE", "DAIANE SANTANA DE JESUS",
    "DIEGO LOPES AZEVEDO", "ELOÁ MASCARENHAS MUNIZ", "FABRICIO SOUSA SANTOS AMARAL",
    "GILVAN ALMEIDA DE SOUZA", "GUSTAVO BARBOSA DE PAULA", "ISABELLA RENARIA TEIXEIRA ROCHA",
    "KAMILLA DE ASSIS SEMBLANO SILVA", "LARISSA PAIM PITANGA RIBEIRO LIMA", "LEILA DOS SANTOS GOMES",
    "LEONARDO FERREIRA DOS SANTOS", "LETÍCIA CASSIMIRO PÊGO", "LETICIA DE PINHO GONZAGA",
    "LORENA DE BRITO NASCIMENTO", "LUCAS DE MELLO BOTELHO", "MANUELA CARLA SOUSA RODRIGUES DE ARGOLLO",
    "NATHALIA DOS SANTOS SOUZA", "POLIANA ANDRADE BARBOSA", "PRISCILA WANDERLEY SARAIVA",
    "SILVANIA COSTA BARBOSA", "STEPHANIE NOVAES OLIVEIRA", "TAILANE DA COSTA DOS SANTOS",
    "TAINA OLIVEIRA BRITO", "TAISE JOSE DOS SANTOS", "THIAGO GOMES SILVA",
    "VICTOR MOURA SENNA", "VINICIUS MEIRA FONTES", "VICTOR PETTER ANDRÉ DÓREA",
    "BRUNA REIS OLIVEIRA MIRANDA", "TIAGO TARGINO CAVALCANTE DE SANTANA", "BEATRIZ CONCEIÇÃO DE MATOS",
    "BEATRIZ SANTOS PEIXOTO", "LARISSA DALTRO SANTANA", "LIVIA ANDRADE OLIVEIRA",
    "MONIQUE FREITAS", "BEATRIZ DA SILVA NUNES", "BEATRIZ SILVA REIS BATISTA",
    "JARDIEL LUQUINE DA SILVA NETO", "JORGE FRANCISCO CARDOZO DE SOUZA", "DÉBORA SILVA FREITAS MOLINA ESCOBAR",
    "FLÁVIA DA SILVA BRITO", "JEFFERSON LUÍS CHAGAS DOS SANTOS", "GABRIELA VIANA MENEZES",
    "LUANA PEDREIRA MASCARENHAS", "MICHAELLA COSTA TEIXEIRA", "VICTORIA GISELLE DOS REIS DE SOUZA",
    "AMANDA FEDULO FERNANDES", "KEY GONÇALVES FERNANDES FILHO", "THAIS EMANUELE DA CRUZ DOS SANTOS",
    "ALEXANDRE JATOBÁ GOMES", "LARISSA LEITE SANTANA", "PALOMA ROCHA ANDRADE"
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
    "ISLA SANTOS COELHO SILVA", "LARISSA LOPEZ DO PRADO BISPO", "MARIANA OLIVEIRA DOS REIS",
    "TAISE PINTO DA SILVA", "ISABELLA AGUIAR DE ALMEIDA CARNEIRO", "MARIA CLARA SOTELINO PASSOS",
    "RODRIGO MARTINS ALMEIDA", "SARA PEREIRA DA COSTA", "LÉA CALDAS",
    "ERYCKA DOMINIKE NBARBOSA DE SOUSA", "JÉSSICA CRISTIANE BORGES DE SOUZA", "YAGO GABRIEL ROCHA CARVALHO",
    "ROBERTO RODRIGUES DE LIMA FILHO", "LARISE SILVA DOS SANTOS", "JANAINA CARIBÉ DE ANDRADE",
    "EDCARLOS DE ARAÚJO BATISTA", "LEONARDO JUNQUEIRA AYRES SÁ WIERING", "LYARA ROCHA DOS SANTOS E SILVA",
    "LUIZ ANTONIO PEDROZA NUNES NETO", "EDUARDO AMBUS DE QUEIROZ", "ANA VITÓRIA CARVALHO",
    "DAIANA MACHADO SANTANA", "BRENDA NASCIMENTO DA CRUZ BEZERRA SANTOS", "RAFAEL SOUZA DANTAS",
    "RAFFAELA PEÇANHA", "JESSÉ CARDOSO DE SANTANA", "LUIZA BAHIA",
    "RAFAEL CRISOSTOMO DE QUEIROZ", "ANA LUÍSA DIAS BASTOS", "CAROL PIRES DA CRUZ BRITO",
    "KÉSSIA CONCEIÇÃO DA CRUZ", "ADRIELLE NERI DA SILVA SANTOS"
  ];

  const prepostosEstagiarios = [
    "ELIANE DE OLIVEIRA FERREIRA", "IGOR RIBEIRO CHAVES RIBEIRO", "JOÃO HENRIQUE DE SANTANA",
    "SAMUEL SANTOS CLEMENTINO", "IRIS NASCHA FRANÇA BOMFIM", "LUCAS GUILHERME SANTOS ALVES",
    "ÉRICA RODRIGUES DOS SANTOS", "JAMILE DE CARVALHO BARAÚNA", "SERGIO SOARES OLIVEIRA",
    "GEOVANA PINHEIRO SANTANA PAZ DE ALMEIDA", "HENRICO DAMASCENO DE CARVALHO", "PABLO KAUAN DOS SANTOS VELOSO",
    "MARIA EDUARDA BASTOS BRITO DE SANTANA", "IZABELLY CARDOSO LEÃO", "MARIA CLARA DA HORA DOS SANTOS",
    "ANA JÚLIA ANJOS DE SOUSA SANTOS", "CAROLINA MAYA DE CARVALHO", "EDSON DE OLIVEIRA SANTOS",
    "FERNANDA VIEIRA VINHAS", "JULIANA KNAPP GAGLIANO DE ALVARENGA", "JULIANA MARIA AFFONSO BORGES",
    "LAURA GREICE PAIXÃO", "LORENA SAMPAIO GUEDES AZEVEDO", "LUZIA ISABEL MOURA SILVA",
    "MARCELLE NICOLLY COELHO DE JESUS", "MATEUS FAHEL", "SOFIA HELENA AMADO",
    "RAFAELA MELO", "VÍTOR BACELLAR SILVEIRA DULTRA", "AYLA MIKAELE MATOS DOS SANTOS",
    "BEATRIZ GOUVEIA", "BRUNO RAMOS BRUM FILHO", "JOÃO GABRIEL DE JESUS DIAS",
    "LARISSA DIAS DE JESUS MIRANDA", "LARISSA FERNANDES MESQUITA", "LUANDA MILCA OLIVEIRA COSTA SANTOS",
    "MARIA EDUARDA AMORIM FERNANDES", "LÍCIA SOUZA MENDONÇA NASCIMENTO", "NINA ALMEIDA VILELA TORRES",
    "CECÍLIA ALVES DE JESUS NASCIMENTO", "GABRIEL COSTA PROTÁSIO DOS SANTOS", "LETÍCIA OLIVEIRA BRUNELLI SANTOS"
  ];

  const tiposAudiencia = [
    'Audiência Virtual - Una',
    'Audiência Virtual - Tentativa de Conciliação',
    'Audiência Virtual - Instrução'
  ];

  // Lista APENAS de advogados (pautistas + internos) - SEM prepostos
  const todosAdvogados = [...advogadosPautistas, ...advogadosInternos];

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
          console.log(`Processando cliente: ${cliente} com ${audienciasCliente.length} audiências e ${advogadosSelecionados.length} advogados`);
          
          const audienciasDistribuidas = distribuirAudiencias(audienciasCliente, advogadosSelecionados);
          
          // Atualizar dados processados
          audienciasDistribuidas.forEach(audienciaDistribuida => {
            const index = audienciaDistribuida.index;
            if (dadosProcessados[index]) {
              dadosProcessados[index] = {
                ...dadosProcessados[index],
                'ADVOGADO': audienciaDistribuida.AdvogadoAtribuido,
                'PREPOSTO': prepostoSelections[cliente]?.[audienciaDistribuida['TIPO DE AUD']] || '',
                'OBSERVAÇÃO': `Cliente: ${cliente}`,
                'HORA SSA FORMATADA': formatExcelTime(dadosProcessados[index]['HORA LOCAL'] || dadosProcessados[index]['HORA SSA'] || '00:00')
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

              {/* Lista APENAS de advogados - CORRIGIDA */}
              <div className="mb-4 bg-white p-3 rounded border">
                <label className="block text-sm font-medium mb-2">
                  Selecionar advogados (clique para selecionar/deselecionar):
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                  {todosAdvogados.map(advogado => {
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
          <li>• Escolha especificamente quais advogados serão atribuídos (APENAS advogados, sem prepostos)</li>
          <li>• <strong>As audiências são distribuídas automaticamente respeitando intervalo MÍNIMO de 1 hora entre audiências do mesmo advogado</strong></li>
          <li>• As datas e horas são convertidas automaticamente do formato Excel</li>
          <li>• A planilha final é unificada com todas as atribuições</li>
          <li>• As horas na planilha de saída são formatadas como HH:MM</li>
          <li>• Logs detalhados da distribuição aparecem no console do navegador (F12)</li>
        </ul>
      </div>
    </div>
  );
};

export default NewAutomationPage;

