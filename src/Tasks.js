// Tasks.js - Componente para gerenciamento de tarefas da inspeção

import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, doc, getDoc, getDocs, updateDoc, deleteDoc, Timestamp, query, where, orderBy } from 'firebase/firestore';
import appData from './data';

const Tasks = ({ user }) => {
  // Estados
  const [tasks, setTasks] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: appData.STATUS.PENDENTE,
    priority: appData.PRIORIDADES.MEDIA,
    responsible: '',
    dueDate: new Date().toISOString().split('T')[0],
    section: ''
  });
  
  // Filtros e ordenação
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterResponsible, setFilterResponsible] = useState('all');
  const [filterSection, setFilterSection] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Refs
  const deleteTaskNameRef = useRef(null);
  
  // Referência ao Firestore
  const db = window.db;

  // Carregar dados
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Em um app real, isso seria uma chamada ao Firestore
        if (db) {
          // Carregar tarefas
          const tasksCollection = collection(db, 'tasks');
          const tasksQuery = query(tasksCollection, orderBy('dueDate', 'asc'));
          const tasksSnapshot = await getDocs(tasksQuery);
          const tasksData = tasksSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            dueDate: doc.data().dueDate?.toDate?.() ? 
                    doc.data().dueDate.toDate().toISOString().split('T')[0] : 
                    doc.data().dueDate
          }));
          
          setTasks(tasksData);
          
          // Carregar seções para o select
          const sectionsCollection = collection(db, 'sections');
          const sectionsSnapshot = await getDocs(sectionsCollection);
          const sectionsData = sectionsSnapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().title
          }));
          
          setSections(sectionsData);
        } else {
          // Usar dados de demonstração
          setTasks(appData.initialTasks);
          
          // Extrair apenas id e título das seções para o select
          const sectionsData = appData.initialSections.map(section => ({
            id: section.id,
            title: section.title
          }));
          
          setSections(sectionsData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar tarefas:", error);
        // Carregar dados de demonstração em caso de erro
        setTasks(appData.initialTasks);
        
        const sectionsData = appData.initialSections.map(section => ({
          id: section.id,
          title: section.title
        }));
        
        setSections(sectionsData);
        setLoading(false);
      }
    };

    fetchData();
  }, [db]);

  // Resetar formulário de nova tarefa
  const resetNewTaskForm = () => {
    setNewTask({
      title: '',
      description: '',
      status: appData.STATUS.PENDENTE,
      priority: appData.PRIORIDADES.MEDIA,
      responsible: '',
      dueDate: new Date().toISOString().split('T')[0],
      section: ''
    });
  };

  // Adicionar nova tarefa
  const handleAddTask = async () => {
    // Validação básica
    if (!newTask.title.trim() || !newTask.responsible.trim() || !newTask.dueDate) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    try {
      // Preparar objeto da tarefa
      const taskToAdd = {
        ...newTask,
        createdAt: Timestamp.now(),
        createdBy: user?.nome || 'Usuário',
        lastUpdated: Timestamp.now(),
        lastUpdatedBy: user?.nome || 'Usuário'
      };
      
      // Em um app real, isso seria uma chamada ao Firestore
      if (db) {
        const tasksCollection = collection(db, 'tasks');
        const docRef = await addDoc(tasksCollection, taskToAdd);
        
        // Adicionar o ID gerado pelo Firestore
        taskToAdd.id = docRef.id;
      } else {
        // Gerar ID único para demonstração
        taskToAdd.id = `task-${Date.now()}`;
      }
      
      // Atualizar estado local
      setTasks([...tasks, taskToAdd]);
      
      // Fechar modal e resetar formulário
      setShowAddModal(false);
      resetNewTaskForm();
      
      // Feedback de sucesso
      alert('Tarefa adicionada com sucesso!');
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error);
      alert('Erro ao adicionar tarefa. Tente novamente.');
    }
  };

  // Atualizar tarefa existente
  const handleUpdateTask = async () => {
    if (!currentTask) return;
    
    // Validação básica
    if (!currentTask.title.trim() || !currentTask.responsible.trim() || !currentTask.dueDate) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    try {
      // Preparar objeto de atualização
      const updatedTask = {
        ...currentTask,
        lastUpdated: Timestamp.now(),
        lastUpdatedBy: user?.nome || 'Usuário'
      };
      
      // Em um app real, isso seria uma chamada ao Firestore
      if (db) {
        const taskDoc = doc(db, "tasks", currentTask.id);
        await updateDoc(taskDoc, updatedTask);
      }
      
      // Atualizar estado local
      setTasks(tasks.map(task => 
        task.id === currentTask.id ? updatedTask : task
      ));
      
      // Fechar modal
      setShowEditModal(false);
      
      // Feedback de sucesso
      alert('Tarefa atualizada com sucesso!');
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
      alert('Erro ao atualizar tarefa. Tente novamente.');
    }
  };

  // Excluir tarefa
  const handleDeleteTask = async () => {
    if (!currentTask) return;
    
    // Validação de confirmação
    const confirmInput = deleteTaskNameRef.current?.value || '';
    if (confirmInput.trim().toLowerCase() !== currentTask.title.trim().toLowerCase()) {
      alert('Nome da tarefa não corresponde. Exclusão cancelada.');
      return;
    }
    
    try {
      // Em um app real, isso seria uma chamada ao Firestore
      if (db) {
        const taskDoc = doc(db, "tasks", currentTask.id);
        await deleteDoc(taskDoc);
      }
      
      // Atualizar estado local
      setTasks(tasks.filter(task => task.id !== currentTask.id));
      
      // Fechar modal
      setShowConfirmDeleteModal(false);
      
      // Feedback de sucesso
      alert('Tarefa excluída com sucesso!');
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
      alert('Erro ao excluir tarefa. Tente novamente.');
    }
  };

  // Atualizar status rápido
  const handleQuickStatusUpdate = async (taskId, newStatus) => {
    try {
      // Encontrar a tarefa
      const taskToUpdate = tasks.find(task => task.id === taskId);
      if (!taskToUpdate) return;
      
      // Preparar objeto atualizado
      const updatedTask = {
        ...taskToUpdate,
        status: newStatus,
        lastUpdated: Timestamp.now(),
        lastUpdatedBy: user?.nome || 'Usuário'
      };
      
      // Em um app real, isso seria uma chamada ao Firestore
      if (db) {
        const taskDoc = doc(db, "tasks", taskId);
        await updateDoc(taskDoc, { 
          status: newStatus,
          lastUpdated: Timestamp.now(),
          lastUpdatedBy: user?.nome || 'Usuário'
        });
      }
      
      // Atualizar estado local
      setTasks(tasks.map(task => 
        task.id === taskId ? updatedTask : task
      ));
    } catch (error) {
      console.error("Erro ao atualizar status da tarefa:", error);
      alert('Erro ao atualizar status. Tente novamente.');
    }
  };

  // Filtragem e ordenação
  const getFilteredAndSortedTasks = () => {
    return tasks
      .filter(task => {
        // Filtro de busca por texto
        const matchesSearch = 
          searchTerm === '' || 
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.responsible.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Filtro por status
        const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
        
        // Filtro por prioridade
        const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
        
        // Filtro por responsável
        const matchesResponsible = 
          filterResponsible === 'all' || 
          task.responsible.toLowerCase().includes(filterResponsible.toLowerCase());
        
        // Filtro por seção
        const matchesSection = filterSection === 'all' || task.section === filterSection;
        
        return matchesSearch && matchesStatus && matchesPriority && matchesResponsible && matchesSection;
      })
      .sort((a, b) => {
        // Ordenação
        if (sortBy === 'dueDate') {
          // Ordenar por data
          const dateA = new Date(a.dueDate);
          const dateB = new Date(b.dueDate);
          return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        } else if (sortBy === 'priority') {
          // Ordenar por prioridade
          const priorityValues = { 
            [appData.PRIORIDADES.ALTA]: 3, 
            [appData.PRIORIDADES.MEDIA]: 2, 
            [appData.PRIORIDADES.BAIXA]: 1 
          };
          return sortDirection === 'asc' 
            ? priorityValues[a.priority] - priorityValues[b.priority]
            : priorityValues[b.priority] - priorityValues[a.priority];
        } else {
          // Ordenação padrão por título
          return sortDirection === 'asc'
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        }
      });
  };

  // Obter estatísticas
  const getTasksStats = () => {
    const stats = {
      total: tasks.length,
      pending: tasks.filter(task => task.status === appData.STATUS.PENDENTE).length,
      inProgress: tasks.filter(task => task.status === appData.STATUS.EM_ANDAMENTO).length,
      completed: tasks.filter(task => task.status === appData.STATUS.CONCLUIDO).length,
      highPriority: tasks.filter(task => task.priority === appData.PRIORIDADES.ALTA).length,
      overdue: tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        return dueDate < today && task.status !== appData.STATUS.CONCLUIDO;
      }).length
    };
    
    return stats;
  };

  // Obter lista de responsáveis únicos
  const getUniqueResponsibles = () => {
    const responsibles = new Set();
    tasks.forEach(task => {
      if (task.responsible) {
        responsibles.add(task.responsible);
      }
    });
    return Array.from(responsibles).sort();
  };

  // Tarefas filtradas e ordenadas
  const filteredTasks = getFilteredAndSortedTasks();
  const stats = getTasksStats();
  const uniqueResponsibles = getUniqueResponsibles();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
        <span className="ml-2">Carregando tarefas...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Lista de Tarefas</h1>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova Tarefa
        </button>
      </div>
      
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
          <span className="text-sm text-gray-500">Total</span>
          <span className="text-2xl font-bold">{stats.total}</span>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
          <span className="text-sm text-gray-500">Pendentes</span>
          <span className="text-2xl font-bold text-orange-500">{stats.pending}</span>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
          <span className="text-sm text-gray-500">Em Andamento</span>
          <span className="text-2xl font-bold text-yellow-500">{stats.inProgress}</span>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
          <span className="text-sm text-gray-500">Concluídas</span>
          <span className="text-2xl font-bold text-green-500">{stats.completed}</span>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
          <span className="text-sm text-gray-500">Alta Prioridade</span>
          <span className="text-2xl font-bold text-red-500">{stats.highPriority}</span>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
          <span className="text-sm text-gray-500">Atrasadas</span>
          <span className="text-2xl font-bold text-purple-500">{stats.overdue}</span>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Busca */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Buscar tarefa..."
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Filtro por Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
            >
              <option value="all">Todos</option>
              <option value={appData.STATUS.PENDENTE}>Pendente</option>
              <option value={appData.STATUS.EM_ANDAMENTO}>Em Andamento</option>
              <option value={appData.STATUS.CONCLUIDO}>Concluído</option>
            </select>
          </div>
          
          {/* Filtro por Prioridade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridade
            </label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
            >
              <option value="all">Todas</option>
              <option value={appData.PRIORIDADES.ALTA}>Alta</option>
              <option value={appData.PRIORIDADES.MEDIA}>Média</option>
              <option value={appData.PRIORIDADES.BAIXA}>Baixa</option>
            </select>
          </div>
          
          {/* Filtro por Responsável */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Responsável
            </label>
            <select
              value={filterResponsible}
              onChange={(e) => setFilterResponsible(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
            >
              <option value="all">Todos</option>
              {uniqueResponsibles.map((responsible, index) => (
                <option key={index} value={responsible}>{responsible}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filtro por Seção */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seção
            </label>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
            >
              <option value="all">Todas</option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>{section.title}</option>
              ))}
            </select>
          </div>
          
          {/* Ordenação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ordenar por
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
            >
              <option value="dueDate">Data Limite</option>
              <option value="priority">Prioridade</option>
              <option value="title">Título</option>
            </select>
          </div>
          
          {/* Direção da Ordenação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Direção
            </label>
            <select
              value={sortDirection}
              onChange={(e) => setSortDirection(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
            >
              <option value="asc">Crescente</option>
              <option value="desc">Decrescente</option>
            </select>
          </div>
        </div>
        
        {/* Botão para limpar filtros */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
              setFilterPriority('all');
              setFilterResponsible('all');
              setFilterSection('all');
              setSortBy('dueDate');
              setSortDirection('asc');
            }}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Limpar Filtros
          </button>
        </div>
      </div>
      
      {/* Lista de Tarefas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <p className="mt-4 text-lg text-gray-500">Nenhuma tarefa encontrada com os filtros atuais.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterPriority('all');
                setFilterResponsible('all');
                setFilterSection('all');
              }}
              className="mt-2 text-red-600 hover:text-red-800"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
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
                    Seção
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task) => {
                  // Verificar se a tarefa está atrasada
                  const dueDate = new Date(task.dueDate);
                  const today = new Date();
                  const isOverdue = dueDate < today && task.status !== appData.STATUS.CONCLUIDO;
                  
                  // Encontrar o nome da seção
                  const section = sections.find(s => s.id === task.section);
                  const sectionName = section ? section.title : '';
                  
                  return (
                    <tr key={task.id} className={isOverdue ? 'bg-red-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {task.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {task.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          task.priority === appData.PRIORIDADES.ALTA ? 'bg-red-100 text-red-800' : 
                          task.priority === appData.PRIORIDADES.MEDIA ? 'bg-yellow-100 text-yellow-800' : 
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
                          onChange={(e) => handleQuickStatusUpdate(task.id, e.target.value)}
                          className={`border-0 rounded py-1 px-2 text-xs font-semibold ${
                            task.status === appData.STATUS.PENDENTE ? 'bg-orange-100 text-orange-800' : 
                            task.status === appData.STATUS.EM_ANDAMENTO ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'
                          }`}
                        >
                          <option value={appData.STATUS.PENDENTE}>Pendente</option>
                          <option value={appData.STATUS.EM_ANDAMENTO}>Em Andamento</option>
                          <option value={appData.STATUS.CONCLUIDO}>Concluído</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={isOverdue ? 'text-red-600 font-semibold' : ''}>
                          {task.dueDate}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sectionName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => {
                              setCurrentTask(task);
                              setShowEditModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => {
                              setCurrentTask(task);
                              setShowConfirmDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Excluir"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Modal de Adicionar Tarefa */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">Nova Tarefa</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input 
                  type="text" 
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
                  placeholder="Título da tarefa"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea 
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  rows={3}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
                  placeholder="Descreva a tarefa"
                ></textarea>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridade
                  </label>
                  <select 
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
                  >
                    <option value={appData.PRIORIDADES.ALTA}>Alta</option>
                    <option value={appData.PRIORIDADES.MEDIA}>Média</option>
                    <option value={appData.PRIORIDADES.BAIXA}>Baixa</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select 
                    value={newTask.status}
                    onChange={(e) => setNewTask({...newTask, status: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
                  >
                    <option value={appData.STATUS.PENDENTE}>Pendente</option>
                    <option value={appData.STATUS.EM_ANDAMENTO}>Em Andamento</option>
                    <option value={appData.STATUS.CONCLUIDO}>Concluído</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Responsável *
                  </label>
                  <input 
                    type="text" 
                    value={newTask.responsible}
                    onChange={(e) => setNewTask({...newTask, responsible: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
                    placeholder="Nome do responsável"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Limite *
                  </label>
                  <input 
                    type="date" 
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seção Relacionada
                </label>
                <select 
                  value={newTask.section}
                  onChange={(e) => setNewTask({...newTask, section: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
                >
                  <option value="">Nenhuma</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>{section.title}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAddTask}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Editar Tarefa */}
      {showEditModal && currentTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">Editar Tarefa</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input 
                  type="text" 
                  value={currentTask.title}
                  onChange={(e) => setCurrentTask({...currentTask, title: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
                  placeholder="Título da tarefa"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea 
                  value={currentTask.description}
                  onChange={(e) => setCurrentTask({...currentTask, description: e.target.value})}
                  rows={3}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
                  placeholder="Descreva a tarefa"
                ></textarea>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridade
                  </label>
                  <select 
                    value={currentTask.priority}
                    onChange={(e) => setCurrentTask({...currentTask, priority: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
                  >
                    <option value={appData.PRIORIDADES.ALTA}>Alta</option>
                    <option value={appData.PRIORIDADES.MEDIA}>Média</option>
                    <option value={appData.PRIORIDADES.BAIXA}>Baixa</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select 
                    value={currentTask.status}
                    onChange={(e) => setCurrentTask({...currentTask, status: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
                  >
                    <option value={appData.STATUS.PENDENTE}>Pendente</option>
                    <option value={appData.STATUS.EM_ANDAMENTO}>Em Andamento</option>
                    <option value={appData.STATUS.CONCLUIDO}>Concluído</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Responsável *
                  </label>
                  <input 
                    type="text" 
                    value={currentTask.responsible}
                    onChange={(e) => setCurrentTask({...currentTask, responsible: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
                    placeholder="Nome do responsável"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Limite *
                  </label>
                  <input 
                    type="date" 
                    value={currentTask.dueDate}
                    onChange={(e) => setCurrentTask({...currentTask, dueDate: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seção Relacionada
                </label>
                <select 
                  value={currentTask.section || ''}
                  onChange={(e) => setCurrentTask({...currentTask, section: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
                >
                  <option value="">Nenhuma</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>{section.title}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button 
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button 
                onClick={handleUpdateTask}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Confirmação de Exclusão */}
      {showConfirmDeleteModal && currentTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium text-red-600">Excluir Tarefa</h3>
              <button 
                onClick={() => setShowConfirmDeleteModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="bg-red-50 rounded-lg p-4 flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-red-800">Tem certeza que deseja excluir a tarefa?</p>
                  <p className="text-sm text-red-700 mt-1">Esta ação não pode ser desfeita.</p>
                </div>
              </div>
              
              <p className="mt-4 text-sm text-gray-600">Para confirmar, digite o nome da tarefa: <strong>{currentTask.title}</strong></p>
              
              <input 
                type="text" 
                ref={deleteTaskNameRef}
                className="mt-2 w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
                placeholder="Digite o nome da tarefa"
              />
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button 
                onClick={() => setShowConfirmDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDeleteTask}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;