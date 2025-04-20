import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

const db = mysqlPool.promise()

export async function GET(request){
    try {
        const [rows, fields] = await db.query(
            'SELECT * FROM Room'
        )
        return NextResponse.json(rows, {status: 200})
    } catch (error){
        return NextResponse.json({error:"Failed to fetch"}, {status: 500})
    }
}

/* export async function POST(request){
    try {
        const {Type_ID, Type_Name,Capacity, Description} = await request.json();
        const [result] = await db.query(
            'INSERT INTO RoomType (Type_ID, Type_Name,Capacity, Description) VALUES (?,?,?,?)',[Type_ID, Type_Name,Capacity, Description]
        );
        return NextResponse.json({Type_ID, Type_Name,Capacity, Description}, {status: 200});
    } catch (error){
        return NextResponse.json({error:error}, {status: 500})
    }
}

export async function PUT(request){
    try {
        const {id, name, detail, coverimage, latitude, longitude} = await request.json();
        const [result] = await db.query(
            'UPDATE attractions SET name=?, detail=?, coverimage=?, latitude=?, longitude=? WHERE id = ?',[name, detail, coverimage, latitude, longitude, id]
        );
        if (result.affectedRows == 0){
            return NextResponse.json({error: "ID Not found"}, {status: 404});
        }

        return NextResponse.json({message: "Updated", id}, {status: 200});
    } catch (error){
        return NextResponse.json({error: error}, {status: 500})
    }
}

export async function DELETE(request){
    try {
        const {id} = await request.json();
        const [result] = await db.query(
            'DELETE FROM attractions WHERE id = ?',[id]
        );
        if (result.affectedRows == 0){
            return NextResponse.json({error: "ID Not found"}, {status: 404});
        }

        return NextResponse.json({message: "Deleted", id}, {status: 200});
    } catch (error){
        return NextResponse.json({error: error}, {status: 500})
    }
}

*/