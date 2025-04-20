import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type'); // 'Topup', 'Booking'
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const sortOrder = searchParams.get('sortOrder') || 'DESC';
    
    // ในบางกรณีอาจยอมให้ไม่ระบุ userId เพื่อดึงข้อมูลทั้งหมด (เช่น สำหรับแอดมิน)
    // แต่ในที่นี้เราเน้นความปลอดภัยโดยให้ระบุ userId เสมอ
    if (!userId) {
      return NextResponse.json({ error: "ต้องระบุรหัสผู้ใช้" }, { status: 400 });
    }
    
    const db = mysqlPool.promise();
    
    // สร้างคำสั่ง SQL พื้นฐาน
    let query = `SELECT * FROM Transaction_History WHERE User_ID = ?`;
    const params = [userId];
    
    // เพิ่มเงื่อนไขกรองตามประเภทธุรกรรม
    if (type) {
      query += ` AND Transaction_Type = ?`;
      params.push(type);
    }
    
    // เพิ่มเงื่อนไขกรองตามช่วงวันที่
    if (fromDate) {
      query += ` AND Transaction_Date >= ?`;
      params.push(fromDate);
    }
    
    if (toDate) {
      query += ` AND Transaction_Date <= ?`;
      // ให้รวมถึงเวลาสิ้นสุดของวัน
      params.push(toDate + ' 23:59:59');
    }
    
    // เพิ่มการเรียงลำดับ
    query += ` ORDER BY Transaction_Date ${sortOrder}`;
    
    // ดึงข้อมูลประวัติธุรกรรม
    const [transactions] = await db.query(query, params);
    
    // จัดรูปแบบข้อมูลเพิ่มเติมหากจำเป็น
    // สำหรับข้อมูลการจอง อาจต้องการข้อมูลเพิ่มเติมเกี่ยวกับห้องที่จอง
    const enhancedTransactions = await Promise.all(transactions.map(async (transaction) => {
      // ถ้าเป็นธุรกรรมการจอง และมีข้อมูล Booking_ID ให้ดึงข้อมูลการจองเพิ่มเติม
      if (transaction.Transaction_Type === 'Booking' && transaction.Reference_ID) {
        try {
          const [bookingDetails] = await db.query(
            `SELECT b.*, r.Room_Number, ts.Slot_Name, ts.Start_Time, ts.End_Time
             FROM Bookings b
             JOIN Rooms r ON b.Room_ID = r.Room_ID
             JOIN Time_Slots ts ON b.Time_Slot_ID = ts.Time_Slot_ID
             WHERE b.Booking_ID = ?`,
            [transaction.Reference_ID]
          );
          
          if (bookingDetails.length > 0) {
            transaction.BookingDetails = {
              roomNumber: bookingDetails[0].Room_Number,
              bookingDate: bookingDetails[0].Booking_Date,
              timeSlot: `${bookingDetails[0].Slot_Name} (${bookingDetails[0].Start_Time.substring(0, 5)} - ${bookingDetails[0].End_Time.substring(0, 5)})`
            };
          }
        } catch (error) {
          console.error('Error fetching booking details:', error);
          // ไม่ต้องหยุดการทำงานทั้งหมดหากไม่สามารถดึงข้อมูลการจองได้
        }
      }
      
      return transaction;
    }));
    
    return NextResponse.json({
      success: true,
      transactions: enhancedTransactions
    });
    
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    return NextResponse.json(
      { 
        success: false,
        error: `ไม่สามารถดึงข้อมูลประวัติธุรกรรมได้: ${error.message}` 
      },
      { status: 500 }
    );
  }
}