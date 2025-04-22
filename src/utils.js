// utils.js - Utilidades e funções auxiliares para o sistema de gestão de inspeção

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Formatar data para exibição (DD/MM/YYYY)
export const formatDate = (date) => {
  if (!date) return '';
  
  // Se for um Timestamp do Firestore
  if (date && typeof date.toDate === 'function') {
    date = date.toDate();
  }
  
  // Se for uma string ISO
  if (typeof date === 'string') {
    // Verificar se é formato ISO ou já formatado
    if (date.includes('T') || date.includes('-')) {
      date = new Date(date);
    } else {
      return date; // Já está formatado
    }
  }
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

// Formatar data e hora para exibição (DD/MM/YYYY HH:MM)
export const formatDateTime = (date) => {
  if (!date) return '';
  
  // Se for um Timestamp do Firestore
  if (date && typeof date.toDate === 'function') {
    date = date.toDate();
  }
  
  // Se for uma string ISO
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Converter data para formato de entrada HTML (YYYY-MM-DD)
export const dateToInputFormat = (date) => {
  if (!date) return '';
  
  // Se for um Timestamp do Firestore
  if (date && typeof date.toDate === 'function') {
    date = date.toDate();
  }
  
  // Se for uma string em formato brasileiro
  if (typeof date === 'string' && date.includes('/')) {
    const parts = date.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }
  
  // Se for uma string ISO ou já formatado para input
  if (typeof date === 'string') {
    // Se já estiver no formato de input (YYYY-MM-DD)
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return date;
    }
    date = new Date(date);
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Calcular dias restantes entre hoje e uma data alvo
export const getDaysRemaining = (targetDate) => {
  if (!targetDate) return 0;
  
  // Se for um Timestamp do Firestore
  if (targetDate && typeof targetDate.toDate === 'function') {
    targetDate = targetDate.toDate();
  }
  
  // Se for uma string
  if (typeof targetDate === 'string') {
    // Se for formato brasileiro
    if (targetDate.includes('/')) {
      const parts = targetDate.split('/');
      if (parts.length === 3) {
        targetDate = new Date(parts[2], parts[1] - 1, parts[0]);
      } else {
        targetDate = new Date(targetDate);
      }
    } else {
      targetDate = new Date(targetDate);
    }
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const targetDay = new Date(targetDate);
  targetDay.setHours(0, 0, 0, 0);
  
  const diffTime = targetDay - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Verificar se uma data já passou
export const isDatePast = (date) => {
  if (!date) return false;
  
  // Se for um Timestamp do Firestore
  if (date && typeof date.toDate === 'function') {
    date = date.toDate();
  }
  
  // Se for uma string
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  
  return checkDate < today;
};

// Obter cores para status
export const getStatusColor = (status) => {
  const colors = {
    'Pendente': {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      border: 'border-orange-200',
      hex: '#FF8042'
    },
    'Em Andamento': {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
      hex: '#FFBB28'
    },
    'Concluído': {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
      hex: '#00C49F'
    },
    'Não Aplicável': {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-200',
      hex: '#A9A9A9'
    }
  };
  
  return colors[status] || colors['Pendente'];
};

// Obter cores para prioridade
export const getPriorityColor = (priority) => {
  const colors = {
    'Alta': {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
      hex: '#FF4842'
    },
    'Média': {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
      hex: '#FFBB28'
    },
    'Baixa': {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
      hex: '#4CAF50'
    }
  };
  
  return colors[priority] || colors['Média'];
};

// Calcular nota média para uma seção
export const calculateSectionAverage = (section) => {
  if (!section || !section.items || !section.items.length) return 0;
  
  let totalScore = 0;
  let itemCount = 0;
  
  section.items.forEach(item => {
    if (item.status !== 'Não Aplicável' && !isNaN(item.score)) {
      totalScore += Number(item.score);
      itemCount++;
    }
  });
  
  return itemCount ? (totalScore / itemCount).toFixed(1) : 0;
};

// Calcular nota média geral
export const calculateAverageScore = (sections) => {
  if (!sections || !sections.length) return 0;
  
  let totalScore = 0;
  let itemCount = 0;
  
  sections.forEach(section => {
    section.items?.forEach(item => {
      if (item.status !== 'Não Aplicável' && !isNaN(item.score)) {
        totalScore += Number(item.score);
        itemCount++;
      }
    });
  });
  
  return itemCount ? (totalScore / itemCount).toFixed(1) : 0;
};

// Calcular percentual de conclusão
export const calculateCompletionPercentage = (sections) => {
  if (!sections || !sections.length) return 0;
  
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

// Atualizar o status de um item
export const updateItemStatus = async (db, sectionId, itemId, newStatus, notes = "", user = null) => {
  try {
    // Validar entradas
    if (!db || !sectionId || !itemId) {
      throw new Error("Parâmetros inválidos para atualização de item");
    }
    
    // Calcular nova pontuação
    const newScore = newStatus === 'Concluído' ? 10 : 
                    newStatus === 'Em Andamento' ? 5 : 
                    newStatus === 'Não Aplicável' ? 'NA' : 0;
    
    // Obter documento atual
    const sectionDoc = doc(db, "sections", sectionId);
    const sectionSnapshot = await getDoc(sectionDoc);
    
    if (!sectionSnapshot.exists()) {
      throw new Error("Seção não encontrada");
    }
    
    const sectionData = sectionSnapshot.data();
    const items = sectionData.items;
    
    // Encontrar e atualizar o item
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          status: newStatus,
          score: newScore,
          notes: notes || item.notes,
          lastUpdated: Timestamp.now(),
          lastUpdatedBy: user?.nome || 'Usuário'
        };
      }
      return item;
    });
    
    // Recalcular o progresso da seção
    const totalItems = updatedItems.filter(i => i.status !== 'Não Aplicável').length;
    const completedItems = updatedItems.filter(i => i.status === 'Concluído').length;
    const progress = totalItems ? Math.round((completedItems / totalItems) * 100) : 0;
    
    // Atualizar status da seção com base no progresso
    const sectionStatus = progress === 100 ? 'Concluído' : 
                          progress > 0 ? 'Em Andamento' : 
                          'Pendente';
    
    // Atualizar documento
    await updateDoc(sectionDoc, { 
      items: updatedItems,
      progress: progress,
      status: sectionStatus,
      lastUpdated: Timestamp.now(),
      lastUpdatedBy: user?.nome || 'Usuário'
    });
    
    // Registrar alteração significativa no histórico
    const oldItem = items.find(i => i.id === itemId);
    if (oldItem && oldItem.status !== newStatus) {
      // Registrar alteração de status no histórico
      const changeLogCollection = collection(db, "change_log");
      await addDoc(changeLogCollection, {
        sectionId: sectionId,
        sectionTitle: sectionData.title,
        itemId: itemId,
        itemTitle: oldItem.title,
        oldStatus: oldItem.status,
        newStatus: newStatus,
        timestamp: Timestamp.now(),
        user: user?.nome || 'Usuário'
      });
      
      // Se o status atual for concluído e anteriormente não era, registrar progresso
      if (newStatus === 'Concluído' && oldItem.status !== 'Concluído') {
        // Obter todas as seções para recalcular progresso geral
        const sectionsCollection = collection(db, "sections");
        const sectionsSnapshot = await getDocs(sectionsCollection);
        const sectionsData = sectionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Calcular progresso geral atualizado
        let updatedSectionsData = [...sectionsData];
        // Atualizar a seção modificada nos dados
        updatedSectionsData = updatedSectionsData.map(s => 
          s.id === sectionId ? {
            ...s,
            items: updatedItems,
            progress: progress,
            status: sectionStatus
          } : s
        );
        
        const updatedCompletion = calculateCompletionPercentage(updatedSectionsData);
        
        // Verificar se já existe uma entrada de progresso para hoje
        const today = new Date().toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit'
        });
        
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
    
    return {
      success: true,
      items: updatedItems,
      progress: progress,
      status: sectionStatus
    };
  } catch (error) {
    console.error("Erro ao atualizar status do item:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Upload de evidência
export const uploadEvidence = async (storage, db, file, sectionId, itemId, user = null) => {
  try {
    if (!storage || !db || !file || !sectionId || !itemId) {
      throw new Error("Parâmetros inválidos para upload de evidência");
    }
    
    // Gerar nome único para o arquivo
    const fileName = `evidences/${sectionId}/${itemId}/${Date.now()}_${file.name}`;
    
    // Upload para o Firebase Storage
    const storageRef = ref(storage, fileName);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    // Atualizar Firestore com a nova evidência
    const sectionDoc = doc(db, "sections", sectionId);
    const sectionSnapshot = await getDoc(sectionDoc);
    
    if (!sectionSnapshot.exists()) {
      throw new Error("Seção não encontrada");
    }
    
    const sectionData = sectionSnapshot.data();
    const items = sectionData.items;
    
    // Encontrar e atualizar o item
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          evidences: [...(item.evidences || []), {
            url: downloadURL,
            name: file.name,
            type: file.type,
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
    
    return {
      success: true,
      url: downloadURL,
      fileName: file.name,
      updatedItems: updatedItems
    };
  } catch (error) {
    console.error("Erro ao enviar evidência:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Exportar relatório como PDF
export const exportReportToPDF = async (reportRef, title, sections, user = null) => {
  if (!reportRef) {
    throw new Error("Referência do relatório inválida");
  }
  
  try {
    const doc = new jsPDF('portrait', 'mm', 'a4');
    
    // Adicionar cabeçalho
    doc.setFontSize(16);
    doc.setTextColor(180, 28, 28); // Red color
    doc.text(title, 105, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100); // Gray color
    doc.text("Sistema de Gestão de Inspeção - CBMERJ", 105, 22, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Gerado em: ${formatDate(new Date())} por ${user?.nome || 'Usuário'}`, 105, 27, { align: 'center' });
    
    // Adicionar linha separadora
    doc.setDrawColor(180, 28, 28);
    doc.setLineWidth(0.5);
    doc.line(15, 30, 195, 30);
    
    // Capturar conteúdo do relatório
    const canvas = await html2canvas(reportRef, { 
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
    const completionPercentage = calculateCompletionPercentage(sections);
    const averageScore = calculateAverageScore(sections);
    
    doc.addPage();
    
    doc.setFontSize(14);
    doc.setTextColor(180, 28, 28);
    doc.text('Sumário dos Dados', 105, 15, { align: 'center' });
    
    const totalItems = sections.reduce((total, section) => 
      total + (section.items?.length || 0), 0
    );
    
    const completedItems = sections.reduce((total, section) => 
      total + (section.items?.filter(item => item.status === 'Concluído').length || 0), 0
    );
    
    const inProgressItems = sections.reduce((total, section) => 
      total + (section.items?.filter(item => item.status === 'Em Andamento').length || 0), 0
    );
    
    const pendingItems = sections.reduce((total, section) => 
      total + (section.items?.filter(item => item.status === 'Pendente').length || 0), 0
    );
    
    doc.autoTable({
      startY: 25,
      head: [['Métrica', 'Valor']],
      body: [
        ['Nota Média', `${averageScore}/10`],
        ['Progresso Geral', `${completionPercentage}%`],
        ['Total de Seções', sections.length],
        ['Seções Concluídas', sections.filter(s => s.status === 'Concluído').length],
        ['Total de Itens', totalItems],
        ['Itens Concluídos', completedItems],
        ['Itens Em Andamento', inProgressItems],
        ['Itens Pendentes', pendingItems],
        ['Data da Inspeção', '28/04/2025'],
        ['Dias Até a Inspeção', getDaysRemaining('2025-04-28')]
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
      doc.text('Sistema de Gestão de Inspeção v1.0.0', 15, 285);
    }
    
    // Salvar o PDF
    doc.save(`Relatorio_Inspecao_${new Date().toISOString().slice(0, 10)}.pdf`);
    
    return {
      success: true,
      filename: `Relatorio_Inspecao_${new Date().toISOString().slice(0, 10)}.pdf`
    };
  } catch (error) {
    console.error('Erro ao exportar relatório:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Validar entrada de texto
export const validateText = (text, minLength = 1, maxLength = 255) => {
  if (!text || typeof text !== 'string') return false;
  
  const trimmed = text.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
};

// Validar data
export const validateDate = (dateStr) => {
  if (!dateStr) return false;
  
  // Se for um objeto Date
  if (dateStr instanceof Date) {
    return !isNaN(dateStr.getTime());
  }
  
  // Se for uma string
  if (typeof dateStr === 'string') {
    // Diferentes formatos
    if (dateStr.includes('-')) {
      // Formato ISO (YYYY-MM-DD)
      const date = new Date(dateStr);
      return !isNaN(date.getTime());
    } else if (dateStr.includes('/')) {
      // Formato brasileiro (DD/MM/YYYY)
      const parts = dateStr.split('/');
      if (parts.length !== 3) return false;
      
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      
      const date = new Date(year, month, day);
      return date.getFullYear() === year &&
             date.getMonth() === month &&
             date.getDate() === day;
    }
  }
  
  return false;
};

// Validar email
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Truncar texto para exibição
export const truncateText = (text, maxLength = 50) => {
  if (!text || typeof text !== 'string') return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

// Obter abreviação para nome
export const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '';
  
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Gerar ID único
export const generateUniqueId = (prefix = '') => {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

// Tratamento de erros
export const handleError = (error, context = '') => {
  const timestamp = new Date().toISOString();
  const message = error?.message || 'Erro desconhecido';
  const stack = error?.stack || '';
  
  console.error(`[${timestamp}] Erro em ${context}: ${message}`);
  
  if (stack) {
    console.error(`Stack: ${stack}`);
  }
  
  // Em um app real, você poderia enviar o erro para um serviço como Firebase Crashlytics
  // firebase.crashlytics().recordError(error);
  
  return {
    timestamp,
    context,
    message,
    stack
  };
};

// Formatação de número por extenso
export const numberToWords = (num) => {
  if (isNaN(num)) return '';
  
  const units = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const teens = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const tens = ['', 'dez', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const hundreds = ['cem', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
    
  if (num === 0) return units[0];
  
  if (num < 0) return 'menos ' + numberToWords(Math.abs(num));
  
  if (num < 10) return units[num];
  
  if (num < 20) return teens[num - 10];
  
  if (num < 100) {
    const unit = num % 10;
    const ten = Math.floor(num / 10);
    return unit > 0 ? `${tens[ten]} e ${units[unit]}` : tens[ten];
  }
  
  if (num < 1000) {
    const rest = num % 100;
    const hundred = Math.floor(num / 100);
    
    if (num === 100) return hundreds[0];
    
    return rest > 0
      ? `${hundreds[hundred]} e ${numberToWords(rest)}`
      : hundreds[hundred];
  }
  
  if (num < 1000000) {
    const thousand = Math.floor(num / 1000);
    const rest = num % 1000;
    
    const thousandStr = thousand === 1 ? 'mil' : `${numberToWords(thousand)} mil`;
    
    return rest > 0
      ? `${thousandStr} ${rest < 100 ? 'e' : ''} ${numberToWords(rest)}`
      : thousandStr;
  }
  
  return num.toString();
};

// Exportação de funções utilitárias
export default {
  // Formatação de data e hora
  formatDate,
  formatDateTime,
  dateToInputFormat,
  getDaysRemaining,
  isDatePast,
  
  // Cores e estilos
  getStatusColor,
  getPriorityColor,
  
  // Cálculos
  calculateSectionAverage,
  calculateAverageScore,
  calculateCompletionPercentage,
  
  // Operações com Firebase
  updateItemStatus,
  uploadEvidence,
  
  // Exportação
  exportReportToPDF,
  
  // Validação
  validateText,
  validateDate,
  validateEmail,
  
  // Formatação de texto
  truncateText,
  getInitials,
  numberToWords,
  
  // Utilidades gerais
  generateUniqueId,
  handleError
};