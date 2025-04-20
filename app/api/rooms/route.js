import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomType = searchParams.get('type');
    const selectedDate = searchParams.get('date'); // รับวันที่ที่ต้องการดู
    const selectedTimeSlot = searchParams.get('timeSlot'); // รับช่วงเวลาที่ต้องการดู
    
    // ในช่วงการพัฒนา เราสามารถส่งข้อมูลทดสอบกลับไปได้
    let allRooms = [
      // Type A rooms
      { Room_ID: 1, Room_Number: 'M-A01', Room_Type: 'Type A', Capacity: 8, Price: 500, Status: 'Available', Description: 'Small meeting room for up to 8 people' },
      { Room_ID: 2, Room_Number: 'M-A02', Room_Type: 'Type A', Capacity: 8, Price: 500, Status: 'Available', Description: 'Small meeting room for up to 8 people' },
      { Room_ID: 3, Room_Number: 'M-A03', Room_Type: 'Type A', Capacity: 8, Price: 500, Status: 'Available', Description: 'Small meeting room for up to 8 people' },
      { Room_ID: 4, Room_Number: 'M-A04', Room_Type: 'Type A', Capacity: 8, Price: 500, Status: 'Available', Description: 'Small meeting room for up to 8 people' },
      { Room_ID: 5, Room_Number: 'M-A05', Room_Type: 'Type A', Capacity: 8, Price: 500, Status: 'Available', Description: 'Small meeting room for up to 8 people' },
      { Room_ID: 6, Room_Number: 'M-A06', Room_Type: 'Type A', Capacity: 8, Price: 500, Status: 'Available', Description: 'Small meeting room for up to 8 people' },
      // Type B rooms
      { Room_ID: 7, Room_Number: 'M-B01', Room_Type: 'Type B', Capacity: 14, Price: 800, Status: 'Available', Description: 'Medium meeting room for up to 14 people' },
      { Room_ID: 8, Room_Number: 'M-B02', Room_Type: 'Type B', Capacity: 14, Price: 800, Status: 'Available', Description: 'Medium meeting room for up to 14 people' },
      { Room_ID: 9, Room_Number: 'M-B03', Room_Type: 'Type B', Capacity: 14, Price: 800, Status: 'Available', Description: 'Medium meeting room for up to 14 people' },
      { Room_ID: 10, Room_Number: 'M-B04', Room_Type: 'Type B', Capacity: 14, Price: 800, Status: 'Available', Description: 'Medium meeting room for up to 14 people' },
      { Room_ID: 11, Room_Number: 'M-B05', Room_Type: 'Type B', Capacity: 14, Price: 800, Status: 'Available', Description: 'Medium meeting room for up to 14 people' },
      { Room_ID: 12, Room_Number: 'M-B06', Room_Type: 'Type B', Capacity: 14, Price: 800, Status: 'Available', Description: 'Medium meeting room for up to 14 people' },
      // Type C rooms
      { Room_ID: 13, Room_Number: 'M-C01', Room_Type: 'Type C', Capacity: 20, Price: 1200, Status: 'Available', Description: 'Large meeting room for up to 20 people' },
      { Room_ID: 14, Room_Number: 'M-C02', Room_Type: 'Type C', Capacity: 20, Price: 1200, Status: 'Available', Description: 'Large meeting room for up to 20 people' },
      { Room_ID: 15, Room_Number: 'M-C03', Room_Type: 'Type C', Capacity: 20, Price: 1200, Status: 'Available', Description: 'Large meeting room for up to 20 people' },
      { Room_ID: 16, Room_Number: 'M-C04', Room_Type: 'Type C', Capacity: 20, Price: 1200, Status: 'Available', Description: 'Large meeting room for up to 20 people' },
      { Room_ID: 17, Room_Number: 'M-C05', Room_Type: 'Type C', Capacity: 20, Price: 1200, Status: 'Available', Description: 'Large meeting room for up to 20 people' },
    ];
    
    // ตรวจสอบการจองจากฐานข้อมูล เฉพาะวันที่และช่วงเวลาที่เลือก
    try {
      if (selectedDate && selectedTimeSlot) {
        const db = mysqlPool.promise();
        
        // ดึงข้อมูลการจองเฉพาะตามวันที่และช่วงเวลาที่เลือก
        const [bookings] = await db.query(
          `SELECT * FROM Bookings 
           WHERE Booking_Status = 'Confirmed' 
           AND Booking_Date = ? 
           AND Time_Slot_ID = ?`,
          [selectedDate, selectedTimeSlot]
        );
        
        console.log('Checking bookings for date:', selectedDate, 'and time slot:', selectedTimeSlot);
        console.log('Found bookings:', bookings);
        
        // อัพเดตสถานะห้องตามข้อมูลการจองเฉพาะวันและเวลาที่เลือก
        allRooms = allRooms.map(room => {
          // ตรวจสอบว่าห้องนี้มีการจองในวันที่และเวลาที่เลือกหรือไม่
          const isBooked = bookings.some(booking => booking.Room_ID === room.Room_ID);
          
          // ถ้ามีการจองในวันและเวลาที่เลือก ให้ปรับสถานะเป็น Unavailable
          if (isBooked) {
            return { ...room, Status: 'Unavailable' };
          }
          return room;
        });
      }
    } catch (dbError) {
      console.error("Error checking bookings:", dbError);
      // ถ้าไม่สามารถเช็คกับฐานข้อมูลได้ ยังคงใช้ข้อมูลเดิม
    }
    
    // กรองห้องตามประเภท
    let rooms = allRooms;
    if (roomType) {
      rooms = allRooms.filter(room => room.Room_Type === roomType);
    }
    
    return NextResponse.json({
      success: true,
      rooms: rooms
    });
    
    // เมื่อคุณพร้อมใช้งานกับฐานข้อมูลจริง ให้แก้ไขโค้ดด้านล่างแทน
    /*
    const db = mysqlPool.promise();
    
    // ดึงข้อมูลห้องทั้งหมด
    let query = "SELECT * FROM Rooms WHERE 1=1";
    const params = [];
    
    if (roomType) {
      query += " AND Room_Type = ?";
      params.push(roomType);
    }
    
    query += " ORDER BY Room_Number ASC";
    
    const [rooms] = await db.query(query, params);
    
    // ถ้ามีการเลือกวันที่และช่วงเวลา ให้ตรวจสอบการจอง
    if (selectedDate && selectedTimeSlot) {
      // ดึงข้อมูลการจองในวันและเวลาที่เลือก
      const [bookings] = await db.query(
        `SELECT * FROM Bookings 
         WHERE Booking_Status = 'Confirmed' 
         AND Booking_Date = ? 
         AND Time_Slot_ID = ?`,
        [selectedDate, selectedTimeSlot]
      );
      
      // อัพเดตสถานะห้องตามข้อมูลการจอง
      rooms.forEach(room => {
        const isBooked = bookings.some(booking => booking.Room_ID === room.Room_ID);
        if (isBooked) {
          room.Status = 'Unavailable';
        } else {
          room.Status = 'Available';
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      rooms: rooms
    });
    */
    
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { 
        success: false,
        error: `ไม่สามารถดึงข้อมูลห้องประชุมได้: ${error.message}` 
      },
      { status: 500 }
    );
  }
}