import { NextApiRequest } from "next";
// import { NextApiResponseServerIO } from "@/types/chat";
import { Server as ServerIO } from "socket.io";
import { Server as NetServer } from "http";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req, res) => {
  if (!res.socket.server.io) {
    console.log("New Socket.io server...");
    // adapt Next's net Server to http Server
    const httpServer = res.socket.server;
    const io = new ServerIO(httpServer, {
      path: "/api/socketio",
      addTrailingSlash: false,
    });
    // append SocketIO server to Next.js socket server response
    res.socket.server.io = io;
  }
  res.end();
};

// import { Server } from "socket.io";

// const SocketHandler = (req, res) => {
//   if (res.socket.server.io) {
//     console.log("이미 바인딩 되었습니다.");
//   } else {
//     console.log("서버-소켓 연결완료");
//     const io = new Server(res.socket.server);
//     res.socket.server.io = io;
//   }
//   res.end();
// };

// export default SocketHandler;
