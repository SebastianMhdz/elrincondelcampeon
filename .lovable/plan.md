Voy a organizar los archivos generados con nombres en español y actualizar todas sus referencias para que el proyecto siga compilando correctamente.

Alcance propuesto:

1. Renombrar componentes principales a español
   - `HomeSection.tsx` → `SeccionInicio.tsx`
   - `AccountSection.tsx` → `SeccionCuenta.tsx`
   - `ProfileEditor.tsx` → `EditorPerfil.tsx`
   - `UserAvatar.tsx` → `AvatarUsuario.tsx`
   - `UserMenu.tsx` → `MenuUsuario.tsx`
   - `CanchaAdminPanel.tsx` → `PanelAdminCanchas.tsx`
   - `AdminReportsLog.tsx` → `RegistroReportesAdmin.tsx`
   - `SettingsPanel.tsx` → `PanelConfiguracion.tsx`
   - `TorneosSection.tsx` → `SeccionTorneos.tsx`
   - `TournamentDetail.tsx` → `DetalleTorneo.tsx`
   - `TournamentForm.tsx` → `FormularioTorneo.tsx`
   - `MapSection.tsx` → `SeccionMapa.tsx`
   - `MapRoutePanel.tsx` → `PanelRutaMapa.tsx`
   - `RickyBot.tsx` → `ChatRicky.tsx`
   - Mantener `ui/` sin cambios porque son componentes base de shadcn y renombrarlos aumentaría mucho el riesgo.

2. Renombrar librerías generadas a español
   - `profile.ts` → `perfil.ts`
   - `avatars.ts` → `avatares.ts`
   - `tournaments.ts` → `torneos.ts`
   - `site-settings.ts` → `configuracion-sitio.ts`
   - `canchas-db.ts` → `canchas-bd.ts`
   - `admin.ts` → `administrador.ts`
   - Mantener `i18n.ts`, `theme.ts` y `utils.ts` porque son nombres técnicos estándar y fáciles de reconocer en GitHub.

3. Renombrar funciones del backend a español cuando sea seguro
   - `admin-access` → `acceso-admin`
   - `ricky-chat` → `chat-ricky`
   - Actualizar las llamadas desde el frontend para que usen los nuevos nombres.
   - Mantener migraciones SQL con sus nombres actuales, porque renombrarlas puede confundir el historial ya aplicado de la base de datos.

4. Actualizar imports y referencias internas
   - Cambiar todos los imports en `src/pages/Index.tsx`, componentes y librerías afectadas.
   - Actualizar referencias entre componentes, por ejemplo mapa, torneos, cuenta, perfil, soporte y panel admin.
   - Revisar llamadas al backend del chatbot y acceso admin para que apunten a los nombres nuevos.

5. Verificar que todo siga funcionando
   - Ejecutar revisión de tipos con TypeScript.
   - Revisar que no queden imports apuntando a archivos antiguos.
   - Corregir cualquier referencia rota antes de terminar.

Resultado esperado:

```text
src/components/
  SeccionInicio.tsx
  SeccionCuenta.tsx
  EditorPerfil.tsx
  AvatarUsuario.tsx
  MenuUsuario.tsx
  PanelAdminCanchas.tsx
  RegistroReportesAdmin.tsx
  PanelConfiguracion.tsx
  SeccionTorneos.tsx
  DetalleTorneo.tsx
  FormularioTorneo.tsx
  SeccionMapa.tsx
  PanelRutaMapa.tsx
  ChatRicky.tsx

src/lib/
  perfil.ts
  avatares.ts
  torneos.ts
  configuracion-sitio.ts
  canchas-bd.ts
  administrador.ts

supabase/functions/
  acceso-admin/
  chat-ricky/
```

Notas técnicas:
- No cambiaré tablas de base de datos como `profiles` o `tournaments`, porque eso requeriría migraciones delicadas y podría romper datos existentes.
- No cambiaré archivos autogenerados de integración ni tipos.
- El objetivo es que al exportarlo a GitHub sea más entendible sin afectar la app.