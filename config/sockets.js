

try {
    io.on('connection', (socket) => {

        socket.on("chat:send-message", data => ChatController.onSendMessage(socket, data));

    });
} catch (e) {
    console.log(e);
}