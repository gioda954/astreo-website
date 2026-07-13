export type ContactStatus = "da_contattare" | "contattato" | "confermato";
export type PaymentStatus = "non_pagato" | "parziale" | "pagato";
export type DeliveryStatus = "da_programmare" | "programmata" | "consegnata";
export type FulfillmentType = "spedizione" | "ritiro";

export interface Campaign {
  id: string;
  name: string;
  vintage: string;
  description: string;
  case_price_cents: number;
  shipping_price_cents: number;
  bottles_per_case: number;
  delivery_note: string;
  charity_note: string;
  goal_bottles: number;
  is_active: boolean;
}

export interface Order {
  id: string;
  code: string;
  receipt_token: string;
  created_at: string;
  updated_at: string;
  customer_name: string;
  phone: string;
  fulfillment_type: FulfillmentType;
  shipping_address: string | null;
  cases_quantity: number;
  bottles_quantity: number;
  notes: string | null;
  product_name: string;
  vintage: string;
  bottles_per_case: number;
  case_price_cents: number;
  shipping_price_cents: number;
  expected_total_cents: number;
  collected_total_cents: number;
  contact_status: ContactStatus;
  payment_status: PaymentStatus;
  delivery_status: DeliveryStatus;
  assignee_id: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  campaign_id: string;
}
