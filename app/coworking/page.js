'use client'

import { useState } from 'react' // ไว้สร้างตัวแปรที่จำค่าได้ 
import { useRouter } from 'next/navigation' // เพื่อใช้ ส่งข้อมูลไปหน้าอื่นๆด้วย
import Link from 'next/link' // ใช้สำหรับลิงค์ไปหน้าอื่นเฉยๆ

import './login.css'
import { FaEye, FaEyeSlash ,FaLock, FaUser } from "react-icons/fa"; // npm install react-icons

  
  

// component หลักของหน้านี้ ก็คือส่วนเนื้อหาของ page นี้
export default function CoworkingLoginPage() {

  const router = useRouter() // ตัวแปรสำหรับส่งข้อมูลไป
  
  // ข้อมูลที่จะส่งไปเช็คใน backend
  const [formData, setFormData] = useState({
    User_Name: '',
    U_Password: ''
  })
  const [showPassword, setShowPassword] = useState(false) // ไว้เปิด-ปิดลูกตาดูรหัสผ่าน  
  const [error, setError] = useState('') // สร้าง error ให้เริ่มต้นเป็น ว่างๆ (setError ไว้ใช้เปลี่ยนค่า)
  const [isLoading, setIsLoading] = useState(false) // สร้าง isLoading ให้เริ่มต้นมีค่าเป็น false ปุ่มจะทำงานได้
  

  // อัพเดต formData ทุกครั้งที่พิมพ์ เพื่อให้ formData เอาไว้ส่งข้อมูลไป backend ในตอนที่เรียก handleLogin
  const handleChange = (e) => { 
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }
  // ...formData คัดลอกพวกนี้ไว้ User_Name: '',  U_Password: '' เพื่อจะได้อัพเดตเฉพาะ e.target.value ที่พิมพ์มา
  // e.target.name -> .name = ชื่อฟิลด์ทั้งหมดของ input "U_Password" หรือ .name = "User_Name"
  // e.target.value -> ก็แล้วแต่ว่าพิมพ์ช่องไหนก่อน ถ้าชื่อก็เป็น User_Name ถ้ารหัสก็เป็น U_Password



  const handleLogin = async (e) => {
    e.preventDefault() // กัน reload หน้า
    setError('') // ให้ error เป็นว่างๆ เวลาเรียก (กดปุ่ม) ใหม่จะได้ไม่ขึ้น Error เก่า
    setIsLoading(true) // ให้ isLoading เป็น true เวลาที่เรียกใช้ handleLogin ปุ่มจะกดไม่ได้

    try {
      // ส่ง formData ไปยัง backend ที่ /api/users/login ในเมทอต POST แล้วเก็บผลที่ได้ด้วย response
      const response = await fetch('/api/users/login', { // ขอ request 
        method: 'POST', // POST = ส่งข้อมูลไป
        headers: { 'Content-Type': 'application/json' }, // ให้ส่งไปเป็น JSON
        body: JSON.stringify(formData), // แปลง formData เป็น JSON
      })


      const responseData = await response.json() // ดึงข้อมูลที่ส่งมา(เป็น body)

      // ดัก Error จากที่ backend เขียนไว้ ดู response ว่า OK(200=true) มั้ย
      if (!response.ok) { // ถ้า response.ok เป็น false ให้หยุดการทำงานใน try แล้ว throw Error ไป catch
        throw new Error(responseData.error) // แล้วส่ง errorData.error ไป
      }
      

      //เอา data เก็บใน localStorage ด้วยตัวแปรชื่อ "user" (ก่อนเก็บต้องแปลงเป็น string ก่อน)
      localStorage.setItem('user', JSON.stringify(responseData.user))  
      
      // ไปหน้า home
      router.push('/coworking/home') 

    } catch (err) { // จับ Error ที่ throw มา แล้วตั่งค่าข้อความ error ที่รับมา
      setError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
    
    } finally {
      setIsLoading(false) // เสร็จแล้วไม่ว่าจะเข้าได้ ไม่ได้ยังไง ก็ต้อง set เป็น false ให้ปุ่มกลับมาใช้ได้
    }
  }





  
  
  return (
    <div className="login-page">
      <div className="login-box">
        <div className="text-center">
          <h1 className="form-title">Co Working Space</h1>
          <p className="form-subtitle">ยินดีต้อนรับสู่บริการพื้นที่ทำงานร่วมของเรา</p>
        </div>

        {/* แสดงค่าใน error ก็ถ้ามีมันก็จะขึ้น ถ้าไม่มีก็คือ error เป็น null */}
        {error ? (<div className="error-message"> {error} </div>) : null}


        {/* form นี้คือ ถ้าถูก submit(กดปุ่ม) จะเรียก handleLogin → แล้วเซ็ต isLoading เป็น true */}
        <form onSubmit={handleLogin}>

          <div className="form-group">
            <label htmlFor="User_Name" className="form-label">
              ชื่อผู้ใช้
            </label>
            <div className="input-container">
              <span className="input-icon"> <FaUser /> </span>
              <input
                id="User_Name"
                name="User_Name"
                type="text"
                required
                className="input-field"
                value={formData.User_Name}
                onChange={handleChange}
                placeholder="กรุณาใส่ชื่อผู้ใช้"
              />
            </div>
          </div>
        

          <div className="form-group">
            <label htmlFor="U_Password" className="form-label">
              รหัสผ่าน
            </label>
            <div className="input-container">
              <span className="input-icon icon-lock"><FaLock /></span>
              <input
                id="U_Password"
                name="U_Password"
                type={showPassword ? "text" : "password"}
                required
                className="input-field"
                value={formData.U_Password}
                onChange={handleChange}
                placeholder="กรุณาใส่รหัสผ่าน"
              />
              <span
                className="input-icon-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>
          </div>


          <div className="form-group">
            <button
              type="submit"
              // isLoading เป็น false (ยังไม่ได้กำลังส่งข้อมูล) ปุ่มจะกดได้ เพราะ disabled={false}
              // isLoading เป็น true (กำลังส่งข้อมูลอยู่) ปุ่มจะกดไม่ได้ เพราะ disabled={true}
              disabled={isLoading}
              className="submit-button"
            >
              {/* เช็ค isLoading ว่าเป็น true : false  */}
              {isLoading ?
                (<> <span className='spinner'></span>กำลังเข้าสู่ระบบ... </>) : 'เข้าสู่ระบบ'
              }
            </button>
          </div>

        </form> {/* form นี้คือ ถ้าถูก submit(กดปุ่ม) จะเรียก handleLogin → แล้วเซ็ต isLoading เป็น true */}




        <div className="text-center">
          <p className="form-subtitle">
            ยังไม่มีบัญชีผู้ใช้งาน?{' '}
            <Link href="/coworking/signup" className="signup-link">
              สมัครสมาชิก
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}





// Flow ที่เกิดขึ้นในนี้คือ
// ผู้ใช้กดปุ่ม → form จะถูก submit → handleLogin ทำงาน
// setIsLoading(true) → React re-render → ปุ่มถูก disable + เปลี่ยนข้อความ
// fetch เสร็จ → เข้าสู่ finally → setIsLoading(false)
// React re-render อีกรอบ → ปุ่มกลับมากดได้ + ข้อความเปลี่ยนกลับเป็น "เข้าสู่ระบบ"