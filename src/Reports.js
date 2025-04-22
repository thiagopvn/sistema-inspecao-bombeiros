// Reports.js - Componente para visualização de relatórios e exportação de dados

import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import appData from './data';

const Reports = ({ user }) => {
  // Estados
  const [sections, setSections] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [progressHistory, setProgressHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [activeReport, setActiveReport] = useState('summary');
  const [filterResponsible, setFilterResponsible] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');
  
  // Referências para exportação
  const reportRef = useRef(null);

  // Referência ao Firestore
  const db = window.db;

  // Carregar dados na inicialização
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Em um app real, isso seria uma chamada ao Firestore
        if (db) {
          // Obter seções com seus itens
          const sectionsCollection = collection(db, 'sections');
          const sectionsSnapshot = await getDocs(sectionsCollection);
          const sectionsData = sectionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setSections(sectionsData);
          
          // Obter tarefas
          const tasksCollection = collection(db, 'tasks');
          const tasksQuery = query(tasksCollection, orderBy('dueDate', 'asc'));
          const tasksSnapshot = await getDocs(tasksQuery);
          const tasksData = tasksSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setTasks(tasksData);
          
          // Obter histórico de progresso
          const progressCollection = collection(db, 'progress_history');
          const progressQuery = query(progressCollection, orderBy('timestamp', 'asc'));
          const progressSnapshot = await getDocs(progressQuery);
          const progressData = progressSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: new Date(doc.data().timestamp.toDate()).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit'
            })
          }));
          setProgressHistory(progressData);
        } else {
          // Para demonstração, usar dados fictícios de data.js
          setSections(appData.initialSections);
          setTasks(appData.initialTasks);
          setProgressHistory(appData.initialProgressHistory);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar dados para relatórios:", error);
        // Mesmo em caso de erro, carregar dados de demonstração
        setSections(appData.initialSections);
        setTasks(appData.initialTasks);
        setProgressHistory(appData.initialProgressHistory);
        setLoading(false);
      }
    };

    fetchData();
  }, [db]);

  // Filtrar dados com base nos filtros selecionados
  const applyFilters = () => {
    let filteredSections = [...appData.initialSections];
    
    // Filtrar por responsável
    if (filterResponsible !== 'all') {
      filteredSections = filteredSections.filter(section => 
        section.responsible.toLowerCase().includes(filterResponsible.toLowerCase())
      );
    }
    
    // Filtrar por data
    if (filterDateRange !== 'all' && filterDateRange !== 'custom') {
      const today = new Date();
      let startDate = new Date();
      
      switch (filterDateRange) {
        case 'week':
          startDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(today.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(today.getMonth() - 3);
          break;
        default:
          break;
      }
      
      filteredSections = filteredSections.filter(section => {
        const deadlineDate = new Date(section.deadline);
        return deadlineDate >= startDate && deadlineDate <= today;
      });
    } else if (filterDateRange === 'custom' && customDateStart && customDateEnd) {
      const startDate = new Date(customDateStart);
      const endDate = new Date(customDateEnd);
      
      filteredSections = filteredSections.filter(section => {
        const deadlineDate = new Date(section.deadline);
        return deadlineDate >= startDate && deadlineDate <= endDate;
      });
    }
    
    return filteredSections;
  };

  // Obter dados filtrados
  const filteredSections = applyFilters();

  // Calcular métricas para relatórios
  const getSummaryData = () => {
    const totalSections = filteredSections.length;
    const completedSections = filteredSections.filter(section => section.progress === 100).length;
    const totalItems = filteredSections.reduce((total, section) => total + (section.items?.length || 0), 0);
    const completedItems = filteredSections.reduce((total, section) => {
      return total + (section.items?.filter(item => item.status === appData.STATUS.CONCLUIDO).length || 0);
    }, 0);
    const inProgressItems = filteredSections.reduce((total, section) => {
      return total + (section.items?.filter(item => item.status === appData.STATUS.EM_ANDAMENTO).length || 0);
    }, 0);
    const pendingItems = filteredSections.reduce((total, section) => {
      return total + (section.items?.filter(item => item.status === appData.STATUS.PENDENTE).length || 0);
    }, 0);
    const averageScore = appData.calculateAverageScore(filteredSections);
    const completionPercentage = appData.calculateCompletionPercentage(filteredSections);
    
    return {
      totalSections,
      completedSections,
      totalItems,
      completedItems,
      inProgressItems,
      pendingItems,
      averageScore,
      completionPercentage
    };
  };

  // Obter dados para o gráfico de status
  const getStatusChartData = () => {
    return appData.getStatusCounts(filteredSections);
  };

  // Obter dados para o gráfico por responsável
  const getResponsibleChartData = () => {
    const responsibleStats = {};
    
    filteredSections.forEach(section => {
      const responsible = section.responsible;
      if (!responsibleStats[responsible]) {
        responsibleStats[responsible] = {
          responsible,
          total: 0,
          completed: 0,
          progress: 0
        };
      }
      
      responsibleStats[responsible].total += section.items?.length || 0;
      section.items?.forEach(item => {
        if (item.status === appData.STATUS.CONCLUIDO) {
          responsibleStats[responsible].completed += 1;
        }
      });
    });
    
    // Calcular porcentagem de conclusão
    Object.keys(responsibleStats).forEach(key => {
      const stat = responsibleStats[key];
      stat.progress = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
    });
    
    return Object.values(responsibleStats);
  };

  // Obter dados para o gráfico radar de categorias
  const getRadarChartData = () => {
    const categoryData = [];
    
    // Agrupar seções em categorias gerais
    const sectionGroups = {
      'Cerimônia': ['Recepção à autoridade inspecionante', 'Hasteamento do Pavilhão Nacional'],
      'Documentação': ['Documentação Operacional', 'Área Operacional'],
      'Operacional': ['Teste Operacional Diário (TOD)', 'Procedimento no Acionamento do Socorro', 'Instalações da SsCO', 'Viaturas Operacionais', 'Recursos Hídricos'],
      'Logística': ['Logística de Materiais', 'Logística de Frota', 'Logística de Bens Imóveis', 'Logística da Unidade de Alimentação e Nutrição'],
      'Outros': ['Estrutura Geral da SST']
    };
    
    // Calcular progresso para cada categoria
    Object.entries(sectionGroups).forEach(([category, titles]) => {
      const categorySections = filteredSections.filter(section => 
        titles.some(title => section.title.includes(title))
      );
      
      const totalItems = categorySections.reduce((total, section) => 
        total + (section.items?.length || 0), 0
      );
      
      const completedItems = categorySections.reduce((total, section) => 
        total + (section.items?.filter(item => item.status === appData.STATUS.CONCLUIDO).length || 0), 0
      );
      
      const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
      
      categoryData.push({
        category,
        progress
      });
    });
    
    return categoryData;
  };

  // Exportar relatório como PDF
  const exportToPDF = async () => {
    if (!reportRef.current) return;
    
    setExportLoading(true);
    
    try {
      const reportTitle = getReportTitle();
      const doc = new jsPDF('portrait', 'mm', 'a4');
      
      // Adicionar cabeçalho
      doc.setFontSize(16);
      doc.setTextColor(180, 28, 28); // Red color
      doc.text(reportTitle, 105, 15, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100); // Gray color
      doc.text(`${appData.appConfig.appName} - ${appData.appConfig.organizationName}`, 105, 22, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} por ${user?.nome || 'Usuário'}`, 105, 27, { align: 'center' });
      
      // Adicionar linha separadora
      doc.setDrawColor(180, 28, 28);
      doc.setLineWidth(0.5);
      doc.line(15, 30, 195, 30);
      
      // Capturar conteúdo do relatório
      const canvas = await html2canvas(reportRef.current, { 
        scale: 2,
        useCORS: true,
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      
      // Calcular proporção para manter aspecto da imagem
      const imgWidth = 180;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Adicionar imagem do relatório
      doc.addImage(imgData, 'PNG', 15, 35, imgWidth, imgHeight);
      
      // Adicionar sumário ao final
      const summaryData = getSummaryData();
      doc.addPage();
      
      doc.setFontSize(14);
      doc.setTextColor(180, 28, 28);
      doc.text('Sumário dos Dados', 105, 15, { align: 'center' });
      
      doc.autoTable({
        startY: 25,
        head: [['Métrica', 'Valor']],
        body: [
          ['Nota Média', `${summaryData.averageScore}/10`],
          ['Progresso Geral', `${summaryData.completionPercentage}%`],
          ['Total de Seções', summaryData.totalSections],
          ['Seções Concluídas', summaryData.completedSections],
          ['Total de Itens', summaryData.totalItems],
          ['Itens Concluídos', summaryData.completedItems],
          ['Itens Em Andamento', summaryData.inProgressItems],
          ['Itens Pendentes', summaryData.pendingItems],
          ['Dias Até a Inspeção', appData.getDaysRemaining(appData.appConfig.inspectionDate)]
        ],
        theme: 'grid',
        headStyles: { fillColor: [180, 28, 28], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });
      
      // Adicionar rodapé
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(`Página ${i} de ${pageCount}`, 195, 285, { align: 'right' });
        doc.text(`${appData.appConfig.appName} v${appData.appConfig.appVersion}`, 15, 285);
      }
      
      // Salvar o PDF
      doc.save(`Relatorio_Inspecao_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      alert('Erro ao exportar o relatório. Tente novamente.');
    } finally {
      setExportLoading(false);
    }
  };

  // Obter título do relatório ativo
  const getReportTitle = () => {
    switch (activeReport) {
      case 'summary':
        return 'Relatório Resumido de Inspeção';
      case 'sections':
        return 'Progresso por Seção';
      case 'status':
        return 'Distribuição por Status';
      case 'responsible':
        return 'Desempenho por Responsável';
      case 'progress':
        return 'Evolução do Progresso';
      case 'categories':
        return 'Radar de Categorias';
      default:
        return 'Relatório de Inspeção';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
        <span className="ml-2">Carregando relatórios...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{getReportTitle()}</h1>
        
        <div className="flex space-x-2">
          <button
            onClick={exportToPDF}
            disabled={exportLoading}
            className={`bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded flex items-center ${exportLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {exportLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exportando...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar PDF
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="col-span-3">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-wrap space-x-2 mb-4">
              <button
                onClick={() => setActiveReport('summary')}
                className={`px-3 py-1 rounded text-sm ${activeReport === 'summary' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Resumo
              </button>
              <button
                onClick={() => setActiveReport('sections')}
                className={`px-3 py-1 rounded text-sm ${activeReport === 'sections' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Seções
              </button>
              <button
                onClick={() => setActiveReport('status')}
                className={`px-3 py-1 rounded text-sm ${activeReport === 'status' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Status
              </button>
              <button
                onClick={() => setActiveReport('responsible')}
                className={`px-3 py-1 rounded text-sm ${activeReport === 'responsible' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Responsáveis
              </button>
              <button
                onClick={() => setActiveReport('progress')}
                className={`px-3 py-1 rounded text-sm ${activeReport === 'progress' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Evolução
              </button>
              <button
                onClick={() => setActiveReport('categories')}
                className={`px-3 py-1 rounded text-sm ${activeReport === 'categories' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Categorias
              </button>
            </div>
            
            <div ref={reportRef}>
              {/* Relatório de Resumo */}
              {activeReport === 'summary' && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <h3 className="text-red-800 text-sm font-medium mb-2">Nota Média</h3>
                      <div className="flex items-baseline">
                        <p className="text-3xl font-bold text-red-800">{getSummaryData().averageScore}</p>
                        <p className="text-red-600 ml-1">/10</p>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <h3 className="text-green-800 text-sm font-medium mb-2">Progresso Geral</h3>
                      <div className="flex items-baseline">
                        <p className="text-3xl font-bold text-green-800">{getSummaryData().completionPercentage}%</p>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h3 className="text-blue-800 text-sm font-medium mb-2">Dias Restantes</h3>
                      <div className="flex items-baseline">
                        <p className="text-3xl font-bold text-blue-800">{appData.getDaysRemaining(appData.appConfig.inspectionDate)}</p>
                        <p className="text-blue-600 ml-1">dias</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-lg border p-4">
                      <h3 className="text-gray-800 text-sm font-medium mb-2">Seções</h3>
                      <div className="flex items-center">
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                          <span className="text-xl font-medium text-blue-800">{Math.round((getSummaryData().completedSections / getSummaryData().totalSections) * 100)}%</span>
                        </div>
                        <div>
                          <p className="text-gray-500">Concluídas: <span className="font-medium text-gray-800">{getSummaryData().completedSections}</span></p>
                          <p className="text-gray-500">Total: <span className="font-medium text-gray-800">{getSummaryData().totalSections}</span></p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg border p-4">
                      <h3 className="text-gray-800 text-sm font-medium mb-2">Itens de Inspeção</h3>
                      <div className="flex items-center">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mr-4">
                          <span className="text-xl font-medium text-green-800">{Math.round((getSummaryData().completedItems / getSummaryData().totalItems) * 100)}%</span>
                        </div>
                        <div>
                          <p className="text-gray-500">Concluídos: <span className="font-medium text-gray-800">{getSummaryData().completedItems}</span></p>
                          <p className="text-gray-500">Em Andamento: <span className="font-medium text-gray-800">{getSummaryData().inProgressItems}</span></p>
                          <p className="text-gray-500">Pendentes: <span className="font-medium text-gray-800">{getSummaryData().pendingItems}</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
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
                      {filteredSections.map((section) => {
                        // Calcular a nota média da seção
                        let totalScore = 0;
                        let itemCount = 0;
                        
                        section.items?.forEach(item => {
                          if (item.status !== appData.STATUS.NAO_APLICAVEL && !isNaN(item.score)) {
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
                                section.status === appData.STATUS.PENDENTE ? 'bg-orange-100 text-orange-800' : 
                                section.status === appData.STATUS.EM_ANDAMENTO ? 'bg-yellow-100 text-yellow-800' : 
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
              )}
              
              {/* Gráfico por Seção */}
              {activeReport === 'sections' && (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={filteredSections.map(section => ({
                        name: section.title.length > 20 ? section.title.substring(0, 20) + '...' : section.title,
                        progresso: section.progress
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 150 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={150} />
                      <YAxis label={{ value: 'Progresso (%)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Progresso']} />
                      <Bar dataKey="progresso" name="Progresso (%)" fill="#8884d8">
                        {filteredSections.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={
                            entry.progress < 30 ? '#EF4444' :  // red
                            entry.progress < 70 ? '#F59E0B' :  // amber
                            '#10B981'  // emerald
                          } />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              
              {/* Gráfico de Status */}
              {activeReport === 'status' && (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getStatusChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getStatusChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={appData.STATUS_COLORS[entry.name]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              
              {/* Gráfico por Responsável */}
              {activeReport === 'responsible' && (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getResponsibleChartData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="responsible" />
                      <YAxis yAxisId="left" orientation="left" label={{ value: 'Progresso (%)', angle: -90, position: 'insideLeft' }} />
                      <YAxis yAxisId="right" orientation="right" label={{ value: 'Quantidade', angle: 90, position: 'insideRight' }} />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="progress" name="Progresso (%)" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="completed" name="Itens Concluídos" fill="#82ca9d" />
                      <Bar yAxisId="right" dataKey="total" name="Total de Itens" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              
              {/* Gráfico de Progresso */}
              {activeReport === 'progress' && (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={progressHistory}
                      margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} label={{ value: 'Progresso (%)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Progresso']} />
                      <Legend />
                      <Line type="monotone" dataKey="porcentagem" name="Progresso (%)" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              
              {/* Gráfico Radar de Categorias */}
              {activeReport === 'categories' && (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getRadarChartData()}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="category" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="Progresso (%)" dataKey="progress" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Legend />
                      <Tooltip formatter={(value) => [`${value}%`, 'Progresso']} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-medium mb-4">Filtros</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Responsável
                </label>
                <select 
                  value={filterResponsible}
                  onChange={(e) => setFilterResponsible(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
                >
                  <option value="all">Todos</option>
                  <option value="Ten">Tenentes</option>
                  <option value="Cap">Capitães</option>
                  <option value="Sgt">Sargentos</option>
                  <option value="Costa">Ten. Costa</option>
                  <option value="Silva">Ten. Silva</option>
                  <option value="Oliveira">Sgt. Oliveira</option>
                  <option value="Pereira">Sgt. Pereira</option>
                  <option value="Souza">Cap. Souza</option>
                  <option value="Rodrigues">Ten. Rodrigues</option>
                  <option value="Santos">Sgt. Santos</option>
                  <option value="Mendes">Cap. Mendes</option>
                  <option value="Almeida">Ten. Almeida</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Período
                </label>
                <select 
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
                >
                  <option value="all">Todos</option>
                  <option value="week">Última semana</option>
                  <option value="month">Último mês</option>
                  <option value="quarter">Último trimestre</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>
              
              {filterDateRange === 'custom' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Inicial
                    </label>
                    <input 
                      type="date" 
                      value={customDateStart}
                      onChange={(e) => setCustomDateStart(e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Final
                    </label>
                    <input 
                      type="date" 
                      value={customDateEnd}
                      onChange={(e) => setCustomDateEnd(e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                </div>
              )}
              
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Resumo</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Nota Média:</span>
                    <span className="text-sm font-medium">{getSummaryData().averageScore}/10</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Progresso:</span>
                    <span className="text-sm font-medium">{getSummaryData().completionPercentage}%</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Itens Concluídos:</span>
                    <span className="text-sm font-medium">{getSummaryData().completedItems}/{getSummaryData().totalItems}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Dias Restantes:</span>
                    <span className="text-sm font-medium">{appData.getDaysRemaining(appData.appConfig.inspectionDate)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;