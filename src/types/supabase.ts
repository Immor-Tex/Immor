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
      products: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string
          price: number
          category: string
          sizes: string[]
          colors: string[]
          images: string[]
          stock: number
          featured: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description: string
          price: number
          category: string
          sizes: string[]
          colors: string[]
          images: string[]
          stock: number
          featured?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string
          price?: number
          category?: string
          sizes?: string[]
          colors?: string[]
          images?: string[]
          stock?: number
          featured?: boolean
        }
      }
      users: {
        Row: {
          id: string
          email: string
          role: string
        }
        Insert: {
          id: string
          email: string
          role?: string
        }
        Update: {
          id?: string
          email?: string
          role?: string
        }
      }
      content: {
        Row: {
          id: string
          section: string
          content: Json
        }
        Insert: {
          id?: string
          section: string
          content: Json
        }
        Update: {
          id?: string
          section?: string
          content?: Json
        }
      }
    }
  }
}