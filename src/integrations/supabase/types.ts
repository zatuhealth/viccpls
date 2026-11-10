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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      clinic_messages: {
        Row: {
          body: string
          child_name: string
          created_at: string
          household_id: string
          id: string
          read_at: string | null
          replied_at: string | null
          replied_by: string | null
          reply_body: string | null
          sender_id: string
        }
        Insert: {
          body: string
          child_name?: string
          created_at?: string
          household_id: string
          id?: string
          read_at?: string | null
          replied_at?: string | null
          replied_by?: string | null
          reply_body?: string | null
          sender_id: string
        }
        Update: {
          body?: string
          child_name?: string
          created_at?: string
          household_id?: string
          id?: string
          read_at?: string | null
          replied_at?: string | null
          replied_by?: string | null
          reply_body?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_messages_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_parent_links: {
        Row: {
          clinic_household_id: string
          created_at: string
          created_by: string
          id: string
          parent_email: string
          parent_household_id: string | null
        }
        Insert: {
          clinic_household_id: string
          created_at?: string
          created_by: string
          id?: string
          parent_email: string
          parent_household_id?: string | null
        }
        Update: {
          clinic_household_id?: string
          created_at?: string
          created_by?: string
          id?: string
          parent_email?: string
          parent_household_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinic_parent_links_clinic_household_id_fkey"
            columns: ["clinic_household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_parent_links_parent_household_id_fkey"
            columns: ["parent_household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_payments: {
        Row: {
          amount: number
          created_at: string
          household_id: string
          id: string
          method: string
          recorded_by: string
          reference: string
        }
        Insert: {
          amount: number
          created_at?: string
          household_id: string
          id?: string
          method: string
          recorded_by: string
          reference?: string
        }
        Update: {
          amount?: number
          created_at?: string
          household_id?: string
          id?: string
          method?: string
          recorded_by?: string
          reference?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_payments_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_staff: {
        Row: {
          added_by: string | null
          clinic_household_id: string | null
          created_at: string
          email: string
          id: string
          occupation: string
          role: string
          user_id: string | null
        }
        Insert: {
          added_by?: string | null
          clinic_household_id?: string | null
          created_at?: string
          email: string
          id?: string
          occupation?: string
          role?: string
          user_id?: string | null
        }
        Update: {
          added_by?: string | null
          clinic_household_id?: string | null
          created_at?: string
          email?: string
          id?: string
          occupation?: string
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinic_staff_clinic_household_id_fkey"
            columns: ["clinic_household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      family_welcome_deliveries: {
        Row: {
          channel: string
          created_at: string
          household_id: string
          id: string
          processed_at: string | null
          recipient: string
          status: string
        }
        Insert: {
          channel: string
          created_at?: string
          household_id: string
          id?: string
          processed_at?: string | null
          recipient: string
          status?: string
        }
        Update: {
          channel?: string
          created_at?: string
          household_id?: string
          id?: string
          processed_at?: string | null
          recipient?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_welcome_deliveries_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      household_invites: {
        Row: {
          code: string
          created_at: string
          created_by: string
          household_id: string
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by: string
          household_id: string
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string
          household_id?: string
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "household_invites_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      household_members: {
        Row: {
          created_at: string
          household_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          household_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          household_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          created_at: string
          data: Json
          id: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      parent_text_consents: {
        Row: {
          actor_id: string | null
          enabled: boolean
          household_id: string
          id: string
          phone: string
          recorded_at: string
        }
        Insert: {
          actor_id?: string | null
          enabled: boolean
          household_id: string
          id?: string
          phone: string
          recorded_at?: string
        }
        Update: {
          actor_id?: string | null
          enabled?: boolean
          household_id?: string
          id?: string
          phone?: string
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_text_consents_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_admins: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vaccine_sms_deliveries: {
        Row: {
          created_at: string
          dose_id: string
          due_date: string
          household_id: string
          id: string
          member_id: string
          parent_confirmed_at: string | null
          processed_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          dose_id: string
          due_date: string
          household_id: string
          id?: string
          member_id: string
          parent_confirmed_at?: string | null
          processed_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          dose_id?: string
          due_date?: string
          household_id?: string
          id?: string
          member_id?: string
          parent_confirmed_at?: string | null
          processed_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "vaccine_sms_deliveries_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invite: { Args: { _code: string }; Returns: string }
      accept_pending_clinic_links: { Args: never; Returns: undefined }
      claim_clinic_staff: { Args: never; Returns: string }
      clinic_role: { Args: never; Returns: string }
      clinic_role_for: { Args: { _hid: string }; Returns: string }
      confirm_vaccine_text: { Args: { _id: string }; Returns: undefined }
      is_household_member: { Args: { _hid: string }; Returns: boolean }
      is_platform_admin: { Args: never; Returns: boolean }
      mark_clinic_message_read: { Args: { _id: string }; Returns: undefined }
      my_clinic: { Args: never; Returns: string }
      my_household: { Args: never; Returns: string }
      parent_clinic_contacts: { Args: never; Returns: Json }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
