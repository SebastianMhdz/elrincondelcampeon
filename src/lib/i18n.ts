export type Locale = "es" | "en" | "pt" | "de";

export type Translation = {
  // Sidebar / nav
  appName: string;
  tagline: string;
  home: string;
  tournaments: string;
  courts: string;
  map: string;
  routes: string;
  reserve: string;
  support: string;
  myReservations: string;
  courtsHint: string;
  mapHint: string;
  routesHint: string;
  reserveHint: string;
  supportHint: string;
  myReservationsHint: string;
  activeSection: string;
  settings: string;
  settingsHint: string;
  account: string;
  accountHint: string;

  // Settings panel
  theme: string;
  language: string;
  light: string;
  dark: string;
  current: string;
  adminAccess: string;
  adminDescription: string;
  openPanel: string;
  signIn: string;
  signOut: string;
  signUp: string;
  email: string;
  password: string;
  name: string;
  fullName: string;
  accessCode: string;
  unlockAdmin: string;
  adminOnlyMessage: string;
  adminPanel: string;
  adminPanelDescription: string;
  saveChanges: string;
  adminLogs: string;
  adminLogsDescription: string;
  noLogsYet: string;
  loginRequiredToAdmin: string;
  loggedInAs: string;

  // Footer
  footerProject: string;
  footerAuthors: string;
  footerPhone: string;
  footerAddress: string;
  footerNavigate: string;
  footerLegal: string;
  footerRights: string;
  footerMission: string;
  footerMissionText: string;
  footerContact: string;

  // Hero
  heroBadge: string;
  heroLiveMap: string;
  heroLiveMapText: string;
  heroSafe: string;
  heroSafeText: string;
  heroExperience: string;
  heroExperienceText: string;
  matchdayPanel: string;
  bookYourCourt: string;
  live: string;
  availability: string;
  activeToday: string;
  reservations: string;
  realTime: string;
  autoBlock: string;

  // Canchas section
  availableCourts: string;
  viewDetails: string;
  back: string;
  pricePerHour: string;
  upToPeak: string;
  schedule: string;
  courtType: string;
  phone: string;
  services: string;
  socialLinks: string;
  noLinksYet: string;
  recentReviews: string;
  viewOnMap: string;
  reserveThisCourt: string;
  reviews: string;

  // Map section
  mapLocation: string;
  selectCourt: string;
  destination: string;
  selectCourtFirst: string;
  route: string;
  calculatingOnLocate: string;
  estimatedTime: string;
  enableLocation: string;
  yourLocation: string;
  notSharedYet: string;
  locating: string;
  updateLocation: string;
  useMyLocation: string;
  showRouteFromMyLocation: string;
  updateRouteFromMyLocation: string;
  routeShownInline: string;
  selectCourtToSeeLocation: string;
  nearestCourt: string;
  findNearestCourt: string;

  // Rutas section
  transportRoutes: string;
  urban: string;
  trunk: string;
  rideshare: string;
  planWithApps: string;
  openMoovit: string;
  openGoogleMaps: string;

  // Reserva section
  bookYourCourtTitle: string;
  loginToReserve: string;
  loginToReserveDesc: string;
  goToAccount: string;
  court: string;
  selectCourtPlaceholder: string;
  fullNameLabel: string;
  yourName: string;
  emailLabel: string;
  emailPlaceholder: string;
  cellphone: string;
  cellphonePlaceholder: string;
  date: string;
  hour: string;
  duration: string;
  hour1: string;
  hour2: string;
  hour3: string;
  modality: string;
  extraServices: string;
  vest: string;
  ball: string;
  nightLighting: string;
  lockerRoom: string;
  coveredCourt: string;
  eventTournament: string;
  additionalNote: string;
  notePlaceholder: string;
  sending: string;
  submitReservation: string;
  reservationSent: string;
  reservationSentDesc: string;
  makeAnother: string;
  errorTitle: string;
  completeAllFields: string;
  slotUnavailable: string;
  slotUnavailableDesc: string;

  // Soporte section
  supportContact: string;
  directCall: string;
  callAdmin: string;
  selectCourtShort: string;
  callNow: string;
  whatsappCard: string;
  writeBusiness: string;
  openWhatsapp: string;
  supportForm: string;
  subject: string;
  reservationProblem: string;
  serviceComplaint: string;
  priceQuery: string;
  requestInfo: string;
  other: string;
  contactInfo: string;
  message: string;
  describeQuery: string;
  sendMessage: string;
  messageSent: string;
  willReplySoon: string;
  completeNameMessage: string;
  mySupportRequests: string;
  teamReply: string;
  noTeamReplyYet: string;
  replyToUser: string;
  saveReply: string;

  // Mis reservas
  myReservationsTitle: string;
  myReservationsDesc: string;
  noReservationsYet: string;
  reservationOf: string;
  status: string;
  confirmed: string;
  pending: string;
  cancelled: string;

  // Account section
  accountTitle: string;
  accountDescription: string;
  signInTab: string;
  signUpTab: string;
  createAccount: string;
  alreadyHaveAccount: string;
  needAccount: string;
  signedInAs: string;
  signOutBtn: string;
  authError: string;
  signupSuccess: string;
  signupSuccessDesc: string;
  loginSuccess: string;

  // Reviews
  userReviews: string;
  loginRequired: string;
  loginToReview: string;
  reviewCommentRequired: string;
  reviewSubmitted: string;
  reviewPlaceholder: string;
  submitReview: string;
  noReviewsYet: string;
  anonymousUser: string;

  // Ricky Bot
  rickyGreeting: string;
  rickySubtitle: string;
  rickyPlaceholder: string;
  rickyOpen: string;
  rickyError: string;
  rickyRateLimit: string;
  rickyNoCredits: string;
  rickyOptionalLogin: string;

  // Admin reports log
  supportReportsLog: string;
  supportReportsHint: string;
  noReportsYet: string;
  statusOpen: string;
  statusInProgress: string;
  statusResolved: string;
};

export const translations: Record<Locale, Translation> = {
  es: {
    appName: "El Rincón Del Campeón",
    tagline: "Encuentra, compara y reserva la mejor cancha para tu partido y diversión en Barranquilla",
    home: "Inicio",
    tournaments: "Torneos",
    courts: "Canchas",
    map: "Mapa",
    routes: "Rutas",
    reserve: "Reservar",
    support: "Soporte",
    myReservations: "Mis Reservas",
    courtsHint: "Fotos, datos y detalles",
    mapHint: "Ruta y ubicación en vivo",
    routesHint: "Transporte y acceso",
    reserveHint: "Bloqueo de horarios",
    supportHint: "Ayuda y contacto",
    myReservationsHint: "Tus reservas guardadas",
    activeSection: "Sección activa",
    settings: "Configuración",
    settingsHint: "Idioma, tema y admin",
    account: "Mi Cuenta",
    accountHint: "Inicia sesión o regístrate",
    theme: "Tema",
    language: "Idioma",
    light: "Claro",
    dark: "Oscuro",
    current: "Actual",
    adminAccess: "Acceso administrador",
    adminDescription: "Solo necesitas tu nombre y el código de acceso oficial.",
    openPanel: "Abrir panel",
    signIn: "Iniciar sesión",
    signOut: "Cerrar sesión",
    signUp: "Registrarse",
    email: "Correo",
    password: "Contraseña",
    name: "Nombre",
    fullName: "Nombre completo",
    accessCode: "Código de acceso",
    unlockAdmin: "Activar admin",
    adminOnlyMessage: "Activa el modo administrador con tu nombre y el código para editar el sitio.",
    adminPanel: "Panel administrador",
    adminPanelDescription: "Actualiza branding y datos visibles en tiempo real.",
    saveChanges: "Guardar cambios",
    adminLogs: "Registro de accesos",
    adminLogsDescription: "Historial de quién entró como administrador.",
    noLogsYet: "Aún no hay accesos registrados.",
    loginRequiredToAdmin: "Inicia sesión para activar el modo admin.",
    loggedInAs: "Sesión activa como",
    footerProject: "Un Proyecto de los estudiantes de la CUC, Derechos Reservados",
    footerAuthors: "Autores",
    footerPhone: "Teléfono",
    footerAddress: "Ubicación",
    footerNavigate: "Navegación",
    footerLegal: "Legal",
    footerRights: "Todos los derechos reservados",
    footerMission: "Nuestra misión",
    footerMissionText: "Conectar a los apasionados del fútbol de Barranquilla con las mejores canchas sintéticas de la ciudad. Reserva fácil, rápido y seguro.",
    footerContact: "Contacto",
    heroBadge: "Barranquilla · reservas deportivas en tiempo real",
    heroLiveMap: "Mapa vivo",
    heroLiveMapText: "Tu ubicación y la cancha en la misma pantalla.",
    heroSafe: "Reserva segura",
    heroSafeText: "Bloqueamos horarios ocupados automáticamente.",
    heroExperience: "Experiencia deportiva",
    heroExperienceText: "Explora canchas con navegación dinámica.",
    matchdayPanel: "Panel del partido",
    bookYourCourt: "Reserva tu cancha ideal",
    live: "EN VIVO",
    availability: "Disponibilidad",
    activeToday: "canchas activas hoy",
    reservations: "Reservas",
    realTime: "Tiempo real",
    autoBlock: "bloqueo automático por horario",
    availableCourts: "Canchas disponibles",
    viewDetails: "Ver detalles",
    back: "Volver a todas las canchas",
    pricePerHour: "Precio por hora",
    upToPeak: "hasta hora pico",
    schedule: "Horario",
    courtType: "Tipo de cancha",
    phone: "Teléfono",
    services: "Servicios",
    socialLinks: "Redes y enlaces",
    noLinksYet: "Pronto agregaremos más enlaces oficiales de esta cancha.",
    recentReviews: "Reseñas recientes",
    viewOnMap: "Ver en el mapa",
    reserveThisCourt: "Reservar esta cancha",
    reviews: "reseñas",
    mapLocation: "Ubicación en el mapa",
    selectCourt: "— Selecciona una cancha —",
    destination: "Destino",
    selectCourtFirst: "Elige una cancha para ver el trayecto.",
    route: "Recorrido",
    calculatingOnLocate: "Calculando al activar ubicación",
    estimatedTime: "Tiempo estimado",
    enableLocation: "Activa tu ubicación para estimar tiempo en carro.",
    yourLocation: "Tu ubicación",
    notSharedYet: "Aún no compartida",
    locating: "Ubicando...",
    updateLocation: "Actualizar ubicación",
    useMyLocation: "Usar mi ubicación",
    showRouteFromMyLocation: "Mostrar ruta desde mi ubicación",
    updateRouteFromMyLocation: "Actualizar ruta desde mi ubicación",
    routeShownInline: "El trayecto se muestra dentro de esta página sin sacarte de la experiencia.",
    selectCourtToSeeLocation: "Selecciona una cancha para ver su ubicación",
    nearestCourt: "Cancha más cercana",
    findNearestCourt: "Buscar cancha más cercana",
    transportRoutes: "Rutas de transporte",
    urban: "Urbano",
    trunk: "Troncal",
    rideshare: "Uber/InDriver",
    planWithApps: "Planear con apps",
    openMoovit: "Abrir Moovit",
    openGoogleMaps: "Google Maps (transporte público)",
    bookYourCourtTitle: "Reservar tu cancha",
    loginToReserve: "Inicia sesión para reservar",
    loginToReserveDesc: "Necesitas una cuenta para crear y guardar reservas. Ve a Mi Cuenta para registrarte.",
    goToAccount: "Ir a Mi Cuenta",
    court: "Cancha",
    selectCourtPlaceholder: "— Selecciona una cancha —",
    fullNameLabel: "Nombre completo *",
    yourName: "Tu nombre",
    emailLabel: "Correo electrónico *",
    emailPlaceholder: "tu@correo.com",
    cellphone: "Celular *",
    cellphonePlaceholder: "300 000 0000",
    date: "Fecha *",
    hour: "Hora",
    duration: "Duración",
    hour1: "1 hora",
    hour2: "2 horas",
    hour3: "3 horas",
    modality: "Modalidad",
    extraServices: "Servicios adicionales",
    vest: "Peto / chaleco",
    ball: "Balón",
    nightLighting: "Iluminación nocturna",
    lockerRoom: "Camerino",
    coveredCourt: "Cancha techada",
    eventTournament: "Evento / torneo",
    additionalNote: "Nota adicional",
    notePlaceholder: "¿Algo más que quieras informar?",
    sending: "Enviando...",
    submitReservation: "Enviar reserva y recibir confirmación por correo",
    reservationSent: "¡Reserva enviada!",
    reservationSentDesc: "Se enviará una confirmación al correo. Te contactaremos para confirmar tu reserva.",
    makeAnother: "Hacer otra reserva",
    errorTitle: "Error",
    completeAllFields: "Por favor completa todos los campos obligatorios.",
    slotUnavailable: "Horario no disponible",
    slotUnavailableDesc: "Ya existe una reserva para esa cancha en esa fecha y hora. Elige otro horario.",
    supportContact: "Soporte y contacto",
    directCall: "Llamada directa",
    callAdmin: "Llama al administrador",
    selectCourtShort: "Selecciona cancha",
    callNow: "Llamar ahora",
    whatsappCard: "WhatsApp",
    writeBusiness: "Escríbele al negocio",
    openWhatsapp: "Abrir WhatsApp",
    supportForm: "Formulario de soporte",
    subject: "Asunto",
    reservationProblem: "Problema con reserva",
    serviceComplaint: "Queja sobre el servicio",
    priceQuery: "Consulta de precios",
    requestInfo: "Solicitar información",
    other: "Otro",
    contactInfo: "Celular / Email",
    message: "Mensaje",
    describeQuery: "Describe tu consulta...",
    sendMessage: "Enviar mensaje",
    messageSent: "Mensaje enviado",
    willReplySoon: "Te responderemos a la brevedad.",
    completeNameMessage: "Completa nombre y mensaje",
    mySupportRequests: "Mis solicitudes de soporte",
    teamReply: "Respuesta del equipo",
    noTeamReplyYet: "Aún no hay respuesta del equipo.",
    replyToUser: "Responder al usuario",
    saveReply: "Guardar respuesta",
    myReservationsTitle: "Mis reservas",
    myReservationsDesc: "Aquí ves todas las reservas que has hecho con tu cuenta.",
    noReservationsYet: "Aún no tienes reservas. Ve a Reservar para crear una.",
    reservationOf: "Reserva de",
    status: "Estado",
    confirmed: "Confirmada",
    pending: "Pendiente",
    cancelled: "Cancelada",
    accountTitle: "Mi cuenta",
    accountDescription: "Inicia sesión o crea una cuenta para guardar tus reservas.",
    signInTab: "Iniciar sesión",
    signUpTab: "Crear cuenta",
    createAccount: "Crear cuenta",
    alreadyHaveAccount: "¿Ya tienes cuenta? Inicia sesión",
    needAccount: "¿No tienes cuenta? Regístrate",
    signedInAs: "Sesión iniciada como",
    signOutBtn: "Cerrar sesión",
    authError: "Error de autenticación",
    signupSuccess: "Cuenta creada",
    signupSuccessDesc: "Revisa tu correo para confirmar el registro y luego inicia sesión.",
    loginSuccess: "Bienvenido",
    userReviews: "Reseñas de usuarios",
    loginRequired: "Inicio de sesión requerido",
    loginToReview: "Inicia sesión para dejar tu reseña",
    reviewCommentRequired: "Escribe un comentario para tu reseña.",
    reviewSubmitted: "¡Reseña publicada!",
    reviewPlaceholder: "Cuéntanos cómo te fue en esta cancha…",
    submitReview: "Publicar reseña",
    noReviewsYet: "Aún no hay reseñas. ¡Sé el primero en opinar!",
    anonymousUser: "Usuario",
    rickyGreeting: "¡Hola! Soy Ricky Bot ⚽ Pregúntame sobre canchas, precios, horarios o reservas.",
    rickySubtitle: "Asistente de El Rincón Del Campeón",
    rickyPlaceholder: "Escribe tu pregunta…",
    rickyOpen: "Abrir chat con Ricky",
    rickyError: "Hubo un error con el chat. Intenta de nuevo.",
    rickyRateLimit: "Demasiadas preguntas seguidas. Espera unos segundos.",
    rickyNoCredits: "Sin créditos de IA disponibles. Avísale al admin.",
    rickyOptionalLogin: "Iniciar sesión es opcional para chatear.",
    supportReportsLog: "Reportes de soporte",
    supportReportsHint: "Mensajes enviados desde el formulario de soporte.",
    noReportsYet: "Aún no hay reportes.",
    statusOpen: "Abierto",
    statusInProgress: "En proceso",
    statusResolved: "Resuelto",
  },
  en: {
    appName: "Champion's Corner",
    tagline: "Find, compare and book the best field for your match in Barranquilla",
    home: "Home",
    tournaments: "Tournaments",
    courts: "Courts", map: "Map", routes: "Routes", reserve: "Book", support: "Support", myReservations: "My Bookings",
    courtsHint: "Photos, data and details", mapHint: "Live route and location", routesHint: "Transport and access", reserveHint: "Time slot lock", supportHint: "Help and contact", myReservationsHint: "Your saved bookings",
    activeSection: "Active section", settings: "Settings", settingsHint: "Language, theme & admin",
    account: "My Account", accountHint: "Sign in or register",
    theme: "Theme", language: "Language", light: "Light", dark: "Dark", current: "Current",
    adminAccess: "Admin access", adminDescription: "Just enter your name and the official access code.",
    openPanel: "Open panel", signIn: "Sign in", signOut: "Sign out", signUp: "Sign up",
    email: "Email", password: "Password", name: "Name", fullName: "Full name",
    accessCode: "Access code", unlockAdmin: "Unlock admin",
    adminOnlyMessage: "Activate admin mode with your name and the code to edit the site.",
    adminPanel: "Admin panel", adminPanelDescription: "Update branding and visible details live.", saveChanges: "Save changes",
    adminLogs: "Access log", adminLogsDescription: "History of who logged in as admin.", noLogsYet: "No accesses recorded yet.",
    loginRequiredToAdmin: "Sign in to activate admin mode.", loggedInAs: "Logged in as",
    footerProject: "A project by CUC students, All Rights Reserved",
    footerAuthors: "Authors", footerPhone: "Phone", footerAddress: "Location",
    footerNavigate: "Navigate", footerLegal: "Legal", footerRights: "All rights reserved",
    footerMission: "Our mission", footerMissionText: "Connecting Barranquilla football lovers with the best synthetic fields. Easy, fast and secure booking.",
    footerContact: "Contact",
    heroBadge: "Barranquilla · live sports bookings",
    heroLiveMap: "Live map", heroLiveMapText: "Your location and the field on one screen.",
    heroSafe: "Safe booking", heroSafeText: "We auto-block taken time slots.",
    heroExperience: "Sports experience", heroExperienceText: "Explore courts with dynamic navigation.",
    matchdayPanel: "Matchday panel", bookYourCourt: "Book your ideal field", live: "LIVE",
    availability: "Availability", activeToday: "active courts today", reservations: "Bookings", realTime: "Real time", autoBlock: "auto block by schedule",
    availableCourts: "Available courts", viewDetails: "View details", back: "Back to all courts",
    pricePerHour: "Price per hour", upToPeak: "up to peak hour", schedule: "Schedule", courtType: "Court type", phone: "Phone",
    services: "Services", socialLinks: "Social & links", noLinksYet: "More official links coming soon.",
    recentReviews: "Recent reviews", viewOnMap: "View on map", reserveThisCourt: "Book this court", reviews: "reviews",
    mapLocation: "Location on map", selectCourt: "— Select a court —",
    destination: "Destination", selectCourtFirst: "Pick a court to see the route.",
    route: "Route", calculatingOnLocate: "Calculating when location is on", estimatedTime: "Estimated time",
    enableLocation: "Enable your location to estimate driving time.", yourLocation: "Your location", notSharedYet: "Not shared yet",
    locating: "Locating...", updateLocation: "Update location", useMyLocation: "Use my location",
    showRouteFromMyLocation: "Show route from my location", updateRouteFromMyLocation: "Update route from my location",
    routeShownInline: "The route is shown inside this page so you stay in the experience.",
    selectCourtToSeeLocation: "Select a court to see its location",
    nearestCourt: "Nearest court",
    findNearestCourt: "Find nearest court",
    transportRoutes: "Transport routes", urban: "Urban", trunk: "Trunk", rideshare: "Uber/InDriver",
    planWithApps: "Plan with apps", openMoovit: "Open Moovit", openGoogleMaps: "Google Maps (public transport)",
    bookYourCourtTitle: "Book your court",
    loginToReserve: "Sign in to book",
    loginToReserveDesc: "You need an account to create and save bookings. Go to My Account to sign up.",
    goToAccount: "Go to My Account",
    court: "Court", selectCourtPlaceholder: "— Select a court —",
    fullNameLabel: "Full name *", yourName: "Your name", emailLabel: "Email *", emailPlaceholder: "you@email.com",
    cellphone: "Cellphone *", cellphonePlaceholder: "300 000 0000", date: "Date *", hour: "Hour", duration: "Duration",
    hour1: "1 hour", hour2: "2 hours", hour3: "3 hours", modality: "Format",
    extraServices: "Extra services", vest: "Vest / bib", ball: "Ball", nightLighting: "Night lighting",
    lockerRoom: "Locker room", coveredCourt: "Covered court", eventTournament: "Event / tournament",
    additionalNote: "Additional note", notePlaceholder: "Anything else you want to share?",
    sending: "Sending...", submitReservation: "Send booking and get email confirmation",
    reservationSent: "Booking sent!", reservationSentDesc: "A confirmation will be emailed. We'll contact you to confirm.",
    makeAnother: "Make another booking", errorTitle: "Error", completeAllFields: "Please fill in all required fields.",
    slotUnavailable: "Time slot unavailable", slotUnavailableDesc: "A booking already exists for that court at that date and time. Pick another time.",
    supportContact: "Support and contact", directCall: "Direct call", callAdmin: "Call the admin",
    selectCourtShort: "Select court", callNow: "Call now", whatsappCard: "WhatsApp", writeBusiness: "Message the business",
    openWhatsapp: "Open WhatsApp", supportForm: "Support form", subject: "Subject",
    reservationProblem: "Booking issue", serviceComplaint: "Service complaint", priceQuery: "Price inquiry",
    requestInfo: "Request information", other: "Other", contactInfo: "Cellphone / Email", message: "Message",
    describeQuery: "Describe your inquiry...", sendMessage: "Send message", messageSent: "Message sent",
    willReplySoon: "We'll reply soon.", completeNameMessage: "Complete name and message",
    mySupportRequests: "My support requests", teamReply: "Team reply", noTeamReplyYet: "No team reply yet.", replyToUser: "Reply to user", saveReply: "Save reply",
    myReservationsTitle: "My bookings", myReservationsDesc: "All bookings made with your account.",
    noReservationsYet: "No bookings yet. Go to Book to create one.",
    reservationOf: "Booking of", status: "Status", confirmed: "Confirmed", pending: "Pending", cancelled: "Cancelled",
    accountTitle: "My account", accountDescription: "Sign in or create an account to save your bookings.",
    signInTab: "Sign in", signUpTab: "Sign up", createAccount: "Create account",
    alreadyHaveAccount: "Already have an account? Sign in", needAccount: "No account? Sign up",
    signedInAs: "Signed in as", signOutBtn: "Sign out", authError: "Authentication error",
    signupSuccess: "Account created", signupSuccessDesc: "Check your email to confirm registration, then sign in.",
    loginSuccess: "Welcome",
    userReviews: "User reviews",
    loginRequired: "Sign in required",
    loginToReview: "Sign in to leave a review",
    reviewCommentRequired: "Write a comment for your review.",
    reviewSubmitted: "Review posted!",
    reviewPlaceholder: "Tell us how it went at this court…",
    submitReview: "Post review",
    noReviewsYet: "No reviews yet. Be the first!",
    anonymousUser: "User",
    rickyGreeting: "Hi! I'm Ricky Bot ⚽ Ask me about courts, prices, schedules or bookings.",
    rickySubtitle: "Champion's Corner assistant",
    rickyPlaceholder: "Type your question…",
    rickyOpen: "Open chat with Ricky",
    rickyError: "Chat error. Please try again.",
    rickyRateLimit: "Too many questions. Wait a few seconds.",
    rickyNoCredits: "No AI credits available. Notify the admin.",
    rickyOptionalLogin: "Signing in is optional to chat.",
    supportReportsLog: "Support reports",
    supportReportsHint: "Messages submitted from the support form.",
    noReportsYet: "No reports yet.",
    statusOpen: "Open",
    statusInProgress: "In progress",
    statusResolved: "Resolved",
  },
  pt: {
    appName: "O Canto do Campeão",
    tagline: "Encontre, compare e reserve o melhor campo para sua partida em Barranquilla",
    home: "Início",
    tournaments: "Torneios",
    courts: "Campos", map: "Mapa", routes: "Rotas", reserve: "Reservar", support: "Suporte", myReservations: "Minhas Reservas",
    courtsHint: "Fotos, dados e detalhes", mapHint: "Rota e localização ao vivo", routesHint: "Transporte e acesso", reserveHint: "Bloqueio de horários", supportHint: "Ajuda e contato", myReservationsHint: "Suas reservas salvas",
    activeSection: "Seção ativa", settings: "Configurações", settingsHint: "Idioma, tema e admin",
    account: "Minha Conta", accountHint: "Entre ou registre-se",
    theme: "Tema", language: "Idioma", light: "Claro", dark: "Escuro", current: "Atual",
    adminAccess: "Acesso administrador", adminDescription: "Só precisa do seu nome e o código de acesso oficial.",
    openPanel: "Abrir painel", signIn: "Entrar", signOut: "Sair", signUp: "Cadastrar",
    email: "Email", password: "Senha", name: "Nome", fullName: "Nome completo",
    accessCode: "Código de acesso", unlockAdmin: "Ativar admin",
    adminOnlyMessage: "Ative o modo admin com seu nome e o código para editar o site.",
    adminPanel: "Painel admin", adminPanelDescription: "Atualize a marca e os dados visíveis em tempo real.", saveChanges: "Salvar alterações",
    adminLogs: "Registro de acessos", adminLogsDescription: "Histórico de quem entrou como admin.", noLogsYet: "Sem acessos registrados.",
    loginRequiredToAdmin: "Entre para ativar o modo admin.", loggedInAs: "Sessão como",
    footerProject: "Um projeto dos estudantes da CUC, Direitos Reservados",
    footerAuthors: "Autores", footerPhone: "Telefone", footerAddress: "Localização",
    footerNavigate: "Navegação", footerLegal: "Legal", footerRights: "Todos os direitos reservados",
    footerMission: "Nossa missão", footerMissionText: "Conectar amantes do futebol de Barranquilla aos melhores campos sintéticos. Reserva fácil, rápida e segura.",
    footerContact: "Contato",
    heroBadge: "Barranquilla · reservas esportivas em tempo real",
    heroLiveMap: "Mapa ao vivo", heroLiveMapText: "Sua localização e o campo na mesma tela.",
    heroSafe: "Reserva segura", heroSafeText: "Bloqueamos horários ocupados automaticamente.",
    heroExperience: "Experiência esportiva", heroExperienceText: "Explore campos com navegação dinâmica.",
    matchdayPanel: "Painel do jogo", bookYourCourt: "Reserve seu campo ideal", live: "AO VIVO",
    availability: "Disponibilidade", activeToday: "campos ativos hoje", reservations: "Reservas", realTime: "Tempo real", autoBlock: "bloqueio automático por horário",
    availableCourts: "Campos disponíveis", viewDetails: "Ver detalhes", back: "Voltar a todos os campos",
    pricePerHour: "Preço por hora", upToPeak: "até hora de pico", schedule: "Horário", courtType: "Tipo de campo", phone: "Telefone",
    services: "Serviços", socialLinks: "Redes e links", noLinksYet: "Mais links oficiais em breve.",
    recentReviews: "Avaliações recentes", viewOnMap: "Ver no mapa", reserveThisCourt: "Reservar este campo", reviews: "avaliações",
    mapLocation: "Localização no mapa", selectCourt: "— Selecione um campo —",
    destination: "Destino", selectCourtFirst: "Escolha um campo para ver o trajeto.",
    route: "Trajeto", calculatingOnLocate: "Calculando ao ativar localização", estimatedTime: "Tempo estimado",
    enableLocation: "Ative sua localização para estimar o tempo de carro.", yourLocation: "Sua localização", notSharedYet: "Ainda não compartilhada",
    locating: "Localizando...", updateLocation: "Atualizar localização", useMyLocation: "Usar minha localização",
    showRouteFromMyLocation: "Mostrar rota da minha localização", updateRouteFromMyLocation: "Atualizar rota da minha localização",
    routeShownInline: "O trajeto aparece dentro desta página sem te tirar da experiência.",
    selectCourtToSeeLocation: "Selecione um campo para ver sua localização",
    transportRoutes: "Rotas de transporte", urban: "Urbano", trunk: "Troncal", rideshare: "Uber/InDriver",
    planWithApps: "Planejar com apps", openMoovit: "Abrir Moovit", openGoogleMaps: "Google Maps (transporte público)",
    bookYourCourtTitle: "Reservar seu campo",
    loginToReserve: "Entre para reservar",
    loginToReserveDesc: "Você precisa de uma conta para criar e salvar reservas. Vá em Minha Conta para se registrar.",
    goToAccount: "Ir para Minha Conta",
    court: "Campo", selectCourtPlaceholder: "— Selecione um campo —",
    fullNameLabel: "Nome completo *", yourName: "Seu nome", emailLabel: "Email *", emailPlaceholder: "voce@email.com",
    cellphone: "Celular *", cellphonePlaceholder: "300 000 0000", date: "Data *", hour: "Hora", duration: "Duração",
    hour1: "1 hora", hour2: "2 horas", hour3: "3 horas", modality: "Formato",
    extraServices: "Serviços extras", vest: "Colete", ball: "Bola", nightLighting: "Iluminação noturna",
    lockerRoom: "Vestiário", coveredCourt: "Campo coberto", eventTournament: "Evento / torneio",
    additionalNote: "Nota adicional", notePlaceholder: "Algo mais a informar?",
    sending: "Enviando...", submitReservation: "Enviar reserva e receber confirmação por email",
    reservationSent: "Reserva enviada!", reservationSentDesc: "Será enviada uma confirmação por email. Entraremos em contato.",
    makeAnother: "Fazer outra reserva", errorTitle: "Erro", completeAllFields: "Por favor preencha todos os campos obrigatórios.",
    slotUnavailable: "Horário indisponível", slotUnavailableDesc: "Já existe reserva nesse campo nessa data e hora. Escolha outro horário.",
    supportContact: "Suporte e contato", directCall: "Ligação direta", callAdmin: "Ligar ao admin",
    selectCourtShort: "Selecione campo", callNow: "Ligar agora", whatsappCard: "WhatsApp", writeBusiness: "Escreva ao negócio",
    openWhatsapp: "Abrir WhatsApp", supportForm: "Formulário de suporte", subject: "Assunto",
    reservationProblem: "Problema com reserva", serviceComplaint: "Reclamação de serviço", priceQuery: "Consulta de preços",
    requestInfo: "Solicitar informação", other: "Outro", contactInfo: "Celular / Email", message: "Mensagem",
    describeQuery: "Descreva sua consulta...", sendMessage: "Enviar mensagem", messageSent: "Mensagem enviada",
    willReplySoon: "Responderemos em breve.", completeNameMessage: "Complete nome e mensagem",
    myReservationsTitle: "Minhas reservas", myReservationsDesc: "Todas as reservas feitas com sua conta.",
    noReservationsYet: "Sem reservas ainda. Vá em Reservar para criar uma.",
    reservationOf: "Reserva de", status: "Status", confirmed: "Confirmada", pending: "Pendente", cancelled: "Cancelada",
    accountTitle: "Minha conta", accountDescription: "Entre ou crie uma conta para salvar suas reservas.",
    signInTab: "Entrar", signUpTab: "Cadastrar", createAccount: "Criar conta",
    alreadyHaveAccount: "Já tem conta? Entre", needAccount: "Sem conta? Cadastre-se",
    signedInAs: "Sessão como", signOutBtn: "Sair", authError: "Erro de autenticação",
    signupSuccess: "Conta criada", signupSuccessDesc: "Verifique seu email para confirmar o registro e entre.",
    loginSuccess: "Bem-vindo",
    userReviews: "Avaliações de usuários",
    loginRequired: "Login necessário",
    loginToReview: "Entre para deixar uma avaliação",
    reviewCommentRequired: "Escreva um comentário para sua avaliação.",
    reviewSubmitted: "Avaliação publicada!",
    reviewPlaceholder: "Conte como foi neste campo…",
    submitReview: "Publicar avaliação",
    noReviewsYet: "Sem avaliações. Seja o primeiro!",
    anonymousUser: "Usuário",
    rickyGreeting: "Olá! Sou Ricky Bot ⚽ Pergunte-me sobre campos, preços, horários ou reservas.",
    rickySubtitle: "Assistente do Canto do Campeão",
    rickyPlaceholder: "Digite sua pergunta…",
    rickyOpen: "Abrir chat com Ricky",
    rickyError: "Erro no chat. Tente de novo.",
    rickyRateLimit: "Muitas perguntas. Espere alguns segundos.",
    rickyNoCredits: "Sem créditos de IA. Avise o admin.",
    rickyOptionalLogin: "Entrar é opcional para conversar.",
    supportReportsLog: "Relatórios de suporte",
    supportReportsHint: "Mensagens enviadas pelo formulário.",
    noReportsYet: "Sem relatórios.",
    statusOpen: "Aberto",
    statusInProgress: "Em andamento",
    statusResolved: "Resolvido",
  },
  de: {
    appName: "Ecke des Champions",
    tagline: "Finde, vergleiche und buche den besten Platz für dein Spiel in Barranquilla",
    home: "Start",
    tournaments: "Turniere",
    courts: "Plätze", map: "Karte", routes: "Routen", reserve: "Buchen", support: "Support", myReservations: "Meine Buchungen",
    courtsHint: "Fotos, Daten, Details", mapHint: "Live-Route & Standort", routesHint: "Transport & Zugang", reserveHint: "Zeitfenster-Sperre", supportHint: "Hilfe & Kontakt", myReservationsHint: "Deine Buchungen",
    activeSection: "Aktiver Bereich", settings: "Einstellungen", settingsHint: "Sprache, Design & Admin",
    account: "Mein Konto", accountHint: "Anmelden oder registrieren",
    theme: "Design", language: "Sprache", light: "Hell", dark: "Dunkel", current: "Aktuell",
    adminAccess: "Admin-Zugang", adminDescription: "Nur dein Name und der offizielle Zugangscode nötig.",
    openPanel: "Panel öffnen", signIn: "Anmelden", signOut: "Abmelden", signUp: "Registrieren",
    email: "E-Mail", password: "Passwort", name: "Name", fullName: "Vollständiger Name",
    accessCode: "Zugangscode", unlockAdmin: "Admin freischalten",
    adminOnlyMessage: "Aktiviere Admin mit deinem Namen und dem Code, um die Seite zu bearbeiten.",
    adminPanel: "Admin-Panel", adminPanelDescription: "Branding und sichtbare Inhalte live aktualisieren.", saveChanges: "Speichern",
    adminLogs: "Zugriffslog", adminLogsDescription: "Wer hat sich als Admin angemeldet?", noLogsYet: "Noch keine Zugriffe.",
    loginRequiredToAdmin: "Melde dich an, um Admin zu aktivieren.", loggedInAs: "Angemeldet als",
    footerProject: "Ein Projekt von CUC-Studierenden, alle Rechte vorbehalten",
    footerAuthors: "Autoren", footerPhone: "Telefon", footerAddress: "Standort",
    footerNavigate: "Navigation", footerLegal: "Rechtliches", footerRights: "Alle Rechte vorbehalten",
    footerMission: "Unsere Mission", footerMissionText: "Wir verbinden Fußballfans aus Barranquilla mit den besten Kunstrasenplätzen. Einfach, schnell und sicher buchen.",
    footerContact: "Kontakt",
    heroBadge: "Barranquilla · Live-Sportbuchungen",
    heroLiveMap: "Live-Karte", heroLiveMapText: "Dein Standort und der Platz auf einem Bildschirm.",
    heroSafe: "Sichere Buchung", heroSafeText: "Belegte Zeitfenster werden automatisch gesperrt.",
    heroExperience: "Sport-Erlebnis", heroExperienceText: "Plätze mit dynamischer Navigation entdecken.",
    matchdayPanel: "Spieltag-Panel", bookYourCourt: "Buche deinen idealen Platz", live: "LIVE",
    availability: "Verfügbarkeit", activeToday: "Plätze heute aktiv", reservations: "Buchungen", realTime: "Echtzeit", autoBlock: "Auto-Sperre nach Zeitplan",
    availableCourts: "Verfügbare Plätze", viewDetails: "Details ansehen", back: "Zurück zu allen Plätzen",
    pricePerHour: "Preis pro Stunde", upToPeak: "bis Stoßzeit", schedule: "Öffnungszeiten", courtType: "Platztyp", phone: "Telefon",
    services: "Leistungen", socialLinks: "Social & Links", noLinksYet: "Bald mehr offizielle Links.",
    recentReviews: "Aktuelle Bewertungen", viewOnMap: "Auf Karte ansehen", reserveThisCourt: "Diesen Platz buchen", reviews: "Bewertungen",
    mapLocation: "Standort auf Karte", selectCourt: "— Platz wählen —",
    destination: "Ziel", selectCourtFirst: "Wähle einen Platz für die Route.",
    route: "Route", calculatingOnLocate: "Berechnung beim Aktivieren des Standorts", estimatedTime: "Geschätzte Zeit",
    enableLocation: "Aktiviere deinen Standort für die Fahrzeit.", yourLocation: "Dein Standort", notSharedYet: "Noch nicht geteilt",
    locating: "Standort wird ermittelt...", updateLocation: "Standort aktualisieren", useMyLocation: "Meinen Standort nutzen",
    showRouteFromMyLocation: "Route von meinem Standort", updateRouteFromMyLocation: "Route aktualisieren",
    routeShownInline: "Die Route wird in dieser Seite angezeigt.",
    selectCourtToSeeLocation: "Platz wählen, um Standort zu sehen",
    transportRoutes: "Verkehrsrouten", urban: "Stadt", trunk: "Hauptlinie", rideshare: "Uber/InDriver",
    planWithApps: "Mit Apps planen", openMoovit: "Moovit öffnen", openGoogleMaps: "Google Maps (Nahverkehr)",
    bookYourCourtTitle: "Platz buchen",
    loginToReserve: "Anmelden zum Buchen",
    loginToReserveDesc: "Du brauchst ein Konto, um Buchungen zu speichern. Geh zu Mein Konto, um dich zu registrieren.",
    goToAccount: "Zu Mein Konto",
    court: "Platz", selectCourtPlaceholder: "— Platz wählen —",
    fullNameLabel: "Vollständiger Name *", yourName: "Dein Name", emailLabel: "E-Mail *", emailPlaceholder: "du@email.com",
    cellphone: "Handy *", cellphonePlaceholder: "300 000 0000", date: "Datum *", hour: "Uhrzeit", duration: "Dauer",
    hour1: "1 Stunde", hour2: "2 Stunden", hour3: "3 Stunden", modality: "Format",
    extraServices: "Zusatzleistungen", vest: "Leibchen", ball: "Ball", nightLighting: "Nachtbeleuchtung",
    lockerRoom: "Umkleide", coveredCourt: "Überdachter Platz", eventTournament: "Event / Turnier",
    additionalNote: "Zusätzliche Notiz", notePlaceholder: "Möchtest du noch etwas mitteilen?",
    sending: "Senden...", submitReservation: "Buchung senden und Bestätigung per E-Mail erhalten",
    reservationSent: "Buchung gesendet!", reservationSentDesc: "Bestätigung kommt per E-Mail. Wir kontaktieren dich.",
    makeAnother: "Weitere Buchung", errorTitle: "Fehler", completeAllFields: "Bitte alle Pflichtfelder ausfüllen.",
    slotUnavailable: "Zeitfenster nicht verfügbar", slotUnavailableDesc: "Es gibt bereits eine Buchung für diesen Platz zu dieser Zeit.",
    supportContact: "Support & Kontakt", directCall: "Direktanruf", callAdmin: "Admin anrufen",
    selectCourtShort: "Platz wählen", callNow: "Jetzt anrufen", whatsappCard: "WhatsApp", writeBusiness: "Nachricht ans Geschäft",
    openWhatsapp: "WhatsApp öffnen", supportForm: "Support-Formular", subject: "Betreff",
    reservationProblem: "Problem mit Buchung", serviceComplaint: "Service-Beschwerde", priceQuery: "Preisanfrage",
    requestInfo: "Information anfordern", other: "Anderes", contactInfo: "Handy / E-Mail", message: "Nachricht",
    describeQuery: "Beschreibe deine Anfrage...", sendMessage: "Nachricht senden", messageSent: "Nachricht gesendet",
    willReplySoon: "Wir antworten bald.", completeNameMessage: "Name und Nachricht ausfüllen",
    myReservationsTitle: "Meine Buchungen", myReservationsDesc: "Alle Buchungen mit deinem Konto.",
    noReservationsYet: "Noch keine Buchungen. Geh zu Buchen, um eine zu erstellen.",
    reservationOf: "Buchung von", status: "Status", confirmed: "Bestätigt", pending: "Ausstehend", cancelled: "Storniert",
    accountTitle: "Mein Konto", accountDescription: "Anmelden oder Konto erstellen, um Buchungen zu speichern.",
    signInTab: "Anmelden", signUpTab: "Registrieren", createAccount: "Konto erstellen",
    alreadyHaveAccount: "Schon ein Konto? Anmelden", needAccount: "Kein Konto? Registrieren",
    signedInAs: "Angemeldet als", signOutBtn: "Abmelden", authError: "Authentifizierungsfehler",
    signupSuccess: "Konto erstellt", signupSuccessDesc: "Bestätige deine E-Mail und melde dich dann an.",
    loginSuccess: "Willkommen",
    userReviews: "Nutzerbewertungen",
    loginRequired: "Anmeldung erforderlich",
    loginToReview: "Melde dich an, um zu bewerten",
    reviewCommentRequired: "Schreibe einen Kommentar für deine Bewertung.",
    reviewSubmitted: "Bewertung veröffentlicht!",
    reviewPlaceholder: "Erzähl uns, wie es auf diesem Platz war…",
    submitReview: "Bewertung posten",
    noReviewsYet: "Noch keine Bewertungen. Sei der Erste!",
    anonymousUser: "Nutzer",
    rickyGreeting: "Hallo! Ich bin Ricky Bot ⚽ Frag mich zu Plätzen, Preisen, Zeiten oder Buchungen.",
    rickySubtitle: "Assistent von Champion's Corner",
    rickyPlaceholder: "Schreibe deine Frage…",
    rickyOpen: "Chat mit Ricky öffnen",
    rickyError: "Chat-Fehler. Bitte erneut versuchen.",
    rickyRateLimit: "Zu viele Fragen. Warte ein paar Sekunden.",
    rickyNoCredits: "Keine KI-Credits. Admin benachrichtigen.",
    rickyOptionalLogin: "Anmeldung ist optional für den Chat.",
    supportReportsLog: "Support-Meldungen",
    supportReportsHint: "Nachrichten aus dem Support-Formular.",
    noReportsYet: "Noch keine Meldungen.",
    statusOpen: "Offen",
    statusInProgress: "In Bearbeitung",
    statusResolved: "Gelöst",
  },
};
