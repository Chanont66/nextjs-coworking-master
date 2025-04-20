import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function POST(request) {
  try {
    const { userId, amount } = await request.json();
    
    if (!userId || !amount) {
      return NextResponse.json(
        { error: "ต้องระบุรหัสผู้ใช้และจำนวนเงิน" },
        { status: 400 }
      );
    }
    
    // ตรวจสอบว่าจำนวนเงินเป็นตัวเลขและมากกว่า 0
    const amountNumber = parseFloat(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      return NextResponse.json(
        { error: "จำนวนเงินต้องเป็นตัวเลขและมากกว่า 0" },
        { status: 400 }
      );
    }
    
    const db = mysqlPool.promise();
    
    // เริ่ม transaction
    await db.query("START TRANSACTION");
    
    try {
      // เติมเงินเข้ากระเป๋า
      await db.query(
        "UPDATE Users SET Balance = Balance + ? WHERE User_ID = ?",
        [amountNumber, userId]
      );
      
      // บันทึกประวัติการเติมเงิน
      await db.query(
        `INSERT INTO Topup_History 
         (User_ID, Amount, Topup_Date) 
         VALUES (?, ?, CURRENT_TIMESTAMP)`,
        [userId, amountNumber]
      );
      
      // บันทึกประวัติธุรกรรม
      await db.query(
        `INSERT INTO Transaction_History 
         (User_ID, Booking_ID, Amount, Transaction_Date, Transaction_Type, Description) 
         VALUES (?, NULL, ?, CURRENT_TIMESTAMP, 'Topup', ?)`,
        [userId, amountNumber, `เติมเงินเข้ากระเป๋า ${amountNumber.toLocaleString('th-TH')} บาท`]
      );
      
      // ดึงข้อมูลผู้ใช้ที่อัพเดทแล้ว
      const [updatedUser] = await db.query(
        "SELECT * FROM Users WHERE User_ID = ?",
        [userId]
      );
      
      // ยืนยัน transaction
      await db.query("COMMIT");
      
      return NextResponse.json({
        success: true,
        message: "เติมเงินสำเร็จ",
        user: updatedUser[0]
      });
      
    } catch (err) {
      // ยกเลิก transaction หากเกิดข้อผิดพลาด
      await db.query("ROLLBACK");
      throw err;
    }
    
  } catch (error) {
    console.error("Error topping up wallet:", error);
    return NextResponse.json(
      { error: `ไม่สามารถเติมเงินได้: ${error.message}` },
      { status: 500 }
    );
  }
}