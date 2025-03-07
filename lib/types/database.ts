export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: string
          last_login: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          role?: string
          last_login?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: string
          last_login?: string | null
          status?: string
          created_at?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          vrn: string
          road_tax_expiry: string | null
          fitness_expiry: string | null
          insurance_validity: string | null
          pollution_expiry: string | null
          permit_expiry: string | null
          national_permit_expiry: string | null
          last_updated: string
          chassis_number: string | null
          engine_number: string | null
          financer_name: string | null
          insurance_company: string | null
          blacklist_status: boolean
          rto_location: string | null
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          vrn: string
          road_tax_expiry?: string | null
          fitness_expiry?: string | null
          insurance_validity?: string | null
          pollution_expiry?: string | null
          permit_expiry?: string | null
          national_permit_expiry?: string | null
          last_updated?: string
          chassis_number?: string | null
          engine_number?: string | null
          financer_name?: string | null
          insurance_company?: string | null
          blacklist_status?: boolean
          rto_location?: string | null
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          vrn?: string
          road_tax_expiry?: string | null
          fitness_expiry?: string | null
          insurance_validity?: string | null
          pollution_expiry?: string | null
          permit_expiry?: string | null
          national_permit_expiry?: string | null
          last_updated?: string
          chassis_number?: string | null
          engine_number?: string | null
          financer_name?: string | null
          insurance_company?: string | null
          blacklist_status?: boolean
          rto_location?: string | null
          created_at?: string
          user_id?: string
        }
      }
      challans: {
        Row: {
          id: string
          vehicle_id: string
          violation_type: string
          amount: number
          status: string
          location: string | null
          issued_at: string
          paid_at: string | null
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          vehicle_id: string
          violation_type: string
          amount: number
          status?: string
          location?: string | null
          issued_at?: string
          paid_at?: string | null
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          vehicle_id?: string
          violation_type?: string
          amount?: number
          status?: string
          location?: string | null
          issued_at?: string
          paid_at?: string | null
          created_at?: string
          user_id?: string
        }
      }
    }
  }
}