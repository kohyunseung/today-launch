import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { NextApiResponseServerIO } from "@/types/chat";

import { getCurrentDate } from "@/utils/common";

export async function POST(req: NextRequest, res: NextApiResponseServerIO) {
  try {
    const todayChats = await db.chat.findMany({
      where: {
        date: getCurrentDate(),
      },
    });

    const parsedChats = JSON.parse(todayChats[0]?.message || "[]");
    const { message } = await req.json();
    parsedChats.push(message);
    saveData(parsedChats);
    res?.socket?.server?.io?.emit("updateChat");
    return NextResponse.json(parsedChats);
  } catch (e: any) {
    return new NextResponse(e.message, { status: 444 });
  }
}

export async function GET() {
  try {
    const todayChats = await db.chat.findMany({
      where: {
        date: getCurrentDate(),
      },
    });

    const parsedChats = JSON.parse(todayChats[0]?.message || "[]");
    return NextResponse.json(parsedChats);
  } catch (e: any) {
    return new NextResponse(e.message, { status: 444 });
  }
}

async function saveData(chats: any) {
  await db.chat.upsert({
    where: {
      date: getCurrentDate(),
    },
    update: {
      message: JSON.stringify(chats),
    },
    create: {
      message: JSON.stringify(chats),
      date: getCurrentDate(),
    },
  });
}
