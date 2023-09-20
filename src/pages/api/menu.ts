import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "@/types/chat";

import { getCurrentDate } from "@/utils/common";

import { db } from "@/lib/db";

export default async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  const todayMenus = await db.menu.findMany({
    where: {
      date: getCurrentDate(),
    },
  });

  const parsedMenus = JSON.parse(todayMenus[0]?.menu || "[]");
  console.log(parsedMenus);
  if (req.method === "GET") {
    res.status(201).json(parsedMenus);
  }

  if (req.method === "POST") {
    const newMenu = req.body.menu;
    parsedMenus.push(newMenu);
    saveData(parsedMenus);
    res?.socket?.server?.io?.emit("updateMenu");
    res.status(201).json(parsedMenus);
  }

  if (req.method === "OPTIONS") {
    res.status(200);
  }
};

async function saveData(menus: any) {
  const upsertUser = await db.menu.upsert({
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
