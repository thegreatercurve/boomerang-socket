import defaultOptions from "../defaultOptions";
import listeners from "../EventListeners";
import { IOptions, Protocols } from "../types";
import Reconnector from "./Reconnector";

describe("Reconnector", () => {
  const validUrl = "ws://locahost:8080";

  const bootstrapNewInstance = (
    url?: string,
    protocols?: Protocols | undefined,
    options?: Partial<IOptions>
  ): any => new Reconnector((url = validUrl), protocols, options);

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("should add the `url`", () => {
      const instance = bootstrapNewInstance();

      expect(instance.url).toEqual(validUrl);
    });

    it("should add the `protocols`", () => {
      const protocols = "chat";

      const instance = bootstrapNewInstance(validUrl, protocols);

      expect(instance.protocols).toEqual(protocols);
    });

    it("should add the `defaultOptions` if no option are provided", () => {
      const instance = bootstrapNewInstance(validUrl);

      expect(instance.protocols).toEqual(undefined);
      expect(instance.options).toEqual(defaultOptions);
    });

    it("should add the `options`, shallow merged with the `defaultOptions`", () => {
      const options = { reconnectAttempts: 100 };

      const instance = bootstrapNewInstance(validUrl, undefined, options);

      expect(instance.options).toEqual({
        ...defaultOptions,
        ...options,
      });
    });

    it("should add copies of the `options` values `reconnectDelay` and `reconnectAttempts`", () => {
      const instance = bootstrapNewInstance(validUrl);

      expect(instance.backoff).toEqual(defaultOptions.reconnectDelay);
      expect(instance.attempts).toEqual(defaultOptions.reconnectAttempts);
    });

    it("should call `attachCloseListener`", () => {
      const attachCloseListenerSpy = jest.spyOn(
        Reconnector.prototype as any,
        "attachCloseListener"
      );

      expect(attachCloseListenerSpy).not.toHaveBeenCalled();

      bootstrapNewInstance();

      expect(attachCloseListenerSpy).toHaveBeenCalled();
    });
  });

  describe("attachCloseListener", () => {
    it("should add a close event listener to the WebSocket when `attachCloseListener` is called", () => {
      const addEventListenerSpy = jest.spyOn(
        WebSocket.prototype as any,
        "addEventListener"
      );

      const instance = bootstrapNewInstance();

      const reconnectSpy = jest.spyOn(instance, "reconnect");

      addEventListenerSpy.mockReset();

      instance.attachCloseListener();

      expect(addEventListenerSpy).toHaveBeenCalledWith("close", reconnectSpy);
    });
  });

  describe("bootstrap", () => {
    it("should create a new WebSocket on instantiation", () => {
      const instance = bootstrapNewInstance();

      const bootstrapSpy = jest.spyOn(instance, "bootstrap");

      jest.clearAllMocks();

      expect(bootstrapSpy).not.toHaveBeenCalled();

      instance.bootstrap();

      expect(bootstrapSpy).toHaveBeenCalledTimes(1);

      expect(instance.ws instanceof WebSocket).toBe(true);
    });
  });

  describe("close", () => {
    it("should should close the WebSocket and remove the reconnect event handler", () => {
      const removeEventListenerSpy = jest.spyOn(
        WebSocket.prototype as any,
        "removeEventListener"
      );

      const instance = bootstrapNewInstance();

      expect(removeEventListenerSpy).not.toHaveBeenCalled();

      const reconnectSpy = jest.spyOn(instance, "reconnect");

      instance.close();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "close",
        reconnectSpy
      );
    });
  });

  describe("connect", () => {
    it("should create a new WebSocket", () => {
      const bootstrapSpy = jest.spyOn(
        Reconnector.prototype as any,
        "bootstrap"
      );

      const instance = bootstrapNewInstance();

      jest.clearAllMocks();

      expect(bootstrapSpy).not.toHaveBeenCalled();

      instance.connect();

      expect(instance.ws instanceof WebSocket).toBe(true);
    });

    it("should assign `connectTimeout` to a close callback for the new WebSocket", () => {
      jest.useFakeTimers();

      const closeSpy = jest.spyOn(WebSocket.prototype as any, "close");

      const instance = bootstrapNewInstance();

      instance.reconnect = jest.fn();

      expect(closeSpy).not.toBeCalled();

      instance.connect();

      jest.runAllTimers();

      expect(closeSpy).toHaveBeenCalledTimes(1);
    });

    it("should call `reconnect`", () => {
      const instance = bootstrapNewInstance();

      const reconnectSpy = jest.spyOn(instance, "reconnect");

      expect(reconnectSpy).not.toBeCalled();

      instance.connect();

      expect(reconnectSpy).toHaveBeenCalledTimes(1);
    });

    it("should assign `reconnectSuccessful` as an `onopen` listener to the WebSocket", () => {
      const instance = bootstrapNewInstance();

      const reconnectSuccessfulSpy = jest.spyOn(
        instance,
        "reconnectSuccessful"
      );

      expect(instance.ws.onopen).toEqual(null);

      instance.connect();

      expect(instance.ws.onopen).toEqual(reconnectSuccessfulSpy);
    });
  });

  describe("reconnect", () => {
    it("should call `connect` if reconnection attempts still remain", () => {
      jest.useFakeTimers();

      const instance = bootstrapNewInstance();

      jest.clearAllMocks();

      expect(setTimeout).not.toHaveBeenCalled();

      instance.reconnect();

      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenCalledWith(
        instance.reconnectUnsuccessful,
        instance.backoff
      );
    });
  });

  describe("reconnectSuccessful", () => {
    it("should clear and delete all timeouts", () => {
      const instance = bootstrapNewInstance();

      const connectTimeout = 123;
      const reconnectTimeout = 456;

      instance.connectTimeout = connectTimeout;
      instance.reconnectTimeout = reconnectTimeout;

      instance.reconnectSuccessful(new CustomEvent("open"));

      expect(clearTimeout).toHaveBeenCalledTimes(2);
      expect(clearTimeout).toHaveBeenCalledWith(connectTimeout);
      expect(clearTimeout).toHaveBeenCalledWith(reconnectTimeout);
      expect(instance.connectTimeout).toBeUndefined();
      expect(instance.reconnectTimeout).toBeUndefined();
    });

    const mockOpenEvent = "open";

    it("should reattach all event listeners to the new WebSocket", () => {
      const instance = bootstrapNewInstance();

      const attachSpy = jest.spyOn(listeners, "attach");

      expect(attachSpy).not.toHaveBeenCalled();

      instance.reconnectSuccessful(mockOpenEvent);

      expect(attachSpy).toHaveBeenCalledTimes(1);
    });

    it("should re-publish the `open` event", () => {
      const instance = bootstrapNewInstance();

      const publishSpy = jest.spyOn(listeners, "publish");

      expect(publishSpy).not.toHaveBeenCalled();

      instance.reconnectSuccessful(mockOpenEvent);

      expect(publishSpy).toHaveBeenCalledWith(mockOpenEvent);
    });
  });

  describe("reconnectUnsuccessful", () => {
    it("should clear the `reconnectTimeout` if reconnect attempts are zero", () => {
      const instance = bootstrapNewInstance();

      instance.attempts = 0;

      expect(clearTimeout).not.toHaveBeenCalled();

      instance.reconnectUnsuccessful();

      expect(clearTimeout).toHaveBeenCalledTimes(1);
      expect(clearTimeout).toHaveBeenCalledWith(instance.reconnectTimeout);
    });

    it("should call `close` if reconnect attempts are zero", () => {
      const closeSpy = jest.spyOn(Reconnector.prototype as any, "close");

      const instance = bootstrapNewInstance();

      instance.attempts = 0;

      expect(closeSpy).not.toHaveBeenCalled();

      instance.reconnectUnsuccessful();

      expect(closeSpy).toHaveBeenCalledTimes(1);
    });

    it("should decrement the remaining reconnection attempts everytime it is called", () => {
      const instance = bootstrapNewInstance();

      instance.attempts = 3;

      expect(instance.attempts).toEqual(3);

      instance.reconnectUnsuccessful();

      expect(instance.attempts).toEqual(2);

      instance.reconnectUnsuccessful();

      expect(instance.attempts).toEqual(1);
    });

    it("should increment the reconnection backoff timeout every time it is called", () => {
      const reconnectDelayExponent = 2;

      const instance = bootstrapNewInstance(validUrl, undefined, {
        reconnectDelayExponent,
      });

      const { reconnectDelay } = defaultOptions;

      expect(instance.backoff).toEqual(reconnectDelay);

      instance.reconnectUnsuccessful();

      expect(instance.backoff).toEqual(
        reconnectDelay ** reconnectDelayExponent
      );

      instance.reconnectUnsuccessful();

      expect(instance.backoff).toEqual(
        reconnectDelay ** (reconnectDelayExponent ** reconnectDelayExponent)
      );
    });

    it("should call `connect`", () => {
      const connectSpy = jest.spyOn(Reconnector.prototype as any, "connect");

      const instance = bootstrapNewInstance();

      expect(connectSpy).not.toHaveBeenCalled();

      instance.reconnectUnsuccessful();

      expect(connectSpy).toHaveBeenCalledTimes(1);
    });
  });
});
