// app/api/bookings/cancel/route.js

import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function POST(request) {
  let connection;
  
  try {
    // ดึงข้อมูลจากคำขอ
    const { bookingId } = await request.json();
    
    // ตรวจสอบข้อมูล
    if (!bookingId) {
      return NextResponse.json(
        { error: "กรุณาระบุรหัสการจอง" },
        { status: 400 }
      );
    }
    
    // เริ่มการเชื่อมต่อแบบใช้ promise
    connection = await mysqlPool.promise().getConnection();
    
    // ตรวจสอบว่าการจองมีอยู่จริงและสามารถยกเลิกได้
    const [bookingCheck] = await connection.execute(
      "SELECT * FROM Bookings WHERE Booking_ID = ?",
      [bookingId]
    );
    
    if (bookingCheck.length === 0) {
      connection.release();
      return NextResponse.json(
        { error: "ไม่พบข้อมูลการจอง" },
        { status: 404 }
      );
    }
    
    const booking = bookingCheck[0];
    
    // ตรวจสอบว่าสถานะปัจจุบันเป็น "Confirmed" หรือไม่
    if (booking.Booking_Status !== "Confirmed") {
      connection.release();
      return NextResponse.json(
        { error: "ไม่สามารถยกเลิกการจองที่ไม่ได้อยู่ในสถานะยืนยันแล้ว" },
        { status: 400 }
      );
    }
    
    // ใช้ transaction
    await connection.beginTransaction();
    
    try {
      // 1. อัปเดตสถานะการจองเป็น "Cancelled"
      await connection.execute(
        "UPDATE Bookings SET Booking_Status = 'Cancelled' WHERE Booking_ID = ?",
        [bookingId]
      );
      
      // 2. คืนเงินให้กับผู้ใช้
      await connection.execute(
        `UPDATE Users SET Balance = Balance + (
          SELECT Total_Price FROM Bookings WHERE Booking_ID = ?
        ) WHERE User_ID = ?`,
        [bookingId, booking.User_ID]
      );
      
      // 3. ทำให้ห้องว่างอีกครั้ง (ถ้าห้องมี status)
      try {
        const [roomColumns] = await connection.execute("SHOW COLUMNS FROM Rooms");
        const hasStatusColumn = roomColumns.some(col => col.Field === 'Status');
        
        if (hasStatusColumn) {
          await connection.execute(
            "UPDATE Rooms SET Status = 'Available' WHERE Room_ID = ?",
            [booking.Room_ID]
          );
        }
      } catch (columnsError) {
        console.error("Error checking room columns:", columnsError);
        // ข้ามการอัปเดทสถานะห้องถ้ามีปัญหา
      }
      
      // Commit การเปลี่ยนแปลงทั้งหมด
      await connection.commit();
      connection.release();
      
      return NextResponse.json({
        success: true,
        message: "ยกเลิกการจองสำเร็จ"
      });
      
    } catch (transactionError) {
      // ถ้าเกิดข้อผิดพลาดในระหว่าง transaction ให้ rollback
      await connection.rollback();
      throw transactionError;
    }
    
  } catch (error) {
    // ถ้ามีการเริ่ม transaction ให้ rollback
    if (connection) {
      try {
        await connection.rollback();
        connection.release();
      } catch (rollbackError) {
        console.error("Error during rollback:", rollbackError);
      }
    }
    
    console.error("Error cancelling booking:", error);
    
    return NextResponse.json(
      { error: `เกิดข้อผิดพลาดในการยกเลิกการจอง: ${error.message}` },
      { status: 500 }
    );
  }
}