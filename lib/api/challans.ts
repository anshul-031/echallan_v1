const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function getChallans() {
  try {
    const response = await fetch(`${API_URL}/challans`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching challans:', error);
    return [];
  }
}

export async function getChallan(id: string) {
  try {
    const response = await fetch(`${API_URL}/challans/${id}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching challan:', error);
    return null;
  }
}