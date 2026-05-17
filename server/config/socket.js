const { Server } = require("socket.io");
let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on("location_update", ({ incidentId, location }) => {
      io.to(incidentId).emit("victim_location", { incidentId, location });
    });

    socket.on("accept_incident", ({ incidentId, responderId }) => {
      io.to(incidentId).emit("incident_accepted", { responderId });
    });

    socket.on("send_message", ({ incidentId, message }) => {
      io.to(incidentId).emit("receive_message", message);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

module.exports = { initSocket, getIO };