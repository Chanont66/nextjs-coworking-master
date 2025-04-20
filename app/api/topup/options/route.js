// app/api/topup/options/route.js

import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function GET() {
  try {
    const db = mysqlPool.promise();
    
    // ดึงข้อมูลตัวเลือกเติมเงินจากฐานข้อมูล
    const [options] = await db.query(
      "SELECT * FROM Amount WHERE Is_Active = 1 ORDER BY Amount"
    );
    
    return NextResponse.json({
      success: true,
      options: options
    });
    
  } catch (error) {
    console.error("Error fetching topup options:", error);
    return NextResponse.json(
      { 
        success: false,
        error: `ไม่สามารถดึงข้อมูลตัวเลือกเติมเงินได้: ${error.message}` 
      },
      { status: 500 }
    );
  }
}