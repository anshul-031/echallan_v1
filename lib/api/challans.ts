import { query } from '../db';
import { Violation } from '@/app/types/challan';

export async function getChallans(): Promise<Violation[]> {
  try {
    return await query<Violation>(`
      SELECT 
        c.id,
        v.vrn as "vehicleNo",
        c.violation_type as violation,
        c.location,
        c.violation_date as date,
        c.amount as fine,
        c.status
      FROM challans c
      JOIN vehicles v ON v.id = c.vehicle_id
      ORDER BY c.violation_date DESC
    `);
  } catch (error) {
    console.error('Error fetching challans:', error);
    return [];
  }
}

export async function getChallan(id: number): Promise<Violation | null> {
  try {
    const challans = await query<Violation>(`
      SELECT 
        c.id,
        v.vrn as "vehicleNo",
        c.violation_type as violation,
        c.location,
        c.violation_date as date,
        c.amount as fine,
        c.status
      FROM challans c
      JOIN vehicles v ON v.id = c.vehicle_id
      WHERE c.id = $1
    `, [id]);

    return challans.length > 0 ? challans[0] : null;
  } catch (error) {
    console.error('Error fetching challan:', error);
    return null;
  }
}

export async function createChallan(
  vehicleId: string,
  violation: string,
  amount: number,
  location: string
): Promise<Violation | null> {
  try {
    const result = await query<Violation>(`
      INSERT INTO challans (vehicle_id, violation_type, amount, location)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [vehicleId, violation, amount, location]);

    if (result.length > 0) {
      return getChallan(result[0].id);
    }
    return null;
  } catch (error) {
    console.error('Error creating challan:', error);
    return null;
  }
}