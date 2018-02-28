import ValidateOptions from "./ValidateOptions";

describe("ValidateOptions", () => {
  const validUrl = "ws://locahost:8080";

  const bootstrapInstance = (url: string, ...rest: any[]) =>
    new ValidateOptions(url, ...rest);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should throw an Error if no `url` is provided", () => {
    expect(() => (bootstrapInstance as any)()).toThrowError(
      "You must provide a url to the constructor function."
    );
  });

  it("should only validate the protocol or `protocols` array if they are provided", () => {
    const validateProtocolsTypesSpy = jest.spyOn(
      ValidateOptions.prototype as any,
      "validateProtocolsTypes"
    );

    expect(validateProtocolsTypesSpy).not.toBeCalled();

    bootstrapInstance(validUrl);

    expect(validateProtocolsTypesSpy).not.toBeCalled();

    bootstrapInstance(validUrl, "chat");

    expect(validateProtocolsTypesSpy).toHaveBeenCalledTimes(1);
  });

  it("should only validate the `options` if they are provided", () => {
    const validateOptionsPropsSpy = jest.spyOn(
      ValidateOptions.prototype as any,
      "validateOptionsProps"
    );

    expect(validateOptionsPropsSpy).not.toBeCalled();

    bootstrapInstance(validUrl, undefined, { reconnect: false });

    expect(validateOptionsPropsSpy).toHaveBeenCalledTimes(1);
  });

  describe("validateOptionsProps", () => {
    it("should throw an Error if the `options` do not contain the correct types for each property", () => {
      expect(() =>
        bootstrapInstance(validUrl, undefined, { reconnect: "" })
      ).toThrowError(
        "That is an invalid type. The option `reconnect` should be a `boolean`."
      );

      expect(() =>
        bootstrapInstance(validUrl, undefined, { connectTimeout: true })
      ).toThrowError(
        "That is an invalid type. The option `connectTimeout` should be a `number`."
      );
    });
  });

  describe("validateOptionsTypes", () => {
    it("should throw an Error if the `options` do not contain the correct property names", () => {
      expect(() =>
        bootstrapInstance(validUrl, undefined, { invalidKey: "" })
      ).toThrowError(
        "The `options` config contains invalid properties. Have you mispelled something?"
      );
    });
  });

  describe("validateProtocolsTypes", () => {
    it("should throw an Error if the protocol or `protocols` array are not, or do not contain a `string` type", () => {
      expect(() => bootstrapInstance(validUrl, 1)).toThrowError(
        "The protocol is an invalid type. It must be a `string`."
      );

      expect(() => bootstrapInstance(validUrl, [1, 2])).toThrowError(
        "The protocols contain invalid types. All protocols must be a `string`."
      );
    });
  });

  describe("validateUrlType", () => {
    it("should throw an Error if the `url` is not a `string` type", () => {
      expect(() => bootstrapInstance(12 as any)).toThrowError(
        "The url is an invalid type. It must be a `string`."
      );
    });
  });
});
