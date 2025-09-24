// server/socket/index.js

const express = require('express')
const { Server } = require('socket.io')
const http = require('http')
const getUserDetailsFromToken = require('../helpers/getUserDetailsFromToken')
const UserModel = require('../models/UserModel')
const { ConversationModel, MessageModel } = require('../models/ConversationModel')
const getConversation = require('../helpers/getConversation')

const app = express()

/*** Socket server setup */
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true,
    },
})

// Online users tracking
const onlineUsers = new Set()

io.on('connection', async (socket) => {
    console.log('Connected User:', socket.id)

    try {
        // Extract token from handshake auth
        const token = socket.handshake.auth.token
        if (!token) {
            console.error('No token provided')
            return socket.disconnect()  // Disconnect client if no token is provided
        }

        // Get current user details using the token
        const user = await getUserDetailsFromToken(token)
        if (!user || !user._id) {
            console.error('Invalid user or user._id is missing')
            return socket.disconnect()  // Disconnect client if user is invalid
        }

        // Create a room for the user and track online users
        socket.join(user._id.toString())
        onlineUsers.add(user._id.toString())
        io.emit('onlineUser', Array.from(onlineUsers))

        /*** Handlers for various events ***/

        // Handle "message-page" event
        socket.on('message-page', async (userId) => {
            try {
                const userDetails = await UserModel.findById(userId).select('-password')
                if (!userDetails) {
                    console.error('User not found:', userId)
                    return
                }

                const payload = {
                    _id: userDetails._id,
                    name: userDetails.name,
                    email: userDetails.email,
                    profile_pic: userDetails.profile_pic,
                    online: onlineUsers.has(userId),
                }
                socket.emit('message-user', payload)

                // Get previous messages between the current user and the other user
                const conversation = await ConversationModel.findOne({
                    $or: [
                        { sender: user._id, receiver: userId },
                        { sender: userId, receiver: user._id },
                    ],
                }).populate('messages').sort({ updatedAt: -1 })

                socket.emit('message', conversation?.messages || [])
            } catch (error) {
                console.error('Error in message-page:', error)
            }
        })

        // Handle "new message" event
        socket.on('new message', async (data) => {
            try {
                const { sender, receiver, text, imageUrl, videoUrl, msgByUserId } = data

                // Check for existing conversation
                let conversation = await ConversationModel.findOne({
                    $or: [
                        { sender, receiver },
                        { sender: receiver, receiver: sender },
                    ],
                })

                // If no conversation exists, create a new one
                if (!conversation) {
                    const newConversation = new ConversationModel({ sender, receiver })
                    conversation = await newConversation.save()
                }

                // Save the new message
                const message = new MessageModel({
                    text,
                    imageUrl,
                    videoUrl,
                    msgByUserId,
                })
                const savedMessage = await message.save()

                // Update conversation with the new message
                await ConversationModel.updateOne(
                    { _id: conversation._id },
                    { $push: { messages: savedMessage._id } }
                )

                // Fetch the updated conversation
                const updatedConversation = await ConversationModel.findById(conversation._id).populate('messages').sort({ updatedAt: -1 })

                // Emit updated messages to both sender and receiver
                io.to(sender).emit('message', updatedConversation?.messages || [])
                io.to(receiver).emit('message', updatedConversation?.messages || [])

                // Emit updated conversations to both users
                const conversationSender = await getConversation(sender)
                const conversationReceiver = await getConversation(receiver)

                io.to(sender).emit('conversation', conversationSender)
                io.to(receiver).emit('conversation', conversationReceiver)
            } catch (error) {
                console.error('Error in new message:', error)
            }
        })

        // Handle "delete message" event
        socket.on('delete message', async (msgId) => {
            try {
                // Find and delete the message by ID
                const message = await MessageModel.findByIdAndDelete(msgId)
                if (!message) {
                    console.error('Message not found:', msgId)
                    return
                }

                // Emit an event to both users to remove the message from their chat
                io.emit('message deleted', msgId)

                console.log('Message deleted:', msgId)
            } catch (error) {
                console.error('Error in delete message:', error)
            }
        })

        // Handle "sidebar" event to get conversations for the current user
        socket.on('sidebar', async (currentUserId) => {
            try {
                const conversation = await getConversation(currentUserId)
                socket.emit('conversation', conversation)
            } catch (error) {
                console.error('Error in sidebar:', error)
            }
        })

        // Handle "seen" event to mark messages as seen
        socket.on('seen', async (msgByUserId) => {
            try {
                const conversation = await ConversationModel.findOne({
                    $or: [
                        { sender: user._id, receiver: msgByUserId },
                        { sender: msgByUserId, receiver: user._id },
                    ],
                })

                const messageIds = conversation?.messages || []

                // Update messages to mark them as seen
                await MessageModel.updateMany(
                    { _id: { $in: messageIds }, msgByUserId },
                    { $set: { seen: true } }
                )

                // Send updated conversations
                const conversationSender = await getConversation(user._id.toString())
                const conversationReceiver = await getConversation(msgByUserId)

                io.to(user._id.toString()).emit('conversation', conversationSender)
                io.to(msgByUserId).emit('conversation', conversationReceiver)
            } catch (error) {
                console.error('Error in seen event:', error)
            }
        })

        // Handle disconnection
        socket.on('disconnect', () => {
            onlineUsers.delete(user._id.toString())
            console.log('User disconnected:', socket.id)
            io.emit('onlineUser', Array.from(onlineUsers))
        })
    } catch (error) {
        console.error('Error during connection:', error)
        socket.disconnect()
    }
})

module.exports = {
    app,
    server,
}
