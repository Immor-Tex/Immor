import { OzonExpressRequest, ShippingOption } from '../types/shipping';

// Ozon Express API configuration
const OZON_API_BASE_URL = 'https://api.ozon.ru/express/v1';
const OZON_API_KEY = import.meta.env.VITE_OZON_API_KEY || '';

// Default warehouse address (you should update this with your actual warehouse address)
const DEFAULT_WAREHOUSE = {
  city: 'Agadir',
  address: 'drarga agadir',
  zip: '80000'
};

export class OzonExpressService {
  private static async makeRequest(endpoint: string, data: any): Promise<any> {
    try {
      const response = await fetch(`${OZON_API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OZON_API_KEY}`,
          'Client-Id': import.meta.env.VITE_OZON_CLIENT_ID || ''
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Ozon API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Ozon Express API error:', error);
      throw error;
    }
  }

  /**
   * Calculate shipping options for a given address and package
   */
  static async calculateShipping(
    toAddress: {
      city: string;
      address: string;
      zip: string;
      phone: string;
    },
    packages: Array<{
      weight: number;
      length: number;
      width: number;
      height: number;
    }>
  ): Promise<ShippingOption[]> {
    try {
      const request: OzonExpressRequest = {
        from_address: DEFAULT_WAREHOUSE,
        to_address: toAddress,
        packages
      };

      const response = await this.makeRequest('/delivery/calculate', request);
      
      if (response.success && response.data?.delivery_options) {
        return response.data.delivery_options.map((option: any) => ({
          id: option.id,
          name: option.name,
          description: option.description,
          price: option.price,
          estimated_days: option.estimated_days,
          provider: 'ozon_express' as const
        }));
      }

      // Fallback to default options if API fails
      return this.getDefaultShippingOptions();
    } catch (error) {
      console.error('Failed to calculate Ozon Express shipping:', error);
      // Return default options as fallback
      return this.getDefaultShippingOptions();
    }
  }

  /**
   * Create a shipping label for an order
   */
  static async createShippingLabel(
    orderData: {
      order_number: string;
      customer_name: string;
      customer_phone: string;
      to_address: {
        city: string;
        address: string;
        zip: string;
      };
      packages: Array<{
        weight: number;
        length: number;
        width: number;
        height: number;
      }>;
    }
  ): Promise<{ tracking_number: string; label_url: string }> {
    try {
      const response = await this.makeRequest('/labels/create', {
        ...orderData,
        from_address: DEFAULT_WAREHOUSE
      });

      if (response.success && response.data) {
        return {
          tracking_number: response.data.tracking_number,
          label_url: response.data.label_url
        };
      }

      throw new Error('Failed to create shipping label');
    } catch (error) {
      console.error('Failed to create shipping label:', error);
      throw error;
    }
  }

  /**
   * Track a shipment by tracking number
   */
  static async trackShipment(trackingNumber: string): Promise<any> {
    try {
      const response = await this.makeRequest('/tracking', {
        tracking_number: trackingNumber
      });

      return response;
    } catch (error) {
      console.error('Failed to track shipment:', error);
      throw error;
    }
  }

  /**
   * Get default shipping options as fallback
   */
  private static getDefaultShippingOptions(): ShippingOption[] {
    return [
      {
        id: 'ozon_express_standard',
        name: 'Ozon Express Standard',
        description: '3-5ess days',
        price: 299, // 299 RUB
        estimated_days: '3-5',
        provider: 'ozon_express'
      },
      {
        id: 'ozon_express_express',
        name: 'Ozon Express Express',
        description: '1-2ess days',
        price: 599, // 599 RUB
        estimated_days: '1-2',
        provider: 'ozon_express'
      },
      {
        id: 'ozon_express_same_day',
        name: 'Ozon Express Same Day',
        description: 'Same day delivery (Moscow only)',
        price: 999, // 999 RUB
        estimated_days: 'Same day',
        provider: 'ozon_express'
      }
    ];
  }

  /**
   * Calculate package dimensions and weight from order items
   */
  static calculatePackageInfo(items: Array<{ quantity: number; product: any }>): Array<{
    weight: number;
    length: number;
    width: number;
    height: number;
  }> {
    // Default package dimensions (you should adjust based on your products)
    const defaultPackage = {
      weight: 0.5, // kg
      length: 30, // cm
      width: 20, // cm
      height: 10 // cm
    };

    // Calculate total weight based on items
    const totalWeight = items.reduce((sum, item) => sum + (defaultPackage.weight * item.quantity), 0);

    // For now, return a single package with calculated weight
    // In a real implementation, you might want to split into multiple packages
    return [{
      weight: Math.max(totalWeight, 0.1), // Minimum 0.1
      length: defaultPackage.length,
      width: defaultPackage.width,
      height: defaultPackage.height
    }];
  }
} 