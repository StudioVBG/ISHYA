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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      abandoned_carts: {
        Row: {
          abandoned_at: string | null
          cart_id: string
          cart_total: number | null
          created_at: string | null
          email: string | null
          id: string
          items_snapshot: Json | null
          recovered: boolean | null
          recovered_order_id: string | null
          reminder_sent_at: string | null
          reminders_count: number | null
          user_id: string | null
        }
        Insert: {
          abandoned_at?: string | null
          cart_id: string
          cart_total?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          items_snapshot?: Json | null
          recovered?: boolean | null
          recovered_order_id?: string | null
          reminder_sent_at?: string | null
          reminders_count?: number | null
          user_id?: string | null
        }
        Update: {
          abandoned_at?: string | null
          cart_id?: string
          cart_total?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          items_snapshot?: Json | null
          recovered?: boolean | null
          recovered_order_id?: string | null
          reminder_sent_at?: string | null
          reminders_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "abandoned_carts_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "abandoned_carts_recovered_order_id_fkey"
            columns: ["recovered_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          company: string | null
          country: string
          created_at: string | null
          first_name: string
          id: string
          is_default: boolean | null
          label: string | null
          last_name: string
          phone: string | null
          postal_code: string
          state: string | null
          type: Database["public"]["Enums"]["address_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          company?: string | null
          country?: string
          created_at?: string | null
          first_name: string
          id?: string
          is_default?: boolean | null
          label?: string | null
          last_name: string
          phone?: string | null
          postal_code: string
          state?: string | null
          type?: Database["public"]["Enums"]["address_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          company?: string | null
          country?: string
          created_at?: string | null
          first_name?: string
          id?: string
          is_default?: boolean | null
          label?: string | null
          last_name?: string
          phone?: string | null
          postal_code?: string
          state?: string | null
          type?: Database["public"]["Enums"]["address_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          permissions: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          permissions?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          permissions?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          last_login_at: string | null
          role_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          role_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          role_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "admin_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      applied_discounts: {
        Row: {
          amount_saved: number
          code: string
          created_at: string | null
          discount_code_id: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          id: string
          order_id: string
        }
        Insert: {
          amount_saved: number
          code: string
          created_at?: string | null
          discount_code_id?: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          id?: string
          order_id: string
        }
        Update: {
          amount_saved?: number
          code?: string
          created_at?: string | null
          discount_code_id?: string | null
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value?: number
          id?: string
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applied_discounts_discount_code_id_fkey"
            columns: ["discount_code_id"]
            isOneToOne: false
            referencedRelation: "discount_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applied_discounts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      banners: {
        Row: {
          created_at: string | null
          ends_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          link_url: string | null
          placement: Database["public"]["Enums"]["banner_placement"] | null
          sort_order: number | null
          starts_at: string | null
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_url?: string | null
          placement?: Database["public"]["Enums"]["banner_placement"] | null
          sort_order?: number | null
          starts_at?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_url?: string | null
          placement?: Database["public"]["Enums"]["banner_placement"] | null
          sort_order?: number | null
          starts_at?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          body: string | null
          cover_image_url: string | null
          created_at: string | null
          excerpt: string | null
          id: string
          is_published: boolean | null
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          body?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          body?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string | null
          id: string
          pack_id: string | null
          pack_selections: Json | null
          product_id: string
          quantity: number
          unit_price: number
          updated_at: string | null
          variant_id: string | null
        }
        Insert: {
          cart_id: string
          created_at?: string | null
          id?: string
          pack_id?: string | null
          pack_selections?: Json | null
          product_id: string
          quantity?: number
          unit_price: number
          updated_at?: string | null
          variant_id?: string | null
        }
        Update: {
          cart_id?: string
          created_at?: string | null
          id?: string
          pack_id?: string | null
          pack_selections?: Json | null
          product_id?: string
          quantity?: number
          unit_price?: number
          updated_at?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "packs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string | null
          currency: string | null
          id: string
          session_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          id?: string
          session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          id?: string
          session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          parent_id: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_pages: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          is_published: boolean | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      collections: {
        Row: {
          created_at: string | null
          description: string | null
          ends_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number | null
          starts_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number | null
          starts_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number | null
          starts_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          applicable_category_ids: string[] | null
          applicable_product_ids: string[] | null
          code: string
          created_at: string | null
          description: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          ends_at: string | null
          id: string
          is_active: boolean | null
          maximum_discount: number | null
          minimum_order_amount: number | null
          per_user_limit: number | null
          starts_at: string | null
          updated_at: string | null
          usage_count: number | null
          usage_limit: number | null
        }
        Insert: {
          applicable_category_ids?: string[] | null
          applicable_product_ids?: string[] | null
          code: string
          created_at?: string | null
          description?: string | null
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          maximum_discount?: number | null
          minimum_order_amount?: number | null
          per_user_limit?: number | null
          starts_at?: string | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
        }
        Update: {
          applicable_category_ids?: string[] | null
          applicable_product_ids?: string[] | null
          code?: string
          created_at?: string | null
          description?: string | null
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value?: number
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          maximum_discount?: number | null
          minimum_order_amount?: number | null
          per_user_limit?: number | null
          starts_at?: string | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          body_html: string | null
          body_text: string | null
          click_count: number | null
          created_at: string | null
          id: string
          name: string
          open_count: number | null
          recipient_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["campaign_status"] | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          body_html?: string | null
          body_text?: string | null
          click_count?: number | null
          created_at?: string | null
          id?: string
          name: string
          open_count?: number | null
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"] | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          body_html?: string | null
          body_text?: string | null
          click_count?: number | null
          created_at?: string | null
          id?: string
          name?: string
          open_count?: number | null
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"] | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      faq_articles: {
        Row: {
          answer: string
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          question: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          question: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          question?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory: {
        Row: {
          created_at: string | null
          id: string
          last_restock_at: string | null
          quantity: number
          reserved: number
          updated_at: string | null
          variant_id: string
          warehouse: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_restock_at?: string | null
          quantity?: number
          reserved?: number
          updated_at?: string | null
          variant_id: string
          warehouse?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_restock_at?: string | null
          quantity?: number
          reserved?: number
          updated_at?: string | null
          variant_id?: string
          warehouse?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string | null
          currency: string | null
          due_at: string | null
          grand_total: number
          id: string
          invoice_number: string
          issued_at: string | null
          order_id: string
          paid_at: string | null
          pdf_url: string | null
          subtotal: number
          tax_total: number | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          due_at?: string | null
          grand_total: number
          id?: string
          invoice_number: string
          issued_at?: string | null
          order_id: string
          paid_at?: string | null
          pdf_url?: string | null
          subtotal: number
          tax_total?: number | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          due_at?: string | null
          grand_total?: number
          id?: string
          invoice_number?: string
          issued_at?: string | null
          order_id?: string
          paid_at?: string | null
          pdf_url?: string | null
          subtotal?: number
          tax_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_tiers: {
        Row: {
          created_at: string | null
          id: string
          min_points: number
          name: Database["public"]["Enums"]["loyalty_tier_name"]
          perks: Json | null
          points_multiplier: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          min_points?: number
          name: Database["public"]["Enums"]["loyalty_tier_name"]
          perks?: Json | null
          points_multiplier?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          min_points?: number
          name?: Database["public"]["Enums"]["loyalty_tier_name"]
          perks?: Json | null
          points_multiplier?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      loyalty_transactions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          order_id: string | null
          points: number
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          order_id?: string | null
          points: number
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          order_id?: string | null
          points?: number
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_marketing: boolean | null
          email_order_updates: boolean | null
          email_review_replies: boolean | null
          id: string
          push_enabled: boolean | null
          sms_marketing: boolean | null
          sms_order_updates: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_marketing?: boolean | null
          email_order_updates?: boolean | null
          email_review_replies?: boolean | null
          id?: string
          push_enabled?: boolean | null
          sms_marketing?: boolean | null
          sms_order_updates?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_marketing?: boolean | null
          email_order_updates?: boolean | null
          email_review_replies?: boolean | null
          id?: string
          push_enabled?: boolean | null
          sms_marketing?: boolean | null
          sms_order_updates?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          discount_amount: number | null
          id: string
          order_id: string
          pack_id: string | null
          product_id: string | null
          product_name_snapshot: string
          quantity: number
          sku_snapshot: string | null
          tax_amount: number | null
          total: number
          unit_price: number
          variant_id: string | null
          variant_name_snapshot: string | null
        }
        Insert: {
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          order_id: string
          pack_id?: string | null
          product_id?: string | null
          product_name_snapshot: string
          quantity?: number
          sku_snapshot?: string | null
          tax_amount?: number | null
          total: number
          unit_price: number
          variant_id?: string | null
          variant_name_snapshot?: string | null
        }
        Update: {
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          order_id?: string
          pack_id?: string | null
          product_id?: string | null
          product_name_snapshot?: string
          quantity?: number
          sku_snapshot?: string | null
          tax_amount?: number | null
          total?: number
          unit_price?: number
          variant_id?: string | null
          variant_name_snapshot?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "packs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address_snapshot: Json | null
          cancelled_at: string | null
          created_at: string | null
          currency: string | null
          customer_note: string | null
          delivered_at: string | null
          discount_total: number | null
          email: string | null
          gift_message: string | null
          gift_wrap: boolean | null
          grand_total: number
          id: string
          internal_note: string | null
          order_number: string
          phone: string | null
          shipped_at: string | null
          shipping_address_snapshot: Json | null
          shipping_total: number | null
          status: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          tax_total: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          billing_address_snapshot?: Json | null
          cancelled_at?: string | null
          created_at?: string | null
          currency?: string | null
          customer_note?: string | null
          delivered_at?: string | null
          discount_total?: number | null
          email?: string | null
          gift_message?: string | null
          gift_wrap?: boolean | null
          grand_total?: number
          id?: string
          internal_note?: string | null
          order_number: string
          phone?: string | null
          shipped_at?: string | null
          shipping_address_snapshot?: Json | null
          shipping_total?: number | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number
          tax_total?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          billing_address_snapshot?: Json | null
          cancelled_at?: string | null
          created_at?: string | null
          currency?: string | null
          customer_note?: string | null
          delivered_at?: string | null
          discount_total?: number | null
          email?: string | null
          gift_message?: string | null
          gift_wrap?: boolean | null
          grand_total?: number
          id?: string
          internal_note?: string | null
          order_number?: string
          phone?: string | null
          shipped_at?: string | null
          shipping_address_snapshot?: Json | null
          shipping_total?: number | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number
          tax_total?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      pack_items: {
        Row: {
          created_at: string | null
          id: string
          is_required: boolean | null
          pack_id: string
          product_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          pack_id: string
          product_id: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          pack_id?: string
          product_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pack_items_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "packs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pack_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      pack_variant_options: {
        Row: {
          created_at: string | null
          id: string
          pack_item_id: string
          price_adjustment: number | null
          variant_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          pack_item_id: string
          price_adjustment?: number | null
          variant_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          pack_item_id?: string
          price_adjustment?: number | null
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pack_variant_options_pack_item_id_fkey"
            columns: ["pack_item_id"]
            isOneToOne: false
            referencedRelation: "pack_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pack_variant_options_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      packs: {
        Row: {
          created_at: string | null
          description: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          ends_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          slug: string
          starts_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value?: number
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          slug: string
          starts_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value?: number
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          slug?: string
          starts_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          error_message: string | null
          id: string
          method: string | null
          order_id: string
          paid_at: string | null
          refunded_at: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          stripe_charge_id: string | null
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          stripe_receipt_url: string | null
          stripe_refund_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          error_message?: string | null
          id?: string
          method?: string | null
          order_id: string
          paid_at?: string | null
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          stripe_charge_id?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_receipt_url?: string | null
          stripe_refund_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          error_message?: string | null
          id?: string
          method?: string | null
          order_id?: string
          paid_at?: string | null
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          stripe_charge_id?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_receipt_url?: string | null
          stripe_refund_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_attributes: {
        Row: {
          created_at: string | null
          id: string
          key: string
          product_id: string
          sort_order: number | null
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          product_id: string
          sort_order?: number | null
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          product_id?: string
          sort_order?: number | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_attributes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_media: {
        Row: {
          alt_text: string | null
          created_at: string | null
          id: string
          is_primary: boolean | null
          media_type: string | null
          product_id: string
          sort_order: number | null
          url: string
          variant_id: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          media_type?: string | null
          product_id: string
          sort_order?: number | null
          url: string
          variant_id?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          media_type?: string | null
          product_id?: string
          sort_order?: number | null
          url?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_media_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_media_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_collections: {
        Row: {
          collection_id: string
          created_at: string | null
          product_id: string
          sort_order: number
        }
        Insert: {
          collection_id: string
          created_at?: string | null
          product_id: string
          sort_order?: number
        }
        Update: {
          collection_id?: string
          created_at?: string | null
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_collections_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_collections_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          category_id: string
          created_at: string | null
          product_id: string
          sort_order: number
        }
        Insert: {
          category_id: string
          created_at?: string | null
          product_id: string
          sort_order?: number
        }
        Update: {
          category_id?: string
          created_at?: string | null
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_relations: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          related_product_id: string
          relation_type: Database["public"]["Enums"]["product_relation_type"]
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          related_product_id: string
          relation_type: Database["public"]["Enums"]["product_relation_type"]
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          related_product_id?: string
          relation_type?: Database["public"]["Enums"]["product_relation_type"]
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_relations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_relations_related_product_id_fkey"
            columns: ["related_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_tags: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          tag: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          tag: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_tags_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          length_cm: number | null
          low_stock_threshold: number | null
          material_variant: string | null
          name: string | null
          price_override: number | null
          product_id: string
          size: string | null
          sku: string | null
          sort_order: number | null
          stock_quantity: number
          stone: string | null
          updated_at: string | null
          weight_g: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          length_cm?: number | null
          low_stock_threshold?: number | null
          material_variant?: string | null
          name?: string | null
          price_override?: number | null
          product_id: string
          size?: string | null
          sku?: string | null
          sort_order?: number | null
          stock_quantity?: number
          stone?: string | null
          updated_at?: string | null
          weight_g?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          length_cm?: number | null
          low_stock_threshold?: number | null
          material_variant?: string | null
          name?: string | null
          price_override?: number | null
          product_id?: string
          size?: string | null
          sku?: string | null
          sort_order?: number | null
          stock_quantity?: number
          stone?: string | null
          updated_at?: string | null
          weight_g?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number
          care_instructions: string | null
          category_id: string | null
          collection_id: string | null
          compare_at_price: number | null
          cost_price: number | null
          created_at: string | null
          currency: string | null
          description: string | null
          dimensions: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          is_new: boolean | null
          is_nickel_free: boolean | null
          material: string | null
          meta_keywords: string[] | null
          name: string
          seo_description: string | null
          seo_title: string | null
          short_description: string | null
          sku: string | null
          slug: string
          sort_order: number | null
          updated_at: string | null
          weight_g: number | null
        }
        Insert: {
          base_price?: number
          care_instructions?: string | null
          category_id?: string | null
          collection_id?: string | null
          compare_at_price?: number | null
          cost_price?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          dimensions?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          is_nickel_free?: boolean | null
          material?: string | null
          meta_keywords?: string[] | null
          name: string
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          sku?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string | null
          weight_g?: number | null
        }
        Update: {
          base_price?: number
          care_instructions?: string | null
          category_id?: string | null
          collection_id?: string | null
          compare_at_price?: number | null
          cost_price?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          dimensions?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          is_nickel_free?: boolean | null
          material?: string | null
          meta_keywords?: string[] | null
          name?: string
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          sku?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
          weight_g?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          first_name: string | null
          id: string
          is_active: boolean | null
          last_login_at: string | null
          last_name: string | null
          loyalty_points: number | null
          loyalty_tier: Database["public"]["Enums"]["loyalty_tier_name"] | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          is_active?: boolean | null
          last_login_at?: string | null
          last_name?: string | null
          loyalty_points?: number | null
          loyalty_tier?: Database["public"]["Enums"]["loyalty_tier_name"] | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          last_name?: string | null
          loyalty_points?: number | null
          loyalty_tier?: Database["public"]["Enums"]["loyalty_tier_name"] | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      return_items: {
        Row: {
          condition: string | null
          created_at: string | null
          id: string
          order_item_id: string
          quantity: number
          reason: Database["public"]["Enums"]["return_reason"] | null
          return_id: string
        }
        Insert: {
          condition?: string | null
          created_at?: string | null
          id?: string
          order_item_id: string
          quantity?: number
          reason?: Database["public"]["Enums"]["return_reason"] | null
          return_id: string
        }
        Update: {
          condition?: string | null
          created_at?: string | null
          id?: string
          order_item_id?: string
          quantity?: number
          reason?: Database["public"]["Enums"]["return_reason"] | null
          return_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "return_items_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_items_return_id_fkey"
            columns: ["return_id"]
            isOneToOne: false
            referencedRelation: "returns"
            referencedColumns: ["id"]
          },
        ]
      }
      returns: {
        Row: {
          approved_at: string | null
          created_at: string | null
          description: string | null
          id: string
          order_id: string
          reason: Database["public"]["Enums"]["return_reason"]
          received_at: string | null
          refund_amount: number | null
          refund_method: string | null
          refunded_at: string | null
          status: Database["public"]["Enums"]["return_status"] | null
          tracking_number: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          order_id: string
          reason: Database["public"]["Enums"]["return_reason"]
          received_at?: string | null
          refund_amount?: number | null
          refund_method?: string | null
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["return_status"] | null
          tracking_number?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          order_id?: string
          reason?: Database["public"]["Enums"]["return_reason"]
          received_at?: string | null
          refund_amount?: number | null
          refund_method?: string | null
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["return_status"] | null
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "returns_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      review_responses: {
        Row: {
          body: string
          created_at: string | null
          id: string
          review_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          review_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          review_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_responses_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          approved_at: string | null
          body: string | null
          created_at: string | null
          id: string
          is_approved: boolean | null
          is_verified_purchase: boolean | null
          photos: string[] | null
          product_id: string
          rating: number
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          body?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          photos?: string[] | null
          product_id: string
          rating: number
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved_at?: string | null
          body?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          photos?: string[] | null
          product_id?: string
          rating?: number
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_sizes: {
        Row: {
          anklet_length: string | null
          bracelet_size: string | null
          created_at: string | null
          id: string
          label: string | null
          necklace_length: string | null
          ring_size: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          anklet_length?: string | null
          bracelet_size?: string | null
          created_at?: string | null
          id?: string
          label?: string | null
          necklace_length?: string | null
          ring_size?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          anklet_length?: string | null
          bracelet_size?: string | null
          created_at?: string | null
          id?: string
          label?: string | null
          necklace_length?: string | null
          ring_size?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      shipment_items: {
        Row: {
          created_at: string | null
          id: string
          order_item_id: string
          quantity: number
          shipment_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_item_id: string
          quantity?: number
          shipment_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          order_item_id?: string
          quantity?: number
          shipment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipment_items_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_items_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          carrier: string | null
          created_at: string | null
          delivered_at: string | null
          estimated_delivery: string | null
          id: string
          label_url: string | null
          order_id: string
          shipped_at: string | null
          shipping_method_id: string | null
          status: Database["public"]["Enums"]["shipment_status"] | null
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          carrier?: string | null
          created_at?: string | null
          delivered_at?: string | null
          estimated_delivery?: string | null
          id?: string
          label_url?: string | null
          order_id: string
          shipped_at?: string | null
          shipping_method_id?: string | null
          status?: Database["public"]["Enums"]["shipment_status"] | null
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          carrier?: string | null
          created_at?: string | null
          delivered_at?: string | null
          estimated_delivery?: string | null
          id?: string
          label_url?: string | null
          order_id?: string
          shipped_at?: string | null
          shipping_method_id?: string | null
          status?: Database["public"]["Enums"]["shipment_status"] | null
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_shipping_method_id_fkey"
            columns: ["shipping_method_id"]
            isOneToOne: false
            referencedRelation: "shipping_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_methods: {
        Row: {
          carrier: string | null
          created_at: string | null
          description: string | null
          estimated_days_max: number | null
          estimated_days_min: number | null
          free_above: number | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          sort_order: number | null
          updated_at: string | null
          zone_id: string
        }
        Insert: {
          carrier?: string | null
          created_at?: string | null
          description?: string | null
          estimated_days_max?: number | null
          estimated_days_min?: number | null
          free_above?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          price?: number
          sort_order?: number | null
          updated_at?: string | null
          zone_id: string
        }
        Update: {
          carrier?: string | null
          created_at?: string | null
          description?: string | null
          estimated_days_max?: number | null
          estimated_days_min?: number | null
          free_above?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          sort_order?: number | null
          updated_at?: string | null
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipping_methods_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "shipping_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_zones: {
        Row: {
          countries: string[]
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          countries?: string[]
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          countries?: string[]
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          attachments: string[] | null
          body: string
          created_at: string | null
          id: string
          is_internal: boolean | null
          ticket_id: string
          user_id: string
        }
        Insert: {
          attachments?: string[] | null
          body: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          ticket_id: string
          user_id: string
        }
        Update: {
          attachments?: string[] | null
          body?: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_to: string | null
          category: Database["public"]["Enums"]["ticket_category"] | null
          channel: Database["public"]["Enums"]["ticket_channel"] | null
          closed_at: string | null
          created_at: string | null
          id: string
          order_id: string | null
          priority: Database["public"]["Enums"]["ticket_priority"] | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["ticket_status"] | null
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["ticket_category"] | null
          channel?: Database["public"]["Enums"]["ticket_channel"] | null
          closed_at?: string | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"] | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"] | null
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["ticket_category"] | null
          channel?: Database["public"]["Enums"]["ticket_channel"] | null
          closed_at?: string | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"] | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"] | null
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_events: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          location: string | null
          occurred_at: string
          raw_payload: Json | null
          shipment_id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          occurred_at?: string
          raw_payload?: Json | null
          shipment_id: string
          status: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          occurred_at?: string
          raw_payload?: Json | null
          shipment_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracking_events_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
          variant_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
          variant_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_variant_stock: {
        Args: {
          p_variant_id: string
          p_quantity: number
        }
        Returns: {
          variant_id: string
          new_quantity: number
        }[]
      }
    }
    Enums: {
      address_type: "shipping" | "billing"
      banner_placement:
        | "hero"
        | "category"
        | "sidebar"
        | "popup"
        | "footer"
        | "announcement_bar"
      campaign_status: "draft" | "scheduled" | "sending" | "sent" | "cancelled"
      discount_type:
        | "percentage"
        | "fixed_amount"
        | "free_shipping"
        | "buy_x_get_y"
      loyalty_tier_name: "bronze" | "silver" | "gold" | "platinum"
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded"
        | "partially_refunded"
        | "on_hold"
        | "failed"
      payment_status:
        | "pending"
        | "processing"
        | "succeeded"
        | "failed"
        | "refunded"
        | "partially_refunded"
        | "cancelled"
      product_relation_type: "cross_sell" | "upsell" | "parure" | "similar"
      return_reason:
        | "wrong_size"
        | "defective"
        | "not_as_described"
        | "changed_mind"
        | "arrived_late"
        | "wrong_item"
        | "other"
      return_status:
        | "requested"
        | "approved"
        | "rejected"
        | "shipped_back"
        | "received"
        | "inspected"
        | "refunded"
        | "exchanged"
        | "closed"
      shipment_status:
        | "pending"
        | "label_created"
        | "picked_up"
        | "in_transit"
        | "out_for_delivery"
        | "delivered"
        | "failed_attempt"
        | "returned_to_sender"
        | "exception"
      ticket_category:
        | "order_issue"
        | "product_question"
        | "shipping"
        | "return_exchange"
        | "payment"
        | "account"
        | "complaint"
        | "other"
      ticket_channel:
        | "email"
        | "phone"
        | "chat"
        | "social_media"
        | "contact_form"
      ticket_priority: "low" | "medium" | "high" | "urgent"
      ticket_status:
        | "open"
        | "in_progress"
        | "waiting_customer"
        | "waiting_internal"
        | "resolved"
        | "closed"
      user_role: "customer" | "support" | "editor" | "admin" | "super_admin"
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
      address_type: ["shipping", "billing"],
      banner_placement: [
        "hero",
        "category",
        "sidebar",
        "popup",
        "footer",
        "announcement_bar",
      ],
      campaign_status: ["draft", "scheduled", "sending", "sent", "cancelled"],
      discount_type: [
        "percentage",
        "fixed_amount",
        "free_shipping",
        "buy_x_get_y",
      ],
      loyalty_tier_name: ["bronze", "silver", "gold", "platinum"],
      order_status: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
        "partially_refunded",
        "on_hold",
        "failed",
      ],
      payment_status: [
        "pending",
        "processing",
        "succeeded",
        "failed",
        "refunded",
        "partially_refunded",
        "cancelled",
      ],
      product_relation_type: ["cross_sell", "upsell", "parure", "similar"],
      return_reason: [
        "wrong_size",
        "defective",
        "not_as_described",
        "changed_mind",
        "arrived_late",
        "wrong_item",
        "other",
      ],
      return_status: [
        "requested",
        "approved",
        "rejected",
        "shipped_back",
        "received",
        "inspected",
        "refunded",
        "exchanged",
        "closed",
      ],
      shipment_status: [
        "pending",
        "label_created",
        "picked_up",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "failed_attempt",
        "returned_to_sender",
        "exception",
      ],
      ticket_category: [
        "order_issue",
        "product_question",
        "shipping",
        "return_exchange",
        "payment",
        "account",
        "complaint",
        "other",
      ],
      ticket_channel: [
        "email",
        "phone",
        "chat",
        "social_media",
        "contact_form",
      ],
      ticket_priority: ["low", "medium", "high", "urgent"],
      ticket_status: [
        "open",
        "in_progress",
        "waiting_customer",
        "waiting_internal",
        "resolved",
        "closed",
      ],
      user_role: ["customer", "support", "editor", "admin", "super_admin"],
    },
  },
} as const

