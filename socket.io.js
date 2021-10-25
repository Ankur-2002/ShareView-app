let io;
module.exports = {
  init: server => {
    io = require('socket.io')(server, {
      cors: {
        methos: ['*'],
      },
    });
    return io;
  },
  getIo: () => {
    if (!io) throw new Error('Socket not Exist');
    return io;
  },
};
