// app/api/roomtype/[id]/route.js

import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function GET(request, { params }) {
  try {
    const roomId = params.id;
    
    if (!roomId) {
      return NextResponse.json(
        { error: "ต้องระบุรหัสห้องประชุม" },
        { status: 400 }
      );
    }
    
    // กรณีที่ยังไม่มีการเชื่อมต่อกับฐานข้อมูล หรือต้องการข้อมูลทดสอบ
    const room = {
      Room_ID: parseInt(roomId),
      Room_Number: `M-A0${roomId}`,
      Room_Type: 'Type A',
      Capacity: 8,
      Price: 500,
      Status: 'Available',
      Description: 'Small meeting room for up to 8 people'
    };
    
    return NextResponse.json({
      success: true,
      room: room
    });
    
  } catch (error) {
    console.error("Error fetching room details:", error);
    return NextResponse.json(
      { error: `ไม่สามารถดึงข้อมูลห้องประชุมได้: ${error.message}` },
      { status: 500 }
    );
  }
}