// src/app/housinglocation.ts
export interface Housinglocation {
  id: number;
  name: string;
  city: string;
  state: string;
  address: string;
  zipCode: string;
  price: number;
  photo: string;
  availableUnits: number;
  wifi: boolean;
  laundry: boolean;
}