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
type ChallanDisposedData = {
  challan_no: string;
  challan_status: string;
  sent_to_reg_court: string;
  remark: string;
  sent_to_virtual_court: string;
  amount_of_fine_imposed: string | null;
  state_code: string;
  fine_imposed: string;
  challan_date_time: string;
  receipt_no:string
};

type ApiResponse = {
  error: string;
  code: string;
  message: string;
  data: {
    Pending_data: ChallanData[];
    Disposed_data: ChallanDisposedData[];
  };
};

// Add export config for dynamic rendering
export const dynamic = 'force-dynamic';

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
        receipt_no:challan.receipt_no
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

// import { NextResponse } from 'next/server';
// import { Prisma, PrismaClient } from '@prisma/client';

// // Add export config for dynamic rendering
// export const dynamic = 'force-dynamic';

// export async function GET(request: Request) {
//   const prisma = new PrismaClient();

//   try {
//     // Get the RC number from the URL params
//     const { searchParams } = new URL(request.url);
//     const rcNo = searchParams.get('rc_no');

//     if (!rcNo) {
//       return NextResponse.json(
//         { error: true, message: 'RC number is required' },
//         { status: 400 }
//       );
//     }

//     // Make the API call to the external service
//     const response = await fetch(
//       `https://apiv2.vahanfin.com/echallan/?rc_no=${rcNo}`,
//       {
//         headers: {
//           'x-api-key': process.env.VAHAN_API_KEY || 'abcd123',
//         },
//       }
//     );

//     if (!response.ok) {
//       throw new Error('Failed to fetch data');
//     }

//     // Type for API response
//     type ApiResponse = {
//       error: string;
//       code: string;
//       message: string;
//       data: {
//         Pending_data: any[];
//         Disposed_data: any[];
//       };
//     };

//     const apiData: ApiResponse = await response.json();

//     // Find the associated vehicle and user
//     const vehicle = await prisma.vehicle.findUnique({
//       where: { vrn: rcNo },
//       select: { id: true, ownerId: true }
//     });

//     if (!vehicle) {
//       return NextResponse.json(
//         { error: true, message: 'Vehicle not found' },
//         { status: 404 }
//       );
//     }

//     // Transform and prepare Challan data to match Prisma schema
//     const transformChallans = (challans: any[], status: string): Prisma.ChallanCreateInput[] => 
//       challans.map(challan => ({
//         rc_no: rcNo,
//         user: {
//           connect: { id: vehicle.ownerId || '' }
//         },
//         vehicle: {
//           connect: { id: vehicle.id }
//         },
//         challan_no: challan.challan_no,
//         challan_status: status,
//         sent_to_reg_court: challan.sent_to_reg_court === 'Yes',
//         remark: challan.remark || null,
//         sent_to_virtual_court: challan.sent_to_virtual_court === 'Yes',
//         amount_of_fine: new Prisma.Decimal(parseFloat(challan.amount_of_fine_imposed || challan.fine_imposed || '0')),
//         state_code: challan.state_code,
//         fine_imposed: new Prisma.Decimal(parseFloat(challan.fine_imposed)),
//         challan_date_time: new Date(challan.challan_date_time),
//         receipt_no: challan.receipt_no || null
//       }));

//     // Transform the data
//     const transformedData = {
//       Pending_data: transformChallans(apiData.data.Pending_data, 'Pending'),
//       Disposed_data: transformChallans(apiData.data.Disposed_data, 'Disposed')
//     };

//     // Optional: Bulk create challans in the database
//     try {
//       // Upsert challans to avoid duplicates
//       const upsertChallans = async (challans: Prisma.ChallanCreateInput[]) => {
//         return Promise.all(
//           challans.map(challan => 
//             prisma.challan.upsert({
//               where: { challan_no: challan.challan_no },
//               update: {
//                 challan_status: challan.challan_status,
//                 sent_to_reg_court: challan.sent_to_reg_court,
//                 remark: challan.remark,
//                 sent_to_virtual_court: challan.sent_to_virtual_court,
//                 amount_of_fine: challan.amount_of_fine,
//                 state_code: challan.state_code,
//                 fine_imposed: challan.fine_imposed,
//                 challan_date_time: challan.challan_date_time,
//                 receipt_no: challan.receipt_no
//               },
//               create: challan
//             })
//           )
//         );
//       };

//       await upsertChallans(transformedData.Pending_data);
//       await upsertChallans(transformedData.Disposed_data);
//     } catch (dbError) {
//       console.error('Error saving challans to database:', dbError);
//       // Non-critical error, continue with response
//     }

//     return NextResponse.json({
//       error: apiData.error,
//       code: apiData.code,
//       message: apiData.message,
//       data: {
//         Pending_data: transformedData.Pending_data.map(p => ({
//           challan_no: p.challan_no,
//           challan_status: p.challan_status,
//           sent_to_reg_court: p.sent_to_reg_court ? 'Yes' : 'No',
//           remark: p.remark || '',
//           sent_to_virtual_court: p.sent_to_virtual_court ? 'Yes' : 'No',
//           amount_of_fine_imposed: p.amount_of_fine.toString(),
//           state_code: p.state_code,
//           fine_imposed: p.fine_imposed.toString(),
//           challan_date_time: p.challan_date_time
//         })),
//         Disposed_data: transformedData.Disposed_data.map(d => ({
//           challan_no: d.challan_no,
//           challan_status: d.challan_status,
//           sent_to_reg_court: d.sent_to_reg_court ? 'Yes' : 'No',
//           remark: d.remark || '',
//           sent_to_virtual_court: d.sent_to_virtual_court ? 'Yes' : 'No',
//           amount_of_fine_imposed: d.amount_of_fine.toString(),
//           state_code: d.state_code,
//           fine_imposed: d.fine_imposed.toString(),
//           challan_date_time: d.challan_date_time,
//           receipt_no: d.receipt_no || ''
//         }))
//       },
//     });
//   } catch (error) {
//     console.error('Error fetching challan data:', error);
//     return NextResponse.json(
//       { error: true, message: 'Failed to fetch challan data' },
//       { status: 500 }
//     );
//   } finally {
//     await prisma.$disconnect();
//   }
// }