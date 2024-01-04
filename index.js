const { createServer } = require("http");
const { Server } = require("socket.io");
const CLIENT_HOST = process.env.CLIENT_HOST || "http://localhost:3000";
const httpServer = createServer();
let onlineUsers = []
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
    const result = await classRepository.getNotifications(userId);
    console.log(result, " chuan bi gui");
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
        console.log(data, " CLASS NOTI DATA");
        for (const rev of data.receiverId) {
            console.log(rev.userId);
            const receiver = getUser(rev.userId);
            console.log(receiver);
            if (receiver) {
                io.to(receiver.socketId).emit("getNotification", {
                    content: await newNotiList(receiver.userId),
                });
            }
        }
    });

    socket.on("sendNotification", ({ senderId, receiverId, type }) => {
        const receiver = getUser(receiverId);
        console.log(type);
        io.to(receiver.socketId).emit("getNotification", {
            content: newNotiList(receiver.socketId),
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
