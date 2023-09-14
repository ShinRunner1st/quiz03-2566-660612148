import { NextResponse } from "next/server";

export const GET = async () => {
  return NextResponse.json({
    ok: true,
    fullName: "Norrawich Sombutnan",
    studentId: "660612148",
  });
};
