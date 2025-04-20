import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function GET() {
  try {
    const db = mysqlPool.promise();
    
    const [amounts] = await db.query("SELECT * FROM Topup_Amounts WHERE Is_Active = 1 ORDER BY Amount");
    
    return NextResponse.json({
      success: true,
      amounts: amounts
    });
    
  } catch (error) {
    console.error("Error fetching topup amounts:", error);
    return NextResponse.json(
      { 
        success: false,
        error: `ไม่สามารถดึงข้อมูลจำนวนเงินเติมได้: ${error.message}` 
      },
      { status: 500 }
    );
  }
}