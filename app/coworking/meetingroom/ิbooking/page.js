// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter, useSearchParams } from 'next/navigation'
// import Link from 'next/link'
// import { format, addDays, parseISO, isAfter, isBefore, isSameDay, startOfDay } from 'date-fns'
// import { th } from 'date-fns/locale'

// export default function BookingPage() {
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const roomId = searchParams.get('room')
//   const timeSlotId = searchParams.get('timeSlot')
  
//   const [user, setUser] = useState(null)
//   const [room, setRoom] = useState(null)
//   const [timeSlot, setTimeSlot] = useState(null)
//   const [selectedDate, setSelectedDate] = useState('')
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [successMessage, setSuccessMessage] = useState(null)
//   const [confirmBooking, setConfirmBooking] = useState(false)
//   const [existingBookings, setExistingBookings] = useState([])
  
//   // วันที่ขั้นต่ำและสูงสุดที่สามารถจองได้
//   const minDate = new Date()
//   const maxDate = addDays(new Date(), 30)
  
//   useEffect(() => {
//     // ตรวจสอบการล็อกอิน
//     const storedUser = localStorage.getItem('user')
//     if (!storedUser) {
//       router.push('/coworking/login')
//       return
//     }
    
//     const parsedUser = JSON.parse(storedUser)
//     setUser(parsedUser)
    
//     // ถ้าไม่ได้ระบุ roomId หรือ timeSlotId ให้กลับไปหน้าเลือกห้อง
//     if (!roomId || !timeSlotId) {
//       router.push('/coworking/meetingroom/mta')
//       return
//     }
    
//     // ดึงข้อมูลห้องและช่วงเวลา และการจองที่มีอยู่
//     const fetchData = async () => {
//       try {
//         // ดึงข้อมูลห้อง
//         const roomResponse = await fetch(`/api/roomtype/${roomId}`)
//         if (!roomResponse.ok) {
//           throw new Error('ไม่สามารถดึงข้อมูลห้องได้')
//         }
//         const roomData = await roomResponse.json()
        
//         // ดึงข้อมูลช่วงเวลา
//         const timeSlotResponse = await fetch(`/api/timeslots/${timeSlotId}`)
//         if (!timeSlotResponse.ok) {
//           throw new Error('ไม่สามารถดึงข้อมูลช่วงเวลาได้')
//         }
//         const timeSlotData = await timeSlotResponse.json()
        
//         // ดึงข้อมูลการจองที่มีอยู่
//         const bookingsResponse = await fetch(`/api/bookings/check?userId=${parsedUser.User_ID}&roomType=Type%20A`)
//         if (!bookingsResponse.ok) {
//           throw new Error('ไม่สามารถดึงข้อมูลการจองได้')
//         }
//         const bookingsData = await bookingsResponse.json()
        
//         setRoom(roomData.room)
//         setTimeSlot(timeSlotData.timeSlot)
//         setExistingBookings(bookingsData.bookings)
//         setLoading(false)
//       } catch (err) {
//         console.error('Error fetching data:', err)
//         setError('ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่อีกครั้ง')
//         setLoading(false)
//       }
//     }
    
//     fetchData()
//   }, [router, roomId, timeSlotId])
  
//   // คำนวณราคาตามช่วงเวลา
//   const calculatePrice = (basePrice, slotId) => {
//     // ตรวจสอบว่า basePrice เป็นตัวเลขหรือไม่
//     if (typeof basePrice !== 'number') {
//       basePrice = Number(basePrice) || 0
//     }
    
//     // ตรวจสอบว่า slotId ถูกต้องหรือไม่
//     if (!slotId) return basePrice
    
//     const slotIdNum = parseInt(slotId)
    
//     switch (slotIdNum) {
//       case 1: // Morning
//       case 2: // Afternoon
//         return basePrice
//       case 3: // Full Day
//         return basePrice * 1.75
//       default:
//         return basePrice
//     }
//   }
  
//   // ตรวจสอบว่าวันที่นี้สามารถจองได้หรือไม่
//   const isDateAvailable = (date) => {
//     if (!date) return false
    
//     const formattedDate = format(date, 'yyyy-MM-dd')
    
//     // ตรวจสอบว่าวันที่ที่เลือกไม่อยู่ในอดีตและไม่เกิน 30 วัน
//     const today = startOfDay(new Date())
//     const maxDate = addDays(today, 30)
    
//     if (isBefore(date, today) || isAfter(date, maxDate)) {
//       return false
//     }
    
//     // ตรวจสอบว่าไม่มีการจองในวันที่เลือกแล้ว
//     return !existingBookings.some(booking => {
//       const bookingDate = parseISO(booking.Booking_Date)
//       return isSameDay(bookingDate, date)
//     })
//   }
  
//   const handleDateChange = (e) => {
//     const dateValue = e.target.value
//     setSelectedDate(dateValue)
    
//     // รีเซ็ตข้อความยืนยัน
//     setConfirmBooking(false)
//   }
  
//   const handleBookingRequest = () => {
//     // ตรวจสอบว่าเลือกวันที่แล้ว
//     if (!selectedDate) {
//       setError('กรุณาเลือกวันที่ต้องการจอง')
//       return
//     }
    
//     // ตรวจสอบว่ามีเงินพอหรือไม่
//     const totalPrice = calculatePrice(room.Price, timeSlot.Time_Slot_ID)
//     if (parseFloat(user.Balance) < totalPrice) {
//       setError('ยอดเงินในกระเป๋าไม่เพียงพอ กรุณาเติมเงินก่อนทำการจอง')
//       return
//     }
    
//     // แสดงหน้าจอยืนยันการจอง
//     setError(null)
//     setConfirmBooking(true)
//   }
  
//   const handleConfirmBooking = async () => {
//     setIsSubmitting(true)
//     setError(null)
    
//     try {
//       // คำนวณราคาทั้งหมด
//       const totalPrice = calculatePrice(room.Price, timeSlot.Time_Slot_ID)
      
//       // เรียกใช้ API สร้างการจอง
//       const bookingData = {
//         userId: user.User_ID,
//         roomId: parseInt(roomId),
//         timeSlotId: parseInt(timeSlotId),
//         bookingDate: selectedDate,
//         totalPrice: totalPrice
//       }
      
//       const response = await fetch('/api/bookings/create', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(bookingData)
//       })
      
//       const data = await response.json()
      
//       if (!response.ok) {
//         throw new Error(data.error || 'ไม่สามารถจองห้องประชุมได้')
//       }
      
//       // อัพเดท localStorage ด้วยข้อมูลผู้ใช้ที่อัพเดทแล้ว
//       localStorage.setItem('user', JSON.stringify(data.user))
//       setUser(data.user)
      
//       // อัพเดทรายการจองที่มีอยู่
//       const newBooking = {
//         Booking_Date: selectedDate,
//         Room_ID: roomId,
//         Time_Slot_ID: timeSlotId
//       }
//       setExistingBookings([...existingBookings, newBooking])
      
//       // รีเซ็ตฟอร์มและแสดงข้อความสำเร็จ
//       setSelectedDate('')
//       setConfirmBooking(false)
//       setSuccessMessage('จองห้องประชุมสำเร็จ')
      
//     } catch (err) {
//       console.error('Booking error:', err)
//       setError(err.message || 'เกิดข้อผิดพลาดในการจองห้องประชุม กรุณาลองใหม่อีกครั้ง')
//     } finally {
//       setIsSubmitting(false)
//     }
//   }
  
//   const handleCancelConfirm = () => {
//     setConfirmBooking(false)
//   }
  
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
//         <div className="text-xl font-semibold text-gray-600">กำลังโหลด...</div>
//       </div>
//     )
//   }
  
//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white shadow">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
//           <div className="flex items-center space-x-4">
//             <Link href="/coworking/home" className="text-2xl font-bold text-gray-900">
//               Co Working Space
//             </Link>
//           </div>
          
//           <div className="flex items-center space-x-4">
//             {/* แสดงยอดเงินในกระเป๋า */}
//             {user && (
//               <Link href="/coworking/topup" className="flex items-center bg-green-50 px-4 py-2 rounded-md border border-green-200 hover:bg-green-100 transition-colors">
//                 <span className="text-green-800 font-medium mr-1">ยอดเงิน:</span>
//                 <span className="text-green-600 font-bold">{parseFloat(user.Balance).toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})} บาท</span>
//               </Link>
//             )}
            
//             <Link 
//               href="/coworking/meetingroom/mta"
//               className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
//             >
//               กลับไปหน้าเลือกห้อง
//             </Link>
//           </div>
//         </div>
//       </header>
      
//       <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
//         {!confirmBooking ? (
//           <div className="bg-white shadow-md rounded-lg p-6">
//             <h2 className="text-2xl font-bold text-gray-900 mb-6">จองห้องประชุม</h2>
            
//             {error && (
//               <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
//                 <span className="block sm:inline">{error}</span>
//               </div>
//             )}
            
//             {successMessage && (
//               <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
//                 <span className="block sm:inline">{successMessage}</span>
//                 <div className="mt-2">
//                   <Link href="/coworking/home" className="text-green-700 font-medium underline">
//                     กลับไปหน้าหลัก
//                   </Link>
//                 </div>
//               </div>
//             )}
            
//             {room && timeSlot && !successMessage && (
//               <>
//                 <div className="bg-gray-50 p-4 rounded-md mb-6">
//                   <h3 className="font-medium text-gray-900 mb-2">รายละเอียดการจอง</h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
//                     <div>
//                       <p><span className="font-medium">ห้องประชุม:</span> {room.Room_Number}</p>
//                       <p><span className="font-medium">ประเภท:</span> {room.Room_Type}</p>
//                       <p><span className="font-medium">ความจุ:</span> {room.Capacity} คน</p>
//                     </div>
//                     <div>
//                       <p><span className="font-medium">ช่วงเวลา:</span> {timeSlot.Slot_Name}</p>
//                       <p><span className="font-medium">เวลา:</span> {timeSlot.Start_Time.substring(0, 5)} - {timeSlot.End_Time.substring(0, 5)} น.</p>
//                       <p><span className="font-medium">ราคา:</span> {calculatePrice(room.Price, timeSlot.Time_Slot_ID).toLocaleString('th-TH')} บาท</p>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="mb-6">
//                   <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-700 mb-2">
//                     เลือกวันที่ต้องการจอง
//                   </label>
//                   <input
//                     type="date"
//                     id="bookingDate"
//                     name="bookingDate"
//                     value={selectedDate}
//                     onChange={handleDateChange}
//                     min={format(minDate, 'yyyy-MM-dd')}
//                     max={format(maxDate, 'yyyy-MM-dd')}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                     required
//                   />
//                   <p className="mt-2 text-sm text-gray-500">
//                     * สามารถจองล่วงหน้าได้ไม่เกิน 30 วัน และสามารถจองได้แค่วันละ 1 ครั้งเท่านั้น
//                   </p>
//                 </div>
                
//                 <div className="mb-6">
//                   <h3 className="font-medium text-gray-900 mb-2">ข้อมูลการชำระเงิน</h3>
//                   <div className="bg-gray-50 p-4 rounded-md">
//                     <div className="flex justify-between mb-2">
//                       <span className="text-gray-600">ราคาห้องประชุม:</span>
//                       <span className="font-medium">{room.Price.toLocaleString('th-TH')} บาท</span>
//                     </div>
//                     {parseInt(timeSlot.Time_Slot_ID) === 3 && (
//                       <div className="flex justify-between mb-2">
//                         <span className="text-gray-600">ส่วนลดเต็มวัน:</span>
//                         <span className="font-medium text-green-600">-{(room.Price * 0.25).toLocaleString('th-TH')} บาท</span>
//                       </div>
//                     )}
//                     <div className="flex justify-between font-medium text-lg pt-2 border-t border-gray-200 mt-2">
//                       <span>ยอดรวม:</span>
//                       <span>{calculatePrice(room.Price, timeSlot.Time_Slot_ID).toLocaleString('th-TH')} บาท</span>
//                     </div>
//                     <div className="flex justify-between mt-4">
//                       <span className="text-gray-600">วิธีชำระเงิน:</span>
//                       <span className="font-medium">กระเป๋าเงิน ({parseFloat(user.Balance).toLocaleString('th-TH')} บาท)</span>
//                     </div>
                    
//                     {/* แจ้งเตือนยอดเงินไม่พอ */}
//                     {parseFloat(user.Balance) < calculatePrice(room.Price, timeSlot.Time_Slot_ID) && (
//                       <div className="mt-2 text-sm text-red-600">
//                         * ยอดเงินในกระเป๋าไม่เพียงพอ กรุณา <Link href="/coworking/topup" className="font-medium underline">เติมเงิน</Link> ก่อนทำการจอง
//                       </div>
//                     )}
//                   </div>
//                 </div>
                
//                 <button
//                   onClick={handleBookingRequest}
//                   disabled={!selectedDate || parseFloat(user.Balance) < calculatePrice(room.Price, timeSlot.Time_Slot_ID)}
//                   className={`w-full py-3 rounded-md font-medium text-white ${
//                     !selectedDate || parseFloat(user.Balance) < calculatePrice(room.Price, timeSlot.Time_Slot_ID)
//                       ? 'bg-gray-400 cursor-not-allowed'
//                       : 'bg-indigo-600 hover:bg-indigo-700'
//                   }`}
//                 >
//                   จองห้องประชุม
//                 </button>
//               </>
//             )}
//           </div>
//         ) : (
//           // หน้าจอยืนยันการจอง
//           <div className="bg-white shadow-md rounded-lg p-6">
//             <h2 className="text-2xl font-bold text-gray-900 mb-6">ยืนยันการจองห้องประชุม</h2>
            
//             {error && (
//               <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
//                 <span className="block sm:inline">{error}</span>
//               </div>
//             )}
            
//             <div className="bg-yellow-50 p-4 rounded-md mb-6 border border-yellow-200">
//               <p className="text-yellow-700 font-medium">คุณกำลังจะทำการจองห้องประชุมดังรายละเอียดต่อไปนี้:</p>
//               <ul className="mt-2 space-y-1 text-yellow-700">
//                 <li>• ห้องประชุม: {room.Room_Number}</li>
//                 <li>• วันที่: {format(parseISO(selectedDate), 'd MMMM yyyy', {locale: th})}</li>
//                 <li>• ช่วงเวลา: {timeSlot.Slot_Name} ({timeSlot.Start_Time.substring(0, 5)} - {timeSlot.End_Time.substring(0, 5)} น.)</li>
//                 <li>• ราคา: {calculatePrice(room.Price, timeSlot.Time_Slot_ID).toLocaleString('th-TH')} บาท</li>
//               </ul>
//               <p className="mt-3 text-yellow-800 font-medium">ยอดเงินจะถูกหักจากกระเป๋าเงินของคุณทันที คุณต้องการดำเนินการต่อหรือไม่?</p>
//             </div>
            
//             <div className="flex space-x-4">
//               <button
//                 onClick={handleConfirmBooking}
//                 disabled={isSubmitting}
//                 className="flex-1 py-3 rounded-md font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed"
//               >
//                 {isSubmitting ? 'กำลังดำเนินการ...' : 'ยืนยันการจอง'}
//               </button>
              
//               <button
//                 onClick={handleCancelConfirm}
//                 disabled={isSubmitting}
//                 className="flex-1 py-3 rounded-md font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 disabled:cursor-not-allowed"
//               >
//                 ยกเลิก
//               </button>
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   )
// }