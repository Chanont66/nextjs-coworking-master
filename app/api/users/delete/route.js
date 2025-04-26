// app/api/users/delete/route.js

import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function DELETE(request) {
  try {
    // รับข้อมูลจาก request body
    const body = await request.json();
    const { userId } = body;
    console.log('Attempting to delete user with ID:', userId);

    // ตรวจสอบว่า userId ถูกต้องหรือไม่
    if (!userId || isNaN(userId)) {
      return NextResponse.json(
        { error: 'กรุณาระบุรหัสผู้ใช้ที่ถูกต้อง' },
        { status: 400 }
      );
    }
    
    const userIdNumber = parseInt(userId, 10);
    
    // สร้างการเชื่อมต่อ
    const connection = await mysqlPool.promise().getConnection();
    
    try {
      // เริ่ม transaction
      await connection.beginTransaction();
      
      // ตรวจสอบว่าผู้ใช้มีอยู่จริงหรือไม่
      const [userExists] = await connection.query(
        "SELECT User_ID FROM Users WHERE User_ID = ?", 
        [userIdNumber]
      );
      
      if (userExists.length === 0) {
        await connection.release();
        return NextResponse.json(
          { error: 'ไม่พบบัญชีผู้ใช้' },
          { status: 404 }
        );
      }
      
      // 1. ลบ Feedback ที่เกี่ยวข้องกับการจองของผู้ใช้
      console.log('Deleting related Feedback...');
      await connection.query(`
        DELETE FROM Feedback
        WHERE Booking_ID IN (SELECT Booking_ID FROM Bookings WHERE User_ID = ?)
      `, [userIdNumber]);
      
      // 2. ลบ Transaction_History ที่เกี่ยวข้อง
      console.log('Deleting related Transaction_History...');
      await connection.query(`
        DELETE FROM Transaction_History WHERE User_ID = ?
      `, [userIdNumber]);
      
      // 3. ลบ Bookings ที่เกี่ยวข้อง
      console.log('Deleting related Bookings...');
      await connection.query(`
        DELETE FROM Bookings WHERE User_ID = ?
      `, [userIdNumber]);
      
      // 4. ลบ Topup_History ที่เกี่ยวข้อง
      console.log('Deleting related Topup_History...');
      await connection.query(`
        DELETE FROM Topup_History WHERE User_ID = ?
      `, [userIdNumber]);
      
      // 5. สุดท้ายลบผู้ใช้
      console.log('Deleting user from Users table...');
      const [result] = await connection.query(
        "DELETE FROM Users WHERE User_ID = ?", 
        [userIdNumber]
      );
      
      if (result.affectedRows > 0) {
        // ทำการ commit transaction
        await connection.commit();
        console.log('User deleted successfully');
        connection.release();
        return NextResponse.json(
          { success: true, message: 'ลบบัญชีผู้ใช้เรียบร้อยแล้ว' },
          { status: 200 }
        );
      } else {
        // ทำการ rollback
        await connection.rollback();
        console.log('User not found during deletion attempt');
        connection.release();
        return NextResponse.json(
          { error: 'ไม่พบบัญชีผู้ใช้' },
          { status: 404 }
        );
      }
    } catch (error) {
      // ถ้าเกิดข้อผิดพลาด ให้ rollback transaction
      if (connection) {
        await connection.rollback();
        connection.release();
      }
      
      console.error('Error deleting user:', error);
      
      return NextResponse.json(
        { error: 'ไม่สามารถลบบัญชีผู้ใช้ได้', details: error.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('General error:', error);
    
    return NextResponse.json(
      { error: 'ไม่สามารถลบบัญชีผู้ใช้ได้', details: error.message },
      { status: 500 }
    );
  }
}