import { TodoProvider } from './context/TodoContext.jsx';
import { TodoList } from './components/TodoList.jsx';
import { AgentChat } from './components/AgentChat.jsx';
import './styles.css';

/**
 * Main App component
 * 
 * Simple todo app with AI assistant using:
 * - Native React Context API for state management
 * - Vanilla CSS for styling
 * - agent-state-bridge for AI integration
 */
function App() {
  return (
    <TodoProvider>
      <div className="app">
        <TodoList />
        <AgentChat />
      </div>
    </TodoProvider>
  );
}

export default App;
