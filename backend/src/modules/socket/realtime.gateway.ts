import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/**
 * Typed events that will be emitted from later phases:
 * - result:published  — when an admin publishes a competition result
 * - final:announced   — when the final championship result is announced
 * - points:updated    — when points change (group or student)
 */

@WebSocketGateway({
  namespace: '/realtime',
  cors: {
    origin: process.env.ORIGINS ? process.env.ORIGINS.split(',').map(o => o.trim()) : true,
    credentials: true,
  },
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  afterInit() {
    console.log('🔌 Socket.IO /realtime gateway initialized');
  }

  handleConnection(client: Socket) {
    console.log(`🔌 Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`🔌 Client disconnected: ${client.id}`);
  }

  /**
   * Emit a typed event to all connected clients.
   * Used by Results module in Phase 6.
   */
  emitEvent(event: string, data: any) {
    this.server.emit(event, data);
  }
}
