'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'


import './mtc.css'


export default function MeetingRoomTypeC() {
  const router = useRouter()
  const [rooms, setRooms] = useState([]) // เก็บห้องทั้งหมด

  const [timeSlots, setTimeSlots] = useState([]) // เก็บช่วงเวลาทั้งหมดที่ได้จาก api
  
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('') // อัพเดทช่วงเวลาที่เลือก
  const [selectedDate, setSelectedDate] = useState('') // อัพเดทวันที่เลือก
  const [selectedRoom, setSelectedRoom] = useState(null) // อัพเดทห้องที่เลือก

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const [bookingInProgress, setBookingInProgress] = useState(false) // ไว้เปิดปิดปุ่มยืนยันจอง
  const [bookingSuccess, setBookingSuccess] = useState(false) // หน้าต่างยืนยันหลังจองสำเร็จ
 

  // วันที่ปัจจุบันและสูงสุดที่สามารถจองได้
  const today = new Date()
  const minDate = today.toISOString().split('T')[0]
  const maxDate = new Date(today.setDate(today.getDate() + 30)).toISOString().split('T')[0]


  // ----------------------- เช็คข้อมูล และดึงวันเวลา -----------------
  useEffect(() => {
    // ดึงข้อมูลจาก localStorage
    const checkAuth = () => { 
      try {
        const storedUser = localStorage.getItem('user') // ดึงข้อมูลผู้ใช้ใน localStorage จากตัวแปร user
        
        if (storedUser) { // ถ้ามีข้อมูล
          const parsedUser = JSON.parse(storedUser) // แปลงข้อมูลที่เป็น string ในรูปแบบ JSON เป็น object
          setUser(parsedUser) // เก็บข้อมูล (ก็เรียกใช้ user.ต่างๆได้ละ)
        } else { // ถ้าไม่มี
          router.push('/coworking')
        }
      } catch (err) {
        localStorage.removeItem('user') // ลบไว้กัน error เผื่อข้อมูลผิด
        router.push('/coworking')
      }
    }
  

    // ดึงข้อมูลช่วงเวลาและตั้งค่าเริ่มต้นจาก api นะ
    const fetchInitialData = async () => {
      try {
        const timeSlotsResponse = await fetch('/api/timeslots') // ขอ request 
        
        if (!timeSlotsResponse.ok) {
          alert('ไม่สามารถดึงข้อมูลช่วงเวลาได้')
        }
        const timeSlotsData = await timeSlotsResponse.json() // แปลง object
        
        // ตั้งค่าช่วงเวลา timeSlot (เอาข้อมูลจาก timeSlotsData เก็บใน timeSlots จะได้่ใช้ timeSlots.ต่างๆได้)
        setTimeSlots(timeSlotsData.timeSlots || [])
        if (timeSlotsData.timeSlots && timeSlotsData.timeSlots.length > 0 && !selectedTimeSlot) 
        {
          setSelectedTimeSlot(timeSlotsData.timeSlots[0].Time_Slot_ID.toString() || '')
        }

      // ตั้งค่าวัน(แค่ครั้งแรกที่มาเท่านั้นที่จะใช้ minDate)
        if (!selectedDate) { setSelectedDate(minDate) }
      
      } catch (err) {
        alert('ไม่สามารถโหลดข้อมูลช่วงเวลา กรุณาลองใหม่อีกครั้ง')
      }
    }

    checkAuth()
    fetchInitialData()
  }, [minDate]) // ให้สองฟังก์ชั่นนี้ทำงานทุกครั้งที่ minDate เปลี่ยน

  // ----------------------- เช็คข้อมูล และดึงวันเวลา -----------------


  
  // ----------------------- ดึงห้อง -----------------
  useEffect(() => {
    // ดึงข้อมูลห้องประชุม
    const fetchRooms = async () => {
      try {
        setLoading(true) // เปิดหน้าโหลด
        // ดึงข้อมูลห้องประชุมประเภท C พร้อมส่งวันที่และช่วงเวลาที่เลือก
        const roomsResponse = await fetch(`/api/rooms?type=Type%20C&date=${selectedDate}&timeSlot=${selectedTimeSlot}`)

        if (!roomsResponse.ok) { // ถ้าไม่มีข้อมูล
          throw new Error('ไม่สามารถดึงข้อมูลห้องประชุมได้')
        }

        const roomsData = await roomsResponse.json()
        setRooms(roomsData.rooms || []) // ข้อมูลห้อง
      
      } catch (err) {
        alert('ไม่สามารถโหลดข้อมูลห้อง กรุณาลองใหม่อีกครั้ง')
      
      } finally {
        setLoading(false) // ปิดหน้าโหลด
      }
    }
    
    fetchRooms()
  }, [selectedDate, selectedTimeSlot]) // โหลดข้อมูลห้องใหม่ตอนที่ วันหรือเวลาที่เลือกเปลี่ยน เพราะแต่ละวันเวลาจองจะเปลี่ยนไปทำให้ห้องต้องว่างใหม่




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



  // ---------------------- กดปุ่มจองห้องแล้วจะ... ----------------------
  const handleBookingClick = (room) => { // รับ room,selectedTimeSlot,selectedDate,user ที่ถูกเลือก
    
    // เช็คว่ามีเงินพอมั้ย
    const totalPrice = calculatePrice(room.Price, selectedTimeSlot)
    if (parseFloat(user.Balance) < totalPrice) {
      alert('ยอดเงินในกระเป๋าไม่เพียงพอ กรุณาเติมเงินก่อนทำการจอง')
      return
    }
    
    // เซตให้ SelectedRoom เก็บข้อมูลห้องที่เลือก
    setSelectedRoom(room)
    setShowConfirmModal(true) // เปิดหน้าต่างยืนยัน
  }


  // ---------------------- ฟังก์ชันยกเลิกการจอง ----------------------
  const handleCancelBooking = () => {
    setShowConfirmModal(false) // ปิดหน้าต่าง
    setSelectedRoom(null) 
  }


  // ---------------------- ฟังก์ชันยืนยันการจอง ----------------------
  const handleConfirmBooking = async () => {
    
    setBookingInProgress(true) // ปิดปุ่มไม่ให้กด
    
    try {
      // คำนวณราคาทั้งหมด
      const totalPrice = calculatePrice(selectedRoom.Price, selectedTimeSlot)
      
      // เตรียมข้อมูลที่จะส่ง - ส่งข้อมูลผู้ใช้ไปด้วยเพื่อไม่ต้องใช้ localStorage ในฝั่ง server
      const bookingData = {
        userId: user.User_ID, // ใช้ User_ID บอกว่าใครจองห้องไหน
        roomId: selectedRoom.Room_ID, // roomid ก็บอก id ห้อง
        timeSlotId: parseInt(selectedTimeSlot),
        bookingDate: selectedDate,
        totalPrice: totalPrice,
        user: user // ส่งข้อมูลผู้ใช้ไปด้วย
      }
      
      
      // ส่งข้อมูลไปยัง API เพื่อสร้างการจองและบันทึกลงฐานข้อมูล
      const response = await fetch('/api/bookings/create', { // ขอ request 
        method: 'POST', // POST = ส่งข้อมูลไป
        headers: { 'Content-Type': 'application/json' }, // ให้ส่งไปเป็น JSON
        body: JSON.stringify(bookingData), // แปลง formData เป็น JSON
      })
      
      // ตรวจสอบว่ามีข้อผิดพลาดหรือไม่
      if (!response.ok) {
        // อ่านข้อความ error จาก response
        const responseText = await response.text()
        let errorMessage = 'ไม่สามารถจองห้องประชุมได้'
        
        try {
          const errorData = JSON.parse(responseText) // ลองแปลงเป็น JSON
          if (errorData.error) {
            errorMessage = errorData.error
          }
        } catch (e) {
          // ถ้าไม่ใช่ JSON ใช้ข้อความที่ได้มา
          if (responseText) {
            errorMessage = responseText
          }
        }
        
        // แสดงข้อความ error แทนการ throw error
        alert(errorMessage)
        return // จบการทำงานฟังก์ชันตรงนี้
      }
  
      // ถ้าสำเร็จ แปลงข้อมูลที่ได้รับกลับมา
      const responseText = await response.text()
      const data = JSON.parse(responseText)
        
      // --------------------------------------------------------
      // อัพเดท localStorage ด้วยว่าจองแล้วเงินลดแล้ว
      if (typeof window !== 'undefined' && data.user) {
        try {
          localStorage.setItem('user', JSON.stringify(data.user))
        } catch (err) {
          console.error('Error saving to localStorage:', err)
        }
      }
      
      if (data.user) { setUser(data.user) } // ต้องอัพเดทเงินในกระเป๋า
      // --------------------------------------------------------
      
      setBookingSuccess(true) // แสดงการจองสำเร็จ
      
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการจองห้องประชุม กรุณาลองใหม่อีกครั้ง')
      console.error('Booking error:', err)
    
    } finally {
      setBookingInProgress(false) // เสร็จแล้วเปิดปุ่มได้
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
        const roomsResponse = await fetch(`/api/rooms?type=Type%20C&date=${selectedDate}&timeSlot=${selectedTimeSlot}`)
        
        if (!roomsResponse.ok) {
          throw new Error('ไม่สามารถดึงข้อมูลห้องประชุมได้')
        }
        const roomsData = await roomsResponse.json()
        setRooms(roomsData.rooms || [])
      
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการดึงข้อมูลห้องประชุม กรุณาลองใหม่อีกครั้ง')
      }
    } 
    fetchRooms()
  }

  
  // ดึงข้อมูลเวลาที่จอง
  const getSelectedTimeSlotName = () => {
    const slot = timeSlots.find(slot => slot.Time_Slot_ID === parseInt(selectedTimeSlot))
    return slot ? `${slot.Slot_Name} (${slot.Start_Time.substring(0, 5)} - ${slot.End_Time.substring(0, 5)})` : ''
  }

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('th-TH', options)
  }


  





  // หน้าจอโหลด (ซึ่งมันเร็วมากกกกกกกกกกกกกกกก)
  if (loading) {
    return (
      <div className="loading-screenMtc"></div>
    )
  }

  return (
    <div className="Main-mtc-page">
      <div className="mtc-container">
        
        <div className="mtc-back-link-container">
          <Link href="/coworking/home" className="mtc-back-link">กลับไปยังหน้าแรก</Link>
        </div>

        <div className="mtc-header-container">
          <div>
            <h1 className="mtc-page-title">Meeting Room Type C</h1>
            <h2 className="mtc-page-subtitle">ห้องประชุมขนาดใหญ่ (จำนวน {rooms.length} ห้อง)</h2>
          </div>

          {user && (
            <div className="mtc-balance-display">
              <p className="mtc-balance-label">ยอดเงินคงเหลือ</p>
              <p className="mtc-balance-amount">฿{parseFloat(user.Balance).toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            </div>
          )}
        </div>

        <div className="mtc-info-card">
          <div className="mtc-info-card-content">
            
            <div>
              <h3 className="mtc-card-title">รายละเอียดห้องประชุม</h3>
              <ul className="mtc-feature-list">
                <li className="mtc-feature-item">ความจุ 20 คน</li>
                <li className="mtc-feature-item">โต๊ะประชุมทรงสี่เหลี่ยมผืนผ้าขนาดใหญ่</li>
                <li className="mtc-feature-item">จอแสดงผล 75 นิ้ว</li>
                <li className="mtc-feature-item">ระบบประชุมทางไกลคุณภาพสูง</li>
                <li className="mtc-feature-item">ระบบเสียงรอบทิศทาง</li>
                <li className="mtc-feature-item">wifi ความเร็วสูง</li>
                <li className="mtc-feature-item">บริการเครื่องดื่มและอาหารว่าง</li>
              </ul>

              <h3 className="mtc-card-title">ข้อมูลเพิ่มเติม</h3>
              
              <ul className="mtc-feature-list">
                <li className="mtc-feature-item">สามารถจองล่วงหน้าได้สูงสุด 30 วัน </li>
                <li className="mtc-feature-item">ทุกห้องมีเครื่องรับอากาศและอุปกรณ์เครื่องเสียง</li>
                <li className="mtc-feature-item">มีบริการช่วยเหลือด้านเทคนิคตลอดเวลาทำการ</li>
              </ul>
            </div>

            <img src="https://uppic.cloud/ib/AtAVoZjD1yUyRXV_1745127744.jpg" className="mtc-room-image" />
            
          </div>
        </div>
        

        <div className="mtc-info-card2"> {/*พื้นหลัง*/}
           <h3 className="mtc-card-title">เลือกวันและเวลา</h3> {/* หัวข้อ */}
          
          <div className="mtc-form-grid">
            <div>
              <label htmlFor="bookingDate" className="mtc-label-day">
                วันที่ต้องการจอง
              </label>
              <input
                type="date"
                id="bookingDate"
                name="bookingDate"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)} // อัพเดทวันที่เลือก
                min={minDate}
                max={maxDate}
                className="mtc-day-input"
                required
              />
              <p className="mtc-hint">* สามารถจองล่วงหน้าได้ไม่เกิน 30 วัน</p>
            </div>

            <div className="mtc-form-group">
              <label htmlFor="timeSlot" className="mtc-label-time">
                ช่วงเวลาที่ต้องการจอง
              </label>
              <select
                id="timeSlot"
                value={selectedTimeSlot}
                onChange={(e) => setSelectedTimeSlot(e.target.value)} // อัพเดทช่วงเวลาที่เลือก
                className="mtc-time-select"
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
        
        
        
        {/* Note: 
          rooms คือ array ที่เก็บ object ทั้งหมด
          room คือตัวแปรที่รับแต่ละ object จากการ map ของ rooms 
        */}

        {/* ------------ ส่วนจองงงงงงงงงงงงงงงงงงงง ------------  */}
        <h3 className="mtc-section-title">ห้องที่ว่าง</h3>
        
        <div className="mtc-room-grid">
          {rooms.map((room) => ( // mapแสดงทุกห้องที่มีข้อมูลจากตัวแปร rooms ที่ดึงมา
            <div key={room.Room_ID} className="mtc-room-card"> {/* ดึง id ห้อง */}
              
              <div className="mtc-room-card-content"> 

                <h4 className="mtc-room-name">{room.Room_Number}</h4> {/* ดึงเลขห้อง */}
                <p className="mtc-room-description">{room.Description}</p>  {/* ดึงคำอธิบาย */}
                
                <div className="mtc-room-details"> {/* ดึงรายละเอียดห้อง */}
                  <span>ความจุ: {room.Capacity} คน</span>
                  <span>ราคา: ฿{Number(calculatePrice(room.Price, selectedTimeSlot)).toFixed(0)}</span>
                </div>

                <div className="mtc-room-actions"> {/* เช็คstatus */}
                  <span className={`mtc-status-badge 
                    ${room.Status === 'Available' ? 'mtc-status-available' : 'mtc-status-unavailable'}`}>
                    {room.Status === 'Available' ? 'ว่าง' : 'ไม่ว่าง'}
                  </span>

                  {/* --------- ปุ่มจอง --------- */}
                  <button
                    onClick={() => handleBookingClick(room)}
                    disabled={room.Status !== 'Available'}
                    // อันนี้เช็คว่าถ้า """"ไม่เท่ากับ""""" available ให้ปุ่มไม่สามารถกดได้
                    className={`mtc-booking-button ${room.Status !== 'Available' ? 'mtc-button-disabled' : ''}`}
                  >
                    {room.Status === 'Available' ? 'จองห้องนี้' : 'ไม่สามารถจองได้'}
                  </button>
                </div> 

              </div>
            </div>
          ))}
        </div>
      </div>




      {/* -------------------------- หน้าต่างยืนยันการจอง -------------------------- */}
      {showConfirmModal && selectedRoom && (
        <div className="mtc-modal-overlay">
          <div className="mtc-modal-container">
            {!bookingSuccess ?
            (
              <>
                <h3 className="mtc-modal-title">ยืนยันการจองห้องประชุม</h3> {/* หัวข้อใน card หลังกดจอง */}
                
                <div className="mtc-booking-details"> {/* /*กล่องรายละเอียดการจอง*/}
                  <h4 className="mtc-details-title">รายละเอียดการจอง</h4>
                  
                  <ul className="mtc-details-list">
                    {/* ส่ง selectedRoom ไป */}
                    <li className="mtc-detail-label">ห้องประชุม: {selectedRoom.Room_Number}</li>
                    {/*ส่ง selectedDate ไป */}
                    <li className="mtc-detail-label">วันที่: {formatDate(selectedDate)}</li> 
                    <li className="mtc-detail-label">ช่วงเวลา:   {getSelectedTimeSlotName()}</li>
                    <li className="mtc-detail-label">ราคา:   ฿{Number(calculatePrice(selectedRoom.Price, selectedTimeSlot)).toFixed(0)}</li>
                  </ul>
                  
                </div>
              
                <div className="mtc-payment-notice"> {/* หล่องสีเหลืองข้อมความน้ำตาล */}
                  <p> ยอดเงินจะถูกหักจากกระเป๋าเงินของคุณทันที คุณต้องการดำเนินการต่อหรือไม่? </p>
                </div>

                <div className="mtc-modal-actions"> {/* ปุุ่มจองกับยกเลิก */}
                  <button
                    onClick={handleConfirmBooking}
                    disabled={bookingInProgress} 
                    className="mtc-confirm-button"
                  >
                    {bookingInProgress ? 'กำลังดำเนินการ...' : 'ยืนยันการจอง'}
                  </button>

                  <button
                    onClick={handleCancelBooking}
                    disabled={bookingInProgress} // ถ้ากำลังทำงานในฟังก์ชั่นอยู่จะกดยกเลิกไม่ได้แล้ว
                    className="mtc-cancel-button"
                  >
                    ยกเลิก
                  </button>
                </div>
              </>

            ) : (
              // bookingSuccess เป็น true จะแสดงข้อความแจ้งการจองห้องประชุมสำเร็จ
              <>
                <div className="mtc-success-message"> {/* ตำแหน่งอักษร */}
                  <h3 className="mtc-success-title">จองห้องประชุมสำเร็จ</h3>
                </div>
                
                <div className="mtc-success-notice">
                  <p> ยอดเงินได้ถูกหักจากกระเป๋าเงินของคุณเรียบร้อยแล้ว ยอดคงเหลือ: ฿{parseFloat(user.Balance).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                <button
                  onClick={handleCloseSuccessModal}
                  className="mtc-ok-button"
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




// Flow ที่เกิดขึ้นในนี้คือ
// การดึงข้อมูลช่วงเวลา:
// ฟังก์ชัน fetchInitialData() จะทำงานพร้อมกับ checkAuth()
// ส่ง request ไปที่ API /api/timeslots เพื่อดึงข้อมูลช่วงเวลาทั้งหมด
// เมื่อได้รับข้อมูลแล้ว จะเก็บไว้ในตัวแปร timeSlots
// ตั้งค่าช่วงเวลาเริ่มต้นเป็นช่วงแรกของรายการที่ได้มา และตั้งค่าวันที่เริ่มต้นเป็นวันปัจจุบัน

// การดึงข้อมูลห้องประชุม:
// เมื่อมีการเลือกวันที่หรือช่วงเวลา useEffect ที่สองจะทำงาน
// ส่ง request ไปที่ API /api/rooms พร้อมพารามิเตอร์:
  // type=Type%20C (ระบุประเภทห้องเป็น Type C)
  // date=${selectedDate} (วันที่ที่เลือก)
  // timeSlot=${selectedTimeSlot} (ช่วงเวลาที่เลือก)
// เมื่อได้รับข้อมูลห้องประชุมแล้ว จะเก็บไว้ในตัวแปร rooms