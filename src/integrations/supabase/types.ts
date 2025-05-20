export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_otps: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          otp: string
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          otp: string
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          otp?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_otps_email_fkey"
            columns: ["email"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["email"]
          },
        ]
      }
      admin_passwords: {
        Row: {
          created_at: string | null
          id: string
          password: string
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          password: string
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          password?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          email: string
          id: string
          name: string
          role: string
          specialty: string
        }
        Insert: {
          email: string
          id?: string
          name: string
          role: string
          specialty: string
        }
        Update: {
          email?: string
          id?: string
          name?: string
          role?: string
          specialty?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          additional_info: string | null
          age: number | null
          clinic: string
          created_at: string
          date: string
          doctor: string
          email: string
          first_name: string
          gender: string | null
          id: string
          last_name: string
          phone: string
          reason: string
          specialty: string
          status: string
          time: string
          updated_at: string
        }
        Insert: {
          additional_info?: string | null
          age?: number | null
          clinic: string
          created_at?: string
          date: string
          doctor: string
          email: string
          first_name: string
          gender?: string | null
          id?: string
          last_name: string
          phone: string
          reason: string
          specialty: string
          status?: string
          time: string
          updated_at?: string
        }
        Update: {
          additional_info?: string | null
          age?: number | null
          clinic?: string
          created_at?: string
          date?: string
          doctor?: string
          email?: string
          first_name?: string
          gender?: string | null
          id?: string
          last_name?: string
          phone?: string
          reason?: string
          specialty?: string
          status?: string
          time?: string
          updated_at?: string
        }
        Relationships: []
      }
      csm_insurance_panel_providers: {
        Row: {
          id: string
          name: string
          provider_type: string
          image: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          provider_type: string
          image?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          provider_type?: string
          image?: string | null
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
      csm_Gyne_insurance_panel_providers: {
        Row: {
          id: string
          name: string
          provider_type: string
          image: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          provider_type: string
          image?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          provider_type?: string
          image?: string | null
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
      blocks: {
        Row: {
          content: Json
          created_at: string
          id: string
          order_index: number
          page_path: string
          type: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          order_index?: number
          page_path: string
          type: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          order_index?: number
          page_path?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_blocks: {
        Row: {
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          metadata: Json | null
          name: string
          order_index: number | null
          page: string
          section: string
          specialty: string
          title: string | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          metadata?: Json | null
          name: string
          order_index?: number | null
          page: string
          section: string
          specialty: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          metadata?: Json | null
          name?: string
          order_index?: number | null
          page?: string
          section?: string
          specialty?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      doctor_availability: {
        Row: {
          created_at: string | null
          date: string
          doctor_id: string
          id: string
          is_holiday: boolean
          reason: string | null
          time_slots: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          doctor_id: string
          id?: string
          is_holiday?: boolean
          reason?: string | null
          time_slots?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          doctor_id?: string
          id?: string
          is_holiday?: boolean
          reason?: string | null
          time_slots?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      doctor_holidays: {
        Row: {
          created_at: string | null
          date: string
          department: string
          doctor_id: string
          id: string
          reason: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          department: string
          doctor_id: string
          id?: string
          reason?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          department?: string
          doctor_id?: string
          id?: string
          reason?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      holidays: {
        Row: {
          created_at: string | null
          date: string
          department: string
          description: string | null
          doctor: string | null
          id: string
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          department: string
          description?: string | null
          doctor?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          department?: string
          description?: string | null
          doctor?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      page_content: {
        Row: {
          created_at: string | null
          id: string
          page_path: string
          sections: Json
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          page_path: string
          sections?: Json
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          page_path?: string
          sections?: Json
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      page_content_elements: {
        Row: {
          content: string | null
          created_at: string | null
          element_type: string
          id: string
          order_index: number
          page_url: string
          parent_selector: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          element_type: string
          id?: string
          order_index: number
          page_url: string
          parent_selector: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          element_type?: string
          id?: string
          order_index?: number
          page_url?: string
          parent_selector?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      public_holidays: {
        Row: {
          country: string
          created_at: string | null
          date: string
          description: string | null
          id: string
          name: string
          type: string | null
          updated_at: string | null
          year: number
        }
        Insert: {
          country?: string
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          name: string
          type?: string | null
          updated_at?: string | null
          year: number
        }
        Update: {
          country?: string
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          name?: string
          type?: string | null
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      website_content: {
        Row: {
          content: string | null
          created_at: string | null
          element_type: string
          id: string
          image_url: string | null
          order_index: number | null
          page_path: string
          properties: Json | null
          selector: string
          styles: Json | null
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          element_type: string
          id?: string
          image_url?: string | null
          order_index?: number | null
          page_path: string
          properties?: Json | null
          selector: string
          styles?: Json | null
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          element_type?: string
          id?: string
          image_url?: string | null
          order_index?: number | null
          page_path?: string
          properties?: Json | null
          selector?: string
          styles?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_holidays_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
