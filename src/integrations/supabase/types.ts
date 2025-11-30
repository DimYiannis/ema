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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      mollie_customers: {
        Row: {
          created_at: string
          id: string
          mollie_customer_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mollie_customer_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mollie_customer_id?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_history: {
        Row: {
          amount: string | null
          created_at: string
          currency: string | null
          description: string | null
          id: string
          mollie_payment_id: string
          paid_at: string | null
          payment_type: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          mollie_payment_id: string
          paid_at?: string | null
          payment_type?: string | null
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          mollie_payment_id?: string
          paid_at?: string | null
          payment_type?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          card_expiry: string | null
          card_last_four: string | null
          created_at: string
          id: string
          is_active: boolean | null
          mollie_customer_id: string | null
          mollie_mandate_id: string | null
          mollie_subscription_id: string | null
          payment_method_type: string | null
          plan: string | null
          subscription_end: string | null
          subscription_start: string | null
          subscription_status: string | null
          trial_end_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          card_expiry?: string | null
          card_last_four?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          mollie_customer_id?: string | null
          mollie_mandate_id?: string | null
          mollie_subscription_id?: string | null
          payment_method_type?: string | null
          plan?: string | null
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_status?: string | null
          trial_end_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          card_expiry?: string | null
          card_last_four?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          mollie_customer_id?: string | null
          mollie_mandate_id?: string | null
          mollie_subscription_id?: string | null
          payment_method_type?: string | null
          plan?: string | null
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_status?: string | null
          trial_end_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          billing_amount: string | null
          created_at: string
          currency: string | null
          id: string
          minutes_limit: number | null
          mollie_subscription_id: string
          plan: string
          plan_duration: string | null
          remaining_trial_days: number | null
          status: string
          subscription_end: string | null
          subscription_start: string | null
          trial_days: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_amount?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          minutes_limit?: number | null
          mollie_subscription_id: string
          plan: string
          plan_duration?: string | null
          remaining_trial_days?: number | null
          status?: string
          subscription_end?: string | null
          subscription_start?: string | null
          trial_days?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_amount?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          minutes_limit?: number | null
          mollie_subscription_id?: string
          plan?: string
          plan_duration?: string | null
          remaining_trial_days?: number | null
          status?: string
          subscription_end?: string | null
          subscription_start?: string | null
          trial_days?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      usage_tracking: {
        Row: {
          billing_period_end: string | null
          billing_period_start: string
          created_at: string
          id: string
          last_reset_date: string | null
          minutes_carried_over: number
          minutes_limit: number
          minutes_used: number
          subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_period_end?: string | null
          billing_period_start?: string
          created_at?: string
          id?: string
          last_reset_date?: string | null
          minutes_carried_over?: number
          minutes_limit?: number
          minutes_used?: number
          subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_period_end?: string | null
          billing_period_start?: string
          created_at?: string
          id?: string
          last_reset_date?: string | null
          minutes_carried_over?: number
          minutes_limit?: number
          minutes_used?: number
          subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_tracking_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_phone: { Args: { _user_id: string }; Returns: string }
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
    Enums: {},
  },
} as const
