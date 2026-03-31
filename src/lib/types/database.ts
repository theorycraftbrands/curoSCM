export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          changes: Json | null
          entity_id: string
          entity_type: string
          id: string
          organization_id: string
          performed_at: string
          performed_by: string
        }
        Insert: {
          action: string
          changes?: Json | null
          entity_id: string
          entity_type: string
          id?: string
          organization_id: string
          performed_at?: string
          performed_by: string
        }
        Update: {
          action?: string
          changes?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
          organization_id?: string
          performed_at?: string
          performed_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bom_items: {
        Row: {
          bom_type: Database["public"]["Enums"]["bom_item_type"]
          catalog_item_id: string | null
          cost_code: string | null
          created_at: string
          currency: string | null
          description: string
          group_name: string | null
          id: string
          organization_id: string
          project_id: string
          quantity: number
          sort_order: number | null
          unit: string | null
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          bom_type?: Database["public"]["Enums"]["bom_item_type"]
          catalog_item_id?: string | null
          cost_code?: string | null
          created_at?: string
          currency?: string | null
          description: string
          group_name?: string | null
          id?: string
          organization_id: string
          project_id: string
          quantity?: number
          sort_order?: number | null
          unit?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          bom_type?: Database["public"]["Enums"]["bom_item_type"]
          catalog_item_id?: string | null
          cost_code?: string | null
          created_at?: string
          currency?: string | null
          description?: string
          group_name?: string | null
          id?: string
          organization_id?: string
          project_id?: string
          quantity?: number
          sort_order?: number | null
          unit?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bom_items_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bom_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bom_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          business_type: Database["public"]["Enums"]["business_type"]
          created_at: string
          id: string
          is_active: boolean
          legal_name: string | null
          name: string
          organization_id: string
          phone: string | null
          search_vector: unknown
          tax_reference: string | null
          team_id: string
          timezone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          business_type?: Database["public"]["Enums"]["business_type"]
          created_at?: string
          id?: string
          is_active?: boolean
          legal_name?: string | null
          name: string
          organization_id: string
          phone?: string | null
          search_vector?: unknown
          tax_reference?: string | null
          team_id: string
          timezone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          business_type?: Database["public"]["Enums"]["business_type"]
          created_at?: string
          id?: string
          is_active?: boolean
          legal_name?: string | null
          name?: string
          organization_id?: string
          phone?: string | null
          search_vector?: unknown
          tax_reference?: string | null
          team_id?: string
          timezone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "businesses_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_items: {
        Row: {
          category: string | null
          created_at: string
          currency: string | null
          default_price: number | null
          description: string | null
          id: string
          is_active: boolean
          is_purchasable: boolean
          name: string
          organization_id: string
          search_vector: unknown
          sku: string | null
          team_id: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          currency?: string | null
          default_price?: number | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_purchasable?: boolean
          name: string
          organization_id: string
          search_vector?: unknown
          sku?: string | null
          team_id: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          currency?: string | null
          default_price?: number | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_purchasable?: boolean
          name?: string
          organization_id?: string
          search_vector?: unknown
          sku?: string | null
          team_id?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_items_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_dates: {
        Row: {
          completed_date: string | null
          created_at: string
          date_type_id: string | null
          entity_id: string
          entity_type: string
          id: string
          label: string
          organization_id: string
          original_date: string | null
          planned_date: string | null
          updated_at: string
        }
        Insert: {
          completed_date?: string | null
          created_at?: string
          date_type_id?: string | null
          entity_id: string
          entity_type: string
          id?: string
          label: string
          organization_id: string
          original_date?: string | null
          planned_date?: string | null
          updated_at?: string
        }
        Update: {
          completed_date?: string | null
          created_at?: string
          date_type_id?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          label?: string
          organization_id?: string
          original_date?: string | null
          planned_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_dates_date_type_id_fkey"
            columns: ["date_type_id"]
            isOneToOne: false
            referencedRelation: "date_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_dates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      date_types: {
        Row: {
          category: string | null
          created_at: string
          id: string
          is_default: boolean
          name: string
          team_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          team_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "date_types_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          entity_id: string
          entity_type: string
          file_name: string
          file_size: number | null
          id: string
          mime_type: string | null
          organization_id: string
          storage_path: string
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          entity_id: string
          entity_type: string
          file_name: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          organization_id: string
          storage_path: string
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          entity_id?: string
          entity_type?: string
          file_name?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          organization_id?: string
          storage_path?: string
          uploaded_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "files_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address_line_1: string | null
          address_line_2: string | null
          business_id: string | null
          city: string | null
          country: string | null
          created_at: string
          id: string
          is_active: boolean
          location_type: Database["public"]["Enums"]["location_type"]
          name: string
          organization_id: string
          postal_code: string | null
          state_province: string | null
          team_id: string
          updated_at: string
        }
        Insert: {
          address_line_1?: string | null
          address_line_2?: string | null
          business_id?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          location_type?: Database["public"]["Enums"]["location_type"]
          name: string
          organization_id: string
          postal_code?: string | null
          state_province?: string | null
          team_id: string
          updated_at?: string
        }
        Update: {
          address_line_1?: string | null
          address_line_2?: string | null
          business_id?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          location_type?: Database["public"]["Enums"]["location_type"]
          name?: string
          organization_id?: string
          postal_code?: string | null
          state_province?: string | null
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string
          created_at: string
          created_by: string
          entity_id: string
          entity_type: string
          id: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          entity_id: string
          entity_type: string
          id?: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          entity_id?: string
          entity_type?: string
          id?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      people: {
        Row: {
          business_id: string | null
          city: string | null
          created_at: string
          department: string | null
          email: string | null
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          organization_id: string
          phone: string | null
          role: string | null
          search_vector: unknown
          team_id: string
          updated_at: string
        }
        Insert: {
          business_id?: string | null
          city?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          first_name: string
          id?: string
          is_active?: boolean
          last_name: string
          organization_id: string
          phone?: string | null
          role?: string | null
          search_vector?: unknown
          team_id: string
          updated_at?: string
        }
        Update: {
          business_id?: string | null
          city?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          first_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          organization_id?: string
          phone?: string | null
          role?: string | null
          search_vector?: unknown
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "people_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "people_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "people_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_locations: {
        Row: {
          id: string
          location_id: string
          project_id: string
          role: string | null
        }
        Insert: {
          id?: string
          location_id: string
          project_id: string
          role?: string | null
        }
        Update: {
          id?: string
          location_id?: string
          project_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_locations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_locations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_memberships: {
        Row: {
          created_at: string
          id: string
          project_id: string
          role: Database["public"]["Enums"]["project_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          role?: Database["public"]["Enums"]["project_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          role?: Database["public"]["Enums"]["project_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_memberships_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          organization_id: string
          project_number: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          organization_id: string
          project_number?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          organization_id?: string
          project_number?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          entity_id: string
          entity_type: string
          id: string
          organization_id: string
          priority: Database["public"]["Enums"]["task_priority"]
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          entity_id: string
          entity_type: string
          id?: string
          organization_id: string
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          organization_id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      team_memberships: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["team_role"]
          team_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["team_role"]
          team_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["team_role"]
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_memberships_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_org_ids: { Args: never; Returns: string[] }
      get_user_team_ids: { Args: never; Returns: string[] }
      user_has_team_role: {
        Args: {
          p_min_role: Database["public"]["Enums"]["team_role"]
          p_team_id: string
        }
        Returns: boolean
      }
      user_is_org_admin: { Args: { p_org_id: string }; Returns: boolean }
    }
    Enums: {
      bom_item_type:
        | "purchase"
        | "client_supplied"
        | "vendor_supplied"
        | "feed_through"
      business_type:
        | "client"
        | "vendor"
        | "fabricator"
        | "carrier"
        | "storage"
        | "other"
      location_type:
        | "mailing"
        | "shipping"
        | "fabrication"
        | "warehouse"
        | "office"
      project_role: "manager" | "buyer" | "expediter" | "viewer"
      project_status: "draft" | "active" | "on_hold" | "complete" | "cancelled"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "open" | "in_progress" | "complete" | "cancelled"
      team_role: "owner" | "admin" | "member" | "viewer"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      bom_item_type: [
        "purchase",
        "client_supplied",
        "vendor_supplied",
        "feed_through",
      ],
      business_type: [
        "client",
        "vendor",
        "fabricator",
        "carrier",
        "storage",
        "other",
      ],
      location_type: [
        "mailing",
        "shipping",
        "fabrication",
        "warehouse",
        "office",
      ],
      project_role: ["manager", "buyer", "expediter", "viewer"],
      project_status: ["draft", "active", "on_hold", "complete", "cancelled"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["open", "in_progress", "complete", "cancelled"],
      team_role: ["owner", "admin", "member", "viewer"],
    },
  },
} as const

