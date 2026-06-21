import {createContext, useContext, useState} from 'react';

export type Lang = 'en' | 'es';

const translations = {
  en: {
    app: {
      welcomeMessage: "Welcome to Code Apps Template!",
      langLabel: "Language",
    },
    nav: {
      main: "Main",
      home: "Chat",
      mcp: "MCP",
      settings: "Settings",
      help: "Help",
      subtitle: "Your Power Apps Template",
    },
    common: {
      backToHome: "Back to Home",
      notFound: "Not found",
      actions: "Actions",
      save: "Save",
      cancel: "Cancel",
      close: "Close",
      open: "Open",
      delete: "Delete",
      confirm: "Confirm",
      status: "Status",
      owner: "Owner",
      noData: "No data available",
    },
    home: {
      title: "Agent Chat",
      heading: "Agent Chat Workspace",
      subHeading: "Frontend ready to connect to your LLM Agent API.",
      inputPlaceholder: "Write a message... (Enter to send, Shift+Enter for new line)",
      send: "Send",
      sending: "Thinking...",
      newChat: "New chat",
      quickPrompts: "Quick prompts",
      apiHintTitle: "Backend connection",
      apiHintDescription: "Set VITE_AGENT_API_URL to point to your agent endpoint. Default path is /api/agent/chat.",
      statusReady: "Ready",
      statusTyping: "Agent responding",
      welcomeAssistant: "Hi! I am your chat UI assistant. Connect your agent API and I will forward each message to your LLM backend.",
      emptyTitle: "No messages yet",
      emptyDescription: "Start by typing a prompt or use one of the quick prompts.",
      quickPromptIdeas: [
        "Summarize this meeting transcript into action items.",
        "Draft an email to announce a product update.",
        "Generate test cases for a login flow.",
      ],
      toast: {
        infoHome: "Hello from Power Apps!",
        apiError: "Could not get a response from the agent API.",
      }
    },
    mcp: {
      heading: "MCP Servers",
      description: "Configure available MCP server endpoints for tool execution.",
      endpointLabel: "MCP endpoint URL",
      endpointPlaceholder: "https://your-server.example.com/mcp",
      addEndpoint: "Add endpoint",
      testAll: "Test all",
      testingAll: "Testing all...",
      empty: "No MCP endpoints configured yet.",
      remove: "Remove",
      testConnection: "Test connection",
      testing: "Testing...",
      toolsDetected: "Tools detected",
      connected: "Connected",
      connectionFailed: "Connection failed",
      saved: "MCP endpoints saved in local storage.",
      invalidUrl: "Please provide a valid URL (http/https).",
    }
  },
  es: {
    app: {
      welcomeMessage: "¡Bienvenido a la plantilla de Code Apps!",
      langLabel: "Idioma",
    },
    nav: {
      main: "Principal",
      home: "Chat",
      mcp: "MCP",
      settings: "Ajustes",
      help: "Ayuda",
      subtitle: "Tu plantilla de Power Apps",
    },
    common: {
      backToHome: "Volver al inicio",
      notFound: "No encontrado",
      actions: "Acciones",
      save: "Guardar",
      cancel: "Cancelar",
      close: "Cerrar",
      open: "Abrir",
      delete: "Eliminar",
      confirm: "Confirmar",
      status: "Estado",
      owner: "Propietario",
      noData: "No hay datos disponibles",
    },
    home: {
      title: "Chat de Agente",
      heading: "Espacio de Chat con Agente",
      subHeading: "Frontend listo para conectarse a tu API de agente LLM.",
      inputPlaceholder: "Escribe un mensaje... (Enter para enviar, Shift+Enter para salto de línea)",
      send: "Enviar",
      sending: "Pensando...",
      newChat: "Nuevo chat",
      quickPrompts: "Prompts rápidos",
      apiHintTitle: "Conexión de backend",
      apiHintDescription: "Configura VITE_AGENT_API_URL para apuntar a tu endpoint de agente. Ruta por defecto: /api/agent/chat.",
      statusReady: "Listo",
      statusTyping: "Agente respondiendo",
      welcomeAssistant: "¡Hola! Soy tu asistente de UI de chat. Conecta tu API de agente y reenviaré cada mensaje a tu backend LLM.",
      emptyTitle: "Aún no hay mensajes",
      emptyDescription: "Empieza escribiendo un prompt o usa uno de los prompts rápidos.",
      quickPromptIdeas: [
        "Resume esta transcripción de reunión en tareas accionables.",
        "Redacta un correo para anunciar una actualización del producto.",
        "Genera casos de prueba para un flujo de inicio de sesión.",
      ],
      toast: {
        infoHome: "¡Hola desde Power Apps!",
        apiError: "No se pudo obtener respuesta desde la API del agente.",
      }
    },
    mcp: {
      heading: "Servidores MCP",
      description: "Configura los endpoints MCP disponibles para ejecutar tools.",
      endpointLabel: "URL del endpoint MCP",
      endpointPlaceholder: "https://tu-servidor.example.com/mcp",
      addEndpoint: "Añadir endpoint",
      testAll: "Probar todos",
      testingAll: "Probando todos...",
      empty: "Aún no hay endpoints MCP configurados.",
      remove: "Eliminar",
      testConnection: "Probar conexión",
      testing: "Probando...",
      toolsDetected: "Tools detectadas",
      connected: "Conectado",
      connectionFailed: "Conexión fallida",
      saved: "Endpoints MCP guardados en local storage.",
      invalidUrl: "Ingresa una URL válida (http/https).",
    }
  }
} as const;

export type Translations = typeof translations.en;

const LANG_KEY = "app_lang";

const LanguageContext = createContext<{
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
}>({
  lang: 'en',
  setLang: () => {},
  t: translations.en,
});

export function LanguageProvider({children}:{children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem(LANG_KEY);
    return stored === 'es' ? 'es' : 'en';
  })

  const setLang = (l: Lang) =>{
    setLangState(l);
    localStorage.setItem(LANG_KEY, l);
}

return (
  <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] as unknown as Translations}}>
    {children}
  </LanguageContext.Provider>
)
}

export function useT(){
  return useContext(LanguageContext)
}