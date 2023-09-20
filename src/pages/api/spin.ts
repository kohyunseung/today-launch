import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "@/types/chat";

export default (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (req.method === "POST") {
    // get message

    // dispatch to channel "message"
    const menu = req.body.menu;
    console.log(menu);
    const randomIndex = Math.floor(Math.random() * menu.length);
    res?.socket?.server?.io?.emit("spin", randomIndex, menu);

    // return message
    res.status(201).json(randomIndex);
  }
};
