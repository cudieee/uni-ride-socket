const dotenv = require('dotenv').config()
const io = require('socket.io')(process.env.PORT, {
  cors: {
    origin: 'https://uniride.netlify.app'
  }
})
let users = []

const addUser = (userId, socketId) => {
  !users.some(user => user.userId === userId) &&
    users.push({ userId, socketId })
}

const removerUser = socketId => {
  users = users.filter(user => user.socketId !== socketId)
}

const getUser = userId => {
  return users.find(user => user.userId === userId)
}
io.on('connection', socket => {
  //when connected
  console.log('user connected')
  socket.on('addUser', userId => {
    addUser(userId, socket.id)
    io.emit('getUsers', users)
  })

  //send adn get message
  socket.on('sendMessage', ({ senderId, recieverId, text }) => {
    const user = getUser(recieverId)
    if (!user) {
      console.log(`User ${recieverId} not found`)
      return
    }

    io.to(user.socketId).emit('getMessage', {
      senderId,
      text
    })
  })

  // when discoonected
  socket.on('disconnect', () => {
    console.log('User Disconnected')
    removerUser(socket.id)
    io.emit('getUsers', users)
  })
})
