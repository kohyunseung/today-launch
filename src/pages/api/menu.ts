import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "@/src/types/chat.d.ts";

import { getCurrentDate } from "/src/utils/common";

const fs = require("fs");
const menus = require("/src/data/menu.json");
const currentDate = getCurrentDate();
const todayMenu = menus[currentDate] || [];

export default (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (req.method === "GET") {
    // get message
    // const message = req.body;

    // return message
    res.status(201).json(todayMenu);
  }

  if (req.method === "POST") {
    const newMenu = req.body;
    todayMenu.push(newMenu);
    saveData();
    res?.socket?.server?.io?.emit("updateMenu");
    res.status(201).json(todayMenu);
  }
};

function saveData() {
  fs.writeFileSync("src/data/menu.json", JSON.stringify(menus, null, 4));
}
