import { EventEmitter } from "events";
import fastify, { FastifyInstance } from "fastify";
import helmet from "fastify-helmet";
import ws from "fastify-websocket";
import pino, { Logger } from "pino";
import { getDefaultLoggerOptions, generateChildLogger } from "@pedrouid/pino-utils";
import client from "prom-client";

import config from "./config";
import register from "./metrics";
import { assertType } from "./utils";
import { RedisService } from "./redis";
import { WebSocketService } from "./ws";
import { NotificationService } from "./notification";
import { HttpServiceOptions, PostSubscribeRequest } from "./types";
import { SERVER_BEAT_INTERVAL, SERVER_EVENTS } from "./constants/http";

export class HttpService {
  public events = new EventEmitter();

  public app: FastifyInstance;
  public logger: Logger;
  public redis: RedisService;

  public ws: WebSocketService;
  public notification: NotificationService;

  public context = "server";

  private metrics;

  constructor(opts: HttpServiceOptions) {
    const logger =
      typeof opts?.logger !== "undefined" && typeof opts?.logger !== "string"
        ? opts.logger
        : pino(getDefaultLoggerOptions({ level: opts?.logger }));
    this.app = fastify({ logger });
    this.logger = generateChildLogger(logger, this.context);
    this.redis = new RedisService(this.logger);
    this.notification = new NotificationService(this, this.logger, this.redis);
    this.ws = new WebSocketService(this, this.logger, this.redis, this.notification);
    this.metrics = {
      hello: new client.Counter({
        registers: [register],
        name: "relay_hello_counter",
        help: "shows how much the /hello has been called",
      }),
    };
    this.initialize();
  }

  public on(event: string, listener: any): void {
    this.events.on(event, listener);
  }

  public once(event: string, listener: any): void {
    this.events.once(event, listener);
  }

  public off(event: string, listener: any): void {
    this.events.off(event, listener);
  }

  public removeListener(event: string, listener: any): void {
    this.events.removeListener(event, listener);
  }

  // ---------- Private ----------------------------------------------- //

  private initialize(): void {
    this.logger.trace(`Initialized`);
    this.registerApi();
    this.setBeatInterval();
  }

  private registerApi() {
    this.app.register(helmet);
    this.app.register(ws);

    this.app.get("/", { websocket: true }, connection => {
      connection.on("error", (e: Error) => {
        if (!e.message.includes("Invalid WebSocket frame")) {
          this.logger.fatal(e);
          throw e;
        }
      });
      this.ws.addNewSocket(connection.socket as any);
    });
/**
  * This is a Health check API
  */

/**
 * @api {get} /health Request User information
 * @apiName health
 * @apiGroup bridge
 * 
 * @apiParam none
 * 
 * @apiSuccess Success 204
 * 
 */
    this.app.get("/health", (_, res) => {
      res.status(204).send();
    });
/**
 * @api {get} /hello Request User information
 * @apiName hello
 * @apiGroup bridge
 *
 * @apiParam none
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       Welcome to NFT MarketPlace Bridge v1.0
 *
 *     }
 */
    this.app.get("/hello", (_, res) => {
      this.metrics.hello.inc();
      res
        .status(200)
        .send(`NFT Bridge, this is Bridge Server v${config.VERSION}@${config.GITHASH}`);
    });
/**
 * @api {get} /mode Request User information
 * @apiName mode
 * @apiGroup bridge
 *
 * @apiParam none
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       RELAY_MODE: any
 *
 *     }
 */
    this.app.get("/mode", (_, res) => {
      res.status(200).send(`RELAY_MODE: ${config.mode}`);
    });

    this.app.get("/metrics", (_, res) => {
      res.headers({ "Content-Type": register.contentType });
      register.metrics().then(result => {
        res.status(200).send(result);
      });
    });

/**
 * @api {get} /info Request User information
 * @apiName info
 * @apiGroup bridge
 *
 * @apiParam none
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "name": "WalletConnect Bridge Server",
 *        "description": "Server Description",
 *         "version": "1.0"
 *     }
 * 
 */
    this.app.get("/info", (_, res) => {
      res.status(200).send(`{
        name: ${config.NAME},
        description: ${config.DESCRIPTION},
        version: ${config.VERSION}
      }`);
    });

/**
 * @api {post} /subscribe Request for Subscription
 * @apiName subscribe
 * @apiGroup bridge
 *
 * @apiParam topic <client_id>
 * @apiParam webhook <push_notification_webhook>
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true
 *     }
 */

    this.app.post<PostSubscribeRequest>("/subscribe", async (req, res) => {
      try {
        assertType(req, "body", "object");

        assertType(req.body, "topic");
        assertType(req.body, "webhook");

        this.redis.setNotification({
          topic: req.body.topic,
          webhook: req.body.webhook,
        });

        res.status(200).send({ success: true });
      } catch (e) {
        res.status(400).send({ message: `Error: ${e.message}` });
      }
    });
  }

  private setBeatInterval() {
    setInterval(() => this.events.emit(SERVER_EVENTS.beat), SERVER_BEAT_INTERVAL);
  }
}
