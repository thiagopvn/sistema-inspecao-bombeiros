import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';

// Cores para eventos
const EVENT_COLORS = {
  'Preparação': { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  'Revisão': { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
  'Inspeção': { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
  'Treinamento': { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
  'Reunião': { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' }
};

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '09:00',
    type: 'Revisão',
    description: ''
  });

  // Simular carregamento de eventos do Firebase
  useEffect(() => {
    // Função para carregar eventos do Firestore
    const fetchEvents = async () => {
      try {
        // Em um app real, isso seria uma chamada ao Firestore
        // const db = getFirestore();
        // const eventsCollection = collection(db, 'events');
        // const eventSnapshot = await getDocs(eventsCollection);
        // const eventsList = eventSnapshot.docs.map(doc => ({
        //   id: doc.id,
        //   ...doc.data()
        // }));
        // setEvents(eventsList);

        // Para demonstração, usamos dados fictícios
        setEvents([
          {
            id: '1',
            title: 'Início de preparação',
            date: '2025-04-15',
            time: '08:00',
            type: 'Preparação',
            description: 'Início dos preparativos para a inspeção oficial'
          },
          {
            id: '2',
            title: 'Revisão de documentos',
            date: '2025-04-21',
            time: '08:00',
            type: 'Revisão',
            description: 'Conferência de toda documentação operacional'
          },
          {
            id: '3',
            title: 'Revisão de materiais',
            date: '2025-04-22',
            time: '08:00',
            type: 'Revisão',
            description: 'Conferência de todos os materiais operacionais'
          },
          {
            id: '4',
            title: 'Revisão de viaturas',
            date: '2025-04-23',
            time: '08:00',
            type: 'Revisão',
            description: 'Conferência de todas as viaturas operacionais'
          },
          {
            id: '5',
            title: 'Ensaio de cerimônia',
            date: '2025-04-24',
            time: '08:00',
            type: 'Treinamento',
            description: 'Ensaio para recepção da comitiva de inspeção'
          },
          {
            id: '6',
            title: 'Inspeção interna',
            date: '2025-04-25',
            time: '08:00',
            type: 'Inspeção',
            description: 'Inspeção interna preparatória'
          },
          {
            id: '7',
            title: 'INSPEÇÃO OFICIAL',
            date: '2025-04-28',
            time: '09:00',
            type: 'Inspeção',
            description: 'Inspeção oficial pela comitiva do Comando Geral'
          },
        ]);

        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar eventos:", error);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Manipular adição de novo evento
  const handleAddEvent = async (e) => {
    e.preventDefault();
    
    // Validar dados do formulário
    if (!newEvent.title || !newEvent.date) {
      alert('Por favor, preencha pelo menos título e data!');
      return;
    }
    
    try {
      const eventToAdd = {
        ...newEvent,
        id: Date.now().toString() // Em um app real, o Firestore geraria este ID
      };
      
      // Em um app real, isso seria uma chamada ao Firestore
      // const db = getFirestore();
      // const eventsRef = collection(db, 'events');
      // const docRef = await addDoc(eventsRef, eventToAdd);
      // eventToAdd.id = docRef.id;
      
      setEvents([...events, eventToAdd]);
      setShowEventModal(false);
      setNewEvent({
        title: '',
        date: '',
        time: '09:00',
        type: 'Revisão',
        description: ''
      });
    } catch (error) {
      console.error("Erro ao adicionar evento:", error);
    }
  };

  // Manipular exclusão de evento
  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Tem certeza que deseja excluir este evento?')) {
      try {
        // Em um app real, isso seria uma chamada ao Firestore
        // const db = getFirestore();
        // const eventDoc = doc(db, 'events', eventId);
        // await deleteDoc(eventDoc);
        
        setEvents(events.filter(event => event.id !== eventId));
      } catch (error) {
        console.error("Erro ao excluir evento:", error);
      }
    }
  };

  // Funções auxiliares para renderizar o calendário
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  // Mudar para o mês anterior
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Mudar para o próximo mês
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Formatar data
  const formatDate = (date) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(date).toLocaleDateString('pt-BR', options);
  };

  // Obter eventos do dia
  const getEventsForDay = (day) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    const dateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return events.filter(event => event.date === dateString);
  };

  // Verificar se é o dia atual
  const isToday = (day) => {
    const today = new Date();
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Obter próximos eventos
  const getUpcomingEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return events
      .filter(event => new Date(event.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 6);
  };

  // Renderizar dias do calendário
  const renderDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Dias vazios do início do mês
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className="bg-white p-2 h-32"></div>
      );
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDay(day);
      const isCurrentDay = isToday(day);
      
      days.push(
        <div 
          key={`day-${day}`} 
          className={`bg-white p-2 h-32 ${isCurrentDay ? 'ring-2 ring-red-500' : ''}`}
          onClick={() => {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const formattedDate = date.toISOString().split('T')[0];
            setSelectedDate(formattedDate);
            setNewEvent({...newEvent, date: formattedDate});
            setShowEventModal(true);
          }}
        >
          <div className={`text-sm ${isCurrentDay ? 'font-bold' : ''}`}>{day}</div>
          
          {dayEvents.map((event, index) => (
            <div 
              key={index} 
              className={`mt-1 p-1 ${EVENT_COLORS[event.type].bg} text-xs rounded ${EVENT_COLORS[event.type].text} truncate`}
              title={event.title}
            >
              {event.title}
            </div>
          ))}
        </div>
      );
    }

    return days;
  };

  // Formatar nome do mês
  const formatMonth = (date) => {
    const options = { month: 'long', year: 'numeric' };
    return date.toLocaleDateString('pt-BR', options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
        <span className="ml-2">Carregando calendário...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Calendário</h1>
      
      <div className="flex justify-end mb-4">
        <button 
          onClick={() => {
            setSelectedDate(new Date().toISOString().split('T')[0]);
            setNewEvent({...newEvent, date: new Date().toISOString().split('T')[0]});
            setShowEventModal(true);
          }}
          className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Adicionar Evento
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 bg-red-600 text-white flex justify-between items-center">
          <button 
            onClick={prevMonth}
            className="p-1 rounded hover:bg-red-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-bold">{formatMonth(currentMonth)}</h2>
          <button 
            onClick={nextMonth}
            className="p-1 rounded hover:bg-red-500"
          >
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
          
          {renderDays()}
        </div>
        
        <div className="p-4 border-t">
          <h3 className="font-medium mb-2">Próximos Eventos</h3>
          <ul className="space-y-2">
            {getUpcomingEvents().map((event) => (
              <li key={event.id} className="flex items-start">
                <span className={`mt-0.5 h-3 w-3 rounded-full ${EVENT_COLORS[event.type].dot} mr-2`}></span>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-medium">{event.title}</p>
                    <button 
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-gray-400 hover:text-red-600"
                      title="Excluir evento"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatDate(event.date)} - {event.time}
                  </p>
                  {event.description && (
                    <p className="text-xs text-gray-500 mt-1">{event.description}</p>
                  )}
                </div>
              </li>
            ))}
            
            {getUpcomingEvents().length === 0 && (
              <li className="text-center text-gray-500 py-2">
                Nenhum evento próximo agendado
              </li>
            )}
          </ul>
        </div>
      </div>
      
      {/* Modal para adicionar evento */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">Adicionar Evento</h3>
              <button 
                onClick={() => setShowEventModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddEvent} className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <input 
                    type="text" 
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
                    placeholder="Título do evento"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data *
                    </label>
                    <input 
                      type="date" 
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora
                    </label>
                    <input 
                      type="time" 
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de evento
                  </label>
                  <select 
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
                  >
                    <option value="Preparação">Preparação</option>
                    <option value="Revisão">Revisão</option>
                    <option value="Inspeção">Inspeção</option>
                    <option value="Treinamento">Treinamento</option>
                    <option value="Reunião">Reunião</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea 
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    rows={3}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
                    placeholder="Descrição do evento"
                  ></textarea>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button 
                    type="button"
                    onClick={() => setShowEventModal(false)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
                  >
                    Salvar Evento
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;