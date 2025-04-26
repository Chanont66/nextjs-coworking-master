'use client'


import './signup.css'

import { useState } from 'react'
import Link from 'next/link' // ไปแบบรวดเร็ว แบบ HTML
import { useRouter } from 'next/navigation' // ไปหน้าอื่นแบบต้องเช็ค logic



// component หลักของหน้านี้ ก็คือส่วนเนื้อหาของ page นี้
export default function SignupPage() {
  const router = useRouter() // ไว้ไปหน้าอื่น
  
  // ข้อมูลจ้า
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
  const [error, setError] = useState('') // สร้าง error ให้เริ่มต้นเป็น ว่างๆ (setError ไว้ใช้เปลี่ยนค่า)
  const [isSubmitting, setIsSubmitting] = useState(false) // เริ่มต้นมีค่าเป็น false ปุ่มจะทำงานได้


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }
  // ...formData คัดลอก formData ทั้งหมด เพื่อจะได้อัพเดตเฉพาะ e.target.value ที่พิมพ์มา
  // e.target.name -> .name = ชื่อฟิลด์ทั้งหมดของ input (แล้วแต่ว่าใส่อะไรก่อน)
  // e.target.value -> ก็แล้วแต่ว่าพิมพ์ช่องไหนก่อน ถ้าชื่อก็เป็น User_Name ถ้ารหัสก็เป็น U_Password


  const validateForm = () => {
    // ตรวจสองช่องว่ารหัสผ่านตรงกัน
    if (formData.U_Password !== formData.U_PasswordConfirm) {
      setError('รหัสผ่านไม่ตรงกัน')
      return false
    }
    
    // ตรวจว่าข้อมูลสำคัญครบถ้วน
    if (!formData.User_Name || !formData.First_Name || !formData.Last_Name || 
        !formData.U_Password || !formData.U_Email) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน')
      return false
    }
    
    // ตรวจรูปแบบอีเมล
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.U_Email)) {
      setError('รูปแบบอีเมลไม่ถูกต้อง')
      return false
    }
    
    // ตรวจบอร์โทรศัพท์ (ถ้ามีการกรอก)
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

    // แสดง error เลยถ้าเจอมาจากที่เขียนไว้ข้างบน
    if (!validateForm()) { return }
    
    setIsSubmitting(true) // ทำให้ปุ่มปิด
    
    try {
      const { U_PasswordConfirm, ...dataToSubmit } = formData // ไม่ต้องส่ง U_PasswordConfirm
      

      // ส่ง formData ไปยัง backend ที่ /api/users/login ในเมทอต POST แล้วเก็บผลที่ได้ด้วย response
      const response = await fetch('/api/users/signup', { // ขอ request 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // ให้ส่งไปเป็น JSON
        body: JSON.stringify(dataToSubmit), // ส่ง formData เป็น JSON
      })
      
      const responseData = await response.json() // ขอข้อมูลผู้ใช้จาก api
      
      // เหมือนตัวดัก Error จากที่ backend เขียนไว้ ดู response ว่า OK มั้ย
      if (!response.ok) { // ถ้า response.ok เป็น false ให้หยุดการทำงานใน try แล้ว throw Error ไป catch
        throw new Error(responseData.error || 'ไม่สามารถสร้างบัญชีได้')
      }


      alert('ลงทะเบียนสำเร็จ')
      router.push('/coworking') // กลับไปยังหน้า login
      
    } catch (err) { // จับ Error ที่ throw มา แล้วตั่งค่าข้อความ error ที่รับมา
      console.error('Signup error:', err)
      setError(err.message || 'เกิดข้อผิดพลาดในการสร้างบัญชี')

    } finally {
      setIsSubmitting(false) // เสร็จแล้วไม่ว่าจะเข้าได้ ไม่ได้ยังไง ก็ต้อง set เป็น false ให้ปุ่มกลับมาใช้ได้
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
        
        {/* แสดงค่าใน error ก็ถ้ามีมันก็จะขึ้น ถ้าไม่มีก็คือ error เป็น null  */}
        {error ? (<div className="cw-show-error">{error}</div>) : null}
        
        {/* form นี้คือ ถ้าถูก submit(กดปุ่ม) จะเรียก handleLogin → แล้วเซ็ต isLoading เป็น true */}
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
                pattern="\d{10}" /* \d = เลข 1-9, {10} = 10ตัว */
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
            {/* เช็ค isLoading ว่าเป็น true : false  */}
            {isSubmitting ? (<><span className="cw-spinner"></span>กำลังสร้างบัญชี...</>) : 'สมัครสมาชิก'}
          </button>

        </form> {/* form นี้คือ ถ้าถูก submit(กดปุ่ม) จะเรียก handleLogin → แล้วเซ็ต isLoading เป็น true */}


      </div>
    </div>
  )
}
