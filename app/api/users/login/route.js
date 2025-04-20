// app/api/users/login/route.js

import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    // รับข้อมูลจากคำขอ
    const { User_Name, U_Password } = await request.json();

    // ตรวจสอบว่ามีข้อมูลจำเป็นครบถ้วน
    if (!User_Name || !U_Password) {
      return NextResponse.json(
        { error: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" },
        { status: 400 }
      );
    }

    const db = mysqlPool.promise();

    // ค้นหาผู้ใช้จากชื่อผู้ใช้ - เปลี่ยนจาก UserID เป็น Users
    const [users] = await db.query(
      "SELECT * FROM Users WHERE User_Name = ?",
      [User_Name]
    );

    // ถ้าไม่พบผู้ใช้
    if (users.length === 0) {
      return NextResponse.json(
        { error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    const user = users[0];

    // ตรวจสอบรหัสผ่านด้วย bcrypt
    const isPasswordValid = await bcrypt.compare(U_Password, user.U_Password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    // ไม่ส่งรหัสผ่านกลับไปยังไคลเอนต์
    const { U_Password: _, ...userWithoutPassword } = user;

    // ส่งข้อมูลผู้ใช้กลับไป
    return NextResponse.json({
      message: "เข้าสู่ระบบสำเร็จ",
      user: userWithoutPassword
    });
    
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: `เกิดข้อผิดพลาดในการเข้าสู่ระบบ: ${error.message}` },
      { status: 500 }
    );
  }
}