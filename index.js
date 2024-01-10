const { createServer } = require("http");
const { Server } = require("socket.io");
const db = require("./db/index");
const moment = require("moment-timezone");
const CLIENT_HOST = process.env.CLIENT_HOST || "http://localhost:3000";
const httpServer = createServer();
let onlineUsers = []
require("dotenv").config();


const getNotifications = async (id) => {
    const result = await db.connection.execute(
        "SELECT notifications.*, accounts.fullname, class.name, CASE WHEN notifications.type = 'class' THEN class.id WHEN notifications.type = 'user' THEN accounts.id ELSE NULL END AS additionalId FROM notifications LEFT JOIN class ON notifications.type = 'class' AND class.id = notifications.sender LEFT JOIN accounts ON notifications.type = 'user' AND accounts.id = notifications.receiver WHERE notifications.receiver = ? ORDER BY notifications.createdDay DESC LIMIT 5",
        [id]
    );

    const notifications = result[0].map((notification) => {
        const localizedTimestamp = moment(notification.createdDay).tz(
            "Asia/Ho_Chi_Minh"
        );
        return {
            ...notification,
            createdDay: localizedTimestamp.format(),
        };
    });

    return notifications.length > 0 ? notifications : null;
}

const io = new Server(httpServer, {
    cors: {
        origin: CLIENT_HOST,
        methods: ["GET", "POST"],
    },
});

const PORT = process.env.PORT || 3500;

const addNewUser = (userId, socketId) => {
    !onlineUsers.some((user) => user.userId === userId) &&
        onlineUsers.push({ userId, socketId });
};

const removeUser = (id) => {
    onlineUsers = onlineUsers.filter((user) => user.userId !== id);
};

const getUser = (userId) => {
    return onlineUsers.find((user) => user.userId === userId);
};

const newNotiList = async (userId) => {
    const result = await getNotifications(userId);
    return result;
};
let count = 0;
io.on("connection", (socket) => {
    // let myinterval = setInterval(function() {
    //   console.log("New connection ", onlineUsers);
    // }, 3000);
    // myinterval
    count++;
    console.log("connected: ", count);
    socket.on("newUser", (userId) => {
        addNewUser(userId, socket.id);
        console.log("Online users: ", onlineUsers);
    });

    socket.on("sendClassNotification", async ({ data }) => {
        for (const rev of data.receiverId) {
            const receiver = getUser(rev.userId);
            if (receiver) {
                io.to(receiver.socketId).emit("getNotification", {
                    content: await newNotiList(receiver.userId),
                });
            }
        }
    });

    socket.on("sendNotification", async ({ senderId, receiverId, type }) => {
        const receiver = getUser(receiverId);
        console.log("receiver: ", receiver);
        io.to(receiver.socketId).emit("getNotification", {
            content: await newNotiList(receiver.userId),
        });
    });

    socket.on("disconnect", (userId) => {
        console.log("USER disconnect ", onlineUsers);
        removeUser(userId);
    });
});


httpServer.listen(PORT, () => {
    console.log(`Socket.io server is running on port ${PORT}`);
});

// Rest of your Socket.io setup...
