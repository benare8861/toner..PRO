export type InkColor = 'Cyan' | 'Magenta' | 'Yellow' | 'Black' | 'Light Cyan' | 'Light Magenta' | 'Other';

export interface InkItem {
  id: string;
  brand: string;
  model: string;
  color: InkColor;
  quantity: number;
  minThreshold: number;
  price: number;
  location: string;
  lastUpdated: string;
}

export interface StockTransaction {
  id: string;
  inkItemId: string;
  type: 'IN' | 'OUT';
  amount: number;
  date: string;
  note?: string;
  user: string;
}
