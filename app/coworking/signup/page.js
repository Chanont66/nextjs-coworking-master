'use client'


import './signup.css'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { FaEye, FaEyeSlash ,FaLock, FaUser } from "react-icons/fa";


export default function SignupPage() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    User_Name: '',
    First_Name: '',
    Last_Name: '',
    U_Password: '',
    U_PasswordConfirm: '',
    U_Phone: '',
    U_Email: '',
    User_Type: 'User' // ค่าเริ่มต้นตามที่กำหนดในสคีมา
  })

  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const validateForm = () => {
    // ตรวจสอบรหัสผ่านตรงกัน
    if (formData.U_Password !== formData.U_PasswordConfirm) {
      setError('รหัสผ่านไม่ตรงกัน')
      return false
    }
    
    // ตรวจสอบว่าข้อมูลสำคัญครบถ้วน
    if (!formData.User_Name || !formData.First_Name || !formData.Last_Name || 
        !formData.U_Password || !formData.U_Email) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน')
      return false
    }
    
    // ตรวจสอบรูปแบบอีเมล
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.U_Email)) {
      setError('รูปแบบอีเมลไม่ถูกต้อง')
      return false
    }
    
    // ตรวจสอบเบอร์โทรศัพท์ (ถ้ามีการกรอก)
    if (formData.U_Phone) {
      const phoneRegex = /^\d{10}$/
      if (!phoneRegex.test(formData.U_Phone)) {
        setError('เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลักเท่านั้น')
        return false
      }
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // ตรวจสอบข้อมูลก่อนส่ง
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // แยกข้อมูลยืนยันรหัสผ่านออกก่อนส่ง
      const { U_PasswordConfirm, ...dataToSubmit } = formData
      
      const response = await fetch('/api/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      })
      
      const responseData = await response.json()
      
      // ตรวจสอบสถานะการตอบกลับ
      if (!response.ok) {
        throw new Error(responseData.error || 'ไม่สามารถสร้างบัญชีได้')
      }
      
      // แสดงข้อความแจ้งเตือนแบบ alert เหมือน JOptionPane ใน Java
      alert('ลงทะเบียนสำเร็จ')
      
      // นำทางกลับไปยังหน้าหลัก coworking
      router.push('/coworking')
      
    } catch (err) {
      console.error('Signup error:', err)
      setError(err.message || 'เกิดข้อผิดพลาดในการสร้างบัญชี')
    } finally {
      setIsSubmitting(false)
    }
  }




  
  return (
    <div className="cw-signup-page">
      <div className="cw-signup-box">
          <h2 className="cw-form-title">สร้างบัญชีผู้ใช้</h2>
          <p className="cw-page-subtitle">
            หรือ{' '}
            <Link href="/coworking" className="cw-login-link">
              เข้าสู่ระบบด้วยบัญชีที่มีอยู่
            </Link>
          </p>
        
        
        {error ? (<div className="cw-show-error">{error}</div>) : null}
        
        <form className="cw-signup-form" onSubmit={handleSubmit}>
          <div className="cw-form-fields">
            
            <div className="cw-input-group">
              <label htmlFor="User_Name" className="cw-input-label">
                ชื่อผู้ใช้
              </label>
              <input
                id="User_Name"
                name="User_Name"
                type="text"
                required
                className="cw-input-field"
                placeholder="กรุณาใส่ชื่อผู้ใช้งาน"
                value={formData.User_Name}
                onChange={handleChange}
              />
            </div>


            <div className="cw-name-fields">
              {/* First Name */}
              <div className="cw-input-group">
                <label htmlFor="First_Name" className="cw-input-label">
                  ชื่อ
                </label>
                <input
                  id="First_Name"
                  name="First_Name"
                  type="text"
                  required
                  className="cw-input-field"
                  placeholder="กรุณาใส่ชื่อ"
                  value={formData.First_Name}
                  onChange={handleChange}
                />
              </div>
              
              
              <div className="cw-input-group">
                <label htmlFor="Last_Name" className="cw-input-label">
                  นามสกุล
                </label>
                <input
                  id="Last_Name"
                  name="Last_Name"
                  type="text"
                  required
                  className="cw-input-field"
                  placeholder="กรุณาใส่นามสกุล"
                  value={formData.Last_Name}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            
            <div className="cw-input-group">
              <label htmlFor="U_Email" className="cw-input-label">
                อีเมล
              </label>
              <input
                id="U_Email"
                name="U_Email"
                type="email"
                required
                className="cw-input-field"
                placeholder="mail@example.com"
                value={formData.U_Email}
                onChange={handleChange}
              />
            </div>
            
            
            <div className="cw-input-group">
              <label htmlFor="U_Phone" className="cw-input-label">
                เบอร์โทรศัพท์ (ตัวเลข 10 หลัก)
              </label>
              <input
                id="U_Phone"
                name="U_Phone"
                type="tel"
                maxLength="10"
                pattern="\d{10}"
                className="cw-input-field"
                placeholder="0899999999"
                value={formData.U_Phone}
                onChange={(e) => {
                  // อนุญาตให้ป้อนเฉพาะตัวเลขเท่านั้น
                  const value = e.target.value.replace(/[^\d]/g, '');
                  setFormData({
                    ...formData,
                    U_Phone: value
                  });
                }}
              />
            </div>
            
            
            <div className="cw-input-group">
              <label htmlFor="U_Password" className="cw-input-label">
                รหัสผ่าน
              </label>
              <input
                id="U_Password"
                name="U_Password"
                type="password"
                required
                className="cw-input-field"
                placeholder="รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
                value={formData.U_Password}
                onChange={handleChange}
              />
            </div>
            
            
            <div className="cw-input-group">
              <label htmlFor="U_PasswordConfirm" className="cw-input-label">
                ยืนยันรหัสผ่าน
              </label>
              <input
                id="U_PasswordConfirm"
                name="U_PasswordConfirm"
                type="password"
                required
                className="cw-input-field"
                placeholder="ป้อนรหัสผ่านอีกครั้ง"
                value={formData.U_PasswordConfirm}
                onChange={handleChange}
              />
            </div>
          </div>
  
          <button
            type="submit"
            disabled={isSubmitting}
            className="cw-submit-button"
          >
            {isSubmitting ? (<><span className="cw-spinner"></span>กำลังสร้างบัญชี...</>) : 'สมัครสมาชิก'}
          </button>


        </form>
      </div>
    </div>
  )
}
