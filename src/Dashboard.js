import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Cores para status
const STATUS_COLORS = {
  'Pendente': '#FF8042',
  'Em Andamento': '#FFBB28', 
  'Concluído': '#00C49F',
  'Não Aplicável': '#A9A9A9'
};

const Dashboard = () => {
  const [sections, setSections] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progressHistory, setProgressHistory] = useState([]);
  const [inspectionDate, setInspectionDate] = useState('2025-04-28');
  
  // Carregar dados
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Em um app real, isso seria uma chamada ao Firestore
        // const db = getFirestore();
        // const sectionsCollection = collection(db, 'sections');
        // const sectionsSnapshot = await getDocs(sectionsCollection);
        // const sectionsData = sectionsSnapshot.docs.map(doc => ({
        //   id: doc.id,
        //   ...doc.data()
        // }));
        
        // const tasksCollection = collection(db, 'tasks');
        // const tasksQuery = query(
        //   tasksCollection,
        //   where('status', '!=', 'Concluído'),
        //   orderBy('priority', 'desc'),
        //   limit(5)
        // );
        // const tasksSnapshot = await getDocs(tasksQuery);
        // const tasksData = tasksSnapshot.docs.map(doc => ({
        //   id: doc.id,
        //   ...doc.data()
        // }));
        
        // const progressCollection = collection(db, 'progress_history');
        // const progressQuery = query(
        //   progressCollection,
        //   orderBy('date', 'asc')
        // );
        // const progressSnapshot = await getDocs(progressQuery);
        // const progressData = progressSnapshot.docs.map(doc => ({
        //   id: doc.id,
        //   ...doc.data()
        // }));

        // Para demonstração, usamos dados fictícios
        setSections([
          {
            id: 1,
            title: 'Recepção à autoridade inspecionante',
            progress: 50,
            status: 'Em Andamento',
            deadline: '2025-04-23',
            responsible: 'Ten. Costa',
            items: [
              {
                id: 101,
                title: 'Execução do pique de alerta e anúncio verbal da chegada da autoridade',
                status: 'Concluído',
                score: 10,
                notes: 'Verificado com a equipe de prontidão',
                evidences: ['evidencia-101.jpg']
              },
              {
                id: 102,
                title: 'Toque de corneta da maior autoridade presente',
                status: 'Em Andamento',
                score: 5,
                notes: 'Necessário testar corneta',
                evidences: []
              },
              {
                id: 103,
                title: 'Apresentação da Guarda pelo Comandante da Guarda',
                status: 'Pendente',
                score: 0,
                notes: '',
                evidences: []
              },
              {
                id: 104,
                title: 'Brado geral e acionamento dos dispositivos sonoros e de iluminação das viaturas',
                status: 'Em Andamento',
                score: 5,
                notes: 'Verificar dispositivos das novas viaturas',
                evidences: []
              },
              {
                id: 105,
                title: 'Apresentação da tropa pelo Comandante da Unidade',
                status: 'Pendente',
                score: 0,
                notes: '',
                evidences: []
              },
              {
                id: 106,
                title: 'Esmero da tropa na formatura',
                status: 'Pendente',
                score: 0,
                notes: '',
                evidences: []
              }
            ]
          },
          {
            id: 2,
            title: 'Hasteamento do Pavilhão Nacional',
            progress: 80,
            status: 'Em Andamento',
            deadline: '2025-04-22',
            responsible: 'Sgt. Pereira',
            items: [
              {
                id: 201,
                title: 'Cerimônia de hasteamento do Pavilhão Nacional',
                status: 'Concluído',
                score: 10,
                notes: 'Cerimônia realizada conforme previsto',
                evidences: ['evidencia-201.jpg']
              },
              {
                id: 202,
                title: 'Todo contigente formado (Oficiais e praças de serviço e expediente)',
                status: 'Concluído',
                score: 10,
                notes: 'Todos presentes na última cerimônia',
                evidences: ['evidencia-202.jpg']
              },
              {
                id: 203,
                title: 'Cânticos dos Hinos e ou canções por todos os militares presentes na formatura',
                status: 'Em Andamento',
                score: 5,
                notes: 'Alguns militares não sabem o Hino Soldado do Fogo completo',
                evidences: []
              },
              {
                id: 204,
                title: 'Boa conservação do Pavilhão Nacional',
                status: 'Concluído',
                score: 10,
                notes: 'Pavilhão em excelente estado',
                evidences: ['evidencia-204.jpg']
              },
              {
                id: 205,
                title: 'Boa conservação de outros símbolos (Bandeira do Estado e flâmula do Cmt)',
                status: 'Concluído',
                score: 10,
                notes: 'Todos os símbolos em bom estado',
                evidences: ['evidencia-205.jpg']
              }
            ]
          },
          // Mais seções seriam adicionadas aqui
        ]);
        
        setTasks([
          {
            id: 1,
            title: 'Verificar QTS atualizado',
            description: 'Confirmar que o QTS está atualizado e exposto em local visível',
            status: 'Em Andamento',
            priority: 'Alta',
            responsible: 'Ten. Silva',
            dueDate: '2025-04-23'
          },
          {
            id: 2,
            title: 'Atualizar POPs',
            description: 'Garantir que todos os POPs estejam disponibilizados para os operadores',
            status: 'Pendente',
            priority: 'Alta',
            responsible: 'Sgt. Oliveira',
            dueDate: '2025-04-22'
          },
          {
            id: 3,
            title: 'Verificar sistema SISGEO',
            description: 'Confirmar lançamento correto de todas as informações no SISGEO',
            status: 'Em Andamento',
            priority: 'Média',
            responsible: 'Ten. Rodrigues',
            dueDate: '2025-04-20'
          },
          {
            id: 4,
            title: 'Revisar motosserras',
            description: 'Verificar funcionamento e testar equipamentos',
            status: 'Pendente',
            priority: 'Alta',
            responsible: 'Sgt. Santos',
            dueDate: '2025-04-24'
          },
          {
            id: 5,
            title: 'Testar viaturas',
            description: 'Teste completo de todas as viaturas operacionais',
            status: 'Pendente',
            priority: 'Alta',
            responsible: 'Ten. Costa',
            dueDate: '2025-04-25'
          }
        ]);
        
        setProgressHistory([
          { date: '15/04', porcentagem: 25 },
          { date: '16/04', porcentagem: 32 },
          { date: '17/04', porcentagem: 40 },
          { date: '18/04', porcentagem: 52 },
          { date: '19/04', porcentagem: 60 },
          { date: '20/04', porcentagem: 67 },
          { date: '21/04', porcentagem: calculateCompletionPercentage([]) } // Será calculado com dados reais
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Atualizar o histório de progresso com o valor atual
  useEffect(() => {
    if (sections.length > 0) {
      const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      
      // Verifica se já existe um registro para hoje
      const todayExists = progressHistory.some(item => item.date === today);
      
      if (!todayExists) {
        const currentProgress = calculateCompletionPercentage(sections);
        const updatedHistory = [...progressHistory];
        
        // Substitui o último item (que foi inicializado com 0)
        updatedHistory[updatedHistory.length - 1] = {
          date: today,
          porcentagem: currentProgress
        };
        
        setProgressHistory(updatedHistory);
        
        // Em um app real, isso seria uma chamada ao Firestore
        // const db = getFirestore();
        // const progressRef = collection(db, 'progress_history');
        // addDoc(progressRef, {
        //   date: new Date(),
        //   formatted_date: today,
        //   progress: currentProgress
        // });
      }
    }
  }, [sections, progressHistory]);

  // Cálculo da nota média
  const calculateAverageScore = (sectionsData) => {
    if (!sectionsData || !sectionsData.length) return 0;
    
    let totalScore = 0;
    let itemCount = 0;
    
    sectionsData.forEach(section => {
      section.items?.forEach(item => {
        if (item.status !== 'Não Aplicável') {
          totalScore += item.score;
          itemCount++;
        }
      });
    });
    
    return itemCount ? (totalScore / itemCount).toFixed(1) : 0;
  };
  
  // Cálculo do percentual de conclusão
  const calculateCompletionPercentage = (sectionsData) => {
    if (!sectionsData || !sectionsData.length) return 0;
    
    let completed = 0;
    let total = 0;
    
    sectionsData.forEach(section => {
      section.items?.forEach(item => {
        if (item.status !== 'Não Aplicável') {
          total++;
          if (item.status === 'Concluído') {
            completed++;
          }
        }
      });
    });
    
    return total ? Math.round((completed / total) * 100) : 0;
  };

  // Obter contagem de status
  const getStatusCounts = (sectionsData) => {
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

  // Obter progresso de cada seção
  const getSectionCompletion = (sectionsData) => {
    return sectionsData.map(section => {
      return {
        name: section.title.substring(0, 15) + (section.title.length > 15 ? '...' : ''),
        porcentagem: section.progress
      };
    });
  };

  // Calcular dias restantes até a inspeção
  const getDaysRemaining = () => {
    const today = new Date();
    const inspectionDay = new Date(inspectionDate);
    const diffTime = Math.abs(inspectionDay - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Formatar data de inspeção
  const formatInspectionDate = () => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(inspectionDate).toLocaleDateString('pt-BR', options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
        <span className="ml-2">Carregando dashboard...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Card 1 - Nota Média */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Nota Média</h3>
            <span className="text-white bg-red-500 rounded-full w-8 h-8 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </span>
          </div>
          <div className="flex items-baseline">
            <p className="text-4xl font-bold">{calculateAverageScore(sections)}</p>
            <p className="text-gray-400 ml-2">/10</p>
          </div>
          <div className="mt-4">
            <div className="h-2 w-full bg-gray-200 rounded-full">
              <div 
                className="h-full bg-red-500 rounded-full" 
                style={{ width: `${calculateAverageScore(sections) * 10}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Card 2 - Progresso Geral */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Progresso Geral</h3>
            <span className="text-white bg-green-500 rounded-full w-8 h-8 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
              </svg>
            </span>
          </div>
          <div className="flex items-baseline">
            <p className="text-4xl font-bold">{calculateCompletionPercentage(sections)}%</p>
          </div>
          <div className="mt-4">
            <div className="h-2 w-full bg-gray-200 rounded-full">
              <div 
                className="h-full bg-green-500 rounded-full" 
                style={{ width: `${calculateCompletionPercentage(sections)}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Card 3 - Dias Restantes */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Dias Restantes</h3>
            <span className="text-white bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
          <div className="flex items-baseline">
            <p className="text-4xl font-bold">{getDaysRemaining()}</p>
            <p className="text-gray-400 ml-2">dias</p>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Data da Inspeção: {formatInspectionDate()}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Gráfico - Status dos Itens */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Status dos Itens</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getStatusCounts(sections)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getStatusCounts(sections).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Gráfico - Progresso por Seção */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Progresso por Seção</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getSectionCompletion(sections)}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="porcentagem" fill="#8884d8" name="Concluído (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Gráfico - Evolução do Progresso */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">Evolução do Progresso</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={progressHistory}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="porcentagem" name="Progresso (%)" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Lista de Tarefas Prioritárias */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">Tarefas Prioritárias</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarefa
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prioridade
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responsável
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Limite
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {task.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      task.priority === 'Alta' ? 'bg-red-100 text-red-800' : 
                      task.priority === 'Média' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.responsible}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      task.status === 'Pendente' ? 'bg-orange-100 text-orange-800' : 
                      task.status === 'Em Andamento' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.dueDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Visão Geral das Seções */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Resumo das Seções</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section) => (
            <div key={section.id} className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">{section.title}</h4>
              <div className="flex justify-between text-sm mb-2">
                <span>Progresso: {section.progress}%</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  section.status === 'Pendente' ? 'bg-orange-100 text-orange-800' : 
                  section.status === 'Em Andamento' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-green-100 text-green-800'
                }`}>
                  {section.status}
                </span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full mb-2">
                <div 
                  className="h-full bg-green-500 rounded-full" 
                  style={{ width: `${section.progress}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500">
                Responsável: {section.responsible} | Prazo: {section.deadline}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;