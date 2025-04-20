import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function GET() {
  try {
    const db = mysqlPool.promise();
    
    const [timeSlots] = await db.query("SELECT * FROM Time_Slots ORDER BY Time_Slot_ID");
    
    return NextResponse.json({
      success: true,
      timeSlots: timeSlots
    });
    
  } catch (error) {
    console.error("Error fetching time slots:", error);
    return NextResponse.json(
      { 
        success: false,
        error: `ไม่สามารถดึงข้อมูลช่วงเวลาได้: ${error.message}` 
      },
      { status: 500 }
    );
  }
}