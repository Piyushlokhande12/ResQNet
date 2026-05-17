const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { initSocket } = require("./config/socket");
dotenv.config();
const disasterRoutes = require("./routes/disaster.routes");
const donorRoutes = require("./routes/donor.routes");
const authRoutes = require("./routes/auth.routes");
const incidentRoutes = require("./routes/incident.routes");
const responderRoutes = require("./routes/responder.routes");
const adminRoutes = require("./routes/admin.routes");
const notificationRoutes = require("./routes/notification.routes");
const roleRequestRoutes = require("./routes/roleRequest.routes");

connectDB();

const app = express();
const server = http.createServer(app);

initSocket(server);

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/responders", responderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/disasters", disasterRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/role-requests", roleRequestRoutes);

app.use(require("./middleware/errorHandler"));
app.get("/",(req,res)=>{
    res.json({
        data:"server working"
    });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));