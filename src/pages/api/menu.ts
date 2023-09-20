import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "@/types/chat";

import { getCurrentDate } from "@/utils/common";

import fs from "fs-extra";
import path from "path";

export default async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  const menuFilePath = path.join(process.cwd(), "/tmp/menu.json");
  const menus = await fs.readJson(menuFilePath);
  const currentDate = getCurrentDate();
  if (!menus[currentDate]) {
    menus[currentDate] = [];
  }
  const todayMenu = menus[currentDate];
  if (req.method === "GET") {
    // get message
    // const message = req.body;

    // return message
    res.status(201).json(todayMenu);
  }

  if (req.method === "POST") {
    const newMenu = req.body.menu;
    todayMenu.push(newMenu);
    saveData(menuFilePath, menus);
    res?.socket?.server?.io?.emit("updateMenu");
    res.status(201).json(todayMenu);
  }

  if (req.method === "OPTIONS") {
    res.status(200);
  }
};

async function saveData(menuFilePath: string, menus: any) {
  await fs.writeJson(menuFilePath, menus, { spaces: 4 });
}
