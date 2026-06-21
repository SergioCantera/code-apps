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
      hero: {
        badge: "Your future starts today",
        title: "Learn technology with real projects and accelerate your professional career",
        description: "Intensive training, personalized mentoring, and a community that supports you from the first module to your first job opportunity.",
        primaryCta: "View programs",
        secondaryCta: "Talk to an advisor",
      },
      testimonials: {
        badge: "Testimonials",
        title: "What our former students say",
        items: [
          {
            quote:
              "The classes gave me a solid foundation to enter the job market. In less than 4 months, I got my first role as a junior developer.",
            name: "Laura V.",
            role: "Frontend Developer",
          },
          {
            quote:
              "I learned with real-world projects and very close mentors. The best part was graduating with a portfolio ready for technical interviews.",
            name: "Miguel A.",
            role: "Full Stack Developer",
          },
          {
            quote:
              "I came from a different field and thought programming was not for me. The personalized support made all the difference.",
            name: "Sofia R.",
            role: "Product Analyst",
          },
        ],
      },
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
      hero: {
        badge: "Tu futuro empieza hoy",
        title: "Aprende tecnologia con proyectos reales y acelera tu carrera profesional",
        description: "Formacion intensiva, mentoring personalizado y una comunidad que te acompana desde el primer modulo hasta tu primera oportunidad laboral.",
        primaryCta: "Ver programas",
        secondaryCta: "Hablar con un asesor",
      },
      testimonials: {
        badge: "Testimonios",
        title: "Lo que cuentan nuestros antiguos estudiantes",
        items: [
          {
            quote:
              "Las clases me dieron una base real para entrar al mercado laboral. En menos de 4 meses consegui mi primer trabajo como desarrolladora junior.",
            name: "Laura V.",
            role: "Frontend Developer",
          },
          {
            quote:
              "Aprendi con proyectos reales y mentores muy cercanos. Lo mejor fue salir con un portfolio listo para entrevistas tecnicas.",
            name: "Miguel A.",
            role: "Full Stack Developer",
          },
          {
            quote:
              "Venia de otro sector y pensaba que programar no era para mi. El acompanamiento personalizado hizo toda la diferencia.",
            name: "Sofia R.",
            role: "Product Analyst",
          },
        ],
      },
      toast: {
        infoHome: "¡Hola desde Power Apps!",
      }
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