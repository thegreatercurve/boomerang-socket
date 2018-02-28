import listeners from "../EventListeners/EventListeners";
import Reconnector from "../Reconnector";
import { IOptions, Protocols } from "../types";
import { ValidateOptions } from "../ValidateOptions/ValidateOptions";
import BoomerangSocket, { validateOptions } from "./BoomerangSocket";

const eventListeners: any = listeners;

const validUrl = "ws://locahost:8080";

describe("validateOptions", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a `validateOptions` function on instantiation which calls a new instance of `ValidateOptions`", () => {
    expect(validateOptions(validUrl) instanceof ValidateOptions).toBe(true);
  });

  it("should throw an error if the `BoomerangSocket` constructor parameters are invalid", () => {
    const invalidUrl: any = 123;

    expect(() => validateOptions(invalidUrl)).toThrow();
  });
});

describe("BoomerangSocket", () => {
  const bootstrapInstance = (
    url: string = validUrl,
    protocols?: Protocols | undefined,
    options?: Partial<IOptions>
  ) => new BoomerangSocket(url, protocols, options);

  afterEach(() => {
    eventListeners.store = {};

    jest.clearAllMocks();
  });

  it("should extend the prototype of `Reconnector`", () => {
    expect(bootstrapInstance(validUrl) instanceof Reconnector).toBe(true);
  });

  describe("constructor", () => {
    it("should call `validateOptions`", () => {
      const validateOptionSpy = jest.spyOn(
        ValidateOptions.prototype as any,
        "constructor"
      );

      expect(validateOptionSpy).not.toHaveBeenCalled();

      bootstrapInstance();

      expect(validateOptionSpy).not.toHaveBeenCalled();
    });
  });

  const closeListenerOne = jest.fn();
  const closeListenerTwo = jest.fn();
  const openListener = jest.fn();

  describe("addEventListener", () => {
    it("should add the listeners to the listeners store when `addEventListener` is called", () => {
      expect(eventListeners.store).toEqual({});

      const instance = bootstrapInstance();

      instance.addEventListener("close", closeListenerOne);
      instance.addEventListener("close", closeListenerTwo);
      instance.addEventListener("open", openListener);

      expect(eventListeners.store).toEqual({
        close: [closeListenerOne, closeListenerTwo],
        open: [openListener],
      });
    });
  });

  describe("bufferedAmount", () => {
    it("should get the `bufferedAmount` of the WebSocket", () => {
      const instance = bootstrapInstance();

      expect(instance.bufferedAmount).toEqual(0);
    });
  });

  describe("extensions", () => {
    it("should get the `extensions` of the WebSocket", () => {
      const instance = bootstrapInstance();

      expect(instance.extensions).toEqual("");
    });
  });

  describe("event handlers", () => {
    it("should call `addEventListener` on the WebSocket when the `onclose`, `onerror`, `onmessage`, and `onopen` setters are assigned", () => {
      const eventHandler = jest.fn();
      const instance = bootstrapInstance();

      const addEventListenerSpy = jest.spyOn(instance, "addEventListener");

      ["close", "error", "message", "open"].forEach((e: string) => {
        instance[`on${e}`] = eventHandler;

        expect(addEventListenerSpy).toHaveBeenCalledWith(e, eventHandler);

        addEventListenerSpy.mockClear();
      });
    });
  });

  describe("readyState", () => {
    it("should get the `readyState` of the WebSocket", () => {
      const instance = bootstrapInstance();

      expect(instance.readyState).toEqual(0);

      instance.close();

      expect(instance.readyState).toEqual(2);
    });
  });

  describe("removeEventListener", () => {
    it("should remove the listeners from the listeners store when `removeEventListener` is called", () => {
      eventListeners.store = {
        close: [closeListenerOne, closeListenerTwo],
        open: [openListener],
      };

      const instance = bootstrapInstance();

      instance.removeEventListener("close", closeListenerOne);
      instance.removeEventListener("open", openListener);

      expect(eventListeners.store).toEqual({
        close: [closeListenerTwo],
        open: [],
      });
    });
  });

  describe("send", () => {
    it("should call `send` on the WebSocket", () => {
      const sendSpy = jest
        .spyOn(WebSocket.prototype as any, "send")
        .mockReturnValue(true);

      const message = "Example client message";

      const instance = bootstrapInstance();

      expect(sendSpy).not.toHaveBeenCalled();

      instance.send(message);

      expect(sendSpy).toHaveBeenCalledWith(message);
    });
  });
});
