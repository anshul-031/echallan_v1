import { query } from '../db';
import { Vehicle } from '@/app/types/vehicle';

export async function getVehicles(): Promise<Vehicle[]> {
  try {
    return await query<Vehicle>(`
      SELECT 
        id,
        vrn,
        road_tax_expiry as "roadTaxExpiry",
        fitness_expiry as "fitnessExpiry",
        insurance_validity as "insuranceValidity",
        pollution_expiry as "pollutionExpiry",
        permit_expiry as "permitExpiry",
        national_permit_expiry as "nationalPermitExpiry",
        chassis_number as "chassisNumber",
        engine_number as "engineNumber",
        financer_name as "financerName",
        insurance_company as "insuranceCompany",
        blacklist_status as "blacklistStatus",
        rto_location as "rtoLocation"
      FROM vehicles
      ORDER BY created_at DESC
    `);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return [];
  }
}

export async function getVehicle(id: string): Promise<Vehicle | null> {
  try {
    const vehicles = await query<Vehicle>(`
      SELECT 
        id,
        vrn,
        road_tax_expiry as "roadTaxExpiry",
        fitness_expiry as "fitnessExpiry",
        insurance_validity as "insuranceValidity",
        pollution_expiry as "pollutionExpiry",
        permit_expiry as "permitExpiry",
        national_permit_expiry as "nationalPermitExpiry",
        chassis_number as "chassisNumber",
        engine_number as "engineNumber",
        financer_name as "financerName",
        insurance_company as "insuranceCompany",
        blacklist_status as "blacklistStatus",
        rto_location as "rtoLocation"
      FROM vehicles
      WHERE id = $1
    `, [id]);

    return vehicles.length > 0 ? vehicles[0] : null;
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return null;
  }
}

export async function createVehicle(vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle | null> {
  try {
    const result = await query<Vehicle>(`
      INSERT INTO vehicles (
        vrn,
        road_tax_expiry,
        fitness_expiry,
        insurance_validity,
        pollution_expiry,
        permit_expiry,
        national_permit_expiry,
        chassis_number,
        engine_number,
        financer_name,
        insurance_company,
        blacklist_status,
        rto_location
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      vehicle.vrn,
      vehicle.roadTaxExpiry,
      vehicle.fitnessExpiry,
      vehicle.insuranceValidity,
      vehicle.pollutionExpiry,
      vehicle.permitExpiry,
      vehicle.nationalPermitExpiry,
      vehicle.chassisNumber,
      vehicle.engineNumber,
      vehicle.financerName,
      vehicle.insuranceCompany,
      vehicle.blacklistStatus,
      vehicle.rtoLocation
    ]);

    return result[0] || null;
  } catch (error) {
    console.error('Error creating vehicle:', error);
    return null;
  }
}