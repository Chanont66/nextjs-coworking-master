// app/api/bookings/history/route.js

import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function GET(request) {
  try {
    // ดึง user ID จาก query parameters
    const searchParams = new URL(request.url).searchParams;
    const userId = searchParams.get("userId");

    // ตรวจสอบว่ามี userId หรือไม่
    if (!userId) {
      return NextResponse.json(
        { error: "ต้องระบุ userId ในการดึงข้อมูลประวัติการจอง" },
        { status: 400 }
      );
    }

    const db = mysqlPool.promise();

    // ดึงข้อมูลการจองพร้อมกับรายละเอียดของห้องและช่วงเวลา
    const [bookings] = await db.query(
      `SELECT 
        b.Booking_ID, 
        b.User_ID, 
        b.Room_ID, 
        r.Room_Number,
        r.Room_Type,
        r.Capacity,
        r.Price,
        b.Time_Slot_ID, 
        ts.Start_Time, 
        ts.End_Time,
        b.Booking_Date, 
        b.Booking_Created, 
        b.Total_Price, 
        b.Booking_Status, 
        b.Payment_Method
      FROM 
        Bookings b
      LEFT JOIN 
        Rooms r ON b.Room_ID = r.Room_ID
      LEFT JOIN 
        Time_Slots ts ON b.Time_Slot_ID = ts.Time_Slot_ID
      WHERE 
        b.User_ID = ?
      ORDER BY 
        b.Booking_Created DESC`,
      [userId]
    );

    // ส่งข้อมูลกลับ
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching booking history:", error);
    return NextResponse.json(
      { error: `เกิดข้อผิดพลาดในการดึงประวัติการจอง: ${error.message}` },
      { status: 500 }
    );
  }
}