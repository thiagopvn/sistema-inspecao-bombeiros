// Sections.js - Componente para gerenciamento das seções de inspeção

import React, { useState, useEffect, useRef } from 'react';
import { collection, doc, getDoc, getDocs, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import appData from './data';

const Sections = ({ user }) => {
  // Estados
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Referências
  const fileInputRef = useRef(null);
  const db = window.db;
  const storage = window.storage;

  // Carregar dados
  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true);
        
        // Em um app real, isso seria uma chamada ao Firestore
        if (db) {
          const sectionsCollection = collection(db, 'sections');
          const sectionsSnapshot = await getDocs(sectionsCollection);
          const sectionsData = sectionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setSections(sectionsData);
        } else {
          // Usar dados de demonstração
          setSections(appData.initialSections);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar seções:", error);
        // Carregar dados de demonstração em caso de erro
        setSections(appData.initialSections);
        setLoading(false);
      }
    };

    fetchSections();
  }, [db]);

  // Selecionar uma seção
  const handleSelectSection = (section) => {
    setSelectedSection(section);
    setSelectedItem(null);
  };

  // Selecionar um item
  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setCurrentStatus(item.status || appData.STATUS.PENDENTE);
    setNotes(item.notes || '');
    setEvidenceFile(null);
  };

  // Atualizar um item
  const handleUpdateItem = async () => {
    if (!selectedItem || !selectedSection) return;
    
    setSaving(true);
    
    // Guarda o item original para comparação
    const originalItem = {...selectedItem};
    
    // Criar objeto com dados atualizados
    const updatedItem = {
      ...selectedItem,
      status: currentStatus,
      notes: notes,
      score: currentStatus === appData.STATUS.CONCLUIDO ? 10 : 
             currentStatus === appData.STATUS.EM_ANDAMENTO ? 5 : 
             currentStatus === appData.STATUS.NAO_APLICAVEL ? 'NA' : 0
    };
    
    try {
      // Atualizar estado local primeiro para feedback imediato
      const updatedSections = sections.map(section => {
        if (section.id === selectedSection.id) {
          const updatedItems = section.items.map(item => {
            if (item.id === selectedItem.id) {
              return updatedItem;
            }
            return item;
          });
          
          // Recalcular o progresso da seção
          const totalItems = updatedItems.filter(i => i.status !== appData.STATUS.NAO_APLICAVEL).length;
          const completedItems = updatedItems.filter(i => i.status === appData.STATUS.CONCLUIDO).length;
          const progress = totalItems ? Math.round((completedItems / totalItems) * 100) : 0;
          
          const updatedSection = {
            ...section,
            items: updatedItems,
            progress: progress,
            // Atualizar status da seção com base no progresso
            status: progress === 100 ? appData.STATUS.CONCLUIDO : 
                   progress > 0 ? appData.STATUS.EM_ANDAMENTO : 
                   appData.STATUS.PENDENTE
          };
          
          // Atualizar o objeto selectedSection para refletir as mudanças
          setSelectedSection(updatedSection);
          
          return updatedSection;
        }
        return section;
      });
      
      setSections(updatedSections);
      
      // Em um app real, atualizar o Firestore
      if (db) {
        const sectionDoc = doc(db, "sections", selectedSection.id);
        
        // Obter a seção atualizada
        const updatedSection = updatedSections.find(s => s.id === selectedSection.id);
        
        await updateDoc(sectionDoc, { 
          items: updatedSection.items,
          progress: updatedSection.progress,
          status: updatedSection.status,
          lastUpdated: Timestamp.now(),
          lastUpdatedBy: user?.nome || 'Usuário'
        });
        
        // Registrar alteração no histórico
        if (originalItem.status !== updatedItem.status) {
          const changeLogCollection = collection(db, "change_log");
          await addDoc(changeLogCollection, {
            sectionId: selectedSection.id,
            sectionTitle: selectedSection.title,
            itemId: selectedItem.id,
            itemTitle: selectedItem.title,
            oldStatus: originalItem.status,
            newStatus: updatedItem.status,
            timestamp: Timestamp.now(),
            user: user?.nome || 'Usuário'
          });
        }
      }
      
      // Se o estado atual for concluído e anteriormente não era, registrar progresso
      if (currentStatus === appData.STATUS.CONCLUIDO && originalItem.status !== appData.STATUS.CONCLUIDO) {
        const updatedCompletion = appData.calculateCompletionPercentage(updatedSections);
        
        // Verificar se há uma entrada de progresso para hoje
        const today = new Date().toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit'
        });
        
        // Em um app real, registrar progresso no Firestore
        if (db) {
          const progressCollection = collection(db, "progress_history");
          const todayQuery = query(
            progressCollection,
            where("date", "==", today)
          );
          const progressSnapshot = await getDocs(todayQuery);
          
          if (progressSnapshot.empty) {
            // Adicionar nova entrada de progresso
            await addDoc(progressCollection, {
              date: today,
              porcentagem: updatedCompletion,
              timestamp: Timestamp.now()
            });
          } else {
            // Atualizar entrada existente
            const progressDoc = progressSnapshot.docs[0];
            await updateDoc(doc(db, "progress_history", progressDoc.id), {
              porcentagem: updatedCompletion,
              timestamp: Timestamp.now()
            });
          }
        }
      }
      
      // Mostrar feedback de sucesso
      alert("Item atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      alert("Erro ao atualizar o item. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  // Carregar arquivo de evidência
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setEvidenceFile(e.target.files[0]);
    }
  };

  // Fazer upload de evidência
  const handleUploadEvidence = async () => {
    if (!evidenceFile || !selectedItem || !selectedSection) return;
    
    setUploadingEvidence(true);
    
    try {
      // Gerar nome único para o arquivo
      const fileName = `evidences/${selectedSection.id}/${selectedItem.id}/${Date.now()}_${evidenceFile.name}`;
      
      if (storage) {
        // Upload para o Firebase Storage
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, evidenceFile);
        const downloadURL = await getDownloadURL(storageRef);
        
        // Atualizar Firestore com a nova evidência
        const sectionDoc = doc(db, "sections", selectedSection.id);
        const sectionSnapshot = await getDoc(sectionDoc);
        
        if (sectionSnapshot.exists()) {
          const sectionData = sectionSnapshot.data();
          const items = sectionData.items;
          
          // Encontrar e atualizar o item
          const updatedItems = items.map(item => {
            if (item.id === selectedItem.id) {
              return {
                ...item,
                evidences: [...(item.evidences || []), {
                  url: downloadURL,
                  name: evidenceFile.name,
                  uploadedAt: Timestamp.now(),
                  uploadedBy: user?.nome || 'Usuário'
                }]
              };
            }
            return item;
          });
          
          // Atualizar documento
          await updateDoc(sectionDoc, { 
            items: updatedItems,
            lastUpdated: Timestamp.now(),
            lastUpdatedBy: user?.nome || 'Usuário'
          });
        }
      } else {
        // Para demonstração, simular upload
        console.log(`Simulando upload de ${fileName}`);
      }
      
      // Atualizar estado local
      const updatedSections = sections.map(section => {
        if (section.id === selectedSection.id) {
          const updatedItems = section.items.map(item => {
            if (item.id === selectedItem.id) {
              return {
                ...item,
                evidences: [...(item.evidences || []), evidenceFile.name]
              };
            }
            return item;
          });
          
          const updatedSection = {
            ...section,
            items: updatedItems
          };
          
          // Atualizar o objeto selectedSection para refletir as mudanças
          setSelectedSection(updatedSection);
          
          // Atualizar o objeto selectedItem para refletir as mudanças
          const updatedItem = updatedItems.find(i => i.id === selectedItem.id);
          setSelectedItem(updatedItem);
          
          return updatedSection;
        }
        return section;
      });
      
      setSections(updatedSections);
      
      // Limpar arquivo selecionado
      setEvidenceFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      alert("Evidência enviada com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar evidência:", error);
      alert("Erro ao enviar a evidência. Tente novamente.");
    } finally {
      setUploadingEvidence(false);
    }
  };

  // Filtrar seções pelo termo de busca e status
  const filteredSections = sections.filter(section => {
    const matchesSearch = searchTerm === '' || 
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      section.responsible.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || section.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Calcular estatísticas
  const totalSections = sections.length;
  const completedSections = sections.filter(section => section.status === appData.STATUS.CONCLUIDO).length;
  const inProgressSections = sections.filter(section => section.status === appData.STATUS.EM_ANDAMENTO).length;
  const pendingSections = sections.filter(section => section.status === appData.STATUS.PENDENTE).length;
  const averageProgress = sections.length ? Math.round(sections.reduce((acc, section) => acc + section.progress, 0) / sections.length) : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
        <span className="ml-2">Carregando seções...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Seções de Inspeção</h1>
      
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Total de Seções</p>
              <p className="text-2xl font-bold">{totalSections}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Concluídas</p>
              <p className="text-2xl font-bold">{completedSections}</p>
            </div>
            <div className="bg-green-100 rounded-full p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Em Andamento</p>
              <p className="text-2xl font-bold">{inProgressSections}</p>
            </div>
            <div className="bg-yellow-100 rounded-full p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Progresso Médio</p>
              <p className="text-2xl font-bold">{averageProgress}%</p>
            </div>
            <div className="bg-red-100 rounded-full p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                placeholder="Buscar por título ou responsável..."
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por Status
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
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
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
      </div>
      
      {/* Lista de seções e detalhes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lista de seções */}
        <div className="md:col-span-1 space-y-4">
          {filteredSections.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="mt-4 text-gray-500">Nenhuma seção encontrada com os filtros atuais.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
                className="mt-2 text-red-600 hover:text-red-800"
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            filteredSections.map((section) => (
              <div
                key={section.id}
                className={`bg-white rounded-lg shadow overflow-hidden cursor-pointer transition duration-150 hover:shadow-md ${
                  selectedSection?.id === section.id ? 'ring-2 ring-red-500' : ''
                }`}
                onClick={() => handleSelectSection(section)}
              >
                <div className="p-4 border-b">
                  <h3 className="font-medium">{section.title}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-sm text-gray-500">Progresso: {section.progress}%</div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      section.status === appData.STATUS.PENDENTE ? 'bg-orange-100 text-orange-800' : 
                      section.status === appData.STATUS.EM_ANDAMENTO ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {section.status}
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full bg-gray-200 rounded-full">
                    <div 
                      className={`h-full rounded-full ${
                        section.progress < 30 ? 'bg-red-500' : 
                        section.progress < 70 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${section.progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50">
                  <div className="flex justify-between text-sm">
                    <div>Responsável: {section.responsible}</div>
                    <div>Prazo: {section.deadline}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Detalhes da seção */}
        <div className="md:col-span-2">
          {selectedSection ? (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold">{selectedSection.title}</h2>
                    <div className="mt-1">
                      <span className="text-sm text-gray-500">Responsável: {selectedSection.responsible}</span>
                      <span className="mx-2 text-gray-300">|</span>
                      <span className="text-sm text-gray-500">Prazo: {selectedSection.deadline}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    selectedSection.status === appData.STATUS.PENDENTE ? 'bg-orange-100 text-orange-800' : 
                    selectedSection.status === appData.STATUS.EM_ANDAMENTO ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-green-100 text-green-800'
                  }`}>
                    {selectedSection.status}
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-sm text-gray-500 mb-1">Progresso: {selectedSection.progress}%</div>
                  <div className="h-2 w-full bg-gray-200 rounded-full">
                    <div 
                      className={`h-full rounded-full ${
                        selectedSection.progress < 30 ? 'bg-red-500' : 
                        selectedSection.progress < 70 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${selectedSection.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="font-medium mb-4">Itens de Inspeção</h3>
                <div className="grid grid-cols-1 gap-4">
                  {selectedSection.items?.map((item) => (
                    <div 
                      key={item.id} 
                      className={`p-4 border rounded cursor-pointer ${
                        selectedItem?.id === item.id ? 'border-red-500 bg-red-50' : 'hover:bg-gray-50'
                      }`}
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
                          item.status === appData.STATUS.PENDENTE ? 'bg-orange-100 text-orange-800' : 
                          item.status === appData.STATUS.EM_ANDAMENTO ? 'bg-yellow-100 text-yellow-800' : 
                          item.status === appData.STATUS.CONCLUIDO ? 'bg-green-100 text-green-800' :
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
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center h-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="mt-4 text-lg text-gray-500">Selecione uma seção para ver os detalhes</p>
            </div>
          )}
          
          {/* Painel de edição do item */}
          {selectedItem && (
            <div className="bg-gray-50 rounded-lg shadow mt-4 p-6">
              <h3 className="font-medium mb-4">Editar Item</h3>
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
                    <option value={appData.STATUS.PENDENTE}>Pendente</option>
                    <option value={appData.STATUS.EM_ANDAMENTO}>Em Andamento</option>
                    <option value={appData.STATUS.CONCLUIDO}>Concluído</option>
                    <option value={appData.STATUS.NAO_APLICAVEL}>Não Aplicável</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Anotações
                  </label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
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
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {selectedItem.evidences.map((evidence, index) => (
                          <div key={index} className="border rounded overflow-hidden flex flex-col">
                            <div className="h-24 bg-gray-200 flex items-center justify-center">
                              {/* Se for URL real do Firebase Storage, exibir imagem */}
                              {evidence.url ? (
                                <img 
                                  src={evidence.url} 
                                  alt={evidence.name || 'Evidência'}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              )}
                            </div>
                            <div className="p-2 text-xs truncate bg-gray-50">
                              {evidence.name || evidence}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500 mb-4">
                        Nenhuma evidência anexada
                      </div>
                    )}
                    
                    <div className="flex flex-col space-y-2">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                      />
                      
                      {evidenceFile && (
                        <button 
                          onClick={handleUploadEvidence}
                          disabled={uploadingEvidence}
                          className={`flex justify-center items-center text-sm text-white ${
                            uploadingEvidence ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'
                          } rounded px-3 py-1.5`}
                        >
                          {uploadingEvidence ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Enviando...
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              Enviar Evidência
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={handleUpdateItem}
                  disabled={saving}
                  className={`w-full ${saving ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'} text-white py-2 px-4 rounded flex justify-center items-center`}
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Salvando...
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sections;