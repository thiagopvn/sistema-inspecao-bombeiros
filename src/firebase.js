// firebase.js - Configuração e inicialização do Firebase para o Sistema de Gestão de Inspeção

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, 
         query, where, orderBy, limit, Timestamp, onSnapshot } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
         signOut, sendPasswordResetEmail, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Configuração do Firebase - substitua com suas credenciais reais
// Estas informações devem ser armazenadas em variáveis de ambiente para segurança
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "sua_api_key",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "seu_projeto.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "seu_projeto_id",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "seu_projeto.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "seu_messaging_sender_id",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "seu_app_id",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "seu_measurement_id"
};

// Inicialização do Firebase
const app = initializeApp(firebaseConfig);

// Inicialização dos serviços
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// Definir região para Cloud Functions se necessário
// connectFunctionsEmulator(functions, "localhost", 5001);

// Criação de Timestamp
const serverTimestamp = Timestamp.now;

/**
 * Serviço de Autenticação
 */
const authService = {
  // Login com email e senha
  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user, error: null };
    } catch (error) {
      console.error("Erro no login:", error);
      return { user: null, error: error.message };
    }
  },

  // Registrar novo usuário
  register: async (email, password, userData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Atualizar perfil do usuário
      if (userData?.displayName) {
        await updateProfile(userCredential.user, {
          displayName: userData.displayName
        });
      }
      
      // Salvar dados adicionais no Firestore
      if (userData) {
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email,
          nome: userData.nome || '',
          patente: userData.patente || '',
          perfil: userData.perfil || 'Usuário',
          createdAt: Timestamp.now(),
          ...userData
        });
      }
      
      return { user: userCredential.user, error: null };
    } catch (error) {
      console.error("Erro no registro:", error);
      return { user: null, error: error.message };
    }
  },

  // Logout
  logout: async () => {
    try {
      await signOut(auth);
      return { success: true, error: null };
    } catch (error) {
      console.error("Erro no logout:", error);
      return { success: false, error: error.message };
    }
  },

  // Recuperação de senha
  resetPassword: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, error: null };
    } catch (error) {
      console.error("Erro na recuperação de senha:", error);
      return { success: false, error: error.message };
    }
  },

  // Obter usuário atual
  getCurrentUser: () => {
    return auth.currentUser;
  },

  // Observer para mudanças no estado de autenticação
  onAuthStateChange: (callback) => {
    return onAuthStateChanged(auth, callback);
  },

  // Obter dados adicionais do usuário do Firestore
  getUserData: async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        return { data: userDoc.data(), error: null };
      } else {
        return { data: null, error: "Usuário não encontrado" };
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      return { data: null, error: error.message };
    }
  },

  // Atualizar dados do usuário
  updateUserData: async (userId, userData) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        ...userData,
        updatedAt: Timestamp.now()
      });
      return { success: true, error: null };
    } catch (error) {
      console.error("Erro ao atualizar dados do usuário:", error);
      return { success: false, error: error.message };
    }
  }
};

/**
 * Serviço do Firestore para Seções
 */
const sectionsService = {
  // Obter todas as seções
  getAllSections: async () => {
    try {
      const sectionsCollection = collection(db, 'sections');
      const sectionsSnapshot = await getDocs(sectionsCollection);
      
      return {
        data: sectionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })),
        error: null
      };
    } catch (error) {
      console.error("Erro ao buscar seções:", error);
      return { data: [], error: error.message };
    }
  },

  // Obter uma seção específica
  getSection: async (sectionId) => {
    try {
      const sectionDoc = await getDoc(doc(db, "sections", sectionId));
      
      if (sectionDoc.exists()) {
        return { 
          data: { id: sectionDoc.id, ...sectionDoc.data() }, 
          error: null 
        };
      } else {
        return { data: null, error: "Seção não encontrada" };
      }
    } catch (error) {
      console.error("Erro ao buscar seção:", error);
      return { data: null, error: error.message };
    }
  },

  // Atualizar uma seção
  updateSection: async (sectionId, sectionData) => {
    try {
      await updateDoc(doc(db, "sections", sectionId), {
        ...sectionData,
        lastUpdated: Timestamp.now()
      });
      
      return { success: true, error: null };
    } catch (error) {
      console.error("Erro ao atualizar seção:", error);
      return { success: false, error: error.message };
    }
  },

  // Atualizar status de um item
  updateItemStatus: async (sectionId, itemId, newStatus, notes = "", user = null) => {
    try {
      // Calcular nova pontuação
      const newScore = newStatus === 'Concluído' ? 10 : 
                      newStatus === 'Em Andamento' ? 5 : 
                      newStatus === 'Não Aplicável' ? 'NA' : 0;
      
      // Obter seção atual
      const sectionDoc = doc(db, "sections", sectionId);
      const sectionSnapshot = await getDoc(sectionDoc);
      
      if (!sectionSnapshot.exists()) {
        return { success: false, error: "Seção não encontrada" };
      }
      
      const sectionData = sectionSnapshot.data();
      const items = sectionData.items;
      
      // Guardar status original do item para comparação
      const originalItem = items.find(item => item.id === itemId);
      if (!originalItem) {
        return { success: false, error: "Item não encontrado" };
      }
      
      // Atualizar o item
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
      
      // Atualizar seção
      await updateDoc(sectionDoc, { 
        items: updatedItems,
        progress: progress,
        status: sectionStatus,
        lastUpdated: Timestamp.now(),
        lastUpdatedBy: user?.nome || 'Usuário'
      });
      
      // Registrar alteração no histórico se o status mudou
      if (originalItem.status !== newStatus) {
        await setDoc(doc(collection(db, "change_log")), {
          sectionId: sectionId,
          sectionTitle: sectionData.title,
          itemId: itemId,
          itemTitle: originalItem.title,
          oldStatus: originalItem.status,
          newStatus: newStatus,
          timestamp: Timestamp.now(),
          user: user?.nome || 'Usuário'
        });
        
        // Se o status atual for concluído e anteriormente não era, registrar progresso
        if (newStatus === 'Concluído' && originalItem.status !== 'Concluído') {
          // Obter todas as seções para recalcular progresso geral
          const sectionsSnapshot = await getDocs(collection(db, "sections"));
          const sectionsData = sectionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Substituir a seção modificada
          const updatedSectionsData = sectionsData.map(s => 
            s.id === sectionId ? {
              ...s,
              items: updatedItems,
              progress: progress,
              status: sectionStatus
            } : s
          );
          
          // Calcular progresso geral
          let totalItemsAll = 0;
          let completedItemsAll = 0;
          
          updatedSectionsData.forEach(section => {
            section.items?.forEach(item => {
              if (item.status !== 'Não Aplicável') {
                totalItemsAll++;
                if (item.status === 'Concluído') {
                  completedItemsAll++;
                }
              }
            });
          });
          
          const overallProgress = totalItemsAll ? Math.round((completedItemsAll / totalItemsAll) * 100) : 0;
          
          // Registrar progresso
          const today = new Date().toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit'
          });
          
          // Verificar se já existe progresso para hoje
          const progressQuery = query(
            collection(db, "progress_history"),
            where("date", "==", today)
          );
          
          const progressSnapshot = await getDocs(progressQuery);
          
          if (progressSnapshot.empty) {
            // Adicionar novo registro
            await setDoc(doc(collection(db, "progress_history")), {
              date: today,
              porcentagem: overallProgress,
              timestamp: Timestamp.now()
            });
          } else {
            // Atualizar registro existente
            const progressDoc = progressSnapshot.docs[0];
            await updateDoc(doc(db, "progress_history", progressDoc.id), {
              porcentagem: overallProgress,
              timestamp: Timestamp.now()
            });
          }
        }
      }
      
      return { 
        success: true, 
        data: {
          items: updatedItems,
          progress: progress,
          status: sectionStatus
        }, 
        error: null 
      };
    } catch (error) {
      console.error("Erro ao atualizar status do item:", error);
      return { success: false, error: error.message };
    }
  },

  // Observar mudanças em tempo real em uma seção
  onSectionChange: (sectionId, callback) => {
    const sectionRef = doc(db, "sections", sectionId);
    return onSnapshot(sectionRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        console.log("Seção não existe");
      }
    });
  },

  // Observar mudanças em tempo real em todas as seções
  onAllSectionsChange: (callback) => {
    const sectionsRef = collection(db, "sections");
    return onSnapshot(sectionsRef, (snapshot) => {
      const sections = [];
      snapshot.forEach((doc) => {
        sections.push({ id: doc.id, ...doc.data() });
      });
      callback(sections);
    });
  }
};

/**
 * Serviço do Firestore para Tarefas
 */
const tasksService = {
  // Obter todas as tarefas
  getAllTasks: async () => {
    try {
      const tasksCollection = collection(db, 'tasks');
      const tasksQuery = query(tasksCollection, orderBy('dueDate', 'asc'));
      const tasksSnapshot = await getDocs(tasksQuery);
      
      return {
        data: tasksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          dueDate: doc.data().dueDate?.toDate?.() ? 
                   doc.data().dueDate.toDate().toISOString().split('T')[0] : 
                   doc.data().dueDate
        })),
        error: null
      };
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
      return { data: [], error: error.message };
    }
  },

  // Obter tarefas pendentes
  getPendingTasks: async () => {
    try {
      const tasksCollection = collection(db, 'tasks');
      const tasksQuery = query(
        tasksCollection,
        where('status', '!=', 'Concluído'),
        orderBy('status'),
        orderBy('dueDate', 'asc')
      );
      
      const tasksSnapshot = await getDocs(tasksQuery);
      
      return {
        data: tasksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          dueDate: doc.data().dueDate?.toDate?.() ? 
                   doc.data().dueDate.toDate().toISOString().split('T')[0] : 
                   doc.data().dueDate
        })),
        error: null
      };
    } catch (error) {
      console.error("Erro ao buscar tarefas pendentes:", error);
      return { data: [], error: error.message };
    }
  },

  // Obter tarefas de alta prioridade
  getHighPriorityTasks: async () => {
    try {
      const tasksCollection = collection(db, 'tasks');
      const tasksQuery = query(
        tasksCollection,
        where('priority', '==', 'Alta'),
        where('status', '!=', 'Concluído'),
        orderBy('status'),
        orderBy('dueDate', 'asc')
      );
      
      const tasksSnapshot = await getDocs(tasksQuery);
      
      return {
        data: tasksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          dueDate: doc.data().dueDate?.toDate?.() ? 
                   doc.data().dueDate.toDate().toISOString().split('T')[0] : 
                   doc.data().dueDate
        })),
        error: null
      };
    } catch (error) {
      console.error("Erro ao buscar tarefas de alta prioridade:", error);
      return { data: [], error: error.message };
    }
  },

  // Adicionar nova tarefa
  addTask: async (taskData, user = null) => {
    try {
      // Verificar se a data é um objeto Date ou uma string
      let dueDate = taskData.dueDate;
      if (typeof dueDate === 'string' && dueDate) {
        dueDate = Timestamp.fromDate(new Date(dueDate));
      }
      
      // Preparar dados da tarefa
      const task = {
        ...taskData,
        dueDate: dueDate,
        createdAt: Timestamp.now(),
        createdBy: user?.nome || 'Usuário',
        lastUpdated: Timestamp.now(),
        lastUpdatedBy: user?.nome || 'Usuário'
      };
      
      // Adicionar ao Firestore
      const docRef = await setDoc(doc(collection(db, "tasks")), task);
      
      return { 
        success: true, 
        id: docRef.id,
        error: null 
      };
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error);
      return { success: false, error: error.message };
    }
  },

  // Atualizar tarefa
  updateTask: async (taskId, taskData, user = null) => {
    try {
      // Verificar se a data é um objeto Date ou uma string
      let dueDate = taskData.dueDate;
      if (typeof dueDate === 'string' && dueDate) {
        dueDate = Timestamp.fromDate(new Date(dueDate));
      }
      
      // Preparar dados de atualização
      const updates = {
        ...taskData,
        dueDate: dueDate,
        lastUpdated: Timestamp.now(),
        lastUpdatedBy: user?.nome || 'Usuário'
      };
      
      // Atualizar no Firestore
      await updateDoc(doc(db, "tasks", taskId), updates);
      
      return { success: true, error: null };
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
      return { success: false, error: error.message };
    }
  },

  // Excluir tarefa
  deleteTask: async (taskId) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
      return { success: true, error: null };
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
      return { success: false, error: error.message };
    }
  },

  // Observar mudanças em tempo real nas tarefas
  onTasksChange: (callback) => {
    const tasksRef = collection(db, "tasks");
    return onSnapshot(tasksRef, (snapshot) => {
      const tasks = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push({
          id: doc.id,
          ...data,
          dueDate: data.dueDate?.toDate?.() ? 
                   data.dueDate.toDate().toISOString().split('T')[0] : 
                   data.dueDate
        });
      });
      callback(tasks);
    });
  }
};

/**
 * Serviço de Storage para upload de evidências
 */
const storageService = {
  // Upload de arquivo
  uploadFile: async (file, path, user = null) => {
    try {
      if (!file) {
        return { success: false, error: "Arquivo não fornecido" };
      }
      
      // Gerar caminho único
      const filePath = path ? `${path}/${Date.now()}_${file.name}` : `uploads/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, filePath);
      
      // Upload
      await uploadBytes(storageRef, file);
      
      // Obter URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Registrar upload no Firestore (opcional)
      await setDoc(doc(collection(db, "uploads")), {
        fileName: file.name,
        filePath: filePath,
        fileURL: downloadURL,
        fileType: file.type,
        fileSize: file.size,
        uploadedAt: Timestamp.now(),
        uploadedBy: user?.nome || 'Usuário'
      });
      
      return { 
        success: true, 
        url: downloadURL,
        path: filePath,
        error: null 
      };
    } catch (error) {
      console.error("Erro ao fazer upload do arquivo:", error);
      return { success: false, error: error.message };
    }
  },

  // Upload de evidência para um item
  uploadEvidence: async (file, sectionId, itemId, user = null) => {
    try {
      if (!file || !sectionId || !itemId) {
        return { success: false, error: "Parâmetros incompletos" };
      }
      
      // Gerar caminho para evidência
      const filePath = `evidences/${sectionId}/${itemId}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, filePath);
      
      // Upload
      await uploadBytes(storageRef, file);
      
      // Obter URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Atualizar item na seção
      const sectionDoc = doc(db, "sections", sectionId);
      const sectionData = (await getDoc(sectionDoc)).data();
      
      if (!sectionData) {
        return { success: false, error: "Seção não encontrada" };
      }
      
      const updatedItems = sectionData.items.map(item => {
        if (item.id === itemId) {
          const evidences = item.evidences || [];
          return {
            ...item,
            evidences: [...evidences, {
              url: downloadURL,
              path: filePath,
              name: file.name,
              type: file.type,
              size: file.size,
              uploadedAt: Timestamp.now(),
              uploadedBy: user?.nome || 'Usuário'
            }]
          };
        }
        return item;
      });
      
      await updateDoc(sectionDoc, {
        items: updatedItems,
        lastUpdated: Timestamp.now(),
        lastUpdatedBy: user?.nome || 'Usuário'
      });
      
      return { 
        success: true, 
        url: downloadURL,
        path: filePath,
        error: null 
      };
    } catch (error) {
      console.error("Erro ao fazer upload da evidência:", error);
      return { success: false, error: error.message };
    }
  },

  // Excluir arquivo
  deleteFile: async (path) => {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      return { success: true, error: null };
    } catch (error) {
      console.error("Erro ao excluir arquivo:", error);
      return { success: false, error: error.message };
    }
  },

  // Listar arquivos em um diretório
  listFiles: async (path) => {
    try {
      const storageRef = ref(storage, path);
      const filesList = await listAll(storageRef);
      
      const filesData = await Promise.all(
        filesList.items.map(async (item) => {
          const url = await getDownloadURL(item);
          return {
            name: item.name,
            path: item.fullPath,
            url: url
          };
        })
      );
      
      return { 
        success: true, 
        files: filesData,
        error: null 
      };
    } catch (error) {
      console.error("Erro ao listar arquivos:", error);
      return { success: false, files: [], error: error.message };
    }
  }
};

/**
 * Serviço para Relatórios e Estatísticas
 */
const reportsService = {
  // Obter histórico de progresso
  getProgressHistory: async () => {
    try {
      const progressCollection = collection(db, 'progress_history');
      const progressQuery = query(progressCollection, orderBy('timestamp', 'asc'));
      const progressSnapshot = await getDocs(progressQuery);
      
      return {
        data: progressSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date || doc.data().timestamp?.toDate().toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit'
          })
        })),
        error: null
      };
    } catch (error) {
      console.error("Erro ao buscar histórico de progresso:", error);
      return { data: [], error: error.message };
    }
  },

  // Obter histórico de alterações
  getChangeLog: async (limit = 50) => {
    try {
      const changeLogCollection = collection(db, 'change_log');
      const changeLogQuery = query(
        changeLogCollection, 
        orderBy('timestamp', 'desc'),
        limit(limit)
      );
      
      const changeLogSnapshot = await getDocs(changeLogQuery);
      
      return {
        data: changeLogSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() ? 
                     doc.data().timestamp.toDate().toLocaleString('pt-BR') : 
                     doc.data().timestamp
        })),
        error: null
      };
    } catch (error) {
      console.error("Erro ao buscar histórico de alterações:", error);
      return { data: [], error: error.message };
    }
  },

  // Obter resumo de status
  getStatusSummary: async () => {
    try {
      const sectionsCollection = collection(db, 'sections');
      const sectionsSnapshot = await getDocs(sectionsCollection);
      const sectionsData = sectionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Calcular estatísticas
      let totalItems = 0;
      let completedItems = 0;
      let inProgressItems = 0;
      let pendingItems = 0;
      let notApplicableItems = 0;
      
      sectionsData.forEach(section => {
        section.items?.forEach(item => {
          totalItems++;
          
          switch(item.status) {
            case 'Concluído':
              completedItems++;
              break;
            case 'Em Andamento':
              inProgressItems++;
              break;
            case 'Pendente':
              pendingItems++;
              break;
            case 'Não Aplicável':
              notApplicableItems++;
              break;
          }
        });
      });
      
      // Calcular progresso
      const relevantItems = totalItems - notApplicableItems;
      const progress = relevantItems > 0 ? Math.round((completedItems / relevantItems) * 100) : 0;
      
      return {
        data: {
          totalItems,
          completedItems,
          inProgressItems,
          pendingItems,
          notApplicableItems,
          progress
        },
        error: null
      };
    } catch (error) {
      console.error("Erro ao calcular resumo de status:", error);
      return { data: {}, error: error.message };
    }
  },

  // Obter estatísticas por responsável
  getStatsByResponsible: async () => {
    try {
      const sectionsCollection = collection(db, 'sections');
      const sectionsSnapshot = await getDocs(sectionsCollection);
      const sectionsData = sectionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Agrupar por responsável
      const statsByResponsible = {};
      
      sectionsData.forEach(section => {
        const responsible = section.responsible;
        
        if (!responsible) return;
        
        if (!statsByResponsible[responsible]) {
          statsByResponsible[responsible] = {
            responsible,
            totalItems: 0,
            completedItems: 0,
            inProgressItems: 0,
            pendingItems: 0,
            notApplicableItems: 0,
            progress: 0
          };
        }
        
        section.items?.forEach(item => {
          statsByResponsible[responsible].totalItems++;
          
          switch(item.status) {
            case 'Concluído':
              statsByResponsible[responsible].completedItems++;
              break;
            case 'Em Andamento':
              statsByResponsible[responsible].inProgressItems++;
              break;
            case 'Pendente':
              statsByResponsible[responsible].pendingItems++;
              break;
            case 'Não Aplicável':
              statsByResponsible[responsible].notApplicableItems++;
              break;
          }
        });
        
        // Calcular progresso
        const relevantItems = statsByResponsible[responsible].totalItems - 
                              statsByResponsible[responsible].notApplicableItems;
                              
        statsByResponsible[responsible].progress = relevantItems > 0 ? 
          Math.round((statsByResponsible[responsible].completedItems / relevantItems) * 100) : 0;
      });
      
      return {
        data: Object.values(statsByResponsible),
        error: null
      };
    } catch (error) {
      console.error("Erro ao calcular estatísticas por responsável:", error);
      return { data: [], error: error.message };
    }
  }
};

// Exportar serviços e instâncias
export {
  app,
  db,
  auth,
  storage,
  functions,
  Timestamp,
  serverTimestamp,
  authService,
  sectionsService,
  tasksService,
  storageService,
  reportsService
};

// Exportação padrão
export default {
  app,
  db,
  auth,
  storage,
  authService,
  sectionsService,
  tasksService,
  storageService,
  reportsService
};