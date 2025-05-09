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
      customers: {
        Row: {
          contact: string | null
          country: string | null
          created_at: string | null
          email: string | null
          id: string
          location: string | null
          mobile: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          contact?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          location?: string | null
          mobile?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          contact?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          location?: string | null
          mobile?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      license_allowed_countries: {
        Row: {
          country_code: string
          created_at: string | null
          id: string
          license_id: string
        }
        Insert: {
          country_code: string
          created_at?: string | null
          id?: string
          license_id: string
        }
        Update: {
          country_code?: string
          created_at?: string | null
          id?: string
          license_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "license_allowed_countries_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
        ]
      }
      license_mac_addresses: {
        Row: {
          created_at: string | null
          id: string
          license_id: string
          mac_address: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          license_id: string
          mac_address: string
        }
        Update: {
          created_at?: string | null
          id?: string
          license_id?: string
          mac_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "license_mac_addresses_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
        ]
      }
      license_verification_logs: {
        Row: {
          country_code: string | null
          device_info: string | null
          id: string
          ip_address: string | null
          is_valid: boolean
          license_id: string
          mac_address: string | null
          message: string | null
          verification_date: string | null
        }
        Insert: {
          country_code?: string | null
          device_info?: string | null
          id?: string
          ip_address?: string | null
          is_valid: boolean
          license_id: string
          mac_address?: string | null
          message?: string | null
          verification_date?: string | null
        }
        Update: {
          country_code?: string | null
          device_info?: string | null
          id?: string
          ip_address?: string | null
          is_valid?: boolean
          license_id?: string
          mac_address?: string | null
          message?: string | null
          verification_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "license_verification_logs_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
        ]
      }
      licenses: {
        Row: {
          created_at: string | null
          current_users: number | null
          customer_id: string
          expiry_date: string | null
          grace_period_days: number
          id: string
          license_scope: string
          license_type: string
          licensing_period: number
          max_users_allowed: number | null
          product_id: string
          product_version_id: string
          renewable_alert_message: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_users?: number | null
          customer_id: string
          expiry_date?: string | null
          grace_period_days?: number
          id?: string
          license_scope?: string
          license_type: string
          licensing_period: number
          max_users_allowed?: number | null
          product_id: string
          product_version_id: string
          renewable_alert_message?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_users?: number | null
          customer_id?: string
          expiry_date?: string | null
          grace_period_days?: number
          id?: string
          license_scope?: string
          license_type?: string
          licensing_period?: number
          max_users_allowed?: number | null
          product_id?: string
          product_version_id?: string
          renewable_alert_message?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "licenses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "licenses_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "licenses_product_version_id_fkey"
            columns: ["product_version_id"]
            isOneToOne: false
            referencedRelation: "product_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      Product: {
        Row: {
          created_at: string
          id: number
          "Product Name": string | null
          "Product Version": string | null
        }
        Insert: {
          created_at?: string
          id?: number
          "Product Name"?: string | null
          "Product Version"?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          "Product Name"?: string | null
          "Product Version"?: string | null
        }
        Relationships: []
      }
      product_versions: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          product_id: string
          release_date: string
          updated_at: string | null
          version: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          product_id: string
          release_date: string
          updated_at?: string | null
          version: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          product_id?: string
          release_date?: string
          updated_at?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_versions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
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
