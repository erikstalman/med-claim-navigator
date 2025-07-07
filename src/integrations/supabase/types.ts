export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: Database["public"]["Enums"]["activity_action"]
          case_id: string | null
          case_name: string | null
          details: string | null
          id: string
          ip_address: string | null
          timestamp: string
          user_id: string
          user_name: string
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          action: Database["public"]["Enums"]["activity_action"]
          case_id?: string | null
          case_name?: string | null
          details?: string | null
          id: string
          ip_address?: string | null
          timestamp?: string
          user_id: string
          user_name: string
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          action?: Database["public"]["Enums"]["activity_action"]
          case_id?: string | null
          case_name?: string | null
          details?: string | null
          id?: string
          ip_address?: string | null
          timestamp?: string
          user_id?: string
          user_name?: string
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "patient_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_rules: {
        Row: {
          actions: Json | null
          conditions: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          rule_type: string
          updated_at: string
        }
        Insert: {
          actions?: Json | null
          conditions?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id: string
          is_active?: boolean
          name: string
          rule_type: string
          updated_at?: string
        }
        Update: {
          actions?: Json | null
          conditions?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          rule_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          case_id: string
          id: string
          is_read: boolean
          message: string
          message_type: string | null
          recipient_id: string | null
          recipient_name: string | null
          recipient_role: Database["public"]["Enums"]["user_role"] | null
          sender_id: string
          sender_name: string
          sender_role: Database["public"]["Enums"]["user_role"]
          timestamp: string
        }
        Insert: {
          case_id: string
          id: string
          is_read?: boolean
          message: string
          message_type?: string | null
          recipient_id?: string | null
          recipient_name?: string | null
          recipient_role?: Database["public"]["Enums"]["user_role"] | null
          sender_id: string
          sender_name: string
          sender_role: Database["public"]["Enums"]["user_role"]
          timestamp?: string
        }
        Update: {
          case_id?: string
          id?: string
          is_read?: boolean
          message?: string
          message_type?: string | null
          recipient_id?: string | null
          recipient_name?: string | null
          recipient_role?: Database["public"]["Enums"]["user_role"] | null
          sender_id?: string
          sender_name?: string
          sender_role?: Database["public"]["Enums"]["user_role"]
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "patient_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          case_id: string
          category: Database["public"]["Enums"]["document_category"]
          content: string | null
          created_at: string
          file_path: string | null
          file_url: string | null
          id: string
          name: string
          pages: number | null
          size_mb: number | null
          type: string
          upload_date: string
          uploaded_by: string | null
          uploaded_by_name: string | null
        }
        Insert: {
          case_id: string
          category: Database["public"]["Enums"]["document_category"]
          content?: string | null
          created_at?: string
          file_path?: string | null
          file_url?: string | null
          id: string
          name: string
          pages?: number | null
          size_mb?: number | null
          type: string
          upload_date?: string
          uploaded_by?: string | null
          uploaded_by_name?: string | null
        }
        Update: {
          case_id?: string
          category?: Database["public"]["Enums"]["document_category"]
          content?: string | null
          created_at?: string
          file_path?: string | null
          file_url?: string | null
          id?: string
          name?: string
          pages?: number | null
          size_mb?: number | null
          type?: string
          upload_date?: string
          uploaded_by?: string | null
          uploaded_by_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "patient_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_cases: {
        Row: {
          accident_date: string
          accident_location: string | null
          address: string | null
          admin_assigned: string | null
          admin_id: string | null
          claim_amount: string | null
          contact_number: string | null
          created_at: string
          created_by: string | null
          description: string | null
          doctor_assigned: string | null
          doctor_id: string | null
          email: string | null
          evaluation_status: string | null
          id: string
          injury_type: string
          insurance_policy: string | null
          last_updated: string
          patient_age: number | null
          patient_gender: string | null
          patient_name: string
          priority: Database["public"]["Enums"]["case_priority"]
          status: Database["public"]["Enums"]["case_status"]
          submission_date: string
        }
        Insert: {
          accident_date: string
          accident_location?: string | null
          address?: string | null
          admin_assigned?: string | null
          admin_id?: string | null
          claim_amount?: string | null
          contact_number?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          doctor_assigned?: string | null
          doctor_id?: string | null
          email?: string | null
          evaluation_status?: string | null
          id: string
          injury_type: string
          insurance_policy?: string | null
          last_updated?: string
          patient_age?: number | null
          patient_gender?: string | null
          patient_name: string
          priority?: Database["public"]["Enums"]["case_priority"]
          status?: Database["public"]["Enums"]["case_status"]
          submission_date?: string
        }
        Update: {
          accident_date?: string
          accident_location?: string | null
          address?: string | null
          admin_assigned?: string | null
          admin_id?: string | null
          claim_amount?: string | null
          contact_number?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          doctor_assigned?: string | null
          doctor_id?: string | null
          email?: string | null
          evaluation_status?: string | null
          id?: string
          injury_type?: string
          insurance_policy?: string | null
          last_updated?: string
          patient_age?: number | null
          patient_gender?: string | null
          patient_name?: string
          priority?: Database["public"]["Enums"]["case_priority"]
          status?: Database["public"]["Enums"]["case_status"]
          submission_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_cases_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_cases_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_cases_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          last_login: string | null
          license_number: string | null
          name: string
          role: Database["public"]["Enums"]["user_role"]
          specialization: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          is_active?: boolean
          last_login?: string | null
          license_number?: string | null
          name: string
          role?: Database["public"]["Enums"]["user_role"]
          specialization?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          license_number?: string | null
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          specialization?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      activity_action:
        | "LOGIN"
        | "LOGOUT"
        | "CREATE_CASE"
        | "UPDATE_CASE"
        | "DELETE_CASE"
        | "ASSIGN_CASE"
        | "UPLOAD_DOCUMENTS"
        | "SAVE_EVALUATION"
        | "SUBMIT_EVALUATION"
        | "CREATE_USER"
        | "DEACTIVATE_USER"
      case_priority: "low" | "medium" | "high"
      case_status:
        | "pending-evaluation"
        | "under-review"
        | "completed"
        | "rejected"
      document_category:
        | "medical"
        | "imaging"
        | "legal"
        | "treatment"
        | "patient-claim"
        | "administrative"
        | "other"
      user_role: "admin" | "doctor" | "system-admin"
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
      activity_action: [
        "LOGIN",
        "LOGOUT",
        "CREATE_CASE",
        "UPDATE_CASE",
        "DELETE_CASE",
        "ASSIGN_CASE",
        "UPLOAD_DOCUMENTS",
        "SAVE_EVALUATION",
        "SUBMIT_EVALUATION",
        "CREATE_USER",
        "DEACTIVATE_USER",
      ],
      case_priority: ["low", "medium", "high"],
      case_status: [
        "pending-evaluation",
        "under-review",
        "completed",
        "rejected",
      ],
      document_category: [
        "medical",
        "imaging",
        "legal",
        "treatment",
        "patient-claim",
        "administrative",
        "other",
      ],
      user_role: ["admin", "doctor", "system-admin"],
    },
  },
} as const
