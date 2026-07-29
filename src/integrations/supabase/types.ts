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
      branding_settings: {
        Row: {
          accent_color: string | null
          address: string | null
          app_name: string
          background_color: string | null
          cnpj: string | null
          company_name: string | null
          created_at: string
          id: string
          logo_url: string | null
          meta_mensal: number | null
          phone: string | null
          phone_is_whatsapp: boolean
          primary_color: string | null
          slogan: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accent_color?: string | null
          address?: string | null
          app_name?: string
          background_color?: string | null
          cnpj?: string | null
          company_name?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          meta_mensal?: number | null
          phone?: string | null
          phone_is_whatsapp?: boolean
          primary_color?: string | null
          slogan?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accent_color?: string | null
          address?: string | null
          app_name?: string
          background_color?: string | null
          cnpj?: string | null
          company_name?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          meta_mensal?: number | null
          phone?: string | null
          phone_is_whatsapp?: boolean
          primary_color?: string | null
          slogan?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      catalogo_itens: {
        Row: {
          ativo: boolean
          categoria: string | null
          created_at: string
          descricao: string | null
          id: string
          nome_item: string
          observacoes: string | null
          ordem: number
          unidade: string | null
          updated_at: string
          user_id: string
          valor_unitario: number
        }
        Insert: {
          ativo?: boolean
          categoria?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome_item: string
          observacoes?: string | null
          ordem?: number
          unidade?: string | null
          updated_at?: string
          user_id: string
          valor_unitario?: number
        }
        Update: {
          ativo?: boolean
          categoria?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome_item?: string
          observacoes?: string | null
          ordem?: number
          unidade?: string | null
          updated_at?: string
          user_id?: string
          valor_unitario?: number
        }
        Relationships: []
      }
      clientes: {
        Row: {
          cidade: string | null
          created_at: string
          endereco: string | null
          id: string
          nome: string
          observacoes: string | null
          status: string
          telefone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cidade?: string | null
          created_at?: string
          endereco?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cidade?: string | null
          created_at?: string
          endereco?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string
          id: string
          location: string | null
          producer_name: string
          production_type: string
          property_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          producer_name: string
          production_type: string
          property_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          producer_name?: string
          production_type?: string
          property_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      financeiro_movimentacoes: {
        Row: {
          categoria: string | null
          cliente_id: string | null
          created_at: string
          data_pagamento: string | null
          data_vencimento: string | null
          descricao: string
          forma_pagamento: string | null
          id: string
          observacoes: string | null
          orcamento_id: string | null
          status: string
          tipo: string
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          categoria?: string | null
          cliente_id?: string | null
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string | null
          descricao: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          orcamento_id?: string | null
          status?: string
          tipo: string
          updated_at?: string
          user_id: string
          valor?: number
        }
        Update: {
          categoria?: string | null
          cliente_id?: string | null
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string | null
          descricao?: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          orcamento_id?: string | null
          status?: string
          tipo?: string
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_movimentacoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_movimentacoes_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamento_itens: {
        Row: {
          catalogo_item_id: string | null
          created_at: string
          descricao: string | null
          id: string
          nome_item: string
          orcamento_id: string
          ordem: number
          quantidade: number
          subtotal: number | null
          unidade: string | null
          valor_unitario: number
        }
        Insert: {
          catalogo_item_id?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome_item: string
          orcamento_id: string
          ordem?: number
          quantidade?: number
          subtotal?: number | null
          unidade?: string | null
          valor_unitario?: number
        }
        Update: {
          catalogo_item_id?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome_item?: string
          orcamento_id?: string
          ordem?: number
          quantidade?: number
          subtotal?: number | null
          unidade?: string | null
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "orcamento_itens_catalogo_item_id_fkey"
            columns: ["catalogo_item_id"]
            isOneToOne: false
            referencedRelation: "catalogo_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamento_itens_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamentos: {
        Row: {
          cliente_id: string | null
          cliente_nome: string | null
          created_at: string
          forma_pagamento: string | null
          id: string
          numero_orcamento: string | null
          observacoes: string | null
          status: string
          total: number
          updated_at: string
          user_id: string
          validade_dias: number
        }
        Insert: {
          cliente_id?: string | null
          cliente_nome?: string | null
          created_at?: string
          forma_pagamento?: string | null
          id?: string
          numero_orcamento?: string | null
          observacoes?: string | null
          status?: string
          total?: number
          updated_at?: string
          user_id: string
          validade_dias?: number
        }
        Update: {
          cliente_id?: string | null
          cliente_nome?: string | null
          created_at?: string
          forma_pagamento?: string | null
          id?: string
          numero_orcamento?: string | null
          observacoes?: string | null
          status?: string
          total?: number
          updated_at?: string
          user_id?: string
          validade_dias?: number
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          aditivos_json: Json | null
          aplicacao: string | null
          client_id: string | null
          created_at: string
          detalhes: string | null
          empresa_name: string | null
          forma_envio: string | null
          forma_pagamento: string | null
          frascos: number
          frequencia: string
          id: string
          input_value: number
          location: string | null
          numero_pedido: string | null
          observacoes: string | null
          producer_name: string
          product_name: string
          production_type: string
          property_name: string | null
          propulsores_json: Json | null
          responsavel: string | null
          status: string
          user_id: string
        }
        Insert: {
          aditivos_json?: Json | null
          aplicacao?: string | null
          client_id?: string | null
          created_at?: string
          detalhes?: string | null
          empresa_name?: string | null
          forma_envio?: string | null
          forma_pagamento?: string | null
          frascos?: number
          frequencia?: string
          id?: string
          input_value?: number
          location?: string | null
          numero_pedido?: string | null
          observacoes?: string | null
          producer_name: string
          product_name?: string
          production_type: string
          property_name?: string | null
          propulsores_json?: Json | null
          responsavel?: string | null
          status?: string
          user_id: string
        }
        Update: {
          aditivos_json?: Json | null
          aplicacao?: string | null
          client_id?: string | null
          created_at?: string
          detalhes?: string | null
          empresa_name?: string | null
          forma_envio?: string | null
          forma_pagamento?: string | null
          frascos?: number
          frequencia?: string
          id?: string
          input_value?: number
          location?: string | null
          numero_pedido?: string | null
          observacoes?: string | null
          producer_name?: string
          product_name?: string
          production_type?: string
          property_name?: string | null
          propulsores_json?: Json | null
          responsavel?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      servicos: {
        Row: {
          cidade: string | null
          cliente_id: string | null
          created_at: string
          data: string
          hora: string | null
          id: string
          observacoes: string | null
          status: string
          tipo: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cidade?: string | null
          cliente_id?: string | null
          created_at?: string
          data: string
          hora?: string | null
          id?: string
          observacoes?: string | null
          status?: string
          tipo?: string
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cidade?: string | null
          cliente_id?: string | null
          created_at?: string
          data?: string
          hora?: string | null
          id?: string
          observacoes?: string | null
          status?: string
          tipo?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "servicos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      registrar_entrada_orcamento: {
        Args: { p_data_vencimento?: string; p_orcamento_id: string }
        Returns: {
          categoria: string | null
          cliente_id: string | null
          created_at: string
          data_pagamento: string | null
          data_vencimento: string | null
          descricao: string
          forma_pagamento: string | null
          id: string
          observacoes: string | null
          orcamento_id: string | null
          status: string
          tipo: string
          updated_at: string
          user_id: string
          valor: number
        }
        SetofOptions: {
          from: "*"
          to: "financeiro_movimentacoes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      seed_catalogo_base: { Args: { p_user_id: string }; Returns: undefined }
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
