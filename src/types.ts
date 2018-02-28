export interface IOptions {
  connectTimeout: number;
  reconnect: boolean;
  reconnectAttempts: number;
  reconnectDelay: number;
  reconnectDelayExponent: number;
}

export interface IStoredEventListener {
  type: string;
  listener: EventListener;
}

export type Protocols = string | string[];

declare class BoomerangSocket {
  constructor(
    url: string,
    protocols?: Protocols | undefined,
    options?: Partial<IOptions>
  );
}

export default BoomerangSocket;
