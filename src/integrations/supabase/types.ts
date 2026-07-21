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
      aditivos: {
        Row: {
          atestado_id: string
          created_at: string
          data_assinatura: string
          descricao: string
          escopo: string | null
          id: string
          nova_data_fim: string | null
          numero: number
          observacoes: string | null
          prazo: number | null
          tipo: Database["public"]["Enums"]["aditivo_tipo"]
          updated_at: string
          user_id: string
          valor: number | null
          valor_adicional: number | null
        }
        Insert: {
          atestado_id: string
          created_at?: string
          data_assinatura: string
          descricao?: string
          escopo?: string | null
          id?: string
          nova_data_fim?: string | null
          numero: number
          observacoes?: string | null
          prazo?: number | null
          tipo: Database["public"]["Enums"]["aditivo_tipo"]
          updated_at?: string
          user_id: string
          valor?: number | null
          valor_adicional?: number | null
        }
        Update: {
          atestado_id?: string
          created_at?: string
          data_assinatura?: string
          descricao?: string
          escopo?: string | null
          id?: string
          nova_data_fim?: string | null
          numero?: number
          observacoes?: string | null
          prazo?: number | null
          tipo?: Database["public"]["Enums"]["aditivo_tipo"]
          updated_at?: string
          user_id?: string
          valor?: number | null
          valor_adicional?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "aditivos_atestado_id_fkey"
            columns: ["atestado_id"]
            isOneToOne: false
            referencedRelation: "atestados"
            referencedColumns: ["id"]
          },
        ]
      }
      atestados: {
        Row: {
          art_numero: string | null
          cnpj_contratante: string | null
          contratante: string
          created_at: string
          data_emissao: string | null
          data_fim: string
          data_inicio: string
          descricao: string
          documento_url: string | null
          finalidade: string | null
          id: string
          local_execucao: string | null
          numero: string
          numero_cat: string | null
          numero_contrato: string | null
          numero_pregao: string | null
          observacoes: string | null
          ordem: number | null
          registro_crea_rt: string | null
          resp_tecnico: string
          status: string
          tipo_contratante: string | null
          updated_at: string
          user_id: string
          valor_contrato: number
        }
        Insert: {
          art_numero?: string | null
          cnpj_contratante?: string | null
          contratante: string
          created_at?: string
          data_emissao?: string | null
          data_fim: string
          data_inicio: string
          descricao?: string
          documento_url?: string | null
          finalidade?: string | null
          id?: string
          local_execucao?: string | null
          numero: string
          numero_cat?: string | null
          numero_contrato?: string | null
          numero_pregao?: string | null
          observacoes?: string | null
          ordem?: number | null
          registro_crea_rt?: string | null
          resp_tecnico?: string
          status?: string
          tipo_contratante?: string | null
          updated_at?: string
          user_id: string
          valor_contrato?: number
        }
        Update: {
          art_numero?: string | null
          cnpj_contratante?: string | null
          contratante?: string
          created_at?: string
          data_emissao?: string | null
          data_fim?: string
          data_inicio?: string
          descricao?: string
          documento_url?: string | null
          finalidade?: string | null
          id?: string
          local_execucao?: string | null
          numero?: string
          numero_cat?: string | null
          numero_contrato?: string | null
          numero_pregao?: string | null
          observacoes?: string | null
          ordem?: number | null
          registro_crea_rt?: string | null
          resp_tecnico?: string
          status?: string
          tipo_contratante?: string | null
          updated_at?: string
          user_id?: string
          valor_contrato?: number
        }
        Relationships: []
      }
      categorias_personalizadas: {
        Row: {
          created_at: string
          id: string
          nome: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          user_id?: string
        }
        Relationships: []
      }
      planilha_items: {
        Row: {
          atestados_count: number
          categoria: string
          codigo: string
          created_at: string
          descricao: string
          fator_conversao: number | null
          id: string
          item_pai_id: string | null
          observacoes: string | null
          quantidade: number
          unidade: string
          unidade_origem: string | null
          updated_at: string
          user_id: string
          valor_total: number | null
          valor_unitario: number | null
        }
        Insert: {
          atestados_count?: number
          categoria: string
          codigo: string
          created_at?: string
          descricao: string
          fator_conversao?: number | null
          id?: string
          item_pai_id?: string | null
          observacoes?: string | null
          quantidade?: number
          unidade: string
          unidade_origem?: string | null
          updated_at?: string
          user_id: string
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Update: {
          atestados_count?: number
          categoria?: string
          codigo?: string
          created_at?: string
          descricao?: string
          fator_conversao?: number | null
          id?: string
          item_pai_id?: string | null
          observacoes?: string | null
          quantidade?: number
          unidade?: string
          unidade_origem?: string | null
          updated_at?: string
          user_id?: string
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "planilha_items_item_pai_id_fkey"
            columns: ["item_pai_id"]
            isOneToOne: false
            referencedRelation: "planilha_items"
            referencedColumns: ["id"]
          },
        ]
      }
      servicos_extraidos: {
        Row: {
          atestado_id: string
          categoria_sugerida: string | null
          codigo_sugerido: string | null
          created_at: string
          descricao_original: string
          descricao_sugerida: string | null
          id: string
          observacoes: string | null
          planilha_item_id: string | null
          quantidade_original: string | null
          quantidade_sugerida: number | null
          status: Database["public"]["Enums"]["servico_status"]
          unidade_sugerida: string | null
          updated_at: string
          user_id: string
          valor_total: number | null
          valor_unitario: number | null
        }
        Insert: {
          atestado_id: string
          categoria_sugerida?: string | null
          codigo_sugerido?: string | null
          created_at?: string
          descricao_original: string
          descricao_sugerida?: string | null
          id?: string
          observacoes?: string | null
          planilha_item_id?: string | null
          quantidade_original?: string | null
          quantidade_sugerida?: number | null
          status?: Database["public"]["Enums"]["servico_status"]
          unidade_sugerida?: string | null
          updated_at?: string
          user_id: string
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Update: {
          atestado_id?: string
          categoria_sugerida?: string | null
          codigo_sugerido?: string | null
          created_at?: string
          descricao_original?: string
          descricao_sugerida?: string | null
          id?: string
          observacoes?: string | null
          planilha_item_id?: string | null
          quantidade_original?: string | null
          quantidade_sugerida?: number | null
          status?: Database["public"]["Enums"]["servico_status"]
          unidade_sugerida?: string | null
          updated_at?: string
          user_id?: string
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "servicos_extraidos_atestado_id_fkey"
            columns: ["atestado_id"]
            isOneToOne: false
            referencedRelation: "atestados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "servicos_extraidos_planilha_item_id_fkey"
            columns: ["planilha_item_id"]
            isOneToOne: false
            referencedRelation: "planilha_items"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      aditivo_tipo: "prazo" | "valor" | "escopo" | "misto"
      servico_status: "pendente" | "confirmado" | "rejeitado" | "ignorado"
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
      aditivo_tipo: ["prazo", "valor", "escopo", "misto"],
      servico_status: ["pendente", "confirmado", "rejeitado", "ignorado"],
    },
  },
} as const
