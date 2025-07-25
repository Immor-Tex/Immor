export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
}

export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimated_days: string;
  provider: 'ozon_express' | 'standard';
}

export interface OzonExpressRequest {
  from_address: {
    city: string;
    address: string;
    zip: string;
  };
  to_address: {
    city: string;
    address: string;
    zip: string;
    phone: string;
  };
  packages: Array<{
    weight: number;
    length: number;
    width: number;
    height: number;
  }>;
}

export interface OzonExpressResponse {
  success: boolean;
  data?: {
    delivery_options: Array<{
      id: string;
      name: string;
      description: string;
      price: number;
      estimated_days: string;
    }>;
  };
  error?: string;
}

export interface ShippingInfo {
  provider: 'ozon_express' | 'standard';
  option_id: string;
  tracking_number?: string;
  estimated_delivery?: string;
  cost: number;
} 