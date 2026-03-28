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
      students: "Students",
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
    },
    students: {
      heading: "Students",
      description: "Select a card to view student details.",
      addButton: "Add student",
      openDetailHint: "Click to open details",
      detailTitle: "Edit student",
      detailDescription: "Update the profile and enrollment details.",
      createTitle: "Create student",
      createDescription: "Fill in the profile and enrollment details.",
      fullNameLabel: "Full name",
      firstNameLabel: "First Name",
      firstNamePlaceholder: "Enter first name",
      lastNameLabel: "Last Name",
      lastNamePlaceholder: "Enter last name",
      courseLabel: "Course",
      coursePlaceholder: "Select a course",
      subjectsLabel: "Subjects",
      subjectsPlaceholder: "Select one or more subjects",
      subjectsMenuTitle: "Available subjects",
      selectedSubjectsCount: "selected",
      noSubjectsSelected: "No subjects selected",
      removeSubjectLabel: "Remove subject",
      toastCreated: "Student created successfully",
      toastSaved: "Student updated successfully",
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
      students: "Estudiantes",
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
    },
    students: {
      heading: "Estudiantes",
      description: "Selecciona una tarjeta para ver los detalles del estudiante.",
      addButton: "Añadir estudiante",
      openDetailHint: "Haz click para abrir el detalle",
      detailTitle: "Editar estudiante",
      detailDescription: "Actualiza el perfil y el detalle de matrícula.",
      createTitle: "Crear estudiante",
      createDescription: "Completa el perfil y el detalle de matrícula.",
      fullNameLabel: "Nombre completo",
      firstNameLabel: "First Name",
      firstNamePlaceholder: "Introduce el nombre",
      lastNameLabel: "Last Name",
      lastNamePlaceholder: "Introduce los apellidos",
      courseLabel: "Curso",
      coursePlaceholder: "Selecciona un curso",
      subjectsLabel: "Asignaturas",
      subjectsPlaceholder: "Selecciona una o varias asignaturas",
      subjectsMenuTitle: "Asignaturas disponibles",
      selectedSubjectsCount: "seleccionadas",
      noSubjectsSelected: "No hay asignaturas seleccionadas",
      removeSubjectLabel: "Quitar asignatura",
      toastCreated: "Estudiante creado correctamente",
      toastSaved: "Estudiante actualizado correctamente",
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