export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type PackageType =
  | 'free'
  | 'single'
  | 'single_premium'
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'finder_single'
  | 'finder_single_premium'
  | 'finder_bronze'
  | 'finder_silver'
  | 'finder_gold'
  | 'finder_platinum'

export type ExpertTier = 'any' | 'rat_guaranteed'

export type Expert = 'rat' | 'badger' | 'monkey'

export type RequestStatus = 'pending' | 'assigned' | 'completed' | 'refunded'

export type Recommendation = 'accept' | 'decline' | 'counter'

export type RequestType = 'trade_evaluation' | 'trade_finder'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          stripe_customer_id: string | null
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          stripe_customer_id?: string | null
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          stripe_customer_id?: string | null
        }
      }
      packages: {
        Row: {
          id: string
          user_id: string
          package_type: PackageType
          credits_purchased: number
          credits_remaining: number
          expert_tier: ExpertTier
          purchased_at: string
          expires_at: string
          stripe_payment_id: string
        }
        Insert: {
          id?: string
          user_id: string
          package_type: PackageType
          credits_purchased: number
          credits_remaining: number
          expert_tier: ExpertTier
          purchased_at?: string
          expires_at: string
          stripe_payment_id: string
        }
        Update: {
          id?: string
          user_id?: string
          package_type?: PackageType
          credits_purchased?: number
          credits_remaining?: number
          expert_tier?: ExpertTier
          purchased_at?: string
          expires_at?: string
          stripe_payment_id?: string
        }
      }
      trade_requests: {
        Row: {
          id: string
          user_id: string
          package_id: string | null
          status: RequestStatus
          assigned_expert: Expert | null
          submitted_at: string
          completed_at: string | null
          screenshot_urls: string[]
          league_rules: Json
          user_notes: string
          request_type: RequestType
          specific_trade_offer: string | null
        }
        Insert: {
          id?: string
          user_id: string
          package_id?: string | null
          status?: RequestStatus
          assigned_expert?: Expert | null
          submitted_at?: string
          completed_at?: string | null
          screenshot_urls: string[]
          league_rules: Json
          user_notes: string
          request_type: RequestType
          specific_trade_offer?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          package_id?: string | null
          status?: RequestStatus
          assigned_expert?: Expert | null
          submitted_at?: string
          completed_at?: string | null
          screenshot_urls?: string[]
          league_rules?: Json
          user_notes?: string
          request_type?: RequestType
          specific_trade_offer?: string | null
        }
      }
      trade_advice: {
        Row: {
          id: string
          trade_request_id: string
          expert: Expert
          proposed_trade: string
          recommendation: Recommendation
          analysis: string
          audio_url: string | null
          counter_offer: string | null
          roster_impact: string
          created_at: string
        }
        Insert: {
          id?: string
          trade_request_id: string
          expert: Expert
          proposed_trade: string
          recommendation: Recommendation
          analysis: string
          audio_url?: string | null
          counter_offer?: string | null
          roster_impact: string
          created_at?: string
        }
        Update: {
          id?: string
          trade_request_id?: string
          expert?: Expert
          proposed_trade?: string
          recommendation?: Recommendation
          analysis?: string
          audio_url?: string | null
          counter_offer?: string | null
          roster_impact?: string
          created_at?: string
        }
      }
      expert_availability: {
        Row: {
          expert: Expert
          is_available: boolean
          current_queue_count: number
          updated_at: string
        }
        Insert: {
          expert: Expert
          is_available?: boolean
          current_queue_count?: number
          updated_at?: string
        }
        Update: {
          expert?: Expert
          is_available?: boolean
          current_queue_count?: number
          updated_at?: string
        }
      }
    }
  }
}
