import { Phone, MapPin, Users, Trophy, Mail, Instagram, Facebook, Github, Shield, HelpCircle } from "lucide-react";
import { useState } from "react";
import logoImage from "@/assets/logo-rincon.png";
import type { Translation } from "@/lib/i18n";
import type { Tab } from "@/components/NavTabs";
import type { BrandingSettings } from "@/lib/configuracion-sitio";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface FooterProps {
  branding: BrandingSettings;
  text: Translation;
  onNavigate: (tab: Tab) => void;
}

const POLICIES = [
  { title: "Política de reservas", content: "Las reservas deben hacerse con mínimo 2 horas de anticipación para permitir la preparación de la cancha. Cada reserva es por un mínimo de 1 hora y máximo de 3 horas (6 horas para torneos)." },
  { title: "Política de cancelación", content: "Las reservas pueden cancelarse con al menos 16 horas de anticipación. Cancelaciones fuera de este plazo no serán procesadas para evitar cancelaciones de último momento que afecten al establecimiento." },
  { title: "Política de pagos", content: "Se requiere un pago parcial del 30% del total para confirmar la reserva. El saldo restante se paga en el sitio el día de la reserva. También se ofrece la opción de pago completo (100%)." },
  { title: "Política de torneos", content: "Los torneos tienen una duración máxima de 6 horas diarias. La reserva del torneo incluye un cargo adicional de $150.000. La cancelación de la reserva financiera del torneo implica la eliminación del torneo." },
  { title: "Servicios adicionales", content: "Peto/chaleco: $5.000 por persona. Balón: $15.000. Refrigerio/bebidas: $25.000 (10 unidades de 350ml). Camerino: $75.000. Evento/torneo: $150.000. Todos estos costos se suman al precio base de la cancha." },
  { title: "Reservas recurrentes", content: "Las reservas semanales y mensuales requieren una fecha de finalización. Se enviará confirmación por cada periodo reservado. Se requiere coordinación directa con la cancha." },
  { title: "Conducta de los usuarios", content: "Está prohibido el uso de lenguaje obsceno, grosero o vulgar en reseñas, biografías, nombres y cualquier contenido de la plataforma. Las infracciones serán registradas y pueden resultar en baneo temporal o permanente." },
  { title: "Política de privacidad", content: "Los datos personales proporcionados durante el registro y la reserva son utilizados exclusivamente para la gestión de la plataforma. No compartimos información con terceros sin consentimiento del usuario." },
  { title: "Horarios de canchas", content: "Cada cancha tiene horarios específicos de operación. Las horas fuera del horario de operación no están disponibles para reserva. Después de las 6:00 PM, la iluminación es obligatoria en todas las canchas." },
  { title: "Responsabilidad", content: "La plataforma actúa como intermediaria entre usuarios y establecimientos deportivos. No nos hacemos responsables por lesiones o daños durante el uso de las instalaciones." },
];

const FAQ = [
  { q: "¿Cómo creo una cuenta?", a: "Ve a la sección 'Mi Cuenta' y selecciona 'Crear cuenta'. Ingresa tu nombre, correo electrónico y contraseña (debes confirmarla). Acepta las políticas y recibirás un correo de verificación." },
  { q: "¿Cómo inicio sesión?", a: "En 'Mi Cuenta', selecciona 'Iniciar sesión' e ingresa tu correo electrónico y contraseña registrados." },
  { q: "¿Cómo reservo una cancha?", a: "Ve a la sección 'Reservar', selecciona una cancha, elige la fecha y hora en el calendario, completa tus datos, selecciona servicios adicionales si deseas y envía la reserva. Recibirás una confirmación por correo." },
  { q: "¿Cómo funciona el calendario?", a: "El calendario muestra la disponibilidad en colores: verde = disponible, naranja = algunas horas ocupadas, rojo = sin disponibilidad, gris = día pasado, rayado = cancha cerrada. Al seleccionar un día se muestran las horas disponibles." },
  { q: "¿Puedo cancelar una reserva?", a: "Sí, pero solo con al menos 16 horas de anticipación. Ve a 'Mis Reservas' y presiona el botón de eliminar. Recibirás un correo de confirmación de la cancelación." },
  { q: "¿Cómo funcionan las reservas recurrentes?", a: "Al reservar, puedes elegir una reserva semanal o mensual y seleccionar la fecha de finalización. Se te enviará un correo por cada periodo reservado." },
  { q: "¿Cómo funciona el pago?", a: "Puedes elegir pago parcial (30% de depósito) o pago completo (100%). Los métodos disponibles son Nequi, Daviplata, Bancolombia y PSE. Después de pagar, envía el comprobante por WhatsApp o correo." },
  { q: "¿Qué son los servicios adicionales?", a: "Son extras que puedes agregar a tu reserva: Peto/chaleco ($5.000/persona), Balón ($15.000), Refrigerio/bebidas ($25.000), Camerino ($75.000), y Evento/torneo ($150.000). Se suman al costo base." },
  { q: "¿Cómo funcionan los torneos?", a: "En la sección 'Torneos' puedes ver torneos programados o crear uno propio. Los torneos permiten duración de hasta 6 horas por día. Para la parte financiera, se te redireccionará a la sección de reservas." },
  { q: "¿Cómo creo un torneo?", a: "Inicia sesión, ve a 'Torneos' y presiona 'Crear torneo'. Selecciona cancha, fechas, modalidad y detalles. Luego deberás completar la reserva financiera en la sección de reservas." },
  { q: "¿Cómo veo las rutas de transporte?", a: "En la sección 'Rutas', selecciona una cancha y el tipo de transporte (Urbano, Troncal, Uber/InDriver). Verás los pasos de la ruta punto a punto y podrás abrir las apps de Moovit o Google Maps." },
  { q: "¿Cómo funciona el mapa?", a: "La sección 'Mapa' muestra la ubicación de la cancha seleccionada. Puedes activar tu ubicación para ver la distancia y el tiempo estimado de llegada." },
  { q: "¿Cómo dejo una reseña?", a: "En la página de detalle de una cancha, desplázate hasta la sección de reseñas. Inicia sesión, selecciona tu calificación (1-5 estrellas) y escribe tu comentario." },
  { q: "¿Qué es el Ricky Bot?", a: "Es un asistente virtual que responde preguntas sobre canchas, precios, horarios y reservas. Haz clic en el ícono de chat flotante para abrir la conversación." },
  { q: "¿Cómo contacto al soporte?", a: "En la sección 'Soporte' puedes llamar directamente, enviar un WhatsApp al equipo, o llenar el formulario de soporte. También puedes escribir al WhatsApp directo (+57 301479033) para respuesta inmediata." },
  { q: "¿Puedo personalizar mi perfil?", a: "Sí, en 'Mi Cuenta' presiona 'Personalizar perfil' para cambiar tu avatar, nombre, biografía y país." },
  { q: "¿Qué pasa si uso lenguaje inapropiado?", a: "La plataforma tiene un filtro de palabras. El uso de lenguaje obsceno genera una infracción en tu cuenta. Los administradores pueden aplicar baneo temporal o permanente según la gravedad." },
];

const FooterSection = ({ branding, text, onNavigate }: FooterProps) => {
  const [policiesOpen, setPoliciesOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const year = new Date().getFullYear();
  const navItems: { tab: Tab; label: string }[] = [
    { tab: "canchas", label: text.courts },
    { tab: "mapa", label: text.map },
    { tab: "rutas", label: text.routes },
    { tab: "reservar", label: text.reserve },
    { tab: "soporte", label: text.support },
  ];

  return (
    <>
      <footer className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mt-16 bg-[hsl(220_55%_8%)] text-white">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-primary to-accent" />
        <div className="mx-auto max-w-7xl px-6 py-14 md:px-10">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/5 p-2 ring-1 ring-white/10">
                  <img src={logoImage} alt={branding.siteName} className="h-14 w-14 object-contain" />
                </div>
                <div>
                  <p className="text-lg font-extrabold leading-tight">{branding.siteName}</p>
                  <p className="text-[10px] uppercase tracking-widest text-primary">Reservación de Fútbol</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/65">{text.footerMissionText}</p>
              <div className="mt-5 flex gap-2">
                <a href="#" className="rounded-full border border-white/15 p-2 text-white/75 transition hover:bg-white/10 hover:text-white"><Instagram className="h-4 w-4" /></a>
                <a href="#" className="rounded-full border border-white/15 p-2 text-white/75 transition hover:bg-white/10 hover:text-white"><Facebook className="h-4 w-4" /></a>
                <a href={`mailto:contacto@rincondelcampeon.com`} className="rounded-full border border-white/15 p-2 text-white/75 transition hover:bg-white/10 hover:text-white"><Mail className="h-4 w-4" /></a>
              </div>
            </div>

            <div>
              <h4 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary"><Trophy className="h-4 w-4" />{text.footerNavigate}</h4>
              <ul className="space-y-2.5 text-sm text-white/75">
                {navItems.map((item) => (
                  <li key={item.tab}>
                    <button onClick={() => onNavigate(item.tab)} className="transition hover:text-primary">{item.label}</button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary"><Phone className="h-4 w-4" />{text.footerContact}</h4>
              <ul className="space-y-3 text-sm text-white/75">
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/45">{text.footerPhone}</p>
                    <a href={`tel:${branding.phone}`} className="font-semibold text-white hover:text-primary">{branding.phone}</a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/45">{text.footerAddress}</p>
                    <p className="font-semibold text-white">{branding.address}</p>
                  </div>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary"><Users className="h-4 w-4" />{text.footerAuthors}</h4>
              <ul className="space-y-2 text-sm text-white/75">
                {branding.authors.map((author) => (
                  <li key={author} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{author}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3 text-[11px] leading-relaxed text-white/60">
                {branding.footerNote}
              </p>
            </div>
          </div>

          {/* Policies & FAQ buttons */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button onClick={() => setPoliciesOpen(true)} className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white">
              <Shield className="h-4 w-4 text-primary" /> {text.policiesTitle}
            </button>
            <button onClick={() => setFaqOpen(true)} className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white">
              <HelpCircle className="h-4 w-4 text-primary" /> {text.faqTitle}
            </button>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/55 md:flex-row">
            <p>© {year} {branding.siteName}. {text.footerRights}.</p>
            <p className="flex items-center gap-2"><Github className="h-3.5 w-3.5" /> CUC · Corporación Universidad de la Costa</p>
          </div>
        </div>
      </footer>

      {/* Policies Dialog */}
      <Dialog open={policiesOpen} onOpenChange={setPoliciesOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> {text.policiesTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {POLICIES.map((p, i) => (
              <div key={i} className="rounded-lg border border-border bg-muted/30 p-4">
                <h4 className="mb-2 text-sm font-bold text-foreground">{p.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.content}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* FAQ Dialog */}
      <Dialog open={faqOpen} onOpenChange={setFaqOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><HelpCircle className="h-5 w-5 text-primary" /> {text.faqTitle}</DialogTitle>
          </DialogHeader>
          <p className="mb-4 text-sm text-muted-foreground">{text.faqSubtitle}</p>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <details key={i} className="rounded-lg border border-border bg-muted/20 p-3 [&[open]]:bg-muted/40">
                <summary className="cursor-pointer text-sm font-semibold text-foreground hover:text-primary">{item.q}</summary>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FooterSection;
