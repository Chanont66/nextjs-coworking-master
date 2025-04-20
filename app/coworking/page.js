'use client'


import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation' // เพื่อใช้ ส่งข้อมูลไปหน้าอื่นๆด้วย
import Link from 'next/link' // ใช้สำหรับลิงค์ไปหน้าอื่นเฉยๆ

import './login.css'
// npm install react-icons
import { FaEye, FaEyeSlash ,FaLock, FaUser } from "react-icons/fa";



// component หลักของหน้านี้ ก็คือส่วนเนื้อหาของ page นี้
export default function CoworkingLoginPage() {

  const router = useRouter() // ตัวแปรสำหรับส่งข้อมูลไป
  
  // ข้อมูลที่จะส่งไปเช็คใน backend
  const [formData, setFormData] = useState({
    User_Name: '',
    U_Password: ''
  })

  // ไว้เปิด-ปิดรหัสผ่านดูได้
  const [showPassword, setShowPassword] = useState(false)

  // สร้าง error ให้เริ่มต้นเป็น ว่างๆ (setError ไว้ใช้เปลี่ยนค่า)
  const [error, setError] = useState('')

  // สร้าง isLoading ให้เริ่มต้นมีค่าเป็น false (setIsLoading ไว้ใช้เปลี่ยนค่า)
  const [isLoading, setIsLoading] = useState(false)
  

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const success = urlParams.get('success')
      if (success) {

        alert(success)

        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }
  }) 
  
  // อัพเดต formData ทุกครั้งที่พิมพ์ เพื่อให้ formData เอาไว้ส่งข้อมูลไป backend ในตอนที่เรียก handleLogin
  const handleChange = (e) => { 
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }


  const handleLogin = async (e) => {
    e.preventDefault() // กัน reload หน้า

    setError('') // ให้ error เป็นว่างๆ เวลาเรียก (กดปุ่ม) ใหม่จะได้ไม่ขึ้น Error เก่า
    setIsLoading(true) // ให้ isLoading เป็น true เวลาที่เรียกใช้ handleLogin ปุ่มจะเปลี่ยนและกดไม่ได้
    
    try {

      // ส่ง formData ไปยัง backend ที่ /api/users/login ในเมทอต POST แล้วเก็บผลที่ได้ด้วย response
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), // ส่งแบบตัวอักษร
      })


      // เหมือนตัวดัก Error จากที่ backend เขียนไว้ ดู response ว่า OK มั้ย
      if (!response.ok) { // ถ้า response.ok เป็น false ให้หยุดการทำงานใน try แล้ว throw Error ไป catch
        const errorData = await response.json() // รับ Error จาก response มาเก็บใน errorData
        throw new Error(errorData.error || 'การเข้าสู่ระบบล้มเหลว') // แล้วส่ง errorData.error ไป
      }

      if (!formData.User_Name.trim()) {
        setError('กรุณากรอกชื่อผู้ใช้')
        return
      }      
      
      const data = await response.json()
      
      localStorage.setItem('user', JSON.stringify(data.user))

      router.push('/coworking/home') // นำทางไปยังหน้าหลักหลังจากล็อกอินสำเร็จ
      
    } catch (err) { // จับ Error ที่ throw มา แล้วตั่งค่าข้อความ error ที่รับมา
      console.error('Login error:', err)
      setError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
    
    } finally {
      setIsLoading(false) // อันนี้คือถ้าเสร็จแล้วไม่ว่าจะเข้าได้ ไม่ได้ยังไง ก็ต้อง set เป็น false คืน
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
              <span className="input-icon input-icon-lock"><FaLock /></span>
              <input
                id="U_Password"
                name="U_Password"
                type={showPassword ? 'text' : "password"}
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
              disabled={isLoading} // ถ้า isLoading เป็น true ปุ่มจะกดไม่ได้
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