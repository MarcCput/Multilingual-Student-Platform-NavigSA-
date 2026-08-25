import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'pt' | 'fr' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'app.name': 'NavigSA',
    'app.tagline': 'Your Trusted Partner for South African University Applications',
    'nav.dashboard': 'Dashboard',
    'nav.marketplace': 'Services',
    'nav.applications': 'Applications',
    'nav.documents': 'Documents',
    'nav.profile': 'Profile',
    'login.title': 'Welcome Back',
    'login.subtitle': 'Sign in to continue your journey',
    'login.email': 'Email Address',
    'login.password': 'Password',
    'login.signin': 'Sign In',
    'login.signup': 'Create Account',
    'login.forgot': 'Forgot Password?',
    'onboarding.welcome': 'Welcome to NavigSA',
    'onboarding.step1': 'Personal Information',
    'onboarding.step2': 'Verification',
    'onboarding.step3': 'Preferences',
    'onboarding.complete': 'Complete Setup',
    'dashboard.welcome': 'Welcome back',
    'dashboard.applications': 'Your Applications',
    'dashboard.services': 'Recommended Services',
    'dashboard.documents': 'Recent Documents',
    'marketplace.title': 'Service Marketplace',
    'marketplace.subtitle': 'Connect with verified providers',
    'marketplace.search': 'Search services...',
    'applications.title': 'My Applications',
    'applications.status': 'Status',
    'applications.track': 'Track Application',
    'documents.title': 'My Documents',
    'documents.upload': 'Upload Document',
    'profile.title': 'My Profile',
    'profile.verify': 'Verify Identity',
    'status.pending': 'Pending',
    'status.inProgress': 'In Progress',
    'status.completed': 'Completed',
    'status.verified': 'Verified',
    'whatsapp.connect': 'Connect WhatsApp',
    'whatsapp.connected': 'WhatsApp Connected',
  },
  pt: {
    'app.name': 'NavigSA',
    'app.tagline': 'Seu Parceiro de Confiança para Candidaturas às Universidades Sul-Africanas',
    'nav.dashboard': 'Painel',
    'nav.marketplace': 'Serviços',
    'nav.applications': 'Candidaturas',
    'nav.documents': 'Documentos',
    'nav.profile': 'Perfil',
    'login.title': 'Bem-vindo de Volta',
    'login.subtitle': 'Entre para continuar sua jornada',
    'login.email': 'Endereço de Email',
    'login.password': 'Senha',
    'login.signin': 'Entrar',
    'login.signup': 'Criar Conta',
    'login.forgot': 'Esqueceu a Senha?',
    'onboarding.welcome': 'Bem-vindo ao NavigSA',
    'onboarding.step1': 'Informações Pessoais',
    'onboarding.step2': 'Verificação',
    'onboarding.step3': 'Preferências',
    'onboarding.complete': 'Completar Configuração',
    'dashboard.welcome': 'Bem-vindo de volta',
    'dashboard.applications': 'Suas Candidaturas',
    'dashboard.services': 'Serviços Recomendados',
    'dashboard.documents': 'Documentos Recentes',
    'marketplace.title': 'Mercado de Serviços',
    'marketplace.subtitle': 'Conecte-se com provedores verificados',
    'marketplace.search': 'Pesquisar serviços...',
    'applications.title': 'Minhas Candidaturas',
    'applications.status': 'Estado',
    'applications.track': 'Rastrear Candidatura',
    'documents.title': 'Meus Documentos',
    'documents.upload': 'Carregar Documento',
    'profile.title': 'Meu Perfil',
    'profile.verify': 'Verificar Identidade',
    'status.pending': 'Pendente',
    'status.inProgress': 'Em Andamento',
    'status.completed': 'Concluído',
    'status.verified': 'Verificado',
    'whatsapp.connect': 'Conectar WhatsApp',
    'whatsapp.connected': 'WhatsApp Conectado',
  },
  fr: {
    'app.name': 'NavigSA',
    'app.tagline': 'Votre Partenaire de Confiance pour les Candidatures aux Universités Sud-Africaines',
    'nav.dashboard': 'Tableau de Bord',
    'nav.marketplace': 'Services',
    'nav.applications': 'Candidatures',
    'nav.documents': 'Documents',
    'nav.profile': 'Profil',
    'login.title': 'Bon Retour',
    'login.subtitle': 'Connectez-vous pour continuer votre parcours',
    'login.email': 'Adresse Email',
    'login.password': 'Mot de Passe',
    'login.signin': 'Se Connecter',
    'login.signup': 'Créer un Compte',
    'login.forgot': 'Mot de Passe Oublié?',
    'onboarding.welcome': 'Bienvenue sur NavigSA',
    'onboarding.step1': 'Informations Personnelles',
    'onboarding.step2': 'Vérification',
    'onboarding.step3': 'Préférences',
    'onboarding.complete': 'Terminer la Configuration',
    'dashboard.welcome': 'Bon retour',
    'dashboard.applications': 'Vos Candidatures',
    'dashboard.services': 'Services Recommandés',
    'dashboard.documents': 'Documents Récents',
    'marketplace.title': 'Marché des Services',
    'marketplace.subtitle': 'Connectez-vous avec des fournisseurs vérifiés',
    'marketplace.search': 'Rechercher des services...',
    'applications.title': 'Mes Candidatures',
    'applications.status': 'Statut',
    'applications.track': 'Suivre la Candidature',
    'documents.title': 'Mes Documents',
    'documents.upload': 'Télécharger un Document',
    'profile.title': 'Mon Profil',
    'profile.verify': 'Vérifier l\'Identité',
    'status.pending': 'En Attente',
    'status.inProgress': 'En Cours',
    'status.completed': 'Terminé',
    'status.verified': 'Vérifié',
    'whatsapp.connect': 'Connecter WhatsApp',
    'whatsapp.connected': 'WhatsApp Connecté',
  },
  es: {
    'app.name': 'NavigSA',
    'app.tagline': 'Tu Socio de Confianza para Solicitudes a Universidades Sudafricanas',
    'nav.dashboard': 'Panel',
    'nav.marketplace': 'Servicios',
    'nav.applications': 'Solicitudes',
    'nav.documents': 'Documentos',
    'nav.profile': 'Perfil',
    'login.title': 'Bienvenido de Nuevo',
    'login.subtitle': 'Inicia sesión para continuar tu viaje',
    'login.email': 'Correo Electrónico',
    'login.password': 'Contraseña',
    'login.signin': 'Iniciar Sesión',
    'login.signup': 'Crear Cuenta',
    'login.forgot': '¿Olvidaste tu Contraseña?',
    'onboarding.welcome': 'Bienvenido a NavigSA',
    'onboarding.step1': 'Información Personal',
    'onboarding.step2': 'Verificación',
    'onboarding.step3': 'Preferencias',
    'onboarding.complete': 'Completar Configuración',
    'dashboard.welcome': 'Bienvenido de nuevo',
    'dashboard.applications': 'Tus Solicitudes',
    'dashboard.services': 'Servicios Recomendados',
    'dashboard.documents': 'Documentos Recientes',
    'marketplace.title': 'Mercado de Servicios',
    'marketplace.subtitle': 'Conéctate con proveedores verificados',
    'marketplace.search': 'Buscar servicios...',
    'applications.title': 'Mis Solicitudes',
    'applications.status': 'Estado',
    'applications.track': 'Rastrear Solicitud',
    'documents.title': 'Mis Documentos',
    'documents.upload': 'Subir Documento',
    'profile.title': 'Mi Perfil',
    'profile.verify': 'Verificar Identidad',
    'status.pending': 'Pendiente',
    'status.inProgress': 'En Progreso',
    'status.completed': 'Completado',
    'status.verified': 'Verificado',
    'whatsapp.connect': 'Conectar WhatsApp',
    'whatsapp.connected': 'WhatsApp Conectado',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
