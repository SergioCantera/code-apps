import { createContext, useContext, useState, useEffect } from 'react';
import {Siero_todosService} from '../generated/services/Siero_todosService'
//import {Siero_todos} from '../generated/models/Siero_todosModel'


// Initial test data
/*const INITIAL_TODOS = [
  { id: 1, text: 'Complete project documentation', done: true },
  { id: 2, text: 'Review pull requests', done: true },
  { id: 3, text: 'Fix bug in authentication module', done: false },
  { id: 4, text: 'Prepare presentation for Monday', done: false },
  { id: 5, text: 'Update dependencies to latest versions', done: false },
  { id: 6, text: 'Write unit tests for new features', done: false },
  { id: 7, text: 'Schedule team meeting', done: true },
];*/

// Create context
const TodoContext = createContext();

/**
 * TodoProvider - Native React Context provider for todo state management
 * 
 * Uses only React built-in hooks (useState, useContext)
 * No external state management libraries (Zustand, Redux, etc.)
 */
export const TodoProvider = ({ children }) => {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    async function fetchTodos(){
      try {
        const result = await Siero_todosService.getAll();
      if (result.data) {
          const todos = result.data;
          setTodos(todos);
          //console.log(`Retrieved ${todos.length} todos`);
      }
      } catch (err) {
          console.error('Failed to retrieve todos:', err);
      }
    }
    fetchTodos();
  }, []);

  // Add new todo
  const addTodo = async (text) => {
    if (!text.trim()) return;
    
    const newTodo = {
      siero_name: text.trim(),
      siero_done: false
    };
    try {
      const result = await Siero_todosService.create(newTodo);
      if (result.data) {
        setTodos(prevTodos => [...prevTodos, newTodo]);
        return result.data;
      }
    } catch (err) {
      console.error('Failed to create todo:', err);
      throw err;
    }
  };

  // Toggle todo done status
  const toggleTodo = async (id) => {
    const changes = {
      siero_done: todos.find(({ siero_todoid}) => siero_todoid === id).siero_done ? false : true
    }
    console.log('changes: ',changes);
    try {
      await Siero_todosService.update(id, changes);
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.siero_todoid === id ? { ...todo, siero_done: !todo.siero_done } : todo
        )
      );
    } catch (err) {
        console.error('Failed to update ToDo:', err);
    }
  };

  // Delete todo
  const deleteTodo = async (id) => {
    try {
      await Siero_todosService.delete(id);
      setTodos(prevTodos => prevTodos.filter(todo => todo.siero_todoid !== id));
    } catch (err) {
        console.error('Failed to delete ToDo:', err);
    }
  };

  // Clear all completed todos
  const clearCompleted = () => {
    setTodos(prevTodos => prevTodos.filter(todo => !todo.siero_done));
  };

  // Get statistics
  const getStats = () => ({
    total: todos.length,
    completed: todos.filter(t => t.siero_done).length,
    pending: todos.filter(t => !t.siero_done).length
  });

  const value = {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    clearCompleted,
    getStats
  };

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  );
};

/**
 * Custom hook to use todo context
 */
export const useTodos = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodos must be used within TodoProvider');
  }
  return context;
};
