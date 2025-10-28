export interface Policy {
  key: string;
  label: string;
  available: boolean;
}

export interface PolicyMetadata {
  policy_key: string;
  name_vi: string;
  name_en: string | null;
  description: string | null;
  display_order: number;
}

export interface PolicyFlags {
  free_cancellation: number;
  pay_later: number;
  no_credit_card: number;
  children_allowed: number;
  pets_allowed: number;
}