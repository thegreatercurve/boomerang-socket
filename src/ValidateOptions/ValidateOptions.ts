import defaultOptions from "../defaultOptions";
import { IOptions, Protocols } from "../types";

export class ValidateOptions {
  constructor(
    url: string,
    protocols?: Protocols | undefined,
    options?: Partial<IOptions>
  ) {
    if (!url) {
      throw new SyntaxError(
        "You must provide a url to the constructor function."
      );
    }

    this.validateUrlType(url);

    if (protocols) {
      this.validateProtocolsTypes(protocols);
    }

    if (options && Object.keys(options).length > 0) {
      this.validateOptionsProps(options);
      this.validateOptionsTypes(options);
    }
  }

  private validateOptionsProps(options: Partial<IOptions>) {
    const optionsProps = Object.keys(options);
    const validProps = Object.keys(defaultOptions);

    const hasInvalidProps = optionsProps.some(
      (opt: keyof IOptions) => validProps.indexOf(opt) < 0
    );

    if (hasInvalidProps) {
      throw new Error(
        "The `options` config contains invalid properties. Have you mispelled something?"
      );
    }
  }

  private validateOptionsTypes(options: Partial<IOptions>) {
    const validOptionTypes = {
      connectTimeout: "number",
      reconnect: "boolean",
      reconnectAttempts: "number",
      reconnectDelay: "number",
      reconnectDelayExponent: "number",
    };

    const invalidOptionType = (option: keyof IOptions, optionType: string) => {
      throw new TypeError(
        `That is an invalid type. The option \`${option}\` should be a \`${optionType}\`.`
      );
    };

    Object.keys(options).map((key: keyof IOptions) => {
      if (typeof options[key] !== validOptionTypes[key]) {
        invalidOptionType(key, validOptionTypes[key]);
      }
    });
  }

  private validateProtocolsTypes(protocols: Protocols) {
    if (
      Array.isArray(protocols) &&
      protocols.some((protocol: string) => typeof protocol !== "string")
    ) {
      throw new TypeError(
        "The protocols contain invalid types. All protocols must be a `string`."
      );
    } else if (typeof protocols !== "string") {
      throw new TypeError(
        "The protocol is an invalid type. It must be a `string`."
      );
    }
  }

  private validateUrlType(url: string) {
    if (typeof url !== "string") {
      throw new TypeError("The url is an invalid type. It must be a `string`.");
    }
  }
}

export default ValidateOptions;
