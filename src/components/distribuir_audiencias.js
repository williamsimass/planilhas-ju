// Função para distribuir audiências entre advogados respeitando intervalo mínimo de 1 hora
export const distribuirAudiencias = (audiencias, advogados) => {
  if (!advogados || advogados.length === 0) return audiencias;

  console.log(`Distribuindo ${audiencias.length} audiências entre ${advogados.length} advogados`);

  // Função para converter data/hora do Excel para objeto Date
  const parseDateTime = (audiencia) => {
    const data = audiencia["DATA"] || audiencia["TRA.Agenda data"] || audiencia.Data_Audiencia || audiencia.Data;
    const hora = audiencia["HORA SSA"] || audiencia["HORA LOCAL"] || audiencia["TRA.Hora da agenda"] || audiencia.Hora || 0;
    
    let dateObj;
    
    // Se data é um número (formato Excel)
    if (typeof data === "number") {
      const excelEpoch = new Date(1900, 0, 1);
      dateObj = new Date(excelEpoch.getTime() + (data - 1) * 24 * 60 * 60 * 1000);
    } else if (data instanceof Date) {
      dateObj = new Date(data);
    } else {
      dateObj = new Date(data);
    }
    
    // Adicionar hora
    if (typeof hora === "number") {
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
    
    console.log(`Processando audiência ${idx + 1}: ${dataHoraAudiencia.toLocaleString("pt-BR")}`);

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
          console.log(`Advogado ${advogado} não pode pegar audiência ${dataHoraAudiencia.toLocaleString("pt-BR")} - conflito com horário ${horarioOcupado.toLocaleString("pt-BR")} (diferença: ${diferencaMinutos.toFixed(1)} min)`);
          podeAtribuir = false;
          break;
        }
      }
      
      if (podeAtribuir) {
        advogadoEscolhido = advogado;
        agendaAdvogados[advogado].push(dataHoraAudiencia);
        console.log(`Audiência ${dataHoraAudiencia.toLocaleString("pt-BR")} atribuída para ${advogado}`);
        break;
      }
    }
    
    // Se nenhum advogado está disponível, forçar atribuição para o primeiro (situação de sobrecarga)
    if (!advogadoEscolhido) {
      advogadoEscolhido = advogados[0];
      agendaAdvogados[advogados[0]].push(dataHoraAudiencia);
      console.warn(`ATENÇÃO: Audiência ${dataHoraAudiencia.toLocaleString("pt-BR")} forçada para ${advogados[0]} - todos os advogados estavam ocupados`);
    }
    
    // Retorna uma cópia da audiência com o advogado atribuído na coluna ADVOGADO
    return {
      ...audiencia,
      ADVOGADO: advogadoEscolhido
    };
  });

  // Log final da distribuição
  console.log("Distribuição final:");
  advogados.forEach(adv => {
    console.log(`${adv}: ${agendaAdvogados[adv].length} audiências`);
  });

  return audienciasDistribuidas;
};

