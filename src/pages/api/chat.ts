import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "@/types/chat";

import { getCurrentDate } from "@/utils/common";

const fs = require("fs");
const chats = require("/src/data/chat.json");
const currentDate = getCurrentDate();
if (!chats[currentDate]) {
  chats[currentDate] = [];
}
const todayChat = chats[currentDate];

export default (req: NextApiRequest, res: NextApiResponseServerIO) => {
  console.log(req);
  if (req.method === "GET") {
    res.status(201).json(todayChat);
  }
  if (req.method === "POST") {
    // get message
    const message = req.body.message;
    todayChat.push(message);
    // saveData();
    // dispatch to channel "message"
    res?.socket?.server?.io?.emit("updateChat");
    // return message
    res.status(201).json(todayChat);
  }
  if (req.method === "OPTIONS") {
    res.status(200);
  }
};

function saveData() {
  fs.writeFileSync("/src/data/chat.json", JSON.stringify(chats, null, 4));
}
