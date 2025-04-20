'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import './tu.css'  // CSS file for styling

export default function TopupPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [amounts, setAmounts] = useState([])
  const [selectedAmount, setSelectedAmount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  
  useEffect(() => {
    // ตรวจสอบการล็อกอิน
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      router.push('/coworking/login')
      return
    }
    
    // ดึงข้อมูลผู้ใช้
    setUser(JSON.parse(storedUser))
    
    // ดึงข้อมูลจำนวนเงินเติม
    const fetchAmounts = async () => {
      try {
        const response = await fetch('/api/topup/amounts')
        if (!response.ok) {
          throw new Error('ไม่สามารถดึงข้อมูลจำนวนเงินเติมได้')
        }
        
        const data = await response.json()
        setAmounts(data.amounts)
      } catch (err) {
        console.error('Error fetching topup amounts:', err)
        setError('ไม่สามารถโหลดข้อมูลจำนวนเงินเติมได้ กรุณาลองใหม่อีกครั้ง')
      } finally {
        setLoading(false)
      }
    }
    
    fetchAmounts()
  }, [router])
  
  const handleTopup = async () => {
    if (!selectedAmount) {
      setError('กรุณาเลือกจำนวนเงินที่ต้องการเติม')
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)
    
    try {
      const response = await fetch('/api/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.User_ID,
          amount: selectedAmount.Amount,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'ไม่สามารถเติมเงินได้')
      }
      
      // อัพเดท localStorage ด้วยข้อมูลผู้ใช้ที่อัพเดทแล้ว
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      
      // แสดงข้อความสำเร็จ
      setSuccess(`เติมเงินสำเร็จ จำนวน ${selectedAmount.Amount.toLocaleString('th-TH')} บาท`)
      
      // รีเซ็ตการเลือก
      setSelectedAmount(null)
    } catch (err) {
      console.error('Topup error:', err)
      setError(err.message || 'เกิดข้อผิดพลาดในการเติมเงิน กรุณาลองใหม่อีกครั้ง')
    } finally {
      setIsSubmitting(false)
    }
  }
  




  
  if (loading) {
    return (
      <div className="tu-loading"></div>
    )
  }
  
  return (
    <div className="tu-page">
      {/* Simple Navigation */}
      <div className="tu-nav">
        <Link href="/coworking/home" className="tu-back">
          กลับหน้าหลัก
        </Link>
        
        {user && (
          <div className="tu-balance">
            <span className="tu-balance-label">ยอดเงิน:</span>
            <span className="tu-balance-value">
              {parseFloat(user.Balance).toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})} บาท
            </span>
          </div>
        )}
      </div>
      
      <div className="tu-content">
        <div className="tu-card">
          <h2 className="tu-title">เติมเงินเข้ากระเป๋า</h2>
          
          {error && (
            <div className="tu-error">
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="tu-success">
              <span>{success}</span>
            </div>
          )}
          
          <div className="tu-selection">
            <p className="tu-label">เลือกจำนวนเงินที่ต้องการเติม</p>
            
            <div className="tu-grid">
              {amounts.map(amount => (
                <button
                  key={amount.Amount_ID}
                  className={`tu-amount ${selectedAmount && selectedAmount.Amount_ID === amount.Amount_ID ? 'tu-selected' : ''}`}
                  onClick={() => setSelectedAmount(amount)}
                >
                  <div className="tu-amount-value">{amount.Amount.toLocaleString('th-TH')} บาท</div>
                  <div className="tu-amount-text">{amount.Display_Text}</div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="tu-summary">
            <div>
              <p className="tu-current-label">ยอดเงินปัจจุบัน</p>
              <p className="tu-current-value">{parseFloat(user.Balance).toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})} บาท</p>
            </div>
            {selectedAmount && (
              <div>
                <p className="tu-new-label">ยอดเงินหลังเติม</p>
                <p className="tu-new-value">
                  {(parseFloat(user.Balance) + parseFloat(selectedAmount.Amount)).toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})} บาท
                </p>
              </div>
            )}
          </div>
          
          <button
            onClick={handleTopup}
            disabled={!selectedAmount || isSubmitting}
            className={`tu-button ${!selectedAmount || isSubmitting ? 'tu-disabled' : 'tu-enabled'}`}
          >
            {isSubmitting ? 'กำลังดำเนินการ...' : 'ยืนยันการเติมเงิน'}
          </button>
          
        </div>
      </div>
    </div>
  )
}