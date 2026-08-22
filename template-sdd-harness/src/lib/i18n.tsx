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
      home: "Home",
      test: "Test",
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
      title: "Home",
      heading: "Power + Code",
      subHeading: "Click on the Power Apps and React logos to learn more",
      toast: {
        infoHome: "Hello from Power Apps!",
      }
    },
    test: {
      heading: "TEST Page",
      description: "This is a page to test router navigation."
    }
  },
  es: {
    app: {
      welcomeMessage: "¡Bienvenido a la plantilla de Code Apps!",
      langLabel: "Idioma",
    },
    nav: {
      main: "Principal",
      home: "Inicio",
      test: "Prueba",
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
      title: "Inicio",
      heading: "Power + Code",
      subHeading: "Haz clic en los logos de Power Apps y React para obtener más información.",
      toast: {
        infoHome: "¡Hola desde Power Apps!",
      }
    },
    test: {
      heading: "Página TEST",
      description: "Esta es una página para probar la navegación del router."
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