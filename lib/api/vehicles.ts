import { Vehicle } from '../../app/types/vehicle';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function getVehicles(): Promise<Vehicle[]> {
  try {
    const response = await fetch(`${API_URL}/vehicles`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return [];
  }
}

export async function getVehicle(id: string): Promise<Vehicle | null> {
  try {
    const response = await fetch(`${API_URL}/vehicles/${id}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return null;
  }
}