'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'


import './mta.css'


export default function MeetingRoomTypeA() {
  const router = useRouter()
  const [rooms, setRooms] = useState([])
  const [timeSlots, setTimeSlots] = useState([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [bookingInProgress, setBookingInProgress] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookingError, setBookingError] = useState(null)

  // วันที่ขั้นต่ำและสูงสุดที่สามารถจองได้
  const today = new Date()
  const minDate = today.toISOString().split('T')[0]
  const maxDate = new Date(today.setDate(today.getDate() + 30)).toISOString().split('T')[0]

  useEffect(() => {
    // ตรวจสอบการล็อกอิน - แก้ไขให้ทำงานเฉพาะในฝั่ง client
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (err) {
        console.error('Error accessing localStorage:', err)
      }
    }
    
    // ดึงข้อมูลช่วงเวลาและตั้งค่าเริ่มต้น (จะทำแค่ครั้งแรกเท่านั้น)
    const fetchInitialData = async () => {
      try {
        // ดึงข้อมูลช่วงเวลา
        const timeSlotsResponse = await fetch('/api/timeslots')
        if (!timeSlotsResponse.ok) {
          throw new Error('ไม่สามารถดึงข้อมูลช่วงเวลาได้')
        }
        const timeSlotsData = await timeSlotsResponse.json()
        
        setTimeSlots(timeSlotsData.timeSlots || [])
        if (timeSlotsData.timeSlots && timeSlotsData.timeSlots.length > 0 && !selectedTimeSlot) {
          setSelectedTimeSlot(timeSlotsData.timeSlots[0].Time_Slot_ID.toString() || '')
        }
        if (!selectedDate) {
          setSelectedDate(minDate) // ตั้งค่าวันที่เริ่มต้นเป็นวันนี้
        }
      } catch (err) {
        console.error('Error fetching timeslots:', err)
        setError('ไม่สามารถโหลดข้อมูลช่วงเวลา กรุณาลองใหม่อีกครั้ง')
      }
    }
    
    fetchInitialData()
  }, [minDate]) // ทำงานครั้งแรกเท่านั้น
  
  // แยกการดึงข้อมูลห้องเป็นอีก useEffect หนึ่ง ซึ่งจะทำงานเมื่อวันที่หรือช่วงเวลาเปลี่ยน
  useEffect(() => {
    // ดึงข้อมูลห้องประชุม
    const fetchRooms = async () => {
      if (!selectedDate || !selectedTimeSlot) return; // ไม่ดึงข้อมูลถ้ายังไม่มีการเลือกวันที่หรือช่วงเวลา
      
      try {
        setLoading(true)
        // ดึงข้อมูลห้องประชุมประเภท A พร้อมส่งวันที่และช่วงเวลาที่เลือก
        const roomsResponse = await fetch(`/api/rooms?type=Type%20A&date=${selectedDate}&timeSlot=${selectedTimeSlot}`)
        if (!roomsResponse.ok) {
          throw new Error('ไม่สามารถดึงข้อมูลห้องประชุมได้')
        }
        const roomsData = await roomsResponse.json()
        
        setRooms(roomsData.rooms || [])
      } catch (err) {
        console.error('Error fetching rooms:', err)
        setError('ไม่สามารถโหลดข้อมูลห้อง กรุณาลองใหม่อีกครั้ง')
      } finally {
        setLoading(false)
      }
    }
    
    fetchRooms()
  }, [selectedDate, selectedTimeSlot]) // ทำงานเมื่อวันที่หรือช่วงเวลาเปลี่ยน

  // คำนวณราคาตามช่วงเวลา
  const calculatePrice = (basePrice, slotId) => {
    // ตรวจสอบว่า basePrice เป็นตัวเลขหรือไม่
    if (typeof basePrice !== 'number') {
      basePrice = Number(basePrice) || 0
    }
    
    // ตรวจสอบว่า slotId ถูกต้องหรือไม่
    if (!slotId || !timeSlots.length) return basePrice
    
    const slotIdNum = parseInt(slotId)
    const slot = timeSlots.find(slot => slot.Time_Slot_ID === slotIdNum)
    if (!slot) return basePrice
    
    // ใช้ราคาตามที่กำหนด
    switch(slot.Slot_Name) {
      case 'Morning':
      case 'Afternoon':
        return basePrice
      case 'Full Day':
        return basePrice * 1.75
      default:
        return basePrice
    }
  }

  // ฟังก์ชันเมื่อกดปุ่มจองห้อง
  const handleBookingClick = (room) => {
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อนทำการจอง')
      router.push('/coworking/login')
      return
    }
    
    if (!selectedTimeSlot) {
      alert('กรุณาเลือกช่วงเวลาที่ต้องการจอง')
      return
    }
    
    if (!selectedDate) {
      alert('กรุณาเลือกวันที่ต้องการจอง')
      return
    }
    
    // เช็คว่ามีเงินพอหรือไม่
    const totalPrice = calculatePrice(room.Price, selectedTimeSlot)
    if (parseFloat(user.Balance) < totalPrice) {
      alert('ยอดเงินในกระเป๋าไม่เพียงพอ กรุณาเติมเงินก่อนทำการจอง')
      return
    }
    
    // ตั้งค่าห้องที่เลือกและแสดงหน้าต่างยืนยัน
    setSelectedRoom(room)
    setShowConfirmModal(true)
  }

  // ฟังก์ชันยกเลิกการจอง
  const handleCancelBooking = () => {
    setShowConfirmModal(false)
    setSelectedRoom(null)
    setBookingError(null)
  }

  // ฟังก์ชันยืนยันการจอง
  const handleConfirmBooking = async () => {
    // แสดงว่ากำลังดำเนินการจอง
    setBookingInProgress(true)
    setBookingError(null)
    
    try {
      // คำนวณราคาทั้งหมด
      const totalPrice = calculatePrice(selectedRoom.Price, selectedTimeSlot)
      
      // เตรียมข้อมูลที่จะส่ง - ส่งข้อมูลผู้ใช้ไปด้วยเพื่อไม่ต้องใช้ localStorage ในฝั่ง server
      const bookingData = {
        userId: user.User_ID,
        roomId: selectedRoom.Room_ID,
        timeSlotId: parseInt(selectedTimeSlot),
        bookingDate: selectedDate,
        totalPrice: totalPrice,
        user: user // ส่งข้อมูลผู้ใช้ไปด้วย
      };
      
      console.log('Sending booking data:', bookingData);
      
      // ส่งข้อมูลไปยัง API เพื่อสร้างการจองและบันทึกลงฐานข้อมูล
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      })
      
      // ตรวจสอบว่ามีข้อผิดพลาดหรือไม่
      if (!response.ok) {
        let errorMessage = 'ไม่สามารถจองห้องประชุมได้';
        
        // อ่าน response เป็นข้อความก่อน
        const responseText = await response.text();
        
        try {
          // ลองแปลงเป็น JSON
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // ถ้าไม่ใช่ JSON ใช้ข้อความที่ได้มา
          errorMessage = responseText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      // ถ้าสำเร็จ แปลงข้อมูลที่ได้รับกลับมา
      const responseText = await response.text();
      const data = JSON.parse(responseText);
        
      // อัพเดท localStorage ด้วยข้อมูลผู้ใช้ที่อัพเดทแล้ว - แก้ไขให้ตรวจสอบก่อนเรียกใช้
      if (typeof window !== 'undefined' && data.user) {
        try {
          localStorage.setItem('user', JSON.stringify(data.user))
        } catch (err) {
          console.error('Error saving to localStorage:', err)
        }
      }
      
      // อัพเดทข้อมูลผู้ใช้ในหน้า
      if (data.user) {
        setUser(data.user)
      }
      
      // แสดงการจองสำเร็จ
      setBookingSuccess(true)
      
    } catch (err) {
      console.error('Booking error:', err)
      setBookingError(err.message || 'เกิดข้อผิดพลาดในการจองห้องประชุม กรุณาลองใหม่อีกครั้ง')
    } finally {
      setBookingInProgress(false)
    }
  }

  // ฟังก์ชันปิดหน้าต่างยืนยันหลังจากจองสำเร็จ
  const handleCloseSuccessModal = () => {
    setShowConfirmModal(false)
    setSelectedRoom(null)
    setBookingSuccess(false)
    
    // ดึงข้อมูลห้องประชุมใหม่เพื่ออัพเดตสถานะห้อง
    const fetchRooms = async () => {
      try {
        const roomsResponse = await fetch(`/api/rooms?type=Type%20A&date=${selectedDate}&timeSlot=${selectedTimeSlot}`)
        if (!roomsResponse.ok) {
          throw new Error('ไม่สามารถดึงข้อมูลห้องประชุมได้')
        }
        const roomsData = await roomsResponse.json()
        setRooms(roomsData.rooms || [])
      } catch (err) {
        console.error('Error fetching rooms:', err)
      }
    }
    
    fetchRooms()
  }

  const getSelectedTimeSlotName = () => {
    const slot = timeSlots.find(slot => slot.Time_Slot_ID === parseInt(selectedTimeSlot))
    return slot ? `${slot.Slot_Name} (${slot.Start_Time.substring(0, 5)} - ${slot.End_Time.substring(0, 5)})` : ''
  }

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('th-TH', options)
  }


  








  if (loading) {
    return (
      <div className="loading-screenMta"></div>
    )
  }

  // if (error) {
  //   return (
  //     <div className="error-container">
  //       <div className="error-message">
  //         <p>{error}</p>
  //         <button 
  //           onClick={() => window.location.reload()} 
  //           className="retry-button"
  //         >
  //           ลองใหม่
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }



  return (
    <div className="Main-mta-page">
      <div className="mta-container">
        
        <div className="mta-back-link-container">
          <Link href="/coworking/home" className="mta-back-link">กลับไปยังหน้าแรก</Link>
        </div>

        <div className="mta-header-container">
          <div>
            <h1 className="mta-page-title">Meeting Room Type A</h1>
            <h2 className="mta-page-subtitle">ห้องประชุมขนาดเล็ก (จำนวน {rooms.length} ห้อง)</h2>
          </div>

          {user && (
            <div className="mta-balance-display">
              <p className="mta-balance-label">ยอดเงินคงเหลือ</p>
              <p className="mta-balance-amount">฿{parseFloat(user.Balance).toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            </div>
          )}
        </div>

        <div className="mta-info-card">
          <div className="mta-info-card-content">
            
            <div>
              <h3 className="mta-card-title">รายละเอียดห้องประชุม</h3>
              <div className="mta-feature-list">
                <li className="mta-feature-item">ความจุ 8 คน</li>
                <li className="mta-feature-item">โต๊ะประชุมทรงสี่เหลี่ยมกับเก้าอี้</li>
                <li className="mta-feature-item">จอแสดงผล 55 นิ้ว</li>
                <li className="mta-feature-item">ระบบเสียงคุณภาพสูง</li>
                <li className="mta-feature-item">wifi ความเร็วสูง</li>
                <li className="mta-feature-item">ระบบประชุมทางไกล</li>
              </div>

              <h3 className="mta-card-title">ข้อมูลเพิ่มเติม</h3>
              
              <div className="mta-feature-list">
                <li className="mta-feature-item">สามารถจองล่วงหน้าได้สูงสุด 30 วัน </li>
                <li className="mta-feature-item">ทุกห้องมีเครื่องรับอากาศและอุปกรณ์เครื่องเสียง</li>
                <li className="mta-feature-item">มีบริการช่วยเหลือด้านเทคนิคตลอดเวลาทำการ</li>
              </div>
            </div>

            <img src="https://uppic.cloud/ib/jQDKTvs0cLelFWA_1744981465.jpg" className="mta-room-image" />
            
          </div>
        </div>
        

        <div className="mta-info-card2"> {/*พื้นหลัง*/}
           <h3 className="mta-card-title">เลือกวันและเวลา</h3> {/* หัวข้อ */}
          
          <div className="mta-form-grid">
            <div>
              <label htmlFor="bookingDate" className="mta-label-day">
                วันที่ต้องการจอง
              </label>
              <input
                type="date"
                id="bookingDate"
                name="bookingDate"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={minDate}
                max={maxDate}
                className="mta-day-input"
                required
              />
              <p className="mta-hint">* สามารถจองล่วงหน้าได้ไม่เกิน 30 วัน</p>
            </div>

            <div className="mta-form-group">
              <label htmlFor="timeSlot" className="mta-label-time">
                ช่วงเวลาที่ต้องการจอง
              </label>
              <select
                id="timeSlot"
                value={selectedTimeSlot}
                onChange={(e) => setSelectedTimeSlot(e.target.value)}
                className="mta-time-select"
              >
                {timeSlots.map((slot) => (
                  <option key={slot.Time_Slot_ID} value={slot.Time_Slot_ID}>
                    {slot.Slot_Name} ({slot.Start_Time.substring(0, 5)} - {slot.End_Time.substring(0, 5)}) - {slot.Description}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>
        
        
        
        
        {/* จองงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงงง */}
        <h3 className="mta-section-title">ห้องที่ว่าง</h3>
        
        <div className="mta-room-grid"> {/* ตำแหน่ง card */}
          {rooms.map((room) => (
            <div key={room.Room_ID} className="mta-room-card"> {/*รูปแบบcard*/}
              
              <div className="mta-room-card-content"> {/*padding*/}

                <h4 className="mta-room-name">{room.Room_Number}</h4> {/*ชื่อห้อง*/}
                <p className="mta-room-description">{room.Description}</p> {/*เนื้อหา*/}
                
                <div className="mta-room-details"> {/*จัดรูปแบบ*/}
                  <span>ความจุ: {room.Capacity} คน</span>
                  <span>ราคา: ฿{Number(calculatePrice(room.Price, selectedTimeSlot)).toFixed(0)}</span>
                </div>

                <div className="mta-room-actions"> {/*จัดตำแหน่ง*/}
                  <span className={`mta-status-badge 
                    ${room.Status === 'Available' ? 'mta-status-available' : 'mta-status-unavailable'}`}>
                    {room.Status === 'Available' ? 'ว่าง' : 'ไม่ว่าง'}
                  </span>

                  {/* ปุ่มจอง */}
                  <button
                    onClick={() => handleBookingClick(room)}
                    disabled={room.Status !== 'Available'}
                    className={`mta-booking-button ${room.Status !== 'Available' ? 'mta-button-disabled' : ''}`}
                  >
                    {room.Status === 'Available' ? 'จองห้องนี้' : 'ไม่สามารถจองได้'}
                  </button>
                </div> {/*จัดตำแหน่ง*/}

              </div>
            </div>
          ))}
        </div>

        {/* {rooms.length === 0 && (
          <div className="mta-no-rooms-message">
            <p>ไม่พบห้องประชุมประเภท A ที่ว่างในขณะนี้ กรุณาตรวจสอบอีกครั้งในภายหลัง</p>
          </div>
        )} */}
      </div>




      {/* -------------------------- หน้าต่างยืนยันการจอง -------------------------- */}
      {showConfirmModal && selectedRoom && (
        <div className="mta-modal-overlay">
          <div className="mta-modal-container">
            {!bookingSuccess ? (
              <>
                <h3 className="mta-modal-title">ยืนยันการจองห้องประชุม</h3> {/* หัวข้อใน card หลังกดจอง */}

                {/* {bookingError && (
                  <div className="mta-error-alert">
                    <span>{bookingError}</span>
                  </div>
                )} */}
                
                <div className="mta-booking-details"> {/* /*กล่องรายละเอียดการจอง*/}
                  <h4 className="mta-details-title">รายละเอียดการจอง</h4>
                  <ul className="mta-details-list">
                    <li className="mta-detail-label">ห้องประชุม: {selectedRoom.Room_Number}</li>
                    <li className="mta-detail-label">วันที่: {formatDate(selectedDate)}</li>
                    <li className="mta-detail-label">ช่วงเวลา:   {getSelectedTimeSlotName()}</li>
                    <li className="mta-detail-label">ราคา:   ฿{Number(calculatePrice(selectedRoom.Price, selectedTimeSlot)).toFixed(0)}</li>
                  </ul>
                </div>
              
                <div className="mta-payment-notice"> {/* หล่องสีเหลืองข้อมความน้ำตาล */}
                  <p> ยอดเงินจะถูกหักจากกระเป๋าเงินของคุณทันที คุณต้องการดำเนินการต่อหรือไม่? </p>
                </div>

                <div className="mta-modal-actions">
                  <button
                    onClick={handleConfirmBooking}
                    disabled={bookingInProgress}
                    className="mta-confirm-button"
                  >
                    {bookingInProgress ? 'กำลังดำเนินการ...' : 'ยืนยันการจอง'}
                  </button>
                  <button
                    onClick={handleCancelBooking}
                    disabled={bookingInProgress}
                    className="mta-cancel-button"
                  >
                    ยกเลิก
                  </button>
                </div>


              </>
            ) : (
              <>
                <div className="mta-success-message"> {/* ตำแหน่งอักษร */}
                  <h3 className="mta-success-title">จองห้องประชุมสำเร็จ</h3>
                </div>

                {/* <div className="mta-booking-details">
                  <h4 className="mta-details-title">รายละเอียดการจอง</h4>
                  <ul className="mta-details-list">
                    <li><span className="mta-detail-label">ห้องประชุม:</span> {selectedRoom.Room_Number}</li>
                    <li><span className="mta-detail-label">วันที่:</span> {formatDate(selectedDate)}</li>
                    <li><span className="mta-detail-label">ช่วงเวลา:</span> {getSelectedTimeSlotName()}</li>
                    <li><span className="mta-detail-label">ราคา:</span> ฿{Number(calculatePrice(selectedRoom.Price, selectedTimeSlot)).toFixed(0)}</li>
                  </ul>
                </div> */}
                
                <div className="mta-success-notice">
                  <p> ยอดเงินได้ถูกหักจากกระเป๋าเงินของคุณเรียบร้อยแล้ว ยอดคงเหลือ: ฿{parseFloat(user.Balance).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                <button
                  onClick={handleCloseSuccessModal}
                  className="mta-ok-button"
                >
                  ตกลง
                </button>
              </>
            )}
          </div>
        </div>
      )} /* หน้าต่าง */


    </div> /* page */


  )
}