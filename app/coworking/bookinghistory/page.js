// 'use client';

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";

// import './bk.css';

// // Status Badge Component
// const StatusBadge = ({ status }) => {
//   // Translate status to Thai
//   const translateStatus = (status) => {
//     switch (status) {
//       case "Confirmed": return "ยืนยันแล้ว";
//       case "Cancelled": return "ยกเลิกแล้ว";
//       case "Completed": return "เสร็จสิ้น";
//       default: return status;
//     }
//   };

//   return (
//     <span className={`status-badge status-${status.toLowerCase()}`}>
//       {translateStatus(status)}
//     </span>
//   );
// };

// // Empty State Component when no bookings exist
// const EmptyState = () => (
//   <div className="empty-state">
//     <div className="empty-icon">
//       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
//         <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//       </svg>
//     </div>
//     <h3>ไม่พบประวัติการจอง</h3>
//     <p>คุณยังไม่เคยจองห้องประชุม</p>
//     <Link href="/booking" className="book-btn">จองห้องประชุม</Link>
//   </div>
// );

// // Room Type Tag Component
// const RoomTypeTag = ({ type }) => {
//   return <span className={`room-tag room-tag-${type.toLowerCase().replace(' ', '')}`}>{type}</span>;
// };

// export default function BookingHistoryPage() {
//   const [bookings, setBookings] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [user, setUser] = useState(null);
//   const router = useRouter();

//   const fetchBookingHistory = async (userId) => {
//     try {
//       setIsLoading(true);
//       const response = await fetch(`/api/bookings/history?userId=${userId}`);
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || "ไม่สามารถดึงข้อมูลประวัติการจองได้");
//       }
//       const data = await response.json();
//       setBookings(data);
//     } catch (err) {
//       console.error("Error fetching booking history:", err);
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     // Check authentication
//     const checkAuth = () => {
//       const storedUser = localStorage.getItem("user");
//       if (!storedUser) {
//         router.push("/login");
//         return null;
//       }
//       try {
//         const parsedUser = JSON.parse(storedUser);
//         setUser(parsedUser);
//         return parsedUser;
//       } catch (err) {
//         console.error("Error parsing user data:", err);
//         localStorage.removeItem("user");
//         router.push("/login");
//         return null;
//       }
//     };

//     const userData = checkAuth();
//     if (userData) {
//       fetchBookingHistory(userData.User_ID);
//     }
//   }, [router]);

//   // Format date to Thai format
//   const formatDate = (dateString) => {
//     const options = { year: "numeric", month: "long", day: "numeric" };
//     return new Date(dateString).toLocaleDateString("th-TH", options);
//   };

//   // Format time
//   const formatTime = (timeString) => {
//     return timeString || "-";
//   };

//   // Handle cancel booking
//   const handleCancelBooking = async (bookingId) => {
//     if (!confirm("คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?")) return;
//     try {
//       const response = await fetch(`/api/bookings/cancel`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ bookingId }),
//       });

//       const data = await response.json();
//       if (!response.ok) {
//         throw new Error(data.error || "ไม่สามารถยกเลิกการจองได้");
//       }

//       // Update booking status locally
//       setBookings((prevBookings) =>
//         prevBookings.map((booking) =>
//           booking.Booking_ID === bookingId
//             ? { ...booking, Booking_Status: "Cancelled" }
//             : booking
//         )
//       );

//       alert("ยกเลิกการจองสำเร็จ");
//     } catch (err) {
//       console.error("Error cancelling booking:", err);
//       alert(`เกิดข้อผิดพลาด: ${err.message}`);
//     }
//   };


//   if (!user) return null;

//   return (
//     <div className="booking-history-page">
//       <div className="container">
//         <div className="back-link-container">
//           <Link href="/coworking/home" className="back-link">
//             กลับไปยังหน้าแรก
//           </Link>
//         </div>

//         <div className="main-content">
//           <div className="page-header">
//             <h1>ประวัติการจองห้อง</h1>
//             <p>รายการการจองห้องประชุมของคุณทั้งหมด</p>
//           </div>
  
//           {error ? (
//             <div className="error-message">
//               <p>{error}</p>
//             </div>
//           ) : bookings.length === 0 ? (
//             <EmptyState />
//           ) : (
//             <div className="table-container">
//               <div className="table-wrapper">
//                 <table className="booking-table">
//                   <thead>
//                     <tr>
//                       <th>ห้อง</th>
//                       <th>ประเภท</th>
//                       <th>ความจุ</th>
//                       <th>วันที่จอง</th>
//                       <th>เวลา</th>
//                       <th>ราคา</th>
//                       <th>สถานะ</th>
//                       <th className="action-column">การจัดการ</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {bookings.map((booking) => (
//                       <tr key={booking.Booking_ID}>
//                         <td className="room-number">{booking.Room_Number || booking.Room_ID}</td>
//                         <td>{booking.Room_Type ? <RoomTypeTag type={booking.Room_Type} /> : '-'}</td>
//                         <td>{booking.Capacity ? `${booking.Capacity} คน` : '-'}</td>
//                         <td>{formatDate(booking.Booking_Date)}</td>
//                         <td>
//                           {booking.Start_Time && booking.End_Time ? 
//                             `${formatTime(booking.Start_Time)} - ${formatTime(booking.End_Time)}` : "-"}
//                         </td>
//                         <td className="price">
//                           {typeof booking.Total_Price === 'number' ? 
//                             `${booking.Total_Price.toFixed(2)} บาท` : 
//                             `${parseFloat(booking.Total_Price).toFixed(2)} บาท`}
//                         </td>
//                         <td>
//                           <StatusBadge status={booking.Booking_Status} />
//                         </td>
//                         <td className="action-column">
//                           <div className="action-buttons">
//                             <button 
//                               onClick={() => router.push(`/booking/detail/${booking.Booking_ID}`)} 
//                               className="details-btn">
//                                 ดูรายละเอียด
//                             </button>
//                             {booking.Booking_Status === "Confirmed" && (
//                               <button 
//                                 onClick={() => handleCancelBooking(booking.Booking_ID)} 
//                                 className="cancel-btn">
//                                   ยกเลิก
//                               </button>
//                             )}
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
  
//               {/* Simple pagination */}
//               <div className="pagination">
//                 <div className="pagination-controls">
//                   <button disabled className="pagination-btn">ก่อนหน้า</button>
//                   <button disabled className="pagination-btn next-btn">ถัดไป</button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }