import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCgSk051-U17EeYLDZ3k3-67C9XFX4gUUc",
  authDomain: "sistema-inspecao-bombeiros.firebaseapp.com",
  projectId: "sistema-inspecao-bombeiros",
  storageBucket: "sistema-inspecao-bombeiros.firebasestorage.app",
  messagingSenderId: "777907321239",
  appId: "1:777907321239:web:1030a1adf6b0b8577d6cd2",
  measurementId: "G-6ZNFPTR3F6"
};

// Inicialização do Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Cores para os gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF0000'];
const STATUS_COLORS = {
  'Pendente': '#FF8042',
  'Em Andamento': '#FFBB28', 
  'Concluído': '#00C49F',
  'Não Aplicável': '#A9A9A9'
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [notes, setNotes] = useState('');
  const [currentStatus, setCurrentStatus] = useState('Pendente');
  const [taskList, setTaskList] = useState([]);
  const [todoTitle, setTodoTitle] = useState('');
  const [todoDescription, setTodoDescription] = useState('');
  const [todoPriority, setTodoPriority] = useState('Média');
  const [todoResponsible, setTodoResponsible] = useState('');

  // Simulação de dados do Firebase
  useEffect(() => {
    // Em um app real, isso seria uma chamada ao Firestore
    // const fetchData = async () => {
    //   try {
    //     const sectionsCollection = collection(db, 'sections');
    //     const sectionsSnapshot = await getDocs(sectionsCollection);
    //     const sectionsData = sectionsSnapshot.docs.map(doc => ({
    //       id: doc.id,
    //       ...doc.data()
    //     }));
    //     setSections(sectionsData);
    //
    //     const tasksCollection = collection(db, 'tasks');
    //     const tasksSnapshot = await getDocs(tasksCollection);
    //     const tasksData = tasksSnapshot.docs.map(doc => ({
    //       id: doc.id,
    //       ...doc.data()
    //     }));
    //     setTaskList(tasksData);
    //   } catch (error) {
    //     console.error("Erro ao buscar dados:", error);
    //   }
    //   setLoading(false);
    // };
    // fetchData();
    
    // Para demonstração, vamos usar dados fictícios
    setTimeout(() => {
      setSections(getSectionsData());
      setTaskList(getInitialTasks());
      setLoading(false);
    }, 1000);
  }, []);

  // Dados de exemplo para tarefas
  const getInitialTasks = () => {
    return [
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
        status: 'Concluído',
        priority: 'Média',
        responsible: 'Ten. Rodrigues',
        dueDate: '2025-04-20'
      }
    ];
  };

  // Dados de exemplo para as seções de inspeção
  const getSectionsData = () => {
    return [
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
      {
        id: 3,
        title: 'Documentação Operacional',
        progress: 25,
        status: 'Em Andamento',
        deadline: '2025-04-24',
        responsible: 'Cap. Souza',
        items: [
          {
            id: 301,
            title: 'QTS atualizado e exposto em local visível',
            status: 'Em Andamento',
            score: 5,
            notes: 'QTS precisa ser atualizado com novas transferências',
            evidences: []
          },
          {
            id: 302,
            title: 'Cópia das Operações simuladas (últimos 2 anos)',
            status: 'Pendente',
            score: 0,
            notes: 'Localizar documentos no arquivo',
            evidences: []
          },
          // Outros itens seriam adicionados aqui
        ]
      },
      {
        id: 4,
        title: 'Teste Operacional Diário (TOD)',
        progress: 40,
        status: 'Em Andamento',
        deadline: '2025-04-25',
        responsible: 'Ten. Rodrigues',
        items: [
          // Itens seriam adicionados aqui
        ]
      },
      {
        id: 5,
        title: 'Área Operacional',
        progress: 60,
        status: 'Em Andamento',
        deadline: '2025-04-24',
        responsible: 'Sgt. Oliveira',
        items: [
          // Itens seriam adicionados aqui
        ]
      },
      {
        id: 6,
        title: 'Procedimento no Acionamento do Socorro',
        progress: 70,
        status: 'Em Andamento',
        deadline: '2025-04-23',
        responsible: 'Ten. Silva',
        items: [
          // Itens seriam adicionados aqui
        ]
      },
      {
        id: 7,
        title: 'Instalações da SsCO',
        progress: 90,
        status: 'Em Andamento',
        deadline: '2025-04-22',
        responsible: 'Cap. Mendes',
        items: [
          // Itens seriam adicionados aqui
        ]
      },
      {
        id: 8,
        title: 'Viaturas Operacionais',
        progress: 85,
        status: 'Em Andamento',
        deadline: '2025-04-23',
        responsible: 'Ten. Costa',
        items: [
          // Itens seriam adicionados aqui
        ]
      },
      {
        id: 9,
        title: 'Recursos Hídricos',
        progress: 30,
        status: 'Em Andamento',
        deadline: '2025-04-25',
        responsible: 'Sgt. Santos',
        items: [
          // Itens seriam adicionados aqui
        ]
      },
      {
        id: 10,
        title: 'Logística de Materiais',
        progress: 45,
        status: 'Em Andamento',
        deadline: '2025-04-26',
        responsible: 'Ten. Almeida',
        items: [
          // Itens seriam adicionados aqui
        ]
      },
      {
        id: 11,
        title: 'Logística de Frota',
        progress: 65,
        status: 'Em Andamento',
        deadline: '2025-04-25',
        responsible: 'Sgt. Pereira',
        items: [
          // Itens seriam adicionados aqui
        ]
      },
      {
        id: 12,
        title: 'Logística de Bens Imóveis',
        progress: 55,
        status: 'Em Andamento',
        deadline: '2025-04-27',
        responsible: 'Ten. Silva',
        items: [
          // Itens seriam adicionados aqui
        ]
      },
      {
        id: 13,
        title: 'Logística da Unidade de Alimentação e Nutrição',
        progress: 75,
        status: 'Em Andamento',
        deadline: '2025-04-24',
        responsible: 'Sgt. Oliveira',
        items: [
          // Itens seriam adicionados aqui
        ]
      },
      {
        id: 14,
        title: 'Estrutura Geral da SST',
        progress: 15,
        status: 'Em Andamento',
        deadline: '2025-04-28',
        responsible: 'Cap. Souza',
        items: [
          // Itens seriam adicionados aqui
        ]
      }
    ];
  };

  // Cálculo da nota média
  const calculateAverageScore = () => {
    if (!sections.length) return 0;
    
    let totalScore = 0;
    let itemCount = 0;
    
    sections.forEach(section => {
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
  const calculateCompletionPercentage = () => {
    if (!sections.length) return 0;
    
    let completed = 0;
    let total = 0;
    
    sections.forEach(section => {
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
  const getStatusCounts = () => {
    const counts = {
      'Pendente': 0,
      'Em Andamento': 0,
      'Concluído': 0,
      'Não Aplicável': 0
    };
    
    sections.forEach(section => {
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
  const getSectionCompletion = () => {
    return sections.map(section => {
      const total = section.items?.length || 0;
      let completed = 0;
      
      section.items?.forEach(item => {
        if (item.status === 'Concluído') {
          completed++;
        }
      });
      
      const percentage = total ? Math.round((completed / total) * 100) : 0;
      
      return {
        name: section.title.substring(0, 15) + (section.title.length > 15 ? '...' : ''),
        porcentagem: percentage
      };
    });
  };

  // Obter tarefas prioritárias
  const getPriorityTasks = () => {
    return taskList
      .filter(task => task.status !== 'Concluído')
      .sort((a, b) => {
        const priorityValues = { 'Alta': 3, 'Média': 2, 'Baixa': 1 };
        return priorityValues[b.priority] - priorityValues[a.priority];
      })
      .slice(0, 5);
  };

  // Adicionar nova tarefa
  const handleAddTask = () => {
    if (!todoTitle.trim()) return;
    
    const newTask = {
      id: Date.now(),
      title: todoTitle,
      description: todoDescription,
      status: 'Pendente',
      priority: todoPriority,
      responsible: todoResponsible,
      dueDate: new Date().toISOString().split('T')[0]
    };
    
    setTaskList([...taskList, newTask]);
    
    // Em um app real, isso seria uma chamada ao Firestore
    // const addTaskToFirestore = async () => {
    //   try {
    //     await addDoc(collection(db, "tasks"), newTask);
    //   } catch (error) {
    //     console.error("Erro ao adicionar tarefa:", error);
    //   }
    // };
    // addTaskToFirestore();
    
    setTodoTitle('');
    setTodoDescription('');
    setTodoPriority('Média');
    setTodoResponsible('');
  };

  // Atualizar status de uma tarefa
  const handleUpdateTaskStatus = (taskId, newStatus) => {
    const updatedTasks = taskList.map(task => 
      task.id === taskId ? {...task, status: newStatus} : task
    );
    setTaskList(updatedTasks);
    
    // Em um app real, isso seria uma chamada ao Firestore
    // const updateTaskInFirestore = async () => {
    //   try {
    //     const taskDoc = doc(db, "tasks", taskId);
    //     await updateDoc(taskDoc, { status: newStatus });
    //   } catch (error) {
    //     console.error("Erro ao atualizar tarefa:", error);
    //   }
    // };
    // updateTaskInFirestore();
  };

  // Selecionar uma seção
  const handleSelectSection = (section) => {
    setSelectedSection(section);
    setSelectedItem(null);
  };

  // Selecionar um item de inspeção
  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setNotes(item.notes || '');
    setCurrentStatus(item.status || 'Pendente');
  };

  // Atualizar um item de inspeção
  const handleUpdateItem = () => {
    if (!selectedItem || !selectedSection) return;
    
    const updatedSections = sections.map(section => {
      if (section.id === selectedSection.id) {
        const updatedItems = section.items.map(item => {
          if (item.id === selectedItem.id) {
            return {
              ...item,
              status: currentStatus,
              notes: notes,
              score: currentStatus === 'Concluído' ? 10 : 
                     currentStatus === 'Em Andamento' ? 5 : 
                     currentStatus === 'Não Aplicável' ? 'NA' : 0
            };
          }
          return item;
        });
        
        // Recalcular o progresso da seção
        const totalItems = updatedItems.filter(i => i.status !== 'Não Aplicável').length;
        const completedItems = updatedItems.filter(i => i.status === 'Concluído').length;
        const progress = totalItems ? Math.round((completedItems / totalItems) * 100) : 0;
        
        return {
          ...section,
          items: updatedItems,
          progress: progress
        };
      }
      return section;
    });
    
    setSections(updatedSections);
    
    // Em um app real, isso seria uma chamada ao Firestore
    // const updateSectionInFirestore = async () => {
    //   try {
    //     const sectionDoc = doc(db, "sections", selectedSection.id);
    //     await updateDoc(sectionDoc, { 
    //       items: updatedSections.find(s => s.id === selectedSection.id).items,
    //       progress: updatedSections.find(s => s.id === selectedSection.id).progress
    //     });
    //   } catch (error) {
    //     console.error("Erro ao atualizar seção:", error);
    //   }
    // };
    // updateSectionInFirestore();
  };

  // Fazer login
  const handleLogin = (e) => {
    e.preventDefault();
    
    // Em um app real, isso seria uma autenticação com Firebase
    // const email = e.target.email.value;
    // const password = e.target.password.value;
    // signInWithEmailAndPassword(auth, email, password)
    //   .then((userCredential) => {
    //     setUser(userCredential.user);
    //   })
    //   .catch((error) => {
    //     console.error("Erro ao fazer login:", error);
    //   });
    
    // Para demonstração
    setUser({ name: 'Comandante', role: 'Administrador' });
  };

  // Renderização do loading
  if (loading) {
    return (
      <div className="flex h-screen justify-center items-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-xl text-gray-700">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  // Renderização da tela de login
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sistema de Gestão de Inspeção</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Corpo de Bombeiros Militar
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">Email</label>
                <input id="email-address" name="email" type="email" autoComplete="email" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm" placeholder="Email" />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Senha</label>
                <input id="password" name="password" type="password" autoComplete="current-password" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm" placeholder="Senha" />
              </div>
            </div>

            <div>
              <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                Entrar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Renderização principal do aplicativo
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-red-800 text-white flex flex-col">
        <div className="p-4 border-b border-red-700">
          <h2 className="text-xl font-bold">Sistema de Inspeção</h2>
          <p className="text-sm opacity-75">CBMERJ</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto">
          <ul className="p-2">
            <li>
              <button 
                onClick={() => setActiveTab('dashboard')} 
                className={`w-full text-left px-4 py-2 rounded ${activeTab === 'dashboard' ? 'bg-red-900' : 'hover:bg-red-700'}`}
              >
                Dashboard
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('sections')} 
                className={`w-full text-left px-4 py-2 rounded ${activeTab === 'sections' ? 'bg-red-900' : 'hover:bg-red-700'}`}
              >
                Seções de Inspeção
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('tasks')} 
                className={`w-full text-left px-4 py-2 rounded ${activeTab === 'tasks' ? 'bg-red-900' : 'hover:bg-red-700'}`}
              >
                Lista de Tarefas
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('reports')} 
                className={`w-full text-left px-4 py-2 rounded ${activeTab === 'reports' ? 'bg-red-900' : 'hover:bg-red-700'}`}
              >
                Relatórios
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('calendar')} 
                className={`w-full text-left px-4 py-2 rounded ${activeTab === 'calendar' ? 'bg-red-900' : 'hover:bg-red-700'}`}
              >
                Calendário
              </button>
            </li>
          </ul>
        </nav>
        
        <div className="p-4 border-t border-red-700">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
              {user.name.charAt(0)}
            </div>
            <div className="ml-2">
              <div className="font-medium">{user.name}</div>
              <div className="text-xs opacity-75">{user.role}</div>
            </div>
          </div>
          <button 
            onClick={() => setUser(null)} 
            className="mt-4 w-full bg-red-700 hover:bg-red-600 py-1 px-2 rounded text-sm"
          >
            Sair
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Card 1 */}
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
                  <p className="text-4xl font-bold">{calculateAverageScore()}</p>
                  <p className="text-gray-400 ml-2">/10</p>
                </div>
                <div className="mt-4">
                  <div className="h-2 w-full bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-red-500 rounded-full" 
                      style={{ width: `${calculateAverageScore() * 10}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Card 2 */}
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
                  <p className="text-4xl font-bold">{calculateCompletionPercentage()}%</p>
                </div>
                <div className="mt-4">
                  <div className="h-2 w-full bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-green-500 rounded-full" 
                      style={{ width: `${calculateCompletionPercentage()}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Card 3 */}
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
                  <p className="text-4xl font-bold">7</p>
                  <p className="text-gray-400 ml-2">dias</p>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Data da Inspeção: 28/04/2025</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Chart 1 */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">Status dos Itens</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getStatusCounts()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getStatusCounts().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Chart 2 */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">Progresso por Seção</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getSectionCompletion()}
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
                    {getPriorityTasks().map((task) => (
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
          </div>
        )}
        
        {activeTab === 'sections' && (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Seções de Inspeção</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sections.map((section) => (
                <div key={section.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-4 border-b">
                    <h3 className="font-medium">{section.title}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-sm text-gray-500">Progresso: {section.progress}%</div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        section.status === 'Pendente' ? 'bg-orange-100 text-orange-800' : 
                        section.status === 'Em Andamento' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {section.status}
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full bg-gray-200 rounded-full">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${section.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50">
                    <div className="flex justify-between text-sm">
                      <div>Responsável: {section.responsible}</div>
                      <div>Prazo: {section.deadline}</div>
                    </div>
                    <button 
                      onClick={() => handleSelectSection(section)}
                      className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 flex justify-center items-center"
                    >
                      Ver Detalhes
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {selectedSection && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-full flex flex-col">
                  <div className="p-6 border-b">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-bold">{selectedSection.title}</h2>
                      <button 
                        onClick={() => setSelectedSection(null)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-2">
                      <div className="text-sm text-gray-500">Responsável: {selectedSection.responsible}</div>
                      <div className="text-sm text-gray-500">Prazo: {selectedSection.deadline}</div>
                      <div className="mt-2">
                        <div className="text-sm text-gray-500">Progresso: {selectedSection.progress}%</div>
                        <div className="mt-1 h-2 w-full bg-gray-200 rounded-full">
                          <div 
                            className="h-full bg-green-500 rounded-full" 
                            style={{ width: `${selectedSection.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-medium">Itens de Inspeção</h3>
                        {selectedSection.items?.map((item) => (
                          <div 
                            key={item.id} 
                            className={`p-4 border rounded cursor-pointer ${selectedItem?.id === item.id ? 'border-red-500 bg-red-50' : 'hover:bg-gray-50'}`}
                            onClick={() => handleSelectItem(item)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{item.title}</h4>
                                {item.notes && (
                                  <p className="text-sm text-gray-500 mt-1">{item.notes}</p>
                                )}
                              </div>
                              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                item.status === 'Pendente' ? 'bg-orange-100 text-orange-800' : 
                                item.status === 'Em Andamento' ? 'bg-yellow-100 text-yellow-800' : 
                                item.status === 'Concluído' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {item.status}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <span>Nota: {item.score}</span>
                              {item.evidences?.length > 0 && (
                                <span className="ml-4 flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                  </svg>
                                  {item.evidences.length} anexo(s)
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {selectedItem && (
                        <div className="bg-gray-50 p-4 rounded border">
                          <h3 className="font-medium mb-4">Detalhe do Item</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                              </label>
                              <select 
                                value={currentStatus}
                                onChange={(e) => setCurrentStatus(e.target.value)}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
                              >
                                <option value="Pendente">Pendente</option>
                                <option value="Em Andamento">Em Andamento</option>
                                <option value="Concluído">Concluído</option>
                                <option value="Não Aplicável">Não Aplicável</option>
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Anotações
                              </label>
                              <textarea 
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={4}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
                                placeholder="Adicione notas sobre este item..."
                              ></textarea>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Evidências
                              </label>
                              <div className="border border-gray-300 rounded-md p-4 bg-white">
                                {selectedItem.evidences?.length > 0 ? (
                                  <div className="grid grid-cols-2 gap-2">
                                    {selectedItem.evidences.map((evidence, index) => (
                                      <div key={index} className="border rounded overflow-hidden">
                                        <div className="h-24 bg-gray-200 flex items-center justify-center">
                                          {/* Placeholder for image */}
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                          </svg>
                                        </div>
                                        <div className="p-2 text-xs truncate">{evidence}</div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-4 text-gray-500">
                                    Nenhuma evidência anexada
                                  </div>
                                )}
                                
                                <button className="mt-2 flex items-center text-sm text-red-600 hover:text-red-800">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                  Adicionar Evidência
                                </button>
                              </div>
                            </div>
                            
                            <button 
                              onClick={handleUpdateItem}
                              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
                            >
                              Salvar Alterações
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'tasks' && (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Lista de Tarefas</h1>
            
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="p-4 border-b">
                <h3 className="font-medium">Adicionar Nova Tarefa</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título
                    </label>
                    <input 
                      type="text" 
                      value={todoTitle}
                      onChange={(e) => setTodoTitle(e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
                      placeholder="Digite o título da tarefa"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Responsável
                    </label>
                    <input 
                      type="text" 
                      value={todoResponsible}
                      onChange={(e) => setTodoResponsible(e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
                      placeholder="Digite o nome do responsável"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <textarea 
                      value={todoDescription}
                      onChange={(e) => setTodoDescription(e.target.value)}
                      rows={3}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
                      placeholder="Digite a descrição da tarefa"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prioridade
                    </label>
                    <select 
                      value={todoPriority}
                      onChange={(e) => setTodoPriority(e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
                    >
                      <option value="Alta">Alta</option>
                      <option value="Média">Média</option>
                      <option value="Baixa">Baixa</option>
                    </select>
                    
                    <button 
                      onClick={handleAddTask}
                      className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
                    >
                      Adicionar Tarefa
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-medium">Tarefas</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Título
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descrição
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
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {taskList.map((task) => (
                      <tr key={task.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {task.title}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {task.description}
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
                          <select 
                            value={task.status}
                            onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                            className={`border-0 rounded py-1 px-2 text-xs font-semibold ${
                              task.status === 'Pendente' ? 'bg-orange-100 text-orange-800' : 
                              task.status === 'Em Andamento' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-green-100 text-green-800'
                            }`}
                          >
                            <option value="Pendente">Pendente</option>
                            <option value="Em Andamento">Em Andamento</option>
                            <option value="Concluído">Concluído</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {task.dueDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button className="text-red-600 hover:text-red-800">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'reports' && (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Relatórios</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">Progresso Geral</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { date: '15/04', porcentagem: 25 },
                        { date: '16/04', porcentagem: 32 },
                        { date: '17/04', porcentagem: 40 },
                        { date: '18/04', porcentagem: 52 },
                        { date: '19/04', porcentagem: 60 },
                        { date: '20/04', porcentagem: 67 },
                        { date: '21/04', porcentagem: calculateCompletionPercentage() }
                      ]}
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
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">Distribuição por Status</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getStatusCounts()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Quantidade de Itens" fill="#8884d8">
                        {getStatusCounts().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Resumo da Inspeção</h3>
                <button className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Exportar PDF
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Seção
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nota Média
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progresso
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prazo
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Responsável
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sections.map((section) => {
                      // Calcular a nota média da seção
                      let totalScore = 0;
                      let itemCount = 0;
                      
                      section.items?.forEach(item => {
                        if (item.status !== 'Não Aplicável' && !isNaN(item.score)) {
                          totalScore += item.score;
                          itemCount++;
                        }
                      });
                      
                      const averageScore = itemCount ? (totalScore / itemCount).toFixed(1) : 'N/A';
                      
                      return (
                        <tr key={section.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {section.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {averageScore}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <span className="mr-2">{section.progress}%</span>
                              <div className="w-24 h-2 bg-gray-200 rounded-full">
                                <div 
                                  className="h-full bg-green-500 rounded-full" 
                                  style={{ width: `${section.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              section.status === 'Pendente' ? 'bg-orange-100 text-orange-800' : 
                              section.status === 'Em Andamento' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-green-100 text-green-800'
                            }`}>
                              {section.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {section.deadline}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {section.responsible}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'calendar' && (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Calendário</h1>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 bg-red-600 text-white flex justify-between items-center">
                <button className="p-1 rounded hover:bg-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-xl font-bold">Abril 2025</h2>
                <button className="p-1 rounded hover:bg-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-7 gap-px bg-gray-200">
                <div className="bg-gray-100 p-2 text-center font-medium">Dom</div>
                <div className="bg-gray-100 p-2 text-center font-medium">Seg</div>
                <div className="bg-gray-100 p-2 text-center font-medium">Ter</div>
                <div className="bg-gray-100 p-2 text-center font-medium">Qua</div>
                <div className="bg-gray-100 p-2 text-center font-medium">Qui</div>
                <div className="bg-gray-100 p-2 text-center font-medium">Sex</div>
                <div className="bg-gray-100 p-2 text-center font-medium">Sáb</div>
                
                {/* Dias vazios do início do mês */}
                <div className="bg-white p-2 h-32"></div>
                <div className="bg-white p-2 h-32">
                  <div className="text-sm">1</div>
                </div>
                <div className="bg-white p-2 h-32">
                  <div className="text-sm">2</div>
                </div>
                <div className="bg-white p-2 h-32">
                  <div className="text-sm">3</div>
                </div>
                <div className="bg-white p-2 h-32">
                  <div className="text-sm">4</div>
                </div>
                <div className="bg-white p-2 h-32">
                  <div className="text-sm">5</div>
                </div>
                
                {/* Segunda semana */}
                <div className="bg-white p-2 h-32">
                  <div className="text-sm">6</div>
                </div>
                <div className="bg-white p-2 h-32">
                  <div className="text-sm">7</div>
                </div>
                <div className="bg-white p-2 h-32">
                  <div className="text-sm">8</div>
                </div>
                <div className="bg-white p-2 h-32">
                  <div className="text-sm">9</div>
                </div>
                <div className="bg-white p-2 h-32">
                  <div className="text-sm">10</div>
                </div>
                <div className="bg-white p-2 h-32">
                  <div className="text-sm">11</div>
                </div>
                <div className="bg-white p-2 h-32">
                  <div className="text-sm">12</div>
                </div>
                
                {/* Terceira semana */}
                <div className="bg-white p-2 h-32">
                  <div className="text-sm">13</div>
                </div>
                <div className="bg-white p-2 h-32">
                  <div className="text-sm">14</div>
                </div>
                <div className="bg-white p-2 h-32">
                  <div className="text-sm">15</div>
                  <div className="mt-1 p-1 bg-blue-100 text-xs rounded text-blue-800">Início de preparação</div>
                </div>
                <div className="bg-white p-2 h-32">
                  <div className="text-sm">16</div>
                </div>
                <div className="bg-white p-2 h-32">
                  <div className="text-sm">17</div>
                </div>
                <div className="bg-white p-2 h-32">
                  <div className="text-sm">18</div>
                </div>
                <div className="bg-white p-2 h-32">
                  <div className="text-sm">19</div>
                </div>
                
                {/* Quarta semana */}
                <div className="bg-white p-2 h-32">
                  <div className="text-sm">20</div>
                </div>
                <div className="bg-white p-2 h-32 ring-2 ring-red-500">
                  <div className="text-sm font-bold">21</div>
                  <div className="mt-1 p-1 bg-yellow-100 text-xs rounded text-yellow-800">Revisão de documentos</div>
                </div>
                <div className="bg-white p-2 h-32">
                  <div className="text-sm">22</div>
                  <div className="mt-1 p-1 bg-yellow-100 text-xs rounded text-yellow-800">Revisão de materiais</div>
                </div>
                <div className="bg-white p-2 h-32">
                  <div className="text-sm">23</div>
                  <div className="mt-1 p-1 bg-yellow-100 text-xs rounded text-yellow-800">Revisão de viaturas</div>
                </div>
                <div className="bg-white p-2 h-32">
                  <div className="text-sm">24</div>
                  <div className="mt-1 p-1 bg-yellow-100 text-xs rounded text-yellow-800">Ensaio de cerimônia</div>
                </div>
                <div className="bg-white p-2 h-32">
                  <div className="text-sm">25</div>
                  <div className="mt-1 p-1 bg-yellow-100 text-xs rounded text-yellow-800">Inspeção interna</div>
                </div>
                <div className="bg-white p-2 h-32">
                  <div className="text-sm">26</div>
                </div>
                
                {/* Quinta semana */}
                <div className="bg-white p-2 h-32">
                  <div className="text-sm">27</div>
                </div>
                <div className="bg-white p-2 h-32">
                  <div className="text-sm">28</div>
                  <div className="mt-1 p-1 bg-red-100 text-xs rounded text-red-800">INSPEÇÃO OFICIAL</div>
                </div>
                <div className="bg-white p-2 h-32">
                  <div className="text-sm">29</div>
                </div>
                <div className="bg-white p-2 h-32">
                  <div className="text-sm">30</div>
                </div>
                <div className="bg-white p-2 h-32"></div>
                <div className="bg-white p-2 h-32"></div>
                <div className="bg-white p-2 h-32"></div>
              </div>
              
              <div className="p-4 border-t">
                <h3 className="font-medium mb-2">Próximos Eventos</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="mt-0.5 h-3 w-3 rounded-full bg-yellow-500 mr-2"></span>
                    <div>
                      <p className="font-medium">Revisão de documentos</p>
                      <p className="text-sm text-gray-500">21 de Abril, 2025 - 08:00</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="mt-0.5 h-3 w-3 rounded-full bg-yellow-500 mr-2"></span>
                    <div>
                      <p className="font-medium">Revisão de materiais</p>
                      <p className="text-sm text-gray-500">22 de Abril, 2025 - 08:00</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="mt-0.5 h-3 w-3 rounded-full bg-yellow-500 mr-2"></span>
                    <div>
                      <p className="font-medium">Revisão de viaturas</p>
                      <p className="text-sm text-gray-500">23 de Abril, 2025 - 08:00</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="mt-0.5 h-3 w-3 rounded-full bg-yellow-500 mr-2"></span>
                    <div>
                      <p className="font-medium">Ensaio de cerimônia</p>
                      <p className="text-sm text-gray-500">24 de Abril, 2025 - 08:00</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="mt-0.5 h-3 w-3 rounded-full bg-yellow-500 mr-2"></span>
                    <div>
                      <p className="font-medium">Inspeção interna</p>
                      <p className="text-sm text-gray-500">25 de Abril, 2025 - 08:00</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="mt-0.5 h-3 w-3 rounded-full bg-red-500 mr-2"></span>
                    <div>
                      <p className="font-medium">INSPEÇÃO OFICIAL</p>
                      <p className="text-sm text-gray-500">28 de Abril, 2025 - 09:00</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;