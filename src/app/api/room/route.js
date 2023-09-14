import { DB, readDB, writeDB } from "@/app/libs/DB";
import { checkToken } from "@/app/libs/checkToken";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export const GET = async () => {
  readDB();
  return NextResponse.json({
    ok: true,
    rooms: DB.rooms,
    totalRooms: DB.rooms.length,
  });
};

export const POST = async (request) => {
  const body = await request.json();
  const payload = checkToken();
  let role = null;

  try {
    role = payload.role;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );
  }

  readDB();
  if (role === "ADMIN" || role === "SUPER_ADMIN") {
    const foundDupe = DB.rooms.find((room) => room.roomName === body.roomName);
    if (foundDupe) {
      return NextResponse.json(
        {
          ok: false,
          message: `Room ${body.roomName} already exists`,
        },
        { status: 400 }
      );
    }

    const roomId = nanoid();
    DB.rooms.push({ roomId: roomId, roomName: body.roomName });

    //call writeDB after modifying Database
    writeDB();

    return NextResponse.json({
      ok: true,
      roomId,
      message: `Room ${body.roomName} has been created`,
    });
  }
};
