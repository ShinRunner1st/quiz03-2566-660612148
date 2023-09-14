import { DB, readDB, writeDB } from "@/app/libs/DB";
import { checkToken } from "@/app/libs/checkToken";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export const GET = async (request) => {
  const roomId = request.nextUrl.searchParams.get("roomId");
  readDB();

  const foundMes = DB.messages.find((messages) => messages.roomId === roomId);
  if (!foundMes) {
    return NextResponse.json(
      {
        ok: false,
        message: `Room is not found`,
      },
      { status: 404 }
    );
  }

  let filtered = DB.messages;
  filtered = filtered.filter((messages) => messages.roomId === roomId);

  return NextResponse.json({
    ok: true,
    messages: filtered,
  });
};

export const POST = async (request) => {
  const body = await request.json();
  readDB();

  const foundRoom = DB.rooms.find((room) => room.roomId === body.roomId);
  if (!foundRoom) {
    return NextResponse.json(
      {
        ok: false,
        message: `Room is not found`,
      },
      { status: 404 }
    );
  }

  const messageId = nanoid();
  DB.messages.push({
    roomId: body.roomId,
    messageId: messageId,
    messageText: body.messageText,
  });

  writeDB();

  return NextResponse.json({
    ok: true,
    messageId,
    message: "Message has been sent",
  });
};

export const DELETE = async (request) => {
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
  if (role === "SUPER_ADMIN") {
    const foundMesId = DB.messages.find(
      (message) => message.messageId === body.messageId
    );
    if (!foundMesId) {
      return NextResponse.json(
        {
          ok: false,
          message: "Message is not found",
        },
        { status: 404 }
      );
    }

    DB.messages = DB.messages.filter(
      (messages) => messages.messageId !== body.messageId
    );

    writeDB();

    return NextResponse.json({
      ok: true,
      message: "Message has been deleted",
    });
  } else {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );
  }
};
