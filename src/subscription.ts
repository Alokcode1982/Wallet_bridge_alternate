import { Logger } from "pino";
import { generateChildLogger } from "@pedrouid/pino-utils";

import { RedisService } from "./redis";
import { WebSocketService } from "./ws";
import { Subscription } from "./types";
import { generateRandomBytes32 } from "./utils";
import { FIVE_SECONDS } from "./constants";
import { HttpService } from "./http";
import { SERVER_EVENTS } from "./constants/http";
import { SOCKET_EVENTS } from "./constants/ws";

export class SubscriptionService {
  public subscriptions: Subscription[] = [];

  public context = "subscription";

  constructor(
    public server: HttpService,
    public logger: Logger,
    public redis: RedisService,
    public ws: WebSocketService,
  ) {
    this.server = server;
    this.logger = generateChildLogger(logger, this.context);
    this.redis = redis;
    this.ws = ws;
    this.initialize();
  }

  public set(subscription: Omit<Subscription, "id">): string {
    const id = generateRandomBytes32();
    this.logger.debug(`Setting Subscription`);
    this.logger.trace({ type: "method", method: "set", topic: subscription.topic });
    this.subscriptions.push({ ...subscription, id });
    return id;
  }

  public get(topic: string, senderSocketId: string): Subscription[] {
    const subscriptions = this.subscriptions.filter(
      sub => sub.topic === topic && sub.socketId !== senderSocketId,
    );
    this.logger.debug(`Getting Subscriptions`);
    this.logger.trace({ type: "method", method: "get", topic, subscriptions });
    return subscriptions;
  }

  public remove(id: string): void {
    this.logger.debug(`Removing Subscription`);
    this.logger.trace({ type: "method", method: "remove", id });
    this.subscriptions = this.subscriptions.filter(sub => sub.id !== id);
  }

  public removeSocket(socketId: string): void {
    this.logger.debug(`Removing Socket Subscriptions`);
    this.logger.trace({ type: "method", method: "removeSocket", socketId });
    this.subscriptions = this.subscriptions.filter(sub => sub.socketId !== socketId);
  }

  // ---------- Private ----------------------------------------------- //

  private initialize(): void {
    this.logger.trace(`Initialized`);
    this.registerEventListeners();
  }

  private clearInactiveSubscriptions() {
    this.subscriptions = this.subscriptions.filter(sub => this.ws.isSocketConnected(sub.socketId));
  }

  private registerEventListeners() {
    this.server.on(SERVER_EVENTS.beat, () => this.clearInactiveSubscriptions());
    this.ws.on(SOCKET_EVENTS.close, (socketId: string) => this.removeSocket(socketId));
  }
}
