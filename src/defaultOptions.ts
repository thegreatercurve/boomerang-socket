import { IOptions } from "./types";

const options: IOptions = {
  connectTimeout: 250,
  reconnect: true,
  reconnectAttempts: Infinity,
  reconnectDelay: 3000,
  reconnectDelayExponent: 1.05,
};

export default options;
