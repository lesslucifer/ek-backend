import { Server, Socket } from 'socket.io'
import ERR from '../glob/err'
import { IUser } from '../models/mongo'
import { ObjectID } from '../models/mongo/mongo-model'
import { GameLogicError } from './base'

export interface IEKMessage {

}

export class EKSocketIOServer {
    io: Server
    userToSocket: Map<string, Socket> = new Map()
    socketToUser: Map<string, ObjectID> = new Map()
    socketIdToSockets: Map<string, Socket> = new Map()

    constructor(ioServer: Server) {
        this.io = ioServer
    }
    
    initListeners() {
        this.io.on('connection', (socket) => {
            this.socketIdToSockets.set(socket.id, socket)
            socket.on('message', (msg) => {
                this.onMessage(socket, msg)
            })

            socket.on('disconnect', () => {
                this.socketIdToSockets.delete(socket.id)
                this.onSocketDisconnected(socket)
            })
        })
    }

    onMessage(socket: Socket, message: any) {
        
    }

    onSocketDisconnected(socket: Socket) {
        const userId = this.socketToUser.get(socket.id)
        if (userId) {
            this.socketToUser.delete(socket.id)
            this.userToSocket.delete(userId.toHexString())
        }
    }

    assignUserWithSocket(user: IUser, socketId: string) {
        if (!this.socketIdToSockets.has(socketId)) throw new GameLogicError(`Socket id does not exist`, ERR.OBJECT_NOT_FOUND)
        if (this.socketToUser.has(socketId) && user._id.equals(this.socketToUser.get(socketId))) {
            throw new GameLogicError('Cannot assign user to socket, it is already used by another user')
        }

        const socket = this.socketIdToSockets.get(socketId)
        this.userToSocket.set(user._id.toHexString(), socket)
        this.socketToUser.set(socketId, user._id)
    }

    userQuit(user: IUser) {
        const socket = this.userToSocket.get(user._id.toHexString())
        if (socket) {
            this.userToSocket.delete(user._id.toHexString())
            this.socketToUser.delete(socket.id)
        }
    }
}