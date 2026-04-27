import { useEffect, useMemo, useState } from "react";
import { BarChart3, Database, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type TablaAdmin = "reservations" | "tournaments" | "tournament_signups" | "support_reports" | "canchas" | "profiles" | "cancha_reviews" | "chat_logs";

interface ConfigTabla {
  key: TablaAdmin;
  label: string;
  descripcion: string;
  columnas: string[];
  orden: string;
}

const tablas: ConfigTabla[] = [
  { key: "reservations", label: "Reservas", descripcion: "Reservas creadas por los usuarios", columnas: ["created_at", "customer_name", "customer_email", "reservation_date", "start_time", "status"], orden: "created_at" },
  { key: "tournaments", label: "Torneos", descripcion: "Torneos publicados y su estado", columnas: ["created_at", "name", "format", "start_date", "end_date", "status"], orden: "created_at" },
  { key: "tournament_signups", label: "Inscripciones", descripcion: "Equipos inscritos en torneos", columnas: ["created_at", "team_name", "contact_phone", "status", "tournament_id"], orden: "created_at" },
  { key: "support_reports", label: "Soporte", descripcion: "Mensajes enviados al equipo", columnas: ["created_at", "name", "email", "subject", "status"], orden: "created_at" },
  { key: "canchas", label: "Canchas", descripcion: "Canchas disponibles en la pagina", columnas: ["name", "addr", "precio", "rating", "reviews_count", "updated_at"], orden: "updated_at" },
  { key: "profiles", label: "Perfiles", descripcion: "Usuarios con perfil creado", columnas: ["created_at", "display_name", "custom_name", "country", "preferred_locale"], orden: "created_at" },
  { key: "cancha_reviews", label: "Reseñas", descripcion: "Opiniones sobre las canchas", columnas: ["created_at", "rating", "comment", "cancha_id", "user_id"], orden: "created_at" },
  { key: "chat_logs", label: "Chat", descripcion: "Historial del asistente", columnas: ["created_at", "role", "content", "user_id"], orden: "created_at" },
];

type FilasPorTabla = Record<TablaAdmin, Record<string, unknown>[]>;
type TotalesPorTabla = Record<TablaAdmin, number>;

const vacioFilas = tablas.reduce((acc, tabla) => ({ ...acc, [tabla.key]: [] }), {} as FilasPorTabla);
const vacioTotales = tablas.reduce((acc, tabla) => ({ ...acc, [tabla.key]: 0 }), {} as TotalesPorTabla);

const formatearValor = (valor: unknown) => {
  if (valor === null || valor === undefined || valor === "") return "Sin dato";
  if (typeof valor === "boolean") return valor ? "Si" : "No";
  if (typeof valor === "object") return JSON.stringify(valor);
  const texto = String(valor);
  if (/^\d{4}-\d{2}-\d{2}T/.test(texto)) return new Date(texto).toLocaleString();
  return texto;
};

const PanelBasesDatosAdmin = () => {
  const { toast } = useToast();
  const [filas, setFilas] = useState<FilasPorTabla>(vacioFilas);
  const [totales, setTotales] = useState<TotalesPorTabla>(vacioTotales);
  const [cargando, setCargando] = useState(true);
  const [activa, setActiva] = useState<TablaAdmin>("reservations");

  const resumen = useMemo(() => [
    { label: "Reservas", value: totales.reservations },
    { label: "Torneos", value: totales.tournaments },
    { label: "Reportes", value: totales.support_reports },
    { label: "Canchas", value: totales.canchas },
  ], [totales]);

  const cargarDatos = async () => {
    setCargando(true);
    const resultados = await Promise.all(tablas.map(async (tabla) => {
      const { data, error, count } = await supabase
        .from(tabla.key)
        .select("*", { count: "exact" })
        .order(tabla.orden, { ascending: false })
        .limit(25);
      return { tabla, data: (data ?? []) as Record<string, unknown>[], count: count ?? 0, error };
    }));

    const error = resultados.find((resultado) => resultado.error)?.error;
    if (error) toast({ title: "No se pudo cargar el control", description: error.message, variant: "destructive" });

    setFilas(resultados.reduce((acc, resultado) => ({ ...acc, [resultado.tabla.key]: resultado.data }), {} as FilasPorTabla));
    setTotales(resultados.reduce((acc, resultado) => ({ ...acc, [resultado.tabla.key]: resultado.count }), {} as TotalesPorTabla));
    setCargando(false);
  };

  useEffect(() => { cargarDatos(); }, []);

  const tablaActual = tablas.find((tabla) => tabla.key === activa) ?? tablas[0];

  return (
    <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground"><Database className="h-4 w-4 text-primary" /> Control de datos</div>
          <p className="text-xs text-muted-foreground">Vista general para revisar reservas, torneos, soporte y actividad.</p>
        </div>
        <Button variant="outline" size="sm" onClick={cargarDatos} disabled={cargando} className="gap-2">
          {cargando ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Actualizar
        </Button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {resumen.map((item) => (
          <div key={item.label} className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-foreground"><BarChart3 className="h-4 w-4 text-primary" /> {item.value}</p>
          </div>
        ))}
      </div>

      <Tabs value={activa} onValueChange={(value) => setActiva(value as TablaAdmin)} className="w-full">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 overflow-x-auto">
          {tablas.map((tabla) => <TabsTrigger key={tabla.key} value={tabla.key} className="text-xs">{tabla.label}</TabsTrigger>)}
        </TabsList>
        <TabsContent value={activa} className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">{tablaActual.descripcion}</p>
            <Badge variant="secondary">{totales[tablaActual.key]} registros</Badge>
          </div>
          <div className="max-h-80 overflow-auto rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  {tablaActual.columnas.map((columna) => <TableHead key={columna} className="whitespace-nowrap text-xs">{columna.replace(/_/g, " ")}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {cargando ? (
                  <TableRow><TableCell colSpan={tablaActual.columnas.length} className="text-center text-xs text-muted-foreground">Cargando datos</TableCell></TableRow>
                ) : filas[tablaActual.key].length === 0 ? (
                  <TableRow><TableCell colSpan={tablaActual.columnas.length} className="text-center text-xs text-muted-foreground">No hay registros</TableCell></TableRow>
                ) : filas[tablaActual.key].map((fila, index) => (
                  <TableRow key={`${tablaActual.key}-${String(fila.id ?? index)}`}>
                    {tablaActual.columnas.map((columna) => <TableCell key={columna} className="max-w-56 truncate text-xs">{formatearValor(fila[columna])}</TableCell>)}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PanelBasesDatosAdmin;