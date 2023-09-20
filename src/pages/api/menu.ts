import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "@/types/chat";

import { getCurrentDate } from "@/utils/common";

const fs = require("fs");
const menus = require("/src/data/menu.json");
const currentDate = getCurrentDate();
if (!menus[currentDate]) {
  menus[currentDate] = [];
}

const todayMenu = menus[currentDate];

export default (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (req.method === "GET") {
    // get message
    // const message = req.body;

    // return message
    res.status(201).json(todayMenu);
  }

  if (req.method === "POST") {
    const newMenu = req.body.menu;
    todayMenu.push(newMenu);
    saveData();
    res?.socket?.server?.io?.emit("updateMenu");
    res.status(201).json(todayMenu);
  }

  if (req.method === "OPTIONS") {
    res.status(200);
  }
};

function saveData() {
  fs.writeFileSync("/src/data/menu.json", JSON.stringify(menus, null, 4));
}
