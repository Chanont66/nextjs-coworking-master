import { NextResponse } from 'next/server';
import { mysqlPool } from '@/utils/db';

export async function POST(request) {
  let connection;
  
  try {
    // ดึงข้อมูลจากคำขอ
    const requestData = await request.json();
    console.log('Received booking request:', requestData);
    
    const { userId, roomId, timeSlotId, bookingDate, totalPrice } = requestData;
    
    // ตรวจสอบข้อมูล
    if (!userId || !roomId || !timeSlotId || !bookingDate || !totalPrice) {
      console.error('Missing required data:', { userId, roomId, timeSlotId, bookingDate, totalPrice });
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 });
    }
    
    // แปลงรูปแบบวันที่ให้ถูกต้อง (YYYY-MM-DD)
    let formattedDate = bookingDate;
    try {
      // ตรวจสอบว่าเป็นรูปแบบวันที่ที่ถูกต้องหรือไม่
      const dateObj = new Date(bookingDate);
      if (!isNaN(dateObj.getTime())) {
        formattedDate = dateObj.toISOString().split('T')[0]; // รูปแบบ YYYY-MM-DD
      }
    } catch (dateError) {
      console.error('Date formatting error:', dateError);
      // ใช้ค่าเดิมถ้าไม่สามารถแปลงได้
    }
    
    console.log('Getting database connection...');
    // เริ่มการเชื่อมต่อแบบใช้ promise
    connection = await mysqlPool.promise().getConnection();
    console.log('Database connection established.');
    
    // ตรวจสอบความพร้อมใช้งานของห้อง
    console.log('Checking room availability...');
    const [checkAvailability] = await connection.execute(
      `SELECT * FROM Bookings 
       WHERE Room_ID = ? AND Time_Slot_ID = ? AND Booking_Date = ? AND Booking_Status = 'Confirmed'`,
      [roomId, timeSlotId, formattedDate]
    );
    
    if (checkAvailability.length > 0) {
      console.log('Room already booked:', checkAvailability);
      connection.release();
      return NextResponse.json({ error: 'ห้องนี้ถูกจองไปแล้ว กรุณาเลือกห้องอื่น' }, { status: 400 });
    }
    
    // ตรวจสอบยอดเงินของผู้ใช้
    console.log('Checking user balance...');
    const [userResult] = await connection.execute('SELECT * FROM Users WHERE User_ID = ?', [userId]);
    if (userResult.length === 0) {
      console.error('User not found:', userId);
      connection.release();
      return NextResponse.json({ error: 'ไม่พบข้อมูลผู้ใช้' }, { status: 400 });
    }
    
    const user = userResult[0];
    console.log('User balance:', user.Balance, 'Total price:', totalPrice);
    
    if (parseFloat(user.Balance) < parseFloat(totalPrice)) {
      console.log('Insufficient balance', { userBalance: user.Balance, required: totalPrice });
      connection.release();
      return NextResponse.json({ error: 'ยอดเงินไม่เพียงพอ' }, { status: 400 });
    }
    
    // ใช้ transaction
    console.log('Beginning transaction...');
    await connection.beginTransaction();
    
    try {
      // 1. สร้างข้อมูลการจอง
      console.log('Creating booking record with date:', formattedDate);
      const [bookingResult] = await connection.execute(
        `INSERT INTO Bookings (User_ID, Room_ID, Time_Slot_ID, Booking_Date, Total_Price, Booking_Status, Payment_Method) 
         VALUES (?, ?, ?, ?, ?, 'Confirmed', 'Wallet')`,
        [userId, roomId, timeSlotId, formattedDate, totalPrice]
      );
      
      console.log('Booking created:', bookingResult);
      
      // 2. อัพเดทยอดเงินของผู้ใช้
      console.log('Updating user balance...');
      const newBalance = parseFloat(user.Balance) - parseFloat(totalPrice);
      const [updateBalanceResult] = await connection.execute(
        'UPDATE Users SET Balance = ? WHERE User_ID = ?',
        [newBalance.toFixed(2), userId]
      );
      
      console.log('User balance updated:', { oldBalance: user.Balance, newBalance: newBalance.toFixed(2), result: updateBalanceResult });
      
      // 3. อัพเดทสถานะห้อง (เพิ่มขั้นตอนนี้)
      console.log('Updating room status...');
      
      // ตรวจสอบว่าคอลัมน์ Status มีอยู่จริงหรือไม่
      try {
        const [roomColumns] = await connection.execute('SHOW COLUMNS FROM Rooms');
        const hasStatusColumn = roomColumns.some(col => col.Field === 'Status');
        
        if (hasStatusColumn) {
          const [updateRoomResult] = await connection.execute(
            'UPDATE Rooms SET Status = "Unavailable" WHERE Room_ID = ?',
            [roomId]
          );
          console.log('Room status updated:', updateRoomResult);
        } else {
          console.warn('Status column not found in Rooms table, skipping room status update');
        }
      } catch (columnsError) {
        console.error('Error checking room columns:', columnsError);
        // ข้ามการอัพเดทสถานะห้องถ้ามีปัญหา
      }
      
      console.log('Committing transaction...');
      await connection.commit();
      console.log('Transaction committed successfully.');
      
      // ดึงข้อมูลผู้ใช้ที่อัพเดทแล้ว
      console.log('Fetching updated user data...');
      const [updatedUserResult] = await connection.execute('SELECT * FROM Users WHERE User_ID = ?', [userId]);
      const updatedUser = updatedUserResult[0];
      
      connection.release();
      console.log('Database connection released.');
      
      return NextResponse.json({ 
        success: true, 
        message: 'จองห้องประชุมสำเร็จ',
        user: updatedUser 
      });
    } catch (transactionError) {
      // ถ้าเกิดข้อผิดพลาดในระหว่าง transaction ให้ rollback
      console.error('Error during transaction, rolling back:', transactionError);
      await connection.rollback();
      throw transactionError; // ส่งต่อข้อผิดพลาดไปยัง catch ข้างนอก
    }
    
  } catch (error) {
    // ถ้ามีการเริ่ม transaction ให้ rollback
    if (connection) {
      try {
        console.log('Performing rollback due to error...');
        await connection.rollback();
        connection.release();
        console.log('Rollback completed and connection released.');
      } catch (rollbackError) {
        console.error('Error during rollback:', rollbackError);
      }
    }
    
    // บันทึกรายละเอียดข้อผิดพลาด
    console.error('Error creating booking:', error);
    console.error('Error stack:', error.stack);
    
    // ส่งข้อความผิดพลาดที่มีรายละเอียดมากขึ้น
    let errorMessage = 'เกิดข้อผิดพลาดในการจองห้องประชุม';
    
    if (error.code) {
      // กรณี SQL Error จะมี error code
      if (error.code === 'ER_DUP_ENTRY') {
        errorMessage = 'มีการจองห้องนี้ไปแล้ว กรุณาเลือกห้องหรือเวลาอื่น';
      } else if (error.code === 'ER_NO_REFERENCED_ROW') {
        errorMessage = 'ข้อมูลอ้างอิงไม่ถูกต้อง โปรดตรวจสอบข้อมูลการจอง';
      } else if (error.code === 'ER_BAD_FIELD_ERROR') {
        errorMessage = 'พบปัญหาเกี่ยวกับฐานข้อมูล: คอลัมน์ไม่ถูกต้อง';
      } else if (error.code === 'ER_NO_SUCH_TABLE') {
        errorMessage = 'พบปัญหาเกี่ยวกับฐานข้อมูล: ไม่พบตารางที่ต้องการ';
      } else if (error.code === 'PROTOCOL_CONNECTION_LOST') {
        errorMessage = 'การเชื่อมต่อกับฐานข้อมูลถูกตัดขาด กรุณาลองใหม่อีกครั้ง';
      } else if (error.code === 'ER_DATA_TOO_LONG') {
        errorMessage = 'ข้อมูลมีขนาดใหญ่เกินไป กรุณาตรวจสอบข้อมูลที่กรอก';
      } else if (error.code === 'ER_TRUNCATED_WRONG_VALUE') {
        errorMessage = 'รูปแบบข้อมูลไม่ถูกต้อง กรุณาตรวจสอบข้อมูลที่กรอก';
      } else {
        errorMessage = `เกิดข้อผิดพลาดในฐานข้อมูล: ${error.code}`;
      }
    } else if (error.message && error.message.includes('WARN_DATA_TRUNCATED')) {
      errorMessage = 'เกิดข้อผิดพลาดในการบันทึกข้อมูล: ข้อมูลมีรูปแบบไม่ถูกต้องหรือมีขนาดใหญ่เกินไป';
    } else if (error.message) {
      errorMessage = `เกิดข้อผิดพลาด: ${error.message}`;
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}