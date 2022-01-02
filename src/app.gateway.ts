import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
 } from '@nestjs/websockets';
 import { Logger } from '@nestjs/common';
 import { Socket, Server } from 'socket.io';
import { UserSessionCache } from './user-session-cache';

 @WebSocketGateway({ cors: true })
 export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
 
  constructor(private userSessionCache: UserSessionCache) {}
  
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway'); 

  @SubscribeMessage('patientJoin')
  public async joinRoom(client: Socket, userName: string) {
    this.logger.log("patientJoin", userName);
    client.join('waitingRoom');
    this.userSessionCache.addOrUpdate(userName);

    const activeUsers = await this.userSessionCache.getAllActive();
    this.server.emit('patientList', activeUsers.map(x=> x.userName));
  }

  afterInit(server: Server) {
   this.logger.log('Init');
  }
 
  handleDisconnect(client: Socket) {
   this.logger.log(`Client disconnected: ${client.id}`);
  }
 
  handleConnection(client: Socket, ...args: any[]) {
   this.logger.log(`Client connected: ${client.id}`);
  }
 }