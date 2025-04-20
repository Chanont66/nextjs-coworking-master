// app/api/timeslots/[id]/route.js

import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function GET(request, { params }) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: "ต้องระบุรหัสช่วงเวลา" },
        { status: 400 }
      );
    }
    
    // กรณีที่ยังไม่มีการเชื่อมต่อกับฐานข้อมูล หรือต้องการข้อมูลทดสอบ
    let timeSlot;
    
    switch (parseInt(id)) {
      case 1:
        timeSlot = {
          Time_Slot_ID: 1,
          Slot_Name: 'Morning',
          Start_Time: '08:00:00',
          End_Time: '12:00:00',
          Description: 'Morning session 08:00 - 12:00'
        };
        break;
      case 2:
        timeSlot = {
          Time_Slot_ID: 2,
          Slot_Name: 'Afternoon',
          Start_Time: '13:00:00',
          End_Time: '17:00:00',
          Description: 'Afternoon session 13:00 - 17:00'
        };
        break;
      case 3:
        timeSlot = {
          Time_Slot_ID: 3,
          Slot_Name: 'Full Day',
          Start_Time: '08:00:00',
          End_Time: '17:00:00',
          Description: 'Full day session 08:00 - 17:00'
        };
        break;
      default:
        return NextResponse.json(
          { error: "ไม่พบช่วงเวลาที่ระบุ" },
          { status: 404 }
        );
    }
    
    return NextResponse.json({
      success: true,
      timeSlot: timeSlot
    });
    
  } catch (error) {
    console.error("Error fetching time slot:", error);
    return NextResponse.json(
      { error: `ไม่สามารถดึงข้อมูลช่วงเวลาได้: ${error.message}` },
      { status: 500 }
    );
  }
}