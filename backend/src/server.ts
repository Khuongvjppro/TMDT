import http from "http";
import app from "./app";
import { Server } from "socket.io";
import { verifyAccessToken } from "./lib/jwt";

const port = Number(process.env.PORT || 4000);
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGIN || "http://localhost:3000")
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);

      const isAllowed =
        FRONTEND_ORIGINS.includes(origin) ||
        (process.env.NODE_ENV !== "production" &&
          /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin));

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  },
});

app.set("io", io);

io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.query.token;
  if (!token) {
    return next(new Error("Authentication error: Token missing"));
  }
  try {
    const payload = verifyAccessToken(token);
    socket.data.user = payload;
    next();
  } catch (err) {
    next(new Error("Authentication error: Invalid token"));
  }
});

const userSockets = new Map<number, string[]>();

io.on("connection", (socket) => {
  const user = socket.data.user;
  if (!user) return;

  const userId = user.userId;
  const existing = userSockets.get(userId) || [];
  existing.push(socket.id);
  userSockets.set(userId, existing);

  socket.join(`user:${userId}`);

  socket.on("disconnect", () => {
    const sockets = userSockets.get(userId) || [];
    const filtered = sockets.filter((id) => id !== socket.id);
    if (filtered.length > 0) {
      userSockets.set(userId, filtered);
    } else {
      userSockets.delete(userId);
    }
  });
});

server.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
