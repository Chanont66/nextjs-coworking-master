// app/api/roomtype/rooms/route.js
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomType = searchParams.get('type');
    
    // จำลองข้อมูลห้องประชุม
    const allRooms = [
      { Room_ID: 1, Room_Number: 'M-A01', Room_Type: 'Type A', Capacity: 8, Price: 500, Status: 'Available', Description: 'Small meeting room for up to 8 people' },
      { Room_ID: 2, Room_Number: 'M-A02', Room_Type: 'Type A', Capacity: 8, Price: 500, Status: 'Available', Description: 'Small meeting room for up to 8 people' },
      { Room_ID: 3, Room_Number: 'M-A03', Room_Type: 'Type A', Capacity: 8, Price: 500, Status: 'Available', Description: 'Small meeting room for up to 8 people' },
      { Room_ID: 4, Room_Number: 'M-A04', Room_Type: 'Type A', Capacity: 8, Price: 500, Status: 'Available', Description: 'Small meeting room for up to 8 people' },
      { Room_ID: 5, Room_Number: 'M-A05', Room_Type: 'Type A', Capacity: 8, Price: 500, Status: 'Available', Description: 'Small meeting room for up to 8 people' },
      // app/api/roomtype/rooms/route.js (continued)
      { Room_ID: 6, Room_Number: 'M-A06', Room_Type: 'Type A', Capacity: 8, Price: 500, Status: 'Available', Description: 'Small meeting room for up to 8 people' },
      // Type B rooms
      { Room_ID: 7, Room_Number: 'M-B01', Room_Type: 'Type B', Capacity: 14, Price: 800, Status: 'Available', Description: 'Medium meeting room for up to 14 people' },
      // Type C rooms
      { Room_ID: 13, Room_Number: 'M-C01', Room_Type: 'Type C', Capacity: 20, Price: 1200, Status: 'Available', Description: 'Large meeting room for up to 20 people' },
    ];
    
    // กรองห้องตามประเภท
    let rooms = allRooms;
    if (roomType) {
      rooms = allRooms.filter(room => room.Room_Type === roomType);
    }
    
    return NextResponse.json({
      success: true,
      rooms: rooms
    });
    
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { error: `ไม่สามารถดึงข้อมูลห้องประชุมได้: ${error.message}` },
      { status: 500 }
    );
  }
}