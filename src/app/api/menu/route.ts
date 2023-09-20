import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { NextApiResponseServerIO } from "@/types/chat";

import { getCurrentDate } from "@/utils/common";

export async function POST(req: NextRequest, res: NextApiResponseServerIO) {
  try {
    const todayMenus = await db.menu.findMany({
      where: {
        date: getCurrentDate(),
      },
    });

    const parsedMenus = JSON.parse(todayMenus[0]?.menu || "[]");
    const { menu } = await req.json();
    parsedMenus.push(menu);
    saveData(parsedMenus);
    res?.socket?.server?.io?.emit("updateMenu");
    return NextResponse.json(parsedMenus);
  } catch (e: any) {
    return new NextResponse(e.message, { status: 444 });
  }
}

export async function GET() {
  try {
    const todayMenus = await db.menu.findMany({
      where: {
        date: getCurrentDate(),
      },
    });

    const parsedMenus = JSON.parse(todayMenus[0]?.menu || "[]");
    return NextResponse.json(parsedMenus);
  } catch (e: any) {
    return new NextResponse(e.message, { status: 444 });
  }
}

async function saveData(menus: any) {
  await db.menu.upsert({
    where: {
      date: getCurrentDate(),
    },
    update: {
      menu: JSON.stringify(menus),
    },
    create: {
      menu: JSON.stringify(menus),
      date: getCurrentDate(),
    },
  });
}
