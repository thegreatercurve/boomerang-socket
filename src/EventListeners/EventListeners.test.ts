import listeners, { EventListeners } from "./EventListeners";

describe("EventListeners", () => {
  const eventListeners: any = listeners;

  afterEach(() => {
    eventListeners.store = {};

    jest.clearAllMocks();
  });

  it("should expport a new instance of `EventListeners` by default", () => {
    expect(eventListeners instanceof EventListeners).toBe(true);
  });

  describe("attach", () => {
    it("should add all of the event listeners for the given event type", () => {
      const closeListenerOne = jest.fn();
      const closeListenerTwo = jest.fn();
      const openListener = jest.fn();

      eventListeners.store = {
        close: [closeListenerOne, closeListenerTwo],
        open: [openListener],
      };

      const instance = new WebSocket("ws://localhost:8080");

      const addEventListenerSpy = jest.spyOn(instance, "addEventListener");

      expect(addEventListenerSpy).not.toHaveBeenCalled();

      listeners.attach(instance);

      expect(addEventListenerSpy).toHaveBeenCalledTimes(3);
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "close",
        closeListenerOne
      );
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "close",
        closeListenerTwo
      );
      expect(addEventListenerSpy).toHaveBeenCalledWith("open", openListener);
    });
  });

  describe("publish", () => {
    it("should call all event listeners for the given event type", () => {
      const closeListenerOne = jest.fn();
      const closeListenerTwo = jest.fn();
      const openListener = jest.fn();

      eventListeners.store = {
        close: [closeListenerOne, closeListenerTwo],
        open: [openListener],
      };

      listeners.publish(new Event("close"));

      expect(closeListenerOne).toHaveBeenCalledTimes(1);
      expect(closeListenerTwo).toHaveBeenCalledTimes(1);
      expect(openListener).toHaveBeenCalledTimes(0);
    });
  });

  describe("remove", () => {
    it("should remove the correct event listener from the event type array", () => {
      const closeListenerOne = jest.fn();
      const closeListenerTwo = jest.fn();
      const closeListenerThree = jest.fn();
      const openListener = jest.fn();

      eventListeners.store = {
        close: [closeListenerOne, closeListenerTwo, closeListenerThree],
        open: [openListener],
      };

      listeners.remove("close", closeListenerTwo);

      expect(eventListeners.store.close.length).toBe(2);
      expect(eventListeners.store.close).toEqual([
        closeListenerOne,
        closeListenerThree,
      ]);

      listeners.remove("close", closeListenerOne);

      expect(eventListeners.store.close.length).toBe(1);
      expect(eventListeners.store.close).toEqual([closeListenerThree]);
    });
  });

  describe("subscribe", () => {
    const newListener = jest.fn();

    it("should create a new event type key in the store if it doesn't exist", () => {
      expect(eventListeners.store).toEqual({});

      listeners.subscribe("open", newListener);

      expect(eventListeners.store).toEqual({ open: [newListener] });
    });

    it("should push event listeners to the end of the array for that event type", () => {
      const openListener = jest.fn();

      eventListeners.store = { open: [openListener] };

      listeners.subscribe("open", newListener);

      expect(eventListeners.store).toEqual({
        open: [openListener, newListener],
      });
    });
  });
});
