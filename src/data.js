// data.js - Dados iniciais para o sistema de gestão de inspeção

// Configuração do Firebase (substitua com suas credenciais reais)
export const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "sua_api_key",
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "seu_projeto.firebaseapp.com",
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "seu_projeto_id",
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "seu_projeto.appspot.com",
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "seu_messaging_sender_id",
    appId: process.env.REACT_APP_FIREBASE_APP_ID || "seu_app_id"
  };
  
  // Status para os itens de inspeção
  export const STATUS = {
    PENDENTE: 'Pendente',
    EM_ANDAMENTO: 'Em Andamento',
    CONCLUIDO: 'Concluído',
    NAO_APLICAVEL: 'Não Aplicável'
  };
  
  // Prioridades para tarefas
  export const PRIORIDADES = {
    ALTA: 'Alta',
    MEDIA: 'Média',
    BAIXA: 'Baixa'
  };
  
  // Tipos de eventos para o calendário
  export const TIPOS_EVENTO = {
    PREPARACAO: 'Preparação',
    REVISAO: 'Revisão',
    INSPECAO: 'Inspeção',
    TREINAMENTO: 'Treinamento',
    REUNIAO: 'Reunião'
  };
  
  // Cores para os diferentes status
  export const STATUS_COLORS = {
    'Pendente': '#FF8042',
    'Em Andamento': '#FFBB28', 
    'Concluído': '#00C49F',
    'Não Aplicável': '#A9A9A9'
  };
  
  // Cores para os tipos de eventos
  export const EVENT_COLORS = {
    'Preparação': { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
    'Revisão': { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
    'Inspeção': { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
    'Treinamento': { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
    'Reunião': { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' }
  };
  
  // Dados iniciais para usuários
  export const initialUsers = [
    { id: 'u1', nome: 'Comandante', patente: 'Cel', email: 'comandante@cbmerj.gov.br', perfil: 'Administrador' },
    { id: 'u2', nome: 'Silva', patente: 'Ten', email: 'silva@cbmerj.gov.br', perfil: 'Responsável' },
    { id: 'u3', nome: 'Oliveira', patente: 'Sgt', email: 'oliveira@cbmerj.gov.br', perfil: 'Responsável' },
    { id: 'u4', nome: 'Costa', patente: 'Ten', email: 'costa@cbmerj.gov.br', perfil: 'Responsável' },
    { id: 'u5', nome: 'Pereira', patente: 'Sgt', email: 'pereira@cbmerj.gov.br', perfil: 'Responsável' },
    { id: 'u6', nome: 'Souza', patente: 'Cap', email: 'souza@cbmerj.gov.br', perfil: 'Responsável' },
    { id: 'u7', nome: 'Rodrigues', patente: 'Ten', email: 'rodrigues@cbmerj.gov.br', perfil: 'Responsável' },
    { id: 'u8', nome: 'Santos', patente: 'Sgt', email: 'santos@cbmerj.gov.br', perfil: 'Responsável' },
    { id: 'u9', nome: 'Mendes', patente: 'Cap', email: 'mendes@cbmerj.gov.br', perfil: 'Responsável' },
    { id: 'u10', nome: 'Almeida', patente: 'Ten', email: 'almeida@cbmerj.gov.br', perfil: 'Responsável' }
  ];
  
  // Dados iniciais para tarefas
  export const initialTasks = [
    {
      id: 't1',
      title: 'Verificar QTS atualizado',
      description: 'Confirmar que o QTS está atualizado e exposto em local visível',
      status: STATUS.EM_ANDAMENTO,
      priority: PRIORIDADES.ALTA,
      responsible: 'Ten. Silva',
      dueDate: '2025-04-23',
      createdAt: new Date().toISOString(),
      section: 's3' // Referência à seção Documentação Operacional
    },
    {
      id: 't2',
      title: 'Atualizar POPs',
      description: 'Garantir que todos os POPs estejam disponibilizados para os operadores',
      status: STATUS.PENDENTE,
      priority: PRIORIDADES.ALTA,
      responsible: 'Sgt. Oliveira',
      dueDate: '2025-04-22',
      createdAt: new Date().toISOString(),
      section: 's7' // Referência à seção Instalações da SsCO
    },
    {
      id: 't3',
      title: 'Verificar sistema SISGEO',
      description: 'Confirmar lançamento correto de todas as informações no SISGEO',
      status: STATUS.EM_ANDAMENTO,
      priority: PRIORIDADES.MEDIA,
      responsible: 'Ten. Rodrigues',
      dueDate: '2025-04-20',
      createdAt: new Date().toISOString(),
      section: 's8' // Referência à seção Viaturas Operacionais
    },
    {
      id: 't4',
      title: 'Revisar motosserras',
      description: 'Verificar funcionamento e testar equipamentos de corte',
      status: STATUS.PENDENTE,
      priority: PRIORIDADES.ALTA,
      responsible: 'Sgt. Santos',
      dueDate: '2025-04-24',
      createdAt: new Date().toISOString(),
      section: 's4' // Referência à seção TOD
    },
    {
      id: 't5',
      title: 'Testar viaturas',
      description: 'Teste completo de todas as viaturas operacionais',
      status: STATUS.PENDENTE,
      priority: PRIORIDADES.ALTA,
      responsible: 'Ten. Costa',
      dueDate: '2025-04-25',
      createdAt: new Date().toISOString(),
      section: 's8' // Referência à seção Viaturas Operacionais
    },
    {
      id: 't6',
      title: 'Organizar fardamento',
      description: 'Verificar se todo o efetivo possui fardamento completo',
      status: STATUS.PENDENTE,
      priority: PRIORIDADES.MEDIA,
      responsible: 'Sgt. Pereira',
      dueDate: '2025-04-26',
      createdAt: new Date().toISOString(),
      section: 's1' // Referência à seção Recepção à autoridade
    },
    {
      id: 't7',
      title: 'Ensaiar cerimônia',
      description: 'Organizar ensaio completo da formatura e recepção',
      status: STATUS.PENDENTE,
      priority: PRIORIDADES.ALTA,
      responsible: 'Cap. Souza',
      dueDate: '2025-04-24',
      createdAt: new Date().toISOString(),
      section: 's1' // Referência à seção Recepção à autoridade
    },
    {
      id: 't8',
      title: 'Checar telas da cozinha',
      description: 'Verificar todas as telas milimétricas da cozinha',
      status: STATUS.PENDENTE,
      priority: PRIORIDADES.MEDIA,
      responsible: 'Sgt. Oliveira',
      dueDate: '2025-04-23',
      createdAt: new Date().toISOString(),
      section: 's13' // Referência à seção UAN
    },
    {
      id: 't9',
      title: 'Atualizar mapa operacional',
      description: 'Verificar e atualizar o mapa da área operacional',
      status: STATUS.EM_ANDAMENTO,
      priority: PRIORIDADES.ALTA,
      responsible: 'Ten. Rodrigues',
      dueDate: '2025-04-22',
      createdAt: new Date().toISOString(),
      section: 's5' // Referência à seção Área Operacional
    },
    {
      id: 't10',
      title: 'Testar sistema de alarme',
      description: 'Verificar funcionamento do carrilhão e sistema de som da UBM',
      status: STATUS.PENDENTE,
      priority: PRIORIDADES.ALTA,
      responsible: 'Ten. Silva',
      dueDate: '2025-04-22',
      createdAt: new Date().toISOString(),
      section: 's6' // Referência à seção Acionamento do Socorro
    }
  ];
  
  // Dados iniciais para eventos do calendário
  export const initialEvents = [
    {
      id: 'e1',
      title: 'Início de preparação',
      date: '2025-04-15',
      time: '08:00',
      type: TIPOS_EVENTO.PREPARACAO,
      description: 'Início dos preparativos para a inspeção oficial'
    },
    {
      id: 'e2',
      title: 'Revisão de documentos',
      date: '2025-04-21',
      time: '08:00',
      type: TIPOS_EVENTO.REVISAO,
      description: 'Conferência de toda documentação operacional'
    },
    {
      id: 'e3',
      title: 'Revisão de materiais',
      date: '2025-04-22',
      time: '08:00',
      type: TIPOS_EVENTO.REVISAO,
      description: 'Conferência de todos os materiais operacionais'
    },
    {
      id: 'e4',
      title: 'Revisão de viaturas',
      date: '2025-04-23',
      time: '08:00',
      type: TIPOS_EVENTO.REVISAO,
      description: 'Conferência de todas as viaturas operacionais'
    },
    {
      id: 'e5',
      title: 'Ensaio de cerimônia',
      date: '2025-04-24',
      time: '08:00',
      type: TIPOS_EVENTO.TREINAMENTO,
      description: 'Ensaio para recepção da comitiva de inspeção'
    },
    {
      id: 'e6',
      title: 'Inspeção interna',
      date: '2025-04-25',
      time: '08:00',
      type: TIPOS_EVENTO.INSPECAO,
      description: 'Inspeção interna preparatória'
    },
    {
      id: 'e7',
      title: 'INSPEÇÃO OFICIAL',
      date: '2025-04-28',
      time: '09:00',
      type: TIPOS_EVENTO.INSPECAO,
      description: 'Inspeção oficial pela comitiva do Comando Geral'
    }
  ];
  
  // Histórico de progresso para o gráfico do dashboard
  export const initialProgressHistory = [
    { date: '15/04', porcentagem: 25 },
    { date: '16/04', porcentagem: 32 },
    { date: '17/04', porcentagem: 40 },
    { date: '18/04', porcentagem: 52 },
    { date: '19/04', porcentagem: 60 },
    { date: '20/04', porcentagem: 67 },
    { date: '21/04', porcentagem: 72 }
  ];
  
  // Dados iniciais para seções e itens de inspeção
  // Estruturados conforme o documento PDF fornecido
  export const initialSections = [
    // Seção 1: Recepção à autoridade inspecionante
    {
      id: 's1',
      title: 'Recepção à autoridade inspecionante',
      progress: 50,
      status: STATUS.EM_ANDAMENTO,
      deadline: '2025-04-23',
      responsible: 'Ten. Costa',
      items: [
        {
          id: 'i101',
          title: 'Execução do pique de alerta e anúncio verbal da chegada da autoridade',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Verificado com a equipe de prontidão',
          evidences: ['evidencia-101.jpg']
        },
        {
          id: 'i102',
          title: 'Toque de corneta da maior autoridade presente',
          status: STATUS.EM_ANDAMENTO,
          score: 5,
          notes: 'Necessário testar corneta',
          evidences: []
        },
        {
          id: 'i103',
          title: 'Apresentação da Guarda pelo Comandante da Guarda',
          status: STATUS.PENDENTE,
          score: 0,
          notes: '',
          evidences: []
        },
        {
          id: 'i104',
          title: 'Brado geral e acionamento dos dispositivos sonoros e de iluminação das viaturas',
          status: STATUS.EM_ANDAMENTO,
          score: 5,
          notes: 'Verificar dispositivos das novas viaturas',
          evidences: []
        },
        {
          id: 'i105',
          title: 'Apresentação da tropa pelo Comandante da Unidade',
          status: STATUS.PENDENTE,
          score: 0,
          notes: '',
          evidences: []
        },
        {
          id: 'i106',
          title: 'Esmero da tropa na formatura',
          status: STATUS.PENDENTE,
          score: 0,
          notes: '',
          evidences: []
        }
      ]
    },
    
    // Seção 2: Hasteamento do Pavilhão Nacional
    {
      id: 's2',
      title: 'Hasteamento do Pavilhão Nacional',
      progress: 80,
      status: STATUS.EM_ANDAMENTO,
      deadline: '2025-04-22',
      responsible: 'Sgt. Pereira',
      items: [
        {
          id: 'i201',
          title: 'Cerimônia de hasteamento do Pavilhão Nacional',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Cerimônia realizada conforme previsto',
          evidences: ['evidencia-201.jpg']
        },
        {
          id: 'i202',
          title: 'Todo contigente formado (Oficiais e praças de serviço e expediente)',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Todos presentes na última cerimônia',
          evidences: ['evidencia-202.jpg']
        },
        {
          id: 'i203',
          title: 'Cânticos dos Hinos e ou canções por todos os militares presentes na formatura',
          status: STATUS.EM_ANDAMENTO,
          score: 5,
          notes: 'Alguns militares não sabem o Hino Soldado do Fogo completo',
          evidences: []
        },
        {
          id: 'i204',
          title: 'Boa conservação do Pavilhão Nacional',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Pavilhão em excelente estado',
          evidences: ['evidencia-204.jpg']
        },
        {
          id: 'i205',
          title: 'Boa conservação de outros símbolos (Bandeira do Estado e flâmula do Cmt)',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Todos os símbolos em bom estado',
          evidences: ['evidencia-205.jpg']
        }
      ]
    },
    
    // Seção 3: Documentação Operacional
    {
      id: 's3',
      title: 'Documentação Operacional',
      progress: 25,
      status: STATUS.EM_ANDAMENTO,
      deadline: '2025-04-24',
      responsible: 'Cap. Souza',
      items: [
        {
          id: 'i301',
          title: 'QTS atualizado e exposto em local visível',
          status: STATUS.EM_ANDAMENTO,
          score: 5,
          notes: 'QTS precisa ser atualizado com novas transferências',
          evidences: []
        },
        {
          id: 'i302',
          title: 'Cópia das Operações simuladas (últimos 2 anos)',
          status: STATUS.PENDENTE,
          score: 0,
          notes: 'Localizar documentos no arquivo',
          evidences: []
        },
        {
          id: 'i303',
          title: 'Cópias dos Planos (Emprego, Chamada, Seção) arquivadas na SsCO/sala do Oficial de Dia (último ano)',
          status: STATUS.PENDENTE,
          score: 0,
          notes: '',
          evidences: []
        },
        {
          id: 'i304',
          title: 'Relatório Mensal das Instruções (Oficiais e Praças)',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Relatórios em dia',
          evidences: ['evidencia-304.jpg']
        },
        {
          id: 'i305',
          title: 'Quesitos e Certidões de Ocorrência (Controle)',
          status: STATUS.PENDENTE,
          score: 0,
          notes: '',
          evidences: []
        },
        {
          id: 'i306',
          title: 'Quesitos e Certidões de Ocorrência (Informações sobre condições de segurança contra incêndio e pânico dos locais sinistrados)',
          status: STATUS.PENDENTE,
          score: 0,
          notes: '',
          evidences: []
        },
        {
          id: 'i307',
          title: 'Integração SOP/SST (se a SOP informa, oficialmente, à SST sobre as condições de segurança contra incêndio e pânico das edificações e áreas de risco, registradas nos quesitos)',
          status: STATUS.PENDENTE,
          score: 0,
          notes: '',
          evidences: []
        },
        {
          id: 'i308',
          title: 'Plano de Operações conforme NPCI',
          status: STATUS.EM_ANDAMENTO,
          score: 5,
          notes: 'Em atualização',
          evidences: []
        },
        {
          id: 'i309',
          title: 'Extrato do Plano de Operações acessível no telefone funcional do Comandante de SOS',
          status: STATUS.PENDENTE,
          score: 0,
          notes: '',
          evidences: []
        },
        {
          id: 'i310',
          title: 'Planejamento quanto a organização e execução dos recursos disponíveis para a execução do TOD',
          status: STATUS.PENDENTE,
          score: 0,
          notes: '',
          evidences: []
        },
        {
          id: 'i311',
          title: 'Relatório de análises dos Testes operacionais diários',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Relatórios em dia',
          evidences: ['evidencia-311.jpg']
        },
        {
          id: 'i312',
          title: 'Arquivamento das fichas de registros do TOD',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Fichas arquivadas corretamente',
          evidences: ['evidencia-312.jpg']
        }
      ]
    },
    
    // Seção 4: Teste Operacional Diário (TOD)
    {
      id: 's4',
      title: 'Teste Operacional Diário (TOD)',
      progress: 40,
      status: STATUS.EM_ANDAMENTO,
      deadline: '2025-04-25',
      responsible: 'Ten. Rodrigues',
      items: [
        {
          id: 'i401',
          title: 'Execução do TOD',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'TOD executado diariamente',
          evidences: ['evidencia-401.jpg']
        },
        {
          id: 'i402',
          title: 'Supervisão do TOD',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Supervisão realizada pelo oficial de dia',
          evidences: ['evidencia-402.jpg']
        },
        {
          id: 'i403',
          title: 'Estabelecimento das viaturas de socorro',
          status: STATUS.EM_ANDAMENTO,
          score: 5,
          notes: 'ABT necessitando manutenção',
          evidences: []
        },
        {
          id: 'i404',
          title: 'Utilização correta do POP',
          status: STATUS.EM_ANDAMENTO,
          score: 5,
          notes: 'Necessário reforçar treinamento',
          evidences: []
        },
        {
          id: 'i405',
          title: 'Houve utilização de rádios no TOD',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Rádios sendo utilizados corretamente',
          evidences: ['evidencia-405.jpg']
        },
        {
          id: 'i406',
          title: 'Utilizaram corretamente a roupa de aproximação',
          status: STATUS.PENDENTE,
          score: 0,
          notes: '',
          evidences: []
        },
        {
          id: 'i407',
          title: 'Utilizaram corretamente os equipamento de proteção respiratória (EPR)',
          status: STATUS.PENDENTE,
          score: 0,
          notes: '',
          evidences: []
        },
        {
          id: 'i408',
          title: 'Manusearam corretamente a motossera ou o moto rebolo',
          status: STATUS.PENDENTE,
          score: 0,
          notes: 'Equipamentos em manutenção',
          evidences: []
        },
        {
          id: 'i409',
          title: 'No item anterior, utilizaram o EPI correto',
          status: STATUS.PENDENTE,
          score: 0,
          notes: '',
          evidences: []
        },
        {
          id: 'i410',
          title: 'Manusearam corretamente o Desencarcerador',
          status: STATUS.PENDENTE,
          score: 0,
          notes: '',
          evidences: []
        },
        {
          id: 'i411',
          title: 'No item anterior, utilizaram o EPI correto',
          status: STATUS.PENDENTE,
          score: 0,
          notes: '',
          evidences: []
        },
        {
          id: 'i412',
          title: 'Utilização correta da técnica denominada "Bomba Armar" para montar duas linhas, com uma mangueira na ligação e uma em cada linha',
          status: STATUS.EM_ANDAMENTO,
          score: 5,
          notes: 'Técnica aplicada, mas com tempo acima do ideal',
          evidences: []
        },
        {
          id: 'i413',
          title: 'No item anterior, utilizaram o EPI correto',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'EPIs utilizados corretamente',
          evidences: ['evidencia-413.jpg']
        },
        {
          id: 'i414',
          title: 'Utilização correta das técnicas de mobilização e transporte de vítimas até o interior da ASE',
          status: STATUS.PENDENTE,
          score: 0,
          notes: '',
          evidences: []
        },
        {
          id: 'i415',
          title: 'No item anterior, utilizaram o EPI correto',
          status: STATUS.PENDENTE,
          score: 0,
          notes: '',
          evidences: []
        },
        {
          id: 'i416',
          title: 'TOD está no SISGEO? (Escolher um mês para fazer a conferência)',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'TOD lançado corretamente no SISGEO',
          evidences: ['evidencia-416.jpg']
        }
      ]
    },
    
    // Seção 5: Área Operacional
    {
      id: 's5',
      title: 'Área Operacional',
      progress: 60,
      status: STATUS.EM_ANDAMENTO,
      deadline: '2025-04-24',
      responsible: 'Sgt. Oliveira',
      items: [
        {
          id: 'i501',
          title: 'O mapa da área operacional está acessível aos militares de serviço na Subseção de Controle Operacional',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Mapa disponível e atualizado',
          evidences: ['evidencia-501.jpg']
        },
        {
          id: 'i502',
          title: 'A demarcação da área operacional no mapa operacional',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Área demarcada corretamente',
          evidences: ['evidencia-502.jpg']
        },
        {
          id: 'i503',
          title: 'A demarcação dos recursos hídricos no mapa operacional',
          status: STATUS.EM_ANDAMENTO,
          score: 5,
          notes: 'Faltam alguns hidrantes recém instalados',
          evidences: []
        },
        {
          id: 'i504',
          title: 'A demarcação dos Pontos Críticos relevantes',
          status: STATUS.PENDENTE,
          score: 0,
          notes: '',
          evidences: []
        },
        {
          id: 'i505',
          title: 'A demarcação de outros recursos disponíveis (hospitais, UBM, BPM, DP, etc...)',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Recursos demarcados e atualizados',
          evidences: ['evidencia-505.jpg']
        }
      ]
    },
    
    // Continuar com as demais seções...
    // Seção 6: Procedimento no Acionamento do Socorro
    {
      id: 's6',
      title: 'Procedimento no Acionamento do Socorro',
      progress: 70,
      status: STATUS.EM_ANDAMENTO,
      deadline: '2025-04-23',
      responsible: 'Ten. Silva',
      items: [
        {
          id: 'i601',
          title: 'Execução do carrilhão e brado de alerta',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Sistema funcionando corretamente',
          evidences: ['evidencia-601.jpg']
        },
        {
          id: 'i602',
          title: 'Descrição da solicitação de socorro através do sistema de som da UBM',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Som claro e audível em todas as áreas',
          evidences: ['evidencia-602.jpg']
        },
        {
          id: 'i603',
          title: 'Brado final',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Procedimento executado corretamente',
          evidences: ['evidencia-603.jpg']
        },
        {
          id: 'i604',
          title: 'Deslocamento dos bombeiros militares com presteza',
          status: STATUS.EM_ANDAMENTO,
          score: 5,
          notes: 'Tempo médio de 35 segundos',
          evidences: []
        },
        {
          id: 'i605',
          title: 'Sonorização e Iluminação das Viaturas',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Sistemas funcionando perfeitamente',
          evidences: ['evidencia-605.jpg']
        },
        {
          id: 'i606',
          title: 'Tempo de saída do Socorro conforme as normas vigentes',
          status: STATUS.EM_ANDAMENTO,
          score: 5,
          notes: 'Tempo médio de 62 segundos, um pouco acima do ideal',
          evidences: []
        }
      ]
    },
    
    // Seção 7: Instalações da Subseção de Controle Operacional (SsCO)
    {
      id: 's7',
      title: 'Instalações da SsCO',
      progress: 90,
      status: STATUS.EM_ANDAMENTO,
      deadline: '2025-04-22',
      responsible: 'Cap. Mendes',
      items: [
        {
          id: 'i701',
          title: 'Ambiente ergonômico',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Ambiente reformado recentemente',
          evidences: ['evidencia-701.jpg']
        },
        {
          id: 'i702',
          title: 'Notas publicadas e POPs disponibilizados aos operadores',
          status: STATUS.EM_ANDAMENTO,
          score: 5,
          notes: 'Alguns POPs em atualização',
          evidences: []
        },
        {
          id: 'i703',
          title: 'Todos os Militares capacitados pelo COCBMERJ',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Capacitação em dia',
          evidences: ['evidencia-703.jpg']
        },
        {
          id: 'i704',
          title: 'Pleno acesso ao sistema de despacho de viaturas "on call"',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Sistema funcionando normalmente',
          evidences: ['evidencia-704.jpg']
        },
        {
          id: 'i705',
          title: 'Pleno acesso ao sistema de monitoramento, estatísticas e relatórios "SisGeO"',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Sistema funcionando normalmente',
          evidences: ['evidencia-705.jpg']
        },
        {
          id: 'i706',
          title: 'Telefones 193 e linhas privativas operando',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Linhas testadas e operacionais',
          evidences: ['evidencia-706.jpg']
        },
        {
          id: 'i707',
          title: 'Visualização do pátio de viaturas operacionais',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Visão completa do pátio',
          evidences: ['evidencia-707.jpg']
        },
        {
          id: 'i708',
          title: 'Visualização das instalações da OBM por CFTV',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Sistema CFTV instalado e funcionando',
          evidences: ['evidencia-708.jpg']
        },
        {
          id: 'i709',
          title: 'Arquivo na SsCO da descrição da rede de abastecimento Pública de água',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Documentação disponível',
          evidences: ['evidencia-709.jpg']
        },
        {
          id: 'i710',
          title: 'Sistema de recebimento e despacho de vtrs em funcionamento',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Sistema operacional',
          evidences: ['evidencia-710.jpg']
        }
      ]
    },
    
    // Seção 8: Viaturas Operacionais
    {
      id: 's8',
      title: 'Viaturas Operacionais',
      progress: 85,
      status: STATUS.EM_ANDAMENTO,
      deadline: '2025-04-23',
      responsible: 'Ten. Costa',
      items: [
        {
          id: 'i801',
          title: 'A relação dos bombeiros militares de serviço foram lançadas no SISGEO',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Informações atualizadas diariamente',
          evidences: ['evidencia-801.jpg']
        },
        {
          id: 'i802',
          title: 'A GRD está lançada no SISGEO',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'GRD em dia',
          evidences: ['evidencia-802.jpg']
        }
      ]
    },
    
    // Seção 9: Recursos Hídricos
    {
      id: 's9',
      title: 'Recursos Hídricos',
      progress: 30,
      status: STATUS.EM_ANDAMENTO,
      deadline: '2025-04-25',
      responsible: 'Sgt. Santos',
      items: [
        {
          id: 'i901',
          title: 'Relatório de corrida de área',
          status: STATUS.EM_ANDAMENTO,
          score: 5,
          notes: 'Em atualização',
          evidences: []
        },
        {
          id: 'i902',
          title: 'Cadastramento do Recursos Hídricos no SisGeO',
          status: STATUS.PENDENTE,
          score: 0,
          notes: 'Falta lançamento de novos hidrantes',
          evidences: []
        }
      ]
    },
    
    // Seção 10: Logística de Materiais
    {
      id: 's10',
      title: 'Logística de Materiais',
      progress: 45,
      status: STATUS.EM_ANDAMENTO,
      deadline: '2025-04-26',
      responsible: 'Ten. Almeida',
      items: [
        {
          id: 'i1001',
          title: 'As condições de armazenamento dos materiais estão adequadas',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Materiais bem armazenados',
          evidences: ['evidencia-1001.jpg']
        },
        {
          id: 'i1002',
          title: 'Existe controle e registro da manutenção dos materiais',
          status: STATUS.EM_ANDAMENTO,
          score: 5,
          notes: 'Registro parcial',
          evidences: []
        },
        {
          id: 'i1003',
          title: 'Existe controle dos materiais (relação carga e cautelas)',
          status: STATUS.PENDENTE,
          score: 0,
          notes: '',
          evidences: []
        },
        {
          id: 'i1004',
          title: 'Existe Identificação da OBM nos materiais',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Todos os materiais identificados',
          evidences: ['evidencia-1004.jpg']
        },
        {
          id: 'i1005',
          title: 'Bens inoperantes: se estão dando prosseguimento para o descarte do material (inservível) ou estão providenciando a manutenção necessária para voltar a operar',
          status: STATUS.EM_ANDAMENTO,
          score: 5,
          notes: 'Processo em andamento no SEI',
          evidences: []
        },
        {
          id: 'i1006',
          title: 'O SISCOM (controle de estoque) está sendo atualizado corretamente',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Sistema atualizado',
          evidences: ['evidencia-1006.jpg']
        },
        {
          id: 'i1007',
          title: 'A Transferência, Aquisição ou Perda de material foram comunicados via SEI ao EMG (BM4)',
          status: STATUS.PENDENTE,
          score: 0,
          notes: '',
          evidences: []
        },
        {
          id: 'i1008',
          title: 'Lançamento dos EPI que estão sendo fornecidos aos militares de forma individual na no sistema DGP',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Lançamentos em dia',
          evidences: ['evidencia-1008.jpg']
        },
        {
          id: 'i1009',
          title: 'Recolhimento dos EPI dos militares q passaram pra a reserva remunerada',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'EPIs recolhidos',
          evidences: ['evidencia-1009.jpg']
        },
        {
          id: 'i1010',
          title: 'O cadastro das medidas antropométricas dos militares está atualizada',
          status: STATUS.PENDENTE,
          score: 0,
          notes: '',
          evidences: []
        },
        {
          id: 'i1011',
          title: 'Está atualizado o controle de fornecimento de fardamento aos Cabos e Soldados',
          status: STATUS.EM_ANDAMENTO,
          score: 5,
          notes: 'Atualização em andamento',
          evidences: []
        }
      ]
    },
    
    // Seção 11: Logística de Frota
    {
      id: 's11',
      title: 'Logística de Frota',
      progress: 65,
      status: STATUS.EM_ANDAMENTO,
      deadline: '2025-04-25',
      responsible: 'Sgt. Pereira',
      items: [
        {
          id: 'i1101',
          title: 'O plano de manutenção está sendo seguido (a manutenção de 1º escalão está sendo realizada e a de 2º escalão em diante está sendo solicitada',
          status: STATUS.EM_ANDAMENTO,
          score: 5,
          notes: 'ABT aguardando manutenção de 2º escalão',
          evidences: []
        },
        {
          id: 'i1102',
          title: 'Há ficha de acidentes nas viaturas',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Todas as viaturas com fichas',
          evidences: ['evidencia-1102.jpg']
        },
        {
          id: 'i1103',
          title: 'Correto preenchimento e atualização do check-list das vtrs (conferência da vtr e material)',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Check-lists preenchidos diariamente',
          evidences: ['evidencia-1103.jpg']
        },
        {
          id: 'i1104',
          title: 'O sistema SISGEO está sendo preenchido (controle e manutenção)',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Sistema atualizado',
          evidences: ['evidencia-1104.jpg']
        },
        {
          id: 'i1105',
          title: 'Existe controle de validade das carteiras de habilitação dos condutores e operadores de viaturas/aeronaves/embarcações',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Controle em dia',
          evidences: ['evidencia-1105.jpg']
        },
        {
          id: 'i1106',
          title: 'Existe controle de cursos dos condutores e operadores de viaturas/aeronaves/embarcações',
          status: STATUS.PENDENTE,
          score: 0,
          notes: '',
          evidences: []
        },
        {
          id: 'i1107',
          title: 'Informações do SISGEO estão de acordo e atualizadas',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Sistema atualizado',
          evidences: ['evidencia-1107.jpg']
        }
      ]
    },
    
    // Seção 12: Logística de Bens Imóveis
    {
      id: 's12',
      title: 'Logística de Bens Imóveis',
      progress: 55,
      status: STATUS.EM_ANDAMENTO,
      deadline: '2025-04-27',
      responsible: 'Ten. Silva',
      items: [
        {
          id: 'i1201',
          title: 'O estado de conservação da iluminação',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Iluminação em bom estado',
          evidences: ['evidencia-1201.jpg']
        },
        {
          id: 'i1202',
          title: 'O estado de conservação do mobiliário',
          status: STATUS.EM_ANDAMENTO,
          score: 5,
          notes: 'Alguns mobiliários necessitando reparo',
          evidences: []
        },
        {
          id: 'i1203',
          title: 'O estado de conservação dos condicionadores de ar',
          status: STATUS.PENDENTE,
          score: 0,
          notes: 'Três aparelhos com defeito',
          evidences: []
        },
        {
          id: 'i1204',
          title: 'Alocação/empenho dos materiais administrativos fornecidos (ar-condicionado, mobília, TV, etc)',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Materiais devidamente alocados',
          evidences: ['evidencia-1204.jpg']
        },
        {
          id: 'i1205',
          title: 'Possui o Plano Diretor da OBM (PDOBM) atualizado, que reflete todas as necessidades de infraestrutura da unidade',
          status: STATUS.PENDENTE,
          score: 0,
          notes: '',
          evidences: []
        }
      ]
    },
    
    // Seção 13: Logística da Unidade de Alimentação e Nutrição
    {
      id: 's13',
      title: 'Logística da Unidade de Alimentação e Nutrição',
      progress: 75,
      status: STATUS.EM_ANDAMENTO,
      deadline: '2025-04-24',
      responsible: 'Sgt. Oliveira',
      items: [
        {
          id: 'i1301',
          title: 'A edificação está em boas condições de conservação (piso, teto, paredes sem rachaduras, buracos, frestas) sem sinais de mofo',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Ambiente recém reformado',
          evidences: ['evidencia-1301.jpg']
        },
        {
          id: 'i1302',
          title: 'As paredes são revestidas de material lavável, impermeável e de fácil higienização',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Azulejos até o teto',
          evidences: ['evidencia-1302.jpg']
        },
        {
          id: 'i1303',
          title: 'As áreas estão em boas condições de higiene e limpeza',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Limpeza diária rigorosa',
          evidences: ['evidencia-1303.jpg']
        },
        {
          id: 'i1304',
          title: 'Há telas milimétricas nas janelas e saídas dos exaustores',
          status: STATUS.EM_ANDAMENTO,
          score: 5,
          notes: 'Algumas telas necessitando troca',
          evidences: []
        },
        {
          id: 'i1305',
          title: 'Há protetores nas soleiras das portas',
          status: STATUS.PENDENTE,
          score: 0,
          notes: '',
          evidences: []
        },
        {
          id: 'i1306',
          title: 'Os equipamentos estão em bom estado de conservação e em boas condições de uso',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Equipamentos novos',
          evidences: ['evidencia-1306.jpg']
        },
        {
          id: 'i1307',
          title: 'Há equipamentos sem uso ou inservíveis na UAN (descarregar, se possível)',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Não há equipamentos inservíveis',
          evidences: ['evidencia-1307.jpg']
        },
        {
          id: 'i1308',
          title: 'Há ventilação natural, ar condicionado ou exaustores para renovação do ar e conforto térmico',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Sistema de exaustão funcionando',
          evidences: ['evidencia-1308.jpg']
        },
        {
          id: 'i1309',
          title: 'Há pias com torneiras exclusivas para lavagem das mãos nas cozinhas e nos refeitórios',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Pias exclusivas instaladas',
          evidences: ['evidencia-1309.jpg']
        },
        {
          id: 'i1310',
          title: 'Há saboneteiras com sabonete líquido antiséptico e papeleiras com papel não reciclado',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Material disponível',
          evidences: ['evidencia-1310.jpg']
        },
        {
          id: 'i1311',
          title: 'Há lixeiras com pedal na cozinha e em demais áreas, forradas com sacos plásticos',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Lixeiras adequadas',
          evidences: ['evidencia-1311.jpg']
        },
        {
          id: 'i1312',
          title: 'A área está organizada, sem caixas de papelão ou de madeira (alimentos perecíveis devem ser acondicionados em recipientes plásticos, preferencialmente brancos, limpos, próprios para alimentos)',
          status: STATUS.EM_ANDAMENTO,
          score: 5,
          notes: 'Algumas caixas ainda presentes',
          evidences: []
        },
        {
          id: 'i1313',
          title: 'As carnes são descongeladas adequadamente (sob refrigeração)',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Procedimento seguido corretamente',
          evidences: ['evidencia-1313.jpg']
        },
        {
          id: 'i1314',
          title: 'Há controle da validade das mercadorias com o sistema PVPS (primeiro que vence, primeiro que sai)',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Sistema implementado',
          evidences: ['evidencia-1314.jpg']
        },
        {
          id: 'i1315',
          title: 'O pré-preparo dos alimentos (corte de carnes, descascamento e fracionamento de hortaliças e frutas e demais etapas anteriores a cocção) é feito em área exclusiva e separada das demais áreas da cozinha',
          status: STATUS.PENDENTE,
          score: 0,
          notes: '',
          evidences: []
        },
        {
          id: 'i1316',
          title: 'Os alimentos prontos ficam em espera em estufa ou balcão térmico',
          status: STATUS.PENDENTE,
          score: 0,
          notes: '',
          evidences: []
        },
        {
          id: 'i1317',
          title: 'Há desinsetização e desratização periódica da uan (ver certificado)',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Certificado dentro da validade',
          evidences: ['evidencia-1317.jpg']
        },
        {
          id: 'i1318',
          title: 'Há cardápio semanal disponível para consulta',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Cardápio disponível e atualizado',
          evidences: ['evidencia-1318.jpg']
        },
        {
          id: 'i1319',
          title: 'Todos os militares que manipulam alimentos estão APTOS em inspeção de saúde',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Inspeções em dia',
          evidences: ['evidencia-1319.jpg']
        },
        {
          id: 'i1320',
          title: 'Possui Laudo de análise química e biológica da água, na validade e afixado em local disponível para conferência',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Laudo disponível',
          evidences: ['evidencia-1320.jpg']
        }
      ]
    },
    
    // Seção 14: Estrutura Geral da SST
    {
      id: 's14',
      title: 'Estrutura Geral da SST',
      progress: 15,
      status: STATUS.EM_ANDAMENTO,
      deadline: '2025-04-28',
      responsible: 'Cap. Souza',
      items: [
        {
          id: 'i1401',
          title: 'Existência de computadores para atender a demanda da seção',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Equipamentos disponíveis',
          evidences: ['evidencia-1401.jpg']
        },
        {
          id: 'i1402',
          title: 'Viatura exclusiva para atendimento da demanda da seção',
          status: STATUS.PENDENTE,
          score: 0,
          notes: '',
          evidences: []
        },
        {
          id: 'i1403',
          title: 'Rede de acesso à internet',
          status: STATUS.CONCLUIDO,
          score: 10,
          notes: 'Internet funcionando',
          evidences: ['evidencia-1403.jpg']
        },
        {
          id: 'i1404',
          title: 'Existência de acessórios e impressoras para atender a demanda da seção',
          status: STATUS.PENDENTE,
          score: 0,
          notes: 'Impressora com defeito',
          evidences: []
        },
        {
          id: 'i1405',
          title: 'Material para análise e vistorias',
          status: STATUS.PENDENTE,
          score: 0,
          notes: '',
          evidences: []
        },
        {
          id: 'i1406',
          title: 'Acesso',
          status: STATUS.PENDENTE,
          score: 0,
          notes: '',
          evidences: []
        },
        {
          id: 'i1407',
          title: 'Acomodações',
          status: STATUS.PENDENTE,
          score: 0,
          notes: '',
          evidences: []
        },
        {
          id: 'i1408',
          title: 'Comodidades',
          status: STATUS.PENDENTE,
          score: 0,
          notes: '',
          evidences: []
        },
        {
          id: 'i1409',
          title: 'Login individualizado e atualizado nos sistemas Web de Análise, Emolumentos e Controle de Fiscalização para os militares da SST',
          status: STATUS.PENDENTE,
          score: 0,
          notes: '',
          evidences: []
        },
        {
          id: 'i1410',
          title: 'Conhecimento e acesso à Legislação de Segurança Contra Incêndio e Pânico',
          status: STATUS.PENDENTE,
          score: 0,
          notes: '',
          evidences: []
        },
        {
          id: 'i1411',
          title: 'Oficiais com especialização ou graduação de interesse (CEPrevI/Engenharia/Arquitetura)',
          status: STATUS.PENDENTE,
          score: 0,
          notes: '',
          evidences: []
        },
        {
          id: 'i1412',
          title: 'Efetivo compatível com a demanda',
          status: STATUS.PENDENTE,
          score: 0,
          notes: '',
          evidences: []
        }
      ]
    }
  ];
  
  // Funções utilitárias para cálculos e formatação
  
  // Função para calcular nota média
  export const calculateAverageScore = (sectionsData) => {
    if (!sectionsData || !sectionsData.length) return 0;
    
    let totalScore = 0;
    let itemCount = 0;
    
    sectionsData.forEach(section => {
      section.items?.forEach(item => {
        if (item.status !== STATUS.NAO_APLICAVEL && !isNaN(item.score)) {
          totalScore += item.score;
          itemCount++;
        }
      });
    });
    
    return itemCount ? (totalScore / itemCount).toFixed(1) : 0;
  };
  
  // Função para calcular percentual de conclusão
  export const calculateCompletionPercentage = (sectionsData) => {
    if (!sectionsData || !sectionsData.length) return 0;
    
    let completed = 0;
    let total = 0;
    
    sectionsData.forEach(section => {
      section.items?.forEach(item => {
        if (item.status !== STATUS.NAO_APLICAVEL) {
          total++;
          if (item.status === STATUS.CONCLUIDO) {
            completed++;
          }
        }
      });
    });
    
    return total ? Math.round((completed / total) * 100) : 0;
  };
  
  // Função para obter contagem de status
  export const getStatusCounts = (sectionsData) => {
    const counts = {
      'Pendente': 0,
      'Em Andamento': 0,
      'Concluído': 0,
      'Não Aplicável': 0
    };
    
    sectionsData.forEach(section => {
      section.items?.forEach(item => {
        counts[item.status]++;
      });
    });
    
    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    }));
  };
  
  // Função para calcular dias restantes até a inspeção
  export const getDaysRemaining = (inspectionDate) => {
    const today = new Date();
    const inspectionDay = new Date(inspectionDate);
    const diffTime = Math.abs(inspectionDay - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  // Função para formatar data
  export const formatDate = (date) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(date).toLocaleDateString('pt-BR', options);
  };
  
  // Função para atualizar o status de um item
  export const updateItemStatus = (sections, sectionId, itemId, newStatus, notes = "") => {
    return sections.map(section => {
      if (section.id === sectionId) {
        const updatedItems = section.items.map(item => {
          if (item.id === itemId) {
            const newScore = newStatus === STATUS.CONCLUIDO ? 10 : 
                            newStatus === STATUS.EM_ANDAMENTO ? 5 : 
                            newStatus === STATUS.NAO_APLICAVEL ? 'NA' : 0;
            
            return {
              ...item,
              status: newStatus,
              score: newScore,
              notes: notes || item.notes
            };
          }
          return item;
        });
        
        // Recalcular o progresso da seção
        const totalItems = updatedItems.filter(i => i.status !== STATUS.NAO_APLICAVEL).length;
        const completedItems = updatedItems.filter(i => i.status === STATUS.CONCLUIDO).length;
        const progress = totalItems ? Math.round((completedItems / totalItems) * 100) : 0;
        
        return {
          ...section,
          items: updatedItems,
          progress: progress
        };
      }
      return section;
    });
  };
  
  // Configurações do app
  export const appConfig = {
    inspectionDate: '2025-04-28',
    appName: 'Sistema de Gestão de Inspeção',
    appVersion: '1.0.0',
    organizationName: 'CBMERJ',
    themeColor: '#b91c1c',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm',
    defaultTaskPriority: PRIORIDADES.MEDIA,
    defaultItemStatus: STATUS.PENDENTE
  };
  
  // Objeto principal que será exportado
  export default {
    firebaseConfig,
    STATUS,
    PRIORIDADES,
    TIPOS_EVENTO,
    STATUS_COLORS,
    EVENT_COLORS,
    initialUsers,
    initialTasks,
    initialEvents,
    initialProgressHistory,
    initialSections,
    appConfig,
    
    // Funções utilitárias
    calculateAverageScore,
    calculateCompletionPercentage,
    getStatusCounts,
    getDaysRemaining,
    formatDate,
    updateItemStatus
  };