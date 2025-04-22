// index.js - Ponto de entrada principal da aplicação

import React from 'react';
import ReactDOM from 'react-dom/client';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import App from './App';
import data from './data';

// Importar estilos
import './tailwind.css';

// Inicialização do Firebase com as configurações importadas de data.js
const app = initializeApp(data.firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Disponibiliza objetos importantes globalmente para acesso em componentes
window.db = db;
window.auth = auth;
window.storage = storage;
window.appData = data;

// Configuração de desenvolvimento/produção
const isDevelopment = process.env.NODE_ENV === 'development';

// Log de versão e configuração
console.log(`Sistema de Gestão de Inspeção v${data.appConfig.appVersion}`);
console.log(`Ambiente: ${isDevelopment ? 'Desenvolvimento' : 'Produção'}`);

// Elemento onde renderizaremos a aplicação React
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

// Inicializa o loader para indicar carregamento
const showLoader = () => {
  const loader = document.getElementById('loading');
  if (loader) {
    loader.style.opacity = 1;
    loader.style.visibility = 'visible';
  }
};

// Esconde o loader quando o aplicativo estiver pronto
const hideLoader = () => {
  const loader = document.getElementById('loading');
  if (loader) {
    loader.style.opacity = 0;
    loader.style.visibility = 'hidden';
  }
};

// Verificação de estado de autenticação do usuário
let userChecked = false;
onAuthStateChanged(auth, (user) => {
  // Se esta é a primeira verificação, esconde o loader
  if (!userChecked) {
    hideLoader();
    userChecked = true;
  }
});

// Renderização principal do aplicativo
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registro de service worker para funcionamento offline
if ('serviceWorker' in navigator && !isDevelopment) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service worker registrado com sucesso:', registration.scope);
      })
      .catch(error => {
        console.log('Falha ao registrar service worker:', error);
      });
  });
}

// Manipulação de erros não capturados
window.addEventListener('error', (event) => {
  console.error('Erro não capturado:', event.error);
  // Aqui você poderia implementar um serviço de log de erros como Firebase Crashlytics
});

// Detecção de conexão offline/online
window.addEventListener('online', () => {
  console.log('Aplicativo está online');
  // Potencialmente sincronizar dados que foram salvos localmente enquanto offline
});

window.addEventListener('offline', () => {
  console.log('Aplicativo está offline');
  // Potencialmente mostrar um alerta ao usuário
});