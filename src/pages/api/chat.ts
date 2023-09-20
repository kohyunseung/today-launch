import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "@/types/chat";

import { getCurrentDate } from "@/utils/common";

import { db } from "@/lib/db";

export default async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  const todayChats = await db.chat.findMany({
    where: {
      date: getCurrentDate(),
    },
  });

  const parsedChats = JSON.parse(todayChats[0]?.message || "[]");

  // const chatFilePath = path.join(process.cwd(), "/tmp/chat.json");
  // const chatsData = await fsPromise.readFile(chatFilePath);
  // const chats = JSON.parse(chatsData.toString());
  // const currentDate = getCurrentDate();
  // if (!chats[currentDate]) {
  //   chats[currentDate] = [];
  // }
  // const todayChat = chats[currentDate];

  if (req.method === "GET") {
    res.status(201).json(parsedChats);
  }
  if (req.method === "POST") {
    // get message
    const message = req.body.message;
    parsedChats.push(message);
    saveData(parsedChats);
    // dispatch to channel "message"
    res?.socket?.server?.io?.emit("updateChat");
    // return message
    res.status(201).json(parsedChats);
  }
  if (req.method === "OPTIONS") {
    res.status(200);
  }
};

async function saveData(chats: any) {
  const upsertUser = await db.chat.upsert({
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

// chat.json 파일 경로 설정
// const chatFilePath = path.join(process.cwd(), "src/data/chat.json");

// export default (req: NextApiRequest, res: NextApiResponseServerIO) => {
//   if (req.method === "GET") {
//     try {
//       // chat.json 파일 읽기
//       const chats = await fs.readJson(chatFilePath);
//       res.status(200).json(chats);
//     } catch (error) {
//       console.error("Error reading chat.json:", error);
//       res.status(500).json({ error: "Error reading chat.json" });
//     }
//   } else if (req.method === "POST") {
//     const message = req.body.message;

//     // chat.json 파일 읽기
//     try {
//       const chats = await fs.readJson(chatFilePath);

//       // 새로운 메시지 추가
//       chats.push({ message });

//       // chat.json 파일 쓰기
//       await fs.writeJson(chatFilePath, chats, { spaces: 4 });

//       res.status(201).json({ message });
//     } catch (error) {
//       console.error("Error writing chat.json:", error);
//       res.status(500).json({ error: "Error writing chat.json" });
//     }
//   } else if (req.method === "OPTIONS") {
//     res.status(200);
//   }
// };
