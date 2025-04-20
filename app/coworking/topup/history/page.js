'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import './his.css'

export default function TopupHistoryPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState([])
  const [bookings, setBookings] = useState([])
  const [combinedData, setCombinedData] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // 'all', 'Topup', 'Booking'
  const [sortOrder, setSortOrder] = useState('DESC') // 'DESC', 'ASC'
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  })
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null)

  useEffect(() => {
    // ตรวจสอบการล็อกอินและดึงข้อมูลผู้ใช้
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        } else {
          // ถ้าไม่มีการล็อกอิน ให้เปลี่ยนเส้นทางไปหน้าล็อกอิน
          router.push('/coworking/login')
          return
        }
      } catch (err) {
        console.error('Error accessing localStorage:', err)
        setError('ไม่สามารถตรวจสอบการล็อกอินได้ กรุณาล็อกอินใหม่')
        return
      }
    }
  }, [router])

  // เมื่อข้อมูลผู้ใช้พร้อม ให้ดึงข้อมูลรายการธุรกรรมและการจอง
  useEffect(() => {
    if (user && user.User_ID) {
      fetchTransactions()
      fetchBookings()
    }
  }, [user, dateRange, sortOrder]) // ดึงข้อมูลใหม่เมื่อมีการเปลี่ยนแปลงเรื่องวันที่หรือการเรียงลำดับ

  // รวมข้อมูลและกรองตามประเภท
  useEffect(() => {
    if (transactions.length > 0 || bookings.length > 0) {
      const filteredData = []

      // เพิ่มธุรกรรมการเติมเงินหากไม่ได้กรองเฉพาะการจอง
      if (filter === 'all' || filter === 'Topup') {
        filteredData.push(...transactions.filter(t => t.Transaction_Type === 'Topup'))
      }

      // เพิ่มธุรกรรมการจองและข้อมูลการจองหากไม่ได้กรองเฉพาะการเติมเงิน
      if (filter === 'all' || filter === 'Booking') {
        // เพิ่มธุรกรรมการจองจากตาราง transactions
        filteredData.push(...transactions.filter(t => t.Transaction_Type === 'Booking'))

        // เพิ่มข้อมูลการจองจากตาราง bookings ที่แปลงเป็นรูปแบบธุรกรรม
        const bookingTransactions = bookings.map(booking => ({
          // สร้างข้อมูลธุรกรรมจำลองจากข้อมูลการจอง
          Transaction_ID: `B-${booking.Booking_ID}`,
          Transaction_Date: booking.Booking_Created || booking.Booking_Date,
          Transaction_Type: 'Booking',
          Description: `จองห้อง ${booking.Room_Number || booking.Room_ID} ${booking.Room_Type ? `(${booking.Room_Type})` : ''} วันที่ ${formatDate(booking.Booking_Date, false)}`,
          Amount: booking.Total_Price,
          Status: booking.Booking_Status,
          Payment_Method: booking.Payment_Method,
          Reference_ID: booking.Booking_ID,
          isBookingRecord: true,
          BookingDetails: {
            bookingId: booking.Booking_ID,
            roomId: booking.Room_ID,
            roomNumber: booking.Room_Number,
            roomType: booking.Room_Type,
            capacity: booking.Capacity,
            bookingDate: formatDate(booking.Booking_Date, false),
            timeSlot: booking.Start_Time && booking.End_Time ? `${booking.Start_Time} - ${booking.End_Time}` : '-',
            status: booking.Booking_Status
          },
          originalBooking: booking // เก็บข้อมูลการจองต้นฉบับไว้
        }))

        // กรองออกข้อมูลที่ซ้ำซ้อน (เฉพาะกรณีที่มีทั้งในตาราง transactions และ bookings)
        const existingBookingIds = new Set(
          transactions
            .filter(t => t.Transaction_Type === 'Booking' && t.Reference_ID)
            .map(t => t.Reference_ID)
        )

        const uniqueBookingTransactions = bookingTransactions.filter(
          bt => !existingBookingIds.has(bt.Reference_ID)
        )

        filteredData.push(...uniqueBookingTransactions)
      }

      // เรียงลำดับข้อมูลตามวันที่
      const sortedData = filteredData.sort((a, b) => {
        const dateA = new Date(a.Transaction_Date)
        const dateB = new Date(b.Transaction_Date)
        return sortOrder === 'DESC' ? dateB - dateA : dateA - dateB
      })

      setCombinedData(sortedData)
    } else {
      setCombinedData([])
    }
  }, [transactions, bookings, filter, sortOrder])

  // ดึงข้อมูลรายการธุรกรรม
  const fetchTransactions = async () => {
    try {
      setLoading(true)

      // สร้าง URL parameters
      const params = new URLSearchParams()
      params.append('userId', user.User_ID)

      if (dateRange.from) {
        params.append('fromDate', dateRange.from)
      }

      if (dateRange.to) {
        params.append('toDate', dateRange.to)
      }

      params.append('sortOrder', sortOrder)

      const response = await fetch(`/api/transactions/history?${params.toString()}`)

      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลธุรกรรมได้')
      }

      const data = await response.json()

      if (data.success) {
        setTransactions(data.transactions || [])
      } else {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการดึงข้อมูลธุรกรรม')
      }
    } catch (err) {
      console.error('Error fetching transactions:', err)
      setError(`ไม่สามารถโหลดข้อมูลประวัติการทำรายการได้: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // ดึงข้อมูลประวัติการจอง
  const fetchBookings = async () => {
    try {
      setLoading(true)

      // สร้าง URL parameters สำหรับการกรองวันที่ (ถ้ามี API รองรับ)
      const params = new URLSearchParams()
      params.append('userId', user.User_ID)

      // ดึงข้อมูลการจอง
      const response = await fetch(`/api/bookings/history?${params.toString()}`)

      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลการจองได้')
      }

      const data = await response.json()
      setBookings(data)
    } catch (err) {
      console.error('Error fetching bookings:', err)
      // ไม่ set error ตรงนี้เพื่อให้ยังแสดงข้อมูลธุรกรรมได้แม้การดึงข้อมูลการจองมีปัญหา
    } finally {
      setLoading(false)
    }
  }

  // ฟังก์ชันช่วย
  const formatDate = (dateString, includeTime = true) => {
    if (!dateString) return '-'

    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }

    if (includeTime) {
      options.hour = '2-digit'
      options.minute = '2-digit'
    }

    return new Date(dateString).toLocaleDateString('th-TH', options)
  }

  const formatAmount = (amount, type) => {
    if (!amount) return '-'

    const number = parseFloat(amount).toFixed(2)
    if (type === 'Topup') {
      return `+฿${number}`
    } else {
      return `-฿${number}`
    }
  }




  // ฟังก์ชันแสดงรายละเอียดธุรกรรม/การจอง
  const handleViewDetail = (item) => {
    if (item.isBookingRecord) {
      setSelectedBooking(item.originalBooking)
    } else {
      setSelectedTransaction(item)
    }
  }

  // ฟังก์ชันปิดหน้าต่างรายละเอียด
  const handleCloseDetail = () => {
    setSelectedTransaction(null)
    setSelectedBooking(null)
  }







  // แสดงหน้าจอโหลด
  if (loading && combinedData.length === 0) {
    return (
      <div className="his-loading-screenHome"></div>
    )
  }

  if (error && combinedData.length === 0) {
    return (
      <div className="his-error-container">
        <div className="his-error-message">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="his-retry-button"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="his-container">
      <div className="his-content">

        <div className="his-back-link-container">
          <Link href="/coworking/home" className="his-back-link">กลับไปยังหน้าแรก</Link>
        </div>

          <div className="his-header-flex">
            <div>
              <h1 className="his-page-title">ประวัติการทำรายการ</h1>
              <p className="his-page-subtitle">ดูประวัติการเติมเงินและการจองของคุณ</p>
            </div>

            {user && (
              <div className="his-balance-card">
                <p className="his-balance-label">ยอดเงินคงเหลือ</p>
                <p className="his-balance-amount">฿{parseFloat(user.Balance).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            )}
          </div>
        </div>

        {/* ตัวกรองและการค้นหา */}
        <div className="his-filter-container">
          <div className="his-filter-grid">
            {/* ตัวกรองประเภท */}
            <div>
              <label htmlFor="type-filter" className="his-filter-label">
                ประเภท
              </label>
              <select
                id="type-filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="his-filter-select"
              >
                <option value="all">ทั้งหมด</option>
                <option value="Topup">เติมเงิน</option>
                <option value="Booking">การจอง</option>
              </select>
            </div>

            {/* ช่วงวันที่ */}
            <div>
              <label className="his-filter-label">
                วันที่
              </label>
              <div className="his-date-range">
                <input
                  type="date"
                  id="date-from"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="his-filter-input"
                  placeholder="วันที่เริ่มต้น"
                />
                <input
                  type="date"
                  id="date-to"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="his-filter-input"
                  placeholder="วันที่สิ้นสุด"
                />
              </div>
            </div>

            {/* การเรียงลำดับ */}
            <div>
              <label htmlFor="sort-order" className="his-filter-label">
                เรียงลำดับ
              </label>
              <select
                id="sort-order"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="his-filter-select"
              >
                <option value="DESC">ล่าสุด</option>
                <option value="ASC">เก่าสุด</option>
              </select>
            </div>
          </div>
        </div>

        {/* แสดงสถานะกำลังโหลดข้อมูลเพิ่มเติม */}
        {loading && combinedData.length > 0 && (
          <div className="his-loading-more">
            <svg className="his-loading-more-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>กำลังโหลดข้อมูลเพิ่มเติม...</span>
          </div>
        )}

        {/* ตารางรายการ */}
        <div className="his-table-container">
          <div className="his-table-scroll">
            <table className="his-table">
              <thead className="his-table-header">
                <tr>
                  <th className="his-table-th">
                    วันที่
                  </th>
                  <th className="his-table-th">
                    รายละเอียด
                  </th>
                  <th className="his-table-th">
                    ประเภท
                  </th>
                  <th className="his-table-th his-table-th-right">
                    จำนวนเงิน
                  </th>
                  <th className="his-table-th his-table-th-center">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="his-table-tbody">
                {combinedData.length > 0 ? (
                  combinedData.map((item, index) => (
                    <tr key={index} className="his-table-tr">
                      <td className="his-table-td">
                        {formatDate(item.Transaction_Date)}
                      </td>
                      <td className="his-table-td">
                        {item.Description}
                      </td>
                      <td className="his-table-td">
                        <span className={`his-badge ${item.Transaction_Type === 'Topup'
                            ? 'his-badge-blue'
                            : 'his-badge-purple'
                          }`}>
                          {item.Transaction_Type === 'Topup' ? 'เติมเงิน' : 'จองห้อง'}
                        </span>
                      </td>
                      <td className={`his-table-td his-table-td-right ${item.Transaction_Type === 'Topup'
                          ? 'his-amount-green'
                          : 'his-amount-red'
                        }`}>
                        {formatAmount(item.Amount, item.Transaction_Type)}
                      </td>
                      <td className="his-table-td his-table-td-center">
                        <button
                          onClick={() => handleViewDetail(item)}
                          className="his-detail-button"
                        >
                          ดูรายละเอียด
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="his-empty-message">
                      ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* สรุปรายการ */}
          {combinedData.length > 0 && (
            <div className="his-table-footer">
              <div className="his-table-footer-flex">
                <p className="his-table-count">
                  แสดง {combinedData.length} รายการ
                </p>
                <div className="his-table-summary">
                  <p className="his-summary-text">รวมเติมเงิน: <span className="his-amount-green">
                    +฿{combinedData
                      .filter(t => t.Transaction_Type === 'Topup')
                      .reduce((sum, t) => sum + parseFloat(t.Amount || 0), 0)
                      .toFixed(2)}
                  </span></p>
                  <p className="his-summary-text">รวมค่าใช้จ่าย: <span className="his-amount-red">
                    -฿{combinedData
                      .filter(t => t.Transaction_Type === 'Booking')
                      .reduce((sum, t) => sum + parseFloat(t.Amount || 0), 0)
                      .toFixed(2)}
                  </span></p>
                </div>
              </div>
            </div>
          )}
        </div>


      {/* Modal รายละเอียดธุรกรรม */}
      {selectedTransaction && (
        <div className="his-modal-overlay">
          <div className="his-modal">
            <div className="his-modal-header">
              <h3 className="his-modal-title">รายละเอียดธุรกรรม</h3>
            </div>

            <div className="his-modal-content">
              <div className="his-modal-row">
                <span className="his-modal-label">หมายเลขธุรกรรม:</span>
                <span className="his-modal-value">{selectedTransaction.Transaction_ID}</span>
              </div>
              <div className="his-modal-row">
                <span className="his-modal-label">วันที่ทำรายการ:</span>
                <span className="his-modal-value">{formatDate(selectedTransaction.Transaction_Date)}</span>
              </div>
              <div className="his-modal-row">
                <span className="his-modal-label">ประเภทธุรกรรม:</span>
                <span className={`his-badge ${selectedTransaction.Transaction_Type === 'Topup'
                    ? 'his-badge-blue'
                    : 'his-badge-purple'
                  }`}>
                  {selectedTransaction.Transaction_Type === 'Topup' ? 'เติมเงิน' : 'จองห้อง'}
                </span>
              </div>
              <div className="his-modal-row">
                <span className="his-modal-label">จำนวนเงิน:</span>
                <span className={
                  selectedTransaction.Transaction_Type === 'Topup'
                    ? 'his-amount-green'
                    : 'his-amount-red'
                }>
                  {selectedTransaction.Transaction_Type === 'Topup' ? '+' : '-'}
                  ฿{parseFloat(selectedTransaction.Amount).toFixed(2)}
                </span>
              </div>
              <div className="his-modal-row">
                <span className="his-modal-label">วิธีชำระเงิน:</span>
                <span className="his-modal-value">{selectedTransaction.Payment_Method || '-'}</span>
              </div>
              {selectedTransaction.Reference_ID && (
                <div className="his-modal-row">
                  <span className="his-modal-label">เลขอ้างอิง:</span>
                  <span className="his-modal-value">{selectedTransaction.Reference_ID}</span>
                </div>
              )}
            </div>

            <div className="his-modal-divider">
             
              {selectedTransaction.Transaction_Type === 'Booking' && selectedTransaction.BookingDetails && (
                <div className="his-booking-details">
                  <h5 className="his-booking-title">ข้อมูลการจอง</h5>
                  <ul className="his-booking-list">
                    <li className="his-booking-item">ห้อง: {selectedTransaction.BookingDetails.roomNumber || selectedTransaction.BookingDetails.roomId || '-'}</li>
                    {selectedTransaction.BookingDetails.roomType && <li className="his-booking-item">ประเภทห้อง: {selectedTransaction.BookingDetails.roomType}</li>}
                    {selectedTransaction.BookingDetails.capacity && <li className="his-booking-item">ความจุ: {selectedTransaction.BookingDetails.capacity} คน</li>}
                    <li className="his-booking-item">วันที่จอง: {selectedTransaction.BookingDetails.bookingDate || '-'}</li>
                    <li className="his-booking-item">ช่วงเวลา: {selectedTransaction.BookingDetails.timeSlot || '-'}</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="his-modal-footer">
              <button
                className="his-modal-button"
                onClick={handleCloseDetail}
              >
                ปิด
              </button>
              
            </div>
          </div>
        </div>
      )}

      {/* Modal รายละเอียดการจอง */}
      {selectedBooking && (
        <div className="his-modal-overlay">
          <div className="his-modal">
            <div className="his-modal-header">
              <h3 className="his-modal-title">รายละเอียดการจอง</h3>
            </div>

            <div className="his-modal-content">
              <div className="his-modal-row">
                <span className="his-modal-label">รหัสการจอง:</span>
                <span className="his-modal-value">{selectedBooking.Booking_ID}</span>
              </div>

              <div className="his-modal-row">
                <span className="his-modal-label">วันที่จอง:</span>
                <span className="his-modal-value">{formatDate(selectedBooking.Booking_Date, false)}</span>
              </div>

              <div className="his-modal-row">
                <span className="his-modal-label">วันที่ทำรายการ:</span>
                <span className="his-modal-value">{formatDate(selectedBooking.Booking_Created)}</span>
              </div>

              <div className="his-modal-row">
                <span className="his-modal-label">ห้อง:</span>
                <span className="his-modal-value">{selectedBooking.Room_Number || selectedBooking.Room_ID}</span>
              </div>

              {selectedBooking.Room_Type && (
                <div className="his-modal-row">
                  <span className="his-modal-label">ประเภทห้อง:</span>
                  <span className={`his-badge ${selectedBooking.Room_Type === 'Type A' ? 'his-badge-blue' :
                      selectedBooking.Room_Type === 'Type B' ? 'his-badge-green' :
                        selectedBooking.Room_Type === 'Type C' ? 'his-badge-purple' :
                          'his-badge-gray'
                    }`}>
                    {selectedBooking.Room_Type}
                  </span>
                </div>
              )}

              {selectedBooking.Capacity && (
                <div className="his-modal-row">
                  <span className="his-modal-label">ความจุ:</span>
                  <span className="his-modal-value">{selectedBooking.Capacity} คน</span>
                </div>
              )}

              <div className="his-modal-row">
                <span className="his-modal-label">เวลา:</span>
                <span className="his-modal-value">
                  {selectedBooking.Start_Time && selectedBooking.End_Time
                    ? `${selectedBooking.Start_Time} - ${selectedBooking.End_Time}`
                    : '-'}
                </span>
              </div>

              <div className="his-modal-row">
                <span className="his-modal-label">ราคา:</span>
                <span className="his-amount-red">฿{parseFloat(selectedBooking.Total_Price).toFixed(2)}</span>
              </div>

              <div className="his-modal-row">
                <span className="his-modal-label">วิธีชำระเงิน:</span>
                <span className="his-modal-value">{selectedBooking.Payment_Method || '-'}</span>
              </div>
            </div>

            <div className="his-modal-footer">
              <button
                className="his-modal-button"
                onClick={handleCloseDetail}
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}