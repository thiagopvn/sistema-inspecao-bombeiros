// Login.js - Componente de autenticação para o sistema de inspeção

import React, { useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import appData from './data';

const Login = ({ onLoginSuccess }) => {
  // Estados para o formulário de login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');

  // Referências ao Firebase
  const auth = getAuth();
  const db = window.db;

  // Efeito para verificar se existe um usuário salvo localmente
  useEffect(() => {
    const savedEmail = localStorage.getItem('cbmerj-inspecao-email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Função para lidar com o envio do formulário de login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Define a persistência com base na opção "Lembrar-me"
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      
      // Tenta fazer login com email e senha
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Salva o email no localStorage se "Lembrar-me" estiver marcado
      if (rememberMe) {
        localStorage.setItem('cbmerj-inspecao-email', email);
      } else {
        localStorage.removeItem('cbmerj-inspecao-email');
      }
      
      // Busca informações adicionais do usuário no Firestore
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Combina os dados do Firebase Auth com os dados extras do Firestore
          const enrichedUser = {
            ...user,
            patente: userData.patente || '',
            nome: userData.nome || user.displayName || '',
            perfil: userData.perfil || 'Usuário',
            quartel: userData.quartel || ''
          };
          
          // Notifica o componente pai sobre o login bem-sucedido
          if (onLoginSuccess) {
            onLoginSuccess(enrichedUser);
          }
        } else {
          // Se não existirem dados extras, usa apenas os dados básicos do Auth
          if (onLoginSuccess) {
            onLoginSuccess(user);
          }
        }
      } catch (firestoreError) {
        console.error("Erro ao buscar dados adicionais do usuário:", firestoreError);
        // Mesmo com erro ao buscar dados extras, procede com o login
        if (onLoginSuccess) {
          onLoginSuccess(user);
        }
      }
    } catch (error) {
      setLoading(false);
      
      // Tratamento de erros específicos do Firebase
      switch (error.code) {
        case 'auth/invalid-email':
          setError('E-mail inválido.');
          break;
        case 'auth/user-disabled':
          setError('Este usuário foi desativado.');
          break;
        case 'auth/user-not-found':
          setError('Usuário não encontrado.');
          break;
        case 'auth/wrong-password':
          setError('Senha incorreta.');
          break;
        case 'auth/too-many-requests':
          setError('Muitas tentativas incorretas. Tente novamente mais tarde.');
          break;
        default:
          setError(`Erro ao fazer login: ${error.message}`);
          break;
      }
    }
  };

  // Função para enviar email de redefinição de senha
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSent(false);
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSent(true);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      
      // Tratamento de erros específicos para redefinição de senha
      switch (error.code) {
        case 'auth/invalid-email':
          setResetError('E-mail inválido.');
          break;
        case 'auth/user-not-found':
          setResetError('Usuário não encontrado com este e-mail.');
          break;
        case 'auth/too-many-requests':
          setResetError('Muitas solicitações. Tente novamente mais tarde.');
          break;
        default:
          setResetError(`Erro ao enviar e-mail de redefinição: ${error.message}`);
          break;
      }
    }
  };

  // Função para alternar entre telas de login e redefinição de senha
  const toggleResetPassword = () => {
    setShowResetPassword(!showResetPassword);
    setResetEmail(email); // Preenche automaticamente com o email do login
    setResetSent(false);
    setResetError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">
        {/* Logo e cabeçalho */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-red-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {appData.appConfig.appName}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {appData.appConfig.organizationName}
          </p>
        </div>

        {!showResetPassword ? (
          /* Formulário de Login */
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">E-mail</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Senha</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Opção "Lembrar-me" e esqueci minha senha */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Lembrar-me
                </label>
              </div>

              <div className="text-sm">
                <button
                  type="button"
                  className="font-medium text-red-600 hover:text-red-500"
                  onClick={toggleResetPassword}
                  disabled={loading}
                >
                  Esqueceu sua senha?
                </button>
              </div>
            </div>

            {/* Mensagem de erro */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Botão de login */}
            <div>
              <button
                type="submit"
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                  loading ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                disabled={loading}
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className={`h-5 w-5 text-red-500 ${loading ? 'text-red-300' : 'text-red-400 group-hover:text-red-300'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </span>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          </form>
        ) : (
          /* Formulário de Redefinição de Senha */
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">
                E-mail
              </label>
              <div className="mt-1">
                <input
                  id="reset-email"
                  name="reset-email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  disabled={loading || resetSent}
                />
              </div>
            </div>

            {/* Mensagem de erro de redefinição */}
            {resetError && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{resetError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Mensagem de sucesso */}
            {resetSent && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      E-mail de redefinição enviado com sucesso! Verifique sua caixa de entrada.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button
                type="button"
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={toggleResetPassword}
                disabled={loading}
              >
                Voltar ao login
              </button>
              
              <button
                type="submit"
                className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading || resetSent ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                disabled={loading || resetSent}
              >
                {loading ? 'Enviando...' : resetSent ? 'Enviado' : 'Enviar link de redefinição'}
              </button>
            </div>
          </form>
        )}

        {/* Informações de versão */}
        <div className="mt-6">
          <p className="text-center text-xs text-gray-500">
            {appData.appConfig.appName} v{appData.appConfig.appVersion}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;