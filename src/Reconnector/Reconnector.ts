import defaultOptions from "../defaultOptions";
import listeners from "../EventListeners";
import { IOptions, Protocols } from "../types";

class Reconnector {
  public ws: WebSocket;

  public url: string;
  public protocols?: Protocols | undefined;

  public binaryType: string = "blob";

  private options: IOptions;

  private attempts: number;
  private backoff: number;

  private connectTimeout: number;
  private reconnectTimeout: number;

  constructor(
    url: string,
    protocols?: Protocols | undefined,
    options?: Partial<IOptions>
  ) {
    this.url = url;
    this.protocols = protocols;

    this.options = Object.assign({}, defaultOptions, options);

    this.reconnect = this.reconnect.bind(this);
    this.reconnectSuccessful = this.reconnectSuccessful.bind(this);
    this.reconnectUnsuccessful = this.reconnectUnsuccessful.bind(this);

    this.resetAttemptsBackoff();
    this.bootstrap();
    this.attachCloseListener();
  }

  public close(code?: number, reason?: string) {
    this.ws.removeEventListener("close", this.reconnect);

    this.ws.close(code, reason);
  }

  private attachCloseListener() {
    this.ws.addEventListener("close", this.reconnect);
  }

  private bootstrap() {
    this.ws = new WebSocket(this.url, this.protocols);

    this.ws.binaryType = this.binaryType;
  }

  private connect() {
    this.bootstrap();

    this.ws.onopen = this.reconnectSuccessful;

    this.connectTimeout = window.setTimeout(
      () => this.ws.close(),
      this.options.connectTimeout
    );

    this.reconnect();
  }

  private reconnect() {
    this.reconnectTimeout = window.setTimeout(
      this.reconnectUnsuccessful,
      this.backoff
    );
  }

  private resetAttemptsBackoff() {
    const { reconnectAttempts, reconnectDelay } = this.options;

    this.attempts = reconnectAttempts;
    this.backoff = reconnectDelay;
  }

  private reconnectSuccessful(e: Event) {
    window.clearTimeout(this.connectTimeout);
    window.clearTimeout(this.reconnectTimeout);

    delete this.connectTimeout;
    delete this.reconnectTimeout;

    delete this.ws.onopen;

    this.resetAttemptsBackoff();
    this.attachCloseListener();

    listeners.attach(this.ws);
    listeners.publish(e);
  }

  private reconnectUnsuccessful(e: Event) {
    if (this.attempts < 1) {
      window.clearTimeout(this.reconnectTimeout);

      delete this.reconnectTimeout;

      return this.close();
    }

    this.attempts--;

    this.backoff = this.backoff ** this.options.reconnectDelayExponent;

    this.connect();
  }
}

export default Reconnector;
