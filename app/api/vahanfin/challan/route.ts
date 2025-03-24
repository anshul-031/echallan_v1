import { NextResponse } from 'next/server';

// Define types for our data structure
type ChallanData = {
  challan_no: string;
  challan_status: string;
  sent_to_reg_court: string;
  remark: string;
  sent_to_virtual_court: string;
  amount_of_fine_imposed: string | null;
  state_code: string;
  fine_imposed: string;
  challan_date_time: string;
};

type ApiResponse = {
  error: string;
  code: string;
  message: string;
  data: {
    Pending_data: ChallanData[];
    Disposed_data: ChallanData[];
  };
};

export async function GET(request: Request) {
  try {
    // Get the RC number from the URL params
    const { searchParams } = new URL(request.url);
    const rcNo = searchParams.get('rc_no');

    if (!rcNo) {
      return NextResponse.json(
        { error: true, message: 'RC number is required' },
        { status: 400 }
      );
    }

    // Make the API call to the external service
    const response = await fetch(
      `https://apiv2.vahanfin.com/echallan/?rc_no=${rcNo}`,
      {
        headers: {
          'x-api-key': 'abcd123',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const data: ApiResponse = await response.json();

    // Transform the data to include only the required fields
    const transformedData = {
      Pending_data: data.data.Pending_data.map((challan) => ({
        challan_no: challan.challan_no,
        challan_status: challan.challan_status,
        sent_to_reg_court: challan.sent_to_reg_court,
        remark: challan.remark,
        sent_to_virtual_court: challan.sent_to_virtual_court,
        amount_of_fine_imposed: challan.amount_of_fine_imposed,
        state_code: challan.state_code,
        fine_imposed: challan.fine_imposed,
        challan_date_time: challan.challan_date_time,
      })),
      Disposed_data: data.data.Disposed_data.map((challan) => ({
        challan_no: challan.challan_no,
        challan_status: challan.challan_status,
        sent_to_reg_court: challan.sent_to_reg_court,
        remark: challan.remark,
        sent_to_virtual_court: challan.sent_to_virtual_court,
        amount_of_fine_imposed: challan.amount_of_fine_imposed,
        state_code: challan.state_code,
        fine_imposed: challan.fine_imposed,
        challan_date_time: challan.challan_date_time,
      })),
    };

    return NextResponse.json({
      error: data.error,
      code: data.code,
      message: data.message,
      data: transformedData,
    });
  } catch (error) {
    console.error('Error fetching challan data:', error);
    return NextResponse.json(
      { error: true, message: 'Failed to fetch challan data' },
      { status: 500 }
    );
  }
}