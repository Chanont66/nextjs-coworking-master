// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'

// export default function MeetingRoomPage() {
//   const router = useRouter()
//   const [user, setUser] = useState(null)
//   const [loading, setLoading] = useState(true)
  
//   useEffect(() => {
//     const checkAuth = () => {
//       const userData = localStorage.getItem('user')
//       if (!userData) {
//         router.push('/coworking')
//       } else {
//         try {
//           const parsedUser = JSON.parse(userData)
//           setUser(parsedUser)
//         } catch (err) {
//           console.error('Error parsing user data:', err)
//           localStorage.removeItem('user')
//           router.push('/coworking')
//         }
//       }
//       setLoading(false)
//     }
    
//     checkAuth()
//   }, [router])

//   const handleLogout = () => {
//     localStorage.removeItem('user')
//     router.push('/coworking')
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
//             <nav className="hidden md:flex space-x-4">
//               <Link href="/coworking/meetingroom" className="text-indigo-600 font-medium">
//                 Meeting Room
//               </Link>
//               <Link href="/coworking/trainingroom" className="text-gray-600 hover:text-indigo-600 font-medium">
//                 Training Room
//               </Link>
//               <Link href="/coworking/eventroom" className="text-gray-600 hover:text-indigo-600 font-medium">
//                 Event Room
//               </Link>
//             </nav>
//           </div>
//           <button
//             onClick={handleLogout}
//             className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
//           >
//             ออกจากระบบ
//           </button>
//         </div>
//       </header>
      
//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
//         <div className="bg-white shadow-md rounded-lg p-6">
//           <h2 className="text-xl font-semibold text-gray-800 mb-4">Meeting Room</h2>
//           <p className="text-gray-600 mb-6">
//             เลือกห้องประชุมที่เหมาะกับความต้องการของคุณ ด้วยตัวเลือกหลากหลายที่รองรับการประชุมทุกรูปแบบ
//           </p>
          
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
//             {/* Meeting Room Type A */}
//             <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200">
//               <h3 className="font-medium text-lg mb-2">Meeting Room Type A</h3>
//               <p className="text-gray-600 text-sm mb-3">ห้องประชุมขนาดเล็ก (จำนวน6ห้อง)</p>
//               <ul className="text-sm text-gray-600 mb-4 space-y-1">
//                 <li>• ความจุ 8 คน </li>
//                 <li>• โต๊ะประชุมทรงสี่เหลี่ยมผืนผ้า</li>
//                 <li>• จอแสดงผล 55 นิ้ว</li>
//                 <li>• ระบบเสียงคุณภาพสูง</li>
//                 <li>• ไวไฟความเร็วสูง</li>
//                 <li>• ระบบประชุมทางไกล</li>
//                 <br/>
//               </ul>
//               <Link href="/coworking/meetingroom/mta" className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md text-sm text-center transition duration-200">
//                 ดูรายละเอียด
//               </Link>
//             </div>
            
//             {/* Meeting Room Type B */}
//             <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200">
//               <h3 className="font-medium text-lg mb-2">Meeting Room Type B</h3>
//               <p className="text-gray-600 text-sm mb-3">ห้องประชุมขนาดกลาง (จำนวน6ห้อง)</p>
//               <ul className="text-sm text-gray-600 mb-4 space-y-1">
//                 <li>•ความจุ 14 คน</li>
//                 <li>• โต๊ะประชุมทรงตัวยู</li>
//                 <li>• จอแสดงผล 65 นิ้ว</li>
//                 <li>• ไวไฟความเร็วสูง</li>
//                 <li>• ระบบประชุมทางไกล</li>
//                 <li>• บริการเครื่องดื่ม</li>
//                 <br/>
//               </ul>
//               <Link href="/coworking/trainingroom/mtb" className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md text-sm text-center transition duration-200">
//                 ดูรายละเอียด
//               </Link>
//             </div>
            
//             {/* Meeting Room Type C */}
//             <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200">
//               <h3 className="font-medium text-lg mb-2">Meeting Room Type C</h3>
//               <p className="text-gray-600 text-sm mb-3">ห้องประชุมขนาดใหญ่ (จำนวน5ห้อง)</p>
//               <ul className="text-sm text-gray-600 mb-4 space-y-1">
//                 <li>• ความจุ 20 คน</li>
//                 <li>• โต๊ะประชุมทรงสี่เหลี่ยมผืนผ้าขนาดใหญ่</li>
//                 <li>• จอแสดงผล 75 นิ้ว</li>
//                 <li>• ระบบประชุมทางไกลคุณภาพสูง</li>
//                 <li>• ระบบเสียงรอบทิศทาง</li>
//                 <li>• ไวไฟความเร็วสูง</li>
//                 <li>• บริการเครื่องดื่มและอาหารว่าง</li>
//               </ul>
//               <Link href="/coworking/eventroom/mtc" className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md text-sm text-center transition duration-200">
//                 ดูรายละเอียด
//               </Link>
//             </div>
//           </div>
          
//           {/* Additional information */}
//           <div className="bg-gray-50 p-4 rounded-md mt-6">
//             <h3 className="font-medium text-gray-900 mb-2">ข้อมูลเพิ่มเติม</h3>
//             <ul className="space-y-1 text-sm text-gray-600">
//               <li>• สามารถจองล่วงหน้าได้สูงสุด 30 วัน</li>
//               <li>• ทุกห้องมีเครื่องปรับอากาศและอุปกรณ์เครื่องเสียง</li>
//               <li>• มีบริการช่วยเหลือด้านเทคนิคตลอดเวลาทำการ</li>
//               <li>• สามารถขอบริการเสริมเพิ่มเติมได้ (มีค่าใช้จ่ายเพิ่ม)</li>
//             </ul>
//           </div>
//         </div>
//       </main>
//     </div>
//   )
// }
