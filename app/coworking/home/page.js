'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import './home.css'
import { FaCalendarAlt, FaMicrophone, FaTools, FaTrash } from "react-icons/fa"; // icon




// component หลักของหน้านี้ ก็คือส่วนเนื้อหาของ page นี้
export default function CoworkingHomePage() {
  const router = useRouter()
  const [user, setUser] = useState()

  const [loading, setLoading] = useState(true)

  const [showConfirmation, setShowConfirmation] = useState(false); // ไว้ show confrim logout
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false); // ไว้ show confirm ตอนลบไอดี

  const [isDeleting, setIsDeleting] = useState(false); // ไว้เปิดปิดปุ่ม



  // ----------------- เช็คข้อมูลตอน login -----------------
  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem('user') // ดึงข้อมูลผู้ใช้ใน localStorage จากตัวแปร user (ได้ string)
      if (!userData) { // ถ้าไม่เจอให้กลับไป login
        router.push('/coworking')
      } else { // ถ้าเจอก็
        try {
          const parsedUser = JSON.parse(userData) // แปลงข้อมูลที่เป็น string ในรูปแบบ JSON เป็น object
          setUser(parsedUser) // เก็บข้อมูล (ก็เรียกใช้ user.ต่างๆได้ละ)

        } catch (err) {
          localStorage.removeItem('user') // ลบไว้กัน error เผื่อข้อมูลผิด
          router.push('/coworking')
        }
      }
      setLoading(false) // เพื่อบอกว่าเช็คข้อมูลเสร็จแล้ว
    }
    checkAuth() // เรียกแค่ครั้งเดียว แค่ตอนโหลด component หลัก
  }, [])



  // ---------------------- ส่วน logic logout --------------------
  const handleLogout = () => {
    localStorage.removeItem('user') // ล้างข้อมูลผู้ใช้จาก localStorage
    router.push('/coworking') // กลับ login
    setShowConfirmation(false); // ปิดหน้าคอนเฟรอม
  }



  // ---------------------- ส่วน logic กำลังลบบัญชี ----------------------
  const handleDeleteAccount = async () => {
    setIsDeleting(true); // ทำให้ปุ่ม Delete ใช้ไม่ได้
    try {
      try {
        // ส่ง formData ไปยัง backend ที่ /api/users/delete ในเมทอต DELETE แล้วลบเลย
        const response = await fetch('/api/users/delete', { // ขอ request 
          method: 'DELETE', // DELETE = ลบ
          headers: { 'Content-Type': 'application/json' }, // ให้ส่งไปเป็น JSON
          body: JSON.stringify({ userId: parseInt(user.User_ID, 10) }), // ส่งแค่ userId เป็น JSON (แปลงเป็นเลขก่อนด้วย)
        });

        if (response.ok) {
          alert('ลบบัญชีผู้ใช้เรียบร้อยแล้ว');
          localStorage.removeItem('user'); // ล้างข้อมูลใน localStorage 
          router.push('/coworking'); // หลับหน้า login 
        } else {
          alert(data.error || `ไม่สามารถลบบัญชีผู้ใช้ได้: ${response.status}`);
          setShowDeleteConfirmation(false);
        }

      } catch (fetchError) {
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์: ' + fetchError.message);
        setShowDeleteConfirmation(false);
      }

    } catch (error) {
      alert('เกิดข้อผิดพลาดในการลบบัญชีผู้ใช้: ' + error.message);
      setShowDeleteConfirmation(false);

    } finally {
      setIsDeleting(false); // ยกเลิกสถานะกำลังลบ
    }
  };






  // หน้าจอโหลด (ซึ่งมันเร็วมากกกกกกกกกกกกกกกก)
  if (loading) {
    return (
      <div className="loading-screenHome"></div>
    )
  }


  return (
    <div className="Main-home-page"> 

      {/* --------------------------- AppBar ---------------------------- */}
      <header className="site-header">  
        <div className="header-container"> 

          <Link href="/coworking/home" className="site-title">Co Working Space</Link>  {/* 4 */}
          <div className="nav-container"> 

             <nav className="nav-menu"> {/* เป็น link */}
              <Link href="/coworking/topup/history" className="nav-link"> History </Link>
            </nav>
          </div>

          {/* <nav className="nav-menu">
              <Link href="/coworking/bookinghistory" className="nav-link"> Booking History </Link>
            </nav> */}


          {/* --------------------------- Wallet ---------------------------- */}
          <div className="containerLeft"> {/* 6 */}
            {user && ( 
              <button onClick={() => router.push('/coworking/topup')} className="wallet-balance">  
                <span className="balance-label">ยอดเงิน: </span>  
                <span className="balance-amount">  
                  {parseFloat(user.Balance).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท
                </span> {/* เป็นทศนิยม2ตำแหน่ง (เพื่ออะไรไม่รู้อีก แต่เท่ดีย์) */}
              </button>
            )}


            {/* --------------------------- Logout ---------------------------- */}
            <button
              onClick={() => setShowConfirmation(true)} /*เปิดหน้าคอนเฟรอม์ อยู่ด้านล่างเลย*/
              className="logout-button"
            >
              ออกจากระบบ
            </button>
          </div>

        </div>
      </header>


      {/* ---- หน้าต่าง logout ---- */}
      {showConfirmation && (
        <div className="modal-overlay">
          <div className="confirmation-dialog">
            <h3 className="dialog-title">ยืนยันการออกจากระบบ</h3>
            <p className="dialog-message">คุณต้องการออกจากระบบใช่หรือไม่?</p>

            <button
              onClick={() => setShowConfirmation(false)}
              className="cancel-button"
            >
              ยกเลิก
            </button>

            <button
              onClick={handleLogout}
              className="confirm-button"
            >
              ยืนยัน
            </button>

          </div>
        </div>
      )}


      {/* ----------- ส่วนลบบัญชีผู้ใช้ ----------- */}
      {showDeleteConfirmation && (
        <div className="modal-overlay">
          <div className="confirmation-dialog">
            <h3 className="dialog-title">ยืนยันการลบบัญชีผู้ใช้</h3>
            <p className="dialog-message">คุณต้องการลบบัญชีผู้ใช้นี้ใช่หรือไม่?</p>
            <p className="warning-text">เงินที่ท่านมีอยู่ในระบบ {parseFloat(user.Balance).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท ไม่สามารถขอคืนได้</p>

            <button
              onClick={() => setShowDeleteConfirmation(false)}
              className="cancel-button"
            >
              ยกเลิก
            </button>

            <button
              onClick={handleDeleteAccount}
              className="confirm-button"
              disabled={isDeleting}
            >
              {/* เช็ค isDeleting ว่าเป็น true : false  */}
              {isDeleting ?
                (<> <span className='home-spinner'></span>กำลังลบบัญชี... </>) : 'ยืนยันการลบบัญชี'}
            </button>

          </div>
        </div>
      )}



      {/* --------------------------- ข้อมูลผู้ใช้ --------------------------- */}
      <div className="home-container">
        <div className="content-card2">

          <h2 className="section-title">ข้อมูลผู้ใช้</h2>
          {user && ( // {user && (...)} --> ถ้า user ไม่เป็น null ให้แสดงข้อมูล
            <div className="profile-container">
              <div className="profile-grid">
                <div className="profile-item">
                  <p className="profile-label">ชื่อผู้ใช้</p>
                  <p className="profile-value">{user.User_Name}</p>
                </div>

                <div className="profile-item">
                  <p className="profile-label">ชื่อ-นามสกุล</p>
                  <p className="profile-value">{user.First_Name} {user.Last_Name}</p>
                </div>

                <div className="profile-item">
                  <p className="profile-label">อีเมล</p>
                  <p className="profile-value">{user.U_Email}</p>
                </div>

                <div className="profile-item">
                  <p className="profile-label">เบอร์โทรศัพท์</p>
                  <p className="profile-value">{user.U_Phone}</p>
                </div>

                <div className="profile-item">
                  <p className="profile-label">สถานะกระเป๋าเงิน</p>
                  <p className="profile-value">
                    <span className="status-dot"></span>
                    ใช้งานได้
                  </p>
                </div>

                <div className="profile-item">
                  <p className="profile-label">วันที่ลงทะเบียน</p>
                  <p className="profile-value">
                    {new Date(user.Registration_Date).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* --------------------------- ปุ่มลบบช. --------------------------- */}
              <button
                onClick={() => setShowDeleteConfirmation(true)}
                className="delete-account-button"
              >
                <FaTrash className="delete-icon" /> ลบบัญชีผู้ใช้
              </button>
            </div>
          )}
        </div>


        {/* --------------------------- รายการห้อง --------------------------- */}
        <div className="content-card2">
          <h2 className="section-title">บริการของเรา</h2>

          <div className="services-grid">

            <div className="room-card">
              <div className="room-header">
                <h3 className="room-title">Meeting Room Type A</h3>
                <p className="room-subtitle">ห้องประชุมขนาดเล็ก (จำนวน 6 ห้อง)</p>
              </div>

              <img src="https://uppic.cloud/ib/jQDKTvs0cLelFWA_1744981465.jpg" className="setPic" />

              <ul className="room-features-list">
                <li className="room-feature">ความจุ 8 คน</li>
                <li className="room-feature">โต๊ะประชุมทรงสี่เหลี่ยมผืนผ้า</li>
                <li className="room-feature">จอแสดงผล 55 นิ้ว</li>
                <li className="room-feature">ระบบเสียงคุณภาพสูง</li>
                <li className="room-feature">wifi ความเร็วสูง</li>
                <li className="room-feature">ระบบประชุมทางไกล</li>
              </ul>

              <button onClick={() => router.push("/coworking/meetingroom/mta")} 
              className="room-link-button">
                จองห้องประชุม
              </button>
            </div>



            <div className="room-card">
              <div className="room-header">
                <h3 className="room-title">Meeting Room Type B</h3>
                <p className="room-subtitle">ห้องประชุมขนาดกลาง (จำนวน 6 ห้อง)</p>
              </div>

              <img src="https://uppic.cloud/ib/rMn9A1xD3lSDE4y_1744981466.jpg" className="setPic" />

              <ul className="room-features-list">
                <li className="room-feature">ความจุ 14 คน</li>
                <li className="room-feature">โต๊ะประชุมทรงตัวยู</li>
                <li className="room-feature">จอแสดงผล 65 นิ้ว</li>
                <li className="room-feature">wifi ความเร็วสูง</li>
                <li className="room-feature">ระบบประชุมทางไกล</li>
                <li className="room-feature">บริการเครื่องดื่ม</li>
              </ul>

              <button onClick={() => router.push("/coworking/meetingroom/mtb")} 
              className="room-link-button">
                จองห้องประชุม
              </button>
            </div>



            <div className="room-card">
              <div className="room-header">
                <h3 className="room-title">Meeting Room Type C</h3>
                <p className="room-subtitle">ห้องประชุมขนาดใหญ่ (จำนวน 5 ห้อง)</p>
              </div>

              <img src="https://uppic.cloud/ib/73bG9uxVY6pgl06_1744981466.jpg" className="setPic" />

              <ul className="room-features-list">
                <li className="room-feature">ความจุ 20 คน</li>
                <li className="room-feature">โต๊ะประชุมทรงสี่เหลี่ยมผืนผ้าขนาดใหญ่</li>
                <li className="room-feature">จอแสดงผล 75 นิ้ว</li>
                <li className="room-feature">ระบบประชุมทางไกลคุณภาพสูง</li>
                <li className="room-feature">ระบบเสียงรอบทิศทาง</li>
                <li className="room-feature">บริการเครื่องดื่มและอาหารว่าง</li>
              </ul>

              <button onClick={() => router.push("/coworking/meetingroom/mtc")} 
              className="room-link-button">
                จองห้องประชุม
              </button>
            </div>


          </div>
        </div>


        <div className="content-card">
          <h2 className="section-title">ข้อมูลเพิ่มเติม</h2>
          <ul className="info-list">
            <li className="info-item"> <FaCalendarAlt className="inline-icon" />
              สามารถจองล่วงหน้าได้สูงสุด 30 วัน
            </li>

            <li className="info-item"> <FaMicrophone className="inline-icon" />   ทุกห้องมีเครื่องปรับอากาศและอุปกรณ์เครื่องเสียง
            </li>

            <li className="info-item"> <FaTools className="inline-icon" />
              มีบริการช่วยเหลือด้านเทคนิคตลอดเวลาทำการ
            </li>
          </ul>
        </div>



      </div>
    </div>
  )
}



// Flow ที่เกิดขึ้นในนี้คือ
// มาถึงหน้านี้ก็ดึงข้อมูลจาก localStorage
// ถ้าไม่พบข้อมูล → ส่งกลับไปหน้าล็อกอิน
// ถ้าพบข้อมูล → แสดงหน้าหลัก

// การทำงานของปุ่มต่างๆ:
// ปุ่มยอดเงิน → ไปหน้าเติมเงิน (/coworking/topup)
// ปุ่มออกจากระบบ → แสดงหน้าต่างยืนยัน → ลบข้อมูลและกลับหน้าล็อกอิน
// ปุ่มลบบัญชีผู้ใช้ → แสดงหน้าต่างยืนยัน → ส่ง request ลบบัญชี → กลับหน้าล็อกอิน
// ปุ่มจองห้องประชุม → ไปยังหน้าจองห้องแต่ละประเภท
// ลิงก์ History → ไปหน้าประวัติการทำรายการ (/coworking/topup/history)