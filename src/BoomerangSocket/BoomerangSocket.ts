import listeners from "../EventListeners";
import Reconnector from "../Reconnector";
import { IOptions, Protocols } from "../types";
import ValidateOptions from "../ValidateOptions";

export const validateOptions = (
  url: string,
  protocols?: Protocols | undefined,
  options?: Partial<IOptions>
) => new ValidateOptions(url, protocols, options);

class BoomerangSocket extends Reconnector {
  constructor(
    url: string,
    protocols?: Protocols | undefined,
    options?: Partial<IOptions>
  ) {
    super(url, protocols, (options = {}));

    validateOptions(url, protocols, options);
  }

  public addEventListener(e: string, fn: EventListener) {
    listeners.subscribe(e, fn);

    this.ws.addEventListener(e, fn);
  }

  get bufferedAmount() {
    return this.ws.bufferedAmount;
  }

  get extensions() {
    return this.ws.extensions;
  }

  set onclose(fn: EventListener) {
    this.addEventListener("close", fn);
  }

  set onerror(fn: EventListener) {
    this.addEventListener("error", fn);
  }

  set onmessage(fn: EventListener) {
    this.addEventListener("message", fn);
  }

  set onopen(fn: EventListener) {
    this.addEventListener("open", fn);
  }

  get readyState() {
    return this.ws.readyState;
  }

  public removeEventListener(e: string, fn: EventListener) {
    listeners.remove(e, fn);

    this.ws.removeEventListener(e, fn);
  }

  public send(data: any) {
    this.ws.send(data);
  }
}

export default BoomerangSocket;
