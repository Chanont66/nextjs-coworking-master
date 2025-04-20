// app/api/bookings/check-availability/route.js
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const roomType = searchParams.get('roomType');
    const timeSlotId = searchParams.get('timeSlotId');
    
    if (!date || !roomType || !timeSlotId) {
      return NextResponse.json(
        { error: "ต้องระบุวันที่ ประเภทห้อง และช่วงเวลา" },
        { status: 400 }
      );
    }
    
    // จำลองการตรวจสอบห้องว่าง
    // ในระบบจริงจะต้องตรวจสอบจากฐานข้อมูล
    
    // จำลองข้อมูลห้องทั้งหมด
    const allRooms = [
      { Room_ID: 1, Room_Number: 'M-A01', Room_Type: 'Type A', Capacity: 8, Price: 500, Status: 'Available', Description: 'Small meeting room for up to 8 people' },
      { Room_ID: 2, Room_Number: 'M-A02', Room_Type: 'Type A', Capacity: 8, Price: 500, Status: 'Available', Description: 'Small meeting room for up to 8 people' },
      { Room_ID: 3, Room_Number: 'M-A03', Room_Type: 'Type A', Capacity: 8, Price: 500, Status: 'Available', Description: 'Small meeting room for up to 8 people' },
      { Room_ID: 4, Room_Number: 'M-A04', Room_Type: 'Type A', Capacity: 8, Price: 500, Status: 'Available', Description: 'Small meeting room for up to 8 people' },
      { Room_ID: 5, Room_Number: 'M-A05', Room_Type: 'Type A', Capacity: 8, Price: 500, Status: 'Available', Description: 'Small meeting room for up to 8 people' },
      { Room_ID: 6, Room_Number: 'M-A06', Room_Type: 'Type A', Capacity: 8, Price: 500, Status: 'Available', Description: 'Small meeting room for up to 8 people' },
    ];
    
    // กรองห้องตามประเภท
    const roomsOfType = allRooms.filter(room => room.Room_Type === roomType);
    
    // จำลองการจองที่มีอยู่
    const existingBookings = [
      // เช่น { roomId: 1, date: '2023-05-01', timeSlotId: 1 }
    ];
    
    // กรองห้องที่ว่าง
    const availableRooms = roomsOfType.filter(room => {
      return !existingBookings.some(booking => 
        booking.roomId === room.Room_ID && 
        booking.date === date && 
        booking.timeSlotId === parseInt(timeSlotId)
      );
    });
    
    return NextResponse.json({
      success: true,
      availableRooms: availableRooms
    });
    
  } catch (error) {
    console.error("Error checking room availability:", error);
    return NextResponse.json(
      { error: `ไม่สามารถตรวจสอบห้องว่างได้: ${error.message}` },
      { status: 500 }
    );
  }
}