"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

import Image from "next/image";
import styles from "./page.module.css";

interface Message {
  user: string;
  msg: string;
}

const user = "User_" + String(new Date().getTime()).substr(-3);

export default function Home() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const inputRef = useRef(null);
  const menuInputRef = useRef(null);
  const canvasRef = useRef(null);

  // init menu
  const [menuInput, setMenuInput] = useState<string>("");

  // connected flag
  const [connected, setConnected] = useState<boolean>(false);

  // init chat and message
  const [chat, setChat] = useState<Message[]>([]);
  const [msg, setMsg] = useState<string>("");
  const [menu, setMenu] = useState([]);

  const colors = [
    "#FF6B6B", // 빨간색
    "#6BFF6B", // 초록색
    "#6B6BFF", // 파란색
    "#FFD166", // 노란색
    "#45AAB8", // 청록색
    "#FF70A6", // 분홍색
    "#6D597A", // 보라색
    "#66BFBF", // 민트색
    "#FF9A8B", // 살몬색
    "#A2D5F2", // 하늘색
    "#FDCB6E", // 주황색
    "#B5B682", // 올리브색
    "#FF9A8B", // 코랄색
    "#4F6367", // 슬레이트 그레이
    "#E5989B", // 로즈색
    "#7FB3D5", // 블루 그레이
    "#6A0572", // 아메시스트
    "#D9BF77", // 골드
    "#52A788", // 티언
    "#C9A88E", // 짙은 베이지
  ];

  useEffect((): any => {
    // connect to socket server
    const socket = io.connect("https://today-launch.vercel.app/", {
      path: "/api/socketio",
    });

    // log socket connection
    socket.on("connect", () => {
      setConnected(true);
      recieveMenu();
      recieveChat();
    });

    // update chat on new message dispatched
    socket.on("updateChat", () => {
      recieveChat();
    });

    socket.on("spin", (randomIndex, arr) => {
      spinRoulette(randomIndex, arr);
    });

    socket.on("updateMenu", () => {
      recieveMenu();
    });

    // socket disconnet onUnmount if exists
    if (socket) return () => socket.disconnect();
  }, []);

  const recieveChat = async () => {
    const resp = await fetch("/api/chat", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const chat = await resp.json();
    setChat(chat);
  };

  const recieveMenu = async () => {
    try {
      const resp = await fetch("/api/menu", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (resp.ok) {
        const menuData = await resp.json();
        setMenu(menuData);
      } else {
        console.error("메뉴 데이터를 가져오는데 문제가 발생했습니다.");
      }
    } catch (error) {
      console.error("메뉴 데이터를 가져오는데 오류가 발생했습니다.", error);
    }
  };

  const sendMessage = async () => {
    if (msg) {
      // build message obj
      const message: Message = {
        user,
        msg,
      };

      // dispatch message to other users
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      // reset field if OK
      if (resp.ok) setMsg("");
    }

    // focus after click
    inputRef?.current?.focus();
  };

  const addMenu = async () => {
    if (menuInput) {
      const resp = await fetch("/api/menu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(menuInput),
      });

      if (resp.ok) {
        setMenuInput("");
        // recieveMenu();
      }
    }
    menuInputRef?.current?.focus();
  };

  // 항목에 대한 무작위 색상 배열 생성

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Canvas를 초기화하고 원을 그립니다.
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.arc(
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2 - 10,
      0,
      Math.PI * 2
    );
    ctx.stroke();

    if (menu.length > 0) {
      // 원의 중심 좌표
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = canvas.width / 2 - 10;

      const angle = (2 * Math.PI) / menu.length;
      for (let i = 0; i < menu.length; i++) {
        // 시작 각도와 끝 각도 계산
        const startAngle = i * angle;
        const endAngle = (i + 1) * angle;

        // 항목에 대한 색상 적용
        ctx.fillStyle = colors[i];

        // 원 부채꼴을 그리기 위해 arc 메서드 사용
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fill();

        // 항목 텍스트 그리기
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        const textX =
          centerX + Math.cos((startAngle + endAngle) / 2) * (radius / 2);
        const textY =
          centerY + Math.sin((startAngle + endAngle) / 2) * (radius / 2);
        ctx.fillText(
          menu[i],
          textX - ctx.measureText(menu[i]).width / 2,
          textY + 6
        );
      }
    }
  }, [menu]);

  const spinRoulette = (randomIndex, arr) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!isSpinning && arr.length > 0) {
      setIsSpinning(true);

      setSelectedItem(null);

      // 룰렛 회전 애니메이션
      const spinDuration = 3000; // 회전 지속 시간 (3초)
      const start = performance.now();

      function animateSpin(time) {
        const elapsed = time - start;
        const progress = elapsed / spinDuration;

        if (progress < 1) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const rotation = (2 * Math.PI * progress) % (2 * Math.PI);
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate(rotation);
          ctx.translate(-canvas.width / 2, -canvas.height / 2);

          // Canvas를 초기화하고 원을 그립니다.
          ctx.lineWidth = 2;
          ctx.strokeStyle = "black";
          ctx.beginPath();
          ctx.arc(
            canvas.width / 2,
            canvas.height / 2,
            canvas.width / 2 - 10,
            0,
            Math.PI * 2
          );
          ctx.stroke();

          // 항목이 있을 경우 각 항목을 Canvas에 그립니다.
          const angle = (2 * Math.PI) / arr.length;
          for (let i = 0; i < arr.length; i++) {
            const x1 = canvas.width / 2;
            const y1 = canvas.height / 2;

            // 각 항목에 대한 색상 적용

            const radius = canvas.width / 2 - 10;
            const startAngle = i * angle;
            const endAngle = (i + 1) * angle;
            ctx.fillStyle = colors[i];
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.arc(x1, y1, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fill();

            // 항목 텍스트 그리기
            ctx.fillStyle = "white";
            ctx.font = "16px Arial";
            const textX =
              x1 + Math.cos((startAngle + endAngle) / 2) * (radius / 2);
            const textY =
              y1 + Math.sin((startAngle + endAngle) / 2) * (radius / 2);
            ctx.fillText(
              arr[i],
              textX - ctx.measureText(arr[i]).width / 2,
              textY + 6
            );
          }

          requestAnimationFrame(animateSpin);
        } else {
          // 애니메이션 완료 후 선택 항목 설정
          setIsSpinning(false);

          const angle = (2 * Math.PI) / arr.length;
          ctx.fillStyle = "yellow";
          ctx.innerWidth = 4;
          const x1 = canvas.width / 2;
          const y1 = canvas.height / 2;

          // 각 항목에 대한 색상 적용

          const radius = canvas.width / 2 - 10;
          const startAngle = randomIndex * angle;
          const endAngle = (randomIndex + 1) * angle;
          // ctx.fillStyle = colors[i];
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.arc(x1, y1, radius, startAngle, endAngle);
          ctx.closePath();
          ctx.fill();

          // 항목 텍스트 그리기
          ctx.fillStyle = "black";
          ctx.font = "16px Arial";
          const textX =
            x1 + Math.cos((startAngle + endAngle) / 2) * (radius / 2);
          const textY =
            y1 + Math.sin((startAngle + endAngle) / 2) * (radius / 2);
          ctx.fillText(
            arr[randomIndex],
            textX - ctx.measureText(arr[randomIndex]).width / 2,
            textY + 6
          );
          setSelectedItem(arr[randomIndex]);
        }
      }

      requestAnimationFrame(animateSpin);
    }
  };

  const sendSpin = async () => {
    const resp = await fetch("/api/spin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(menu),
    });
    if (resp.ok) console.log("ok");
  };

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1>20230920 메뉴정하자!!!!!!</h1>
      </div>
      <div className={styles.chat}>
        <input
          ref={inputRef}
          type="text"
          value={msg}
          placeholder={connected ? "Type a message..." : "Connecting..."}
          disabled={!connected}
          onChange={(e) => {
            setMsg(e.target.value);
          }}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        />

        {chat.map((message, index) => (
          <div key={index}>
            <span>익명: </span>
            <span>{message}</span>
          </div>
        ))}
      </div>
      <div className={styles.roulette}>
        <canvas ref={canvasRef} width="200" height="200" />
        {menu.length > 0 ? (
          <button onClick={sendSpin} disabled={selectedItem}>
            룰렛 돌리기
          </button>
        ) : (
          <span>메뉴입력 하소</span>
        )}

        <div>
          {selectedItem && (
            <div>
              <span>오점뭐!!!!!!!!!!: </span>
              <span>{selectedItem}</span>
            </div>
          )}
        </div>
      </div>
      <div className={styles.menu}>
        <input
          ref={menuInputRef}
          type="text"
          value={menuInput}
          placeholder="메뉴입력하세여"
          onChange={(e) => {
            setMenuInput(e.target.value);
          }}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              addMenu();
            }
          }}
        />
      </div>
    </main>
  );
}
