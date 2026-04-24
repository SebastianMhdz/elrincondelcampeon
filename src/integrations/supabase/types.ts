export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          accessed_at: string
          admin_name: string
          id: string
          ip_info: string | null
          user_id: string | null
        }
        Insert: {
          accessed_at?: string
          admin_name: string
          id?: string
          ip_info?: string | null
          user_id?: string | null
        }
        Update: {
          accessed_at?: string
          admin_name?: string
          id?: string
          ip_info?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cancha_reviews: {
        Row: {
          cancha_id: string
          comment: string
          created_at: string
          id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cancha_id: string
          comment: string
          created_at?: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cancha_id?: string
          comment?: string
          created_at?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cancha_reviews_cancha_id_fkey"
            columns: ["cancha_id"]
            isOneToOne: false
            referencedRelation: "canchas"
            referencedColumns: ["id"]
          },
        ]
      }
      canchas: {
        Row: {
          addr: string
          created_at: string
          hours: string | null
          icon: string | null
          id: string
          image_url: string | null
          lat: number
          legacy_id: number | null
          lng: number
          name: string
          phone: string | null
          precio: string | null
          precio_min: number | null
          rating: number | null
          reviews: Json
          reviews_count: number | null
          rutas: Json
          servicios: Json
          tipo: string | null
          updated_at: string
        }
        Insert: {
          addr: string
          created_at?: string
          hours?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          lat: number
          legacy_id?: number | null
          lng: number
          name: string
          phone?: string | null
          precio?: string | null
          precio_min?: number | null
          rating?: number | null
          reviews?: Json
          reviews_count?: number | null
          rutas?: Json
          servicios?: Json
          tipo?: string | null
          updated_at?: string
        }
        Update: {
          addr?: string
          created_at?: string
          hours?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          lat?: number
          legacy_id?: number | null
          lng?: number
          name?: string
          phone?: string | null
          precio?: string | null
          precio_min?: number | null
          rating?: number | null
          reviews?: Json
          reviews_count?: number | null
          rutas?: Json
          servicios?: Json
          tipo?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      chat_logs: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          country: string | null
          created_at: string
          custom_name: string | null
          display_name: string | null
          id: string
          preferred_locale: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          custom_name?: string | null
          display_name?: string | null
          id?: string
          preferred_locale?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          custom_name?: string | null
          display_name?: string | null
          id?: string
          preferred_locale?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          cancha_id: string
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          duration_hours: number
          extras: Json
          format_label: string | null
          id: string
          note: string | null
          reservation_date: string
          start_time: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cancha_id: string
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          duration_hours?: number
          extras?: Json
          format_label?: string | null
          id?: string
          note?: string | null
          reservation_date: string
          start_time: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cancha_id?: string
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          duration_hours?: number
          extras?: Json
          format_label?: string | null
          id?: string
          note?: string | null
          reservation_date?: string
          start_time?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_cancha_id_fkey"
            columns: ["cancha_id"]
            isOneToOne: false
            referencedRelation: "canchas"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      support_reports: {
        Row: {
          admin_notes: string | null
          category: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          category?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          category?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tournament_announcements: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          title: string
          tournament_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          title: string
          tournament_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          title?: string
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_announcements_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_signups: {
        Row: {
          contact_phone: string | null
          created_at: string
          id: string
          notes: string | null
          status: string
          team_name: string
          tournament_id: string
          user_id: string
        }
        Insert: {
          contact_phone?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          status?: string
          team_name: string
          tournament_id: string
          user_id: string
        }
        Update: {
          contact_phone?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          status?: string
          team_name?: string
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_signups_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          banner_url: string | null
          cancha_id: string
          contact_phone: string | null
          created_at: string
          description: string | null
          end_date: string
          entry_fee: string | null
          format: string
          id: string
          max_teams: number
          name: string
          organizer_id: string
          prize: string | null
          signups_open: boolean
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          cancha_id: string
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          end_date: string
          entry_fee?: string | null
          format?: string
          id?: string
          max_teams?: number
          name: string
          organizer_id: string
          prize?: string | null
          signups_open?: boolean
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          cancha_id?: string
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          end_date?: string
          entry_fee?: string | null
          format?: string
          id?: string
          max_teams?: number
          name?: string
          organizer_id?: string
          prize?: string | null
          signups_open?: boolean
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournaments_cancha_id_fkey"
            columns: ["cancha_id"]
            isOneToOne: false
            referencedRelation: "canchas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_reservation_slot_available: {
        Args: {
          _cancha_id: string
          _reservation_date: string
          _start_time: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
