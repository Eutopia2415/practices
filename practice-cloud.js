"use strict";
(() => {
  // node_modules/convex/dist/esm/index.js
  var version = "1.46.0";

  // node_modules/convex/dist/esm/values/base64.js
  var lookup = [];
  var revLookup = [];
  var Arr = Uint8Array;
  var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  for (i = 0, len = code.length; i < len; ++i) {
    lookup[i] = code[i];
    revLookup[code.charCodeAt(i)] = i;
  }
  var i;
  var len;
  revLookup["-".charCodeAt(0)] = 62;
  revLookup["_".charCodeAt(0)] = 63;
  function getLens(b64) {
    var len = b64.length;
    if (len % 4 > 0) {
      throw new Error("Invalid string. Length must be a multiple of 4");
    }
    var validLen = b64.indexOf("=");
    if (validLen === -1) validLen = len;
    var placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;
    return [validLen, placeHoldersLen];
  }
  function _byteLength(_b64, validLen, placeHoldersLen) {
    return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
  }
  function toByteArray(b64) {
    var tmp;
    var lens = getLens(b64);
    var validLen = lens[0];
    var placeHoldersLen = lens[1];
    var arr2 = new Arr(_byteLength(b64, validLen, placeHoldersLen));
    var curByte = 0;
    var len = placeHoldersLen > 0 ? validLen - 4 : validLen;
    var i;
    for (i = 0; i < len; i += 4) {
      tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
      arr2[curByte++] = tmp >> 16 & 255;
      arr2[curByte++] = tmp >> 8 & 255;
      arr2[curByte++] = tmp & 255;
    }
    if (placeHoldersLen === 2) {
      tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
      arr2[curByte++] = tmp & 255;
    }
    if (placeHoldersLen === 1) {
      tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
      arr2[curByte++] = tmp >> 8 & 255;
      arr2[curByte++] = tmp & 255;
    }
    return arr2;
  }
  function tripletToBase64(num) {
    return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
  }
  function encodeChunk(uint8, start2, end) {
    var tmp;
    var output = [];
    for (var i = start2; i < end; i += 3) {
      tmp = (uint8[i] << 16 & 16711680) + (uint8[i + 1] << 8 & 65280) + (uint8[i + 2] & 255);
      output.push(tripletToBase64(tmp));
    }
    return output.join("");
  }
  function fromByteArray(uint8) {
    var tmp;
    var len = uint8.length;
    var extraBytes = len % 3;
    var parts = [];
    var maxChunkLength = 16383;
    for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
      parts.push(
        encodeChunk(
          uint8,
          i,
          i + maxChunkLength > len2 ? len2 : i + maxChunkLength
        )
      );
    }
    if (extraBytes === 1) {
      tmp = uint8[len - 1];
      parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "==");
    } else if (extraBytes === 2) {
      tmp = (uint8[len - 2] << 8) + uint8[len - 1];
      parts.push(
        lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "="
      );
    }
    return parts.join("");
  }

  // node_modules/convex/dist/esm/common/index.js
  function parseArgs(args) {
    if (args === void 0) {
      return {};
    }
    if (!isSimpleObject(args)) {
      throw new Error(
        `The arguments to a Convex function must be an object. Received: ${args}`
      );
    }
    return args;
  }
  function validateDeploymentUrl(deploymentUrl) {
    if (typeof deploymentUrl === "undefined") {
      throw new Error(
        `Client created with undefined deployment address. If you used an environment variable, check that it's set.`
      );
    }
    if (typeof deploymentUrl !== "string") {
      throw new Error(
        `Invalid deployment address: found ${deploymentUrl}".`
      );
    }
    if (!(deploymentUrl.startsWith("http:") || deploymentUrl.startsWith("https:"))) {
      throw new Error(
        `Invalid deployment address: Must start with "https://" or "http://". Found "${deploymentUrl}".`
      );
    }
    try {
      new URL(deploymentUrl);
    } catch {
      throw new Error(
        `Invalid deployment address: "${deploymentUrl}" is not a valid URL. If you believe this URL is correct, use the \`skipConvexDeploymentUrlCheck\` option to bypass this.`
      );
    }
    if (deploymentUrl.endsWith(".convex.site")) {
      throw new Error(
        `Invalid deployment address: "${deploymentUrl}" ends with .convex.site, which is used for HTTP Actions. Convex deployment URLs typically end with .convex.cloud? If you believe this URL is correct, use the \`skipConvexDeploymentUrlCheck\` option to bypass this.`
      );
    }
  }
  function isSimpleObject(value) {
    const isObject = typeof value === "object";
    const prototype = Object.getPrototypeOf(value);
    const isSimple = prototype === null || prototype === Object.prototype || // Objects generated from other contexts (e.g. across Node.js `vm` modules) will not satisfy the previous
    // conditions but are still simple objects.
    prototype?.constructor?.name === "Object";
    return isObject && isSimple;
  }

  // node_modules/convex/dist/esm/values/value.js
  var LITTLE_ENDIAN = true;
  var MIN_INT64 = BigInt("-9223372036854775808");
  var MAX_INT64 = BigInt("9223372036854775807");
  var ZERO = BigInt("0");
  var EIGHT = BigInt("8");
  var TWOFIFTYSIX = BigInt("256");
  var COMMIT_TS_UNRESOLVED = "This commit timestamp is unresolved: its value is assigned when the mutation commits. Read the document after the mutation completes to get its value.";
  var CommitTsPlaceholder = class {
    [Symbol.toPrimitive](hint) {
      if (hint === "string") {
        return this.toString();
      }
      throw new Error(COMMIT_TS_UNRESOLVED);
    }
    valueOf() {
      throw new Error(COMMIT_TS_UNRESOLVED);
    }
    toJSON() {
      throw new Error(COMMIT_TS_UNRESOLVED);
    }
    toString() {
      return "[unresolved commit timestamp]";
    }
  };
  var commitTsPlaceholder = new CommitTsPlaceholder();
  function isSpecial(n) {
    return Number.isNaN(n) || !Number.isFinite(n) || Object.is(n, -0);
  }
  function slowBigIntToBase64(value) {
    if (value < ZERO) {
      value -= MIN_INT64 + MIN_INT64;
    }
    let hex = value.toString(16);
    if (hex.length % 2 === 1) hex = "0" + hex;
    const bytes = new Uint8Array(new ArrayBuffer(8));
    let i = 0;
    for (const hexByte of hex.match(/.{2}/g).reverse()) {
      bytes.set([parseInt(hexByte, 16)], i++);
      value >>= EIGHT;
    }
    return fromByteArray(bytes);
  }
  function slowBase64ToBigInt(encoded) {
    const integerBytes = toByteArray(encoded);
    if (integerBytes.byteLength !== 8) {
      throw new Error(
        `Received ${integerBytes.byteLength} bytes, expected 8 for $integer`
      );
    }
    let value = ZERO;
    let power = ZERO;
    for (const byte of integerBytes) {
      value += BigInt(byte) * TWOFIFTYSIX ** power;
      power++;
    }
    if (value > MAX_INT64) {
      value += MIN_INT64 + MIN_INT64;
    }
    return value;
  }
  function modernBigIntToBase64(value) {
    if (value < MIN_INT64 || MAX_INT64 < value) {
      throw new Error(
        `BigInt ${value} does not fit into a 64-bit signed integer.`
      );
    }
    const buffer = new ArrayBuffer(8);
    new DataView(buffer).setBigInt64(0, value, true);
    return fromByteArray(new Uint8Array(buffer));
  }
  function modernBase64ToBigInt(encoded) {
    const integerBytes = toByteArray(encoded);
    if (integerBytes.byteLength !== 8) {
      throw new Error(
        `Received ${integerBytes.byteLength} bytes, expected 8 for $integer`
      );
    }
    const intBytesView = new DataView(integerBytes.buffer);
    return intBytesView.getBigInt64(0, true);
  }
  var bigIntToBase64 = DataView.prototype.setBigInt64 ? modernBigIntToBase64 : slowBigIntToBase64;
  var base64ToBigInt = DataView.prototype.getBigInt64 ? modernBase64ToBigInt : slowBase64ToBigInt;
  var MAX_IDENTIFIER_LEN = 1024;
  function validateObjectField(k) {
    if (k.length > MAX_IDENTIFIER_LEN) {
      throw new Error(
        `Field name ${k} exceeds maximum field name length ${MAX_IDENTIFIER_LEN}.`
      );
    }
    if (k.startsWith("$")) {
      throw new Error(`Field name ${k} starts with a '$', which is reserved.`);
    }
    for (let i = 0; i < k.length; i += 1) {
      const charCode = k.charCodeAt(i);
      if (charCode < 32 || charCode >= 127) {
        throw new Error(
          `Field name ${k} has invalid character '${k[i]}': Field names can only contain non-control ASCII characters`
        );
      }
    }
  }
  function jsonToConvex(value) {
    if (value === null) {
      return value;
    }
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "number") {
      return value;
    }
    if (typeof value === "string") {
      return value;
    }
    if (Array.isArray(value)) {
      return value.map((value2) => jsonToConvex(value2));
    }
    if (typeof value !== "object") {
      throw new Error(`Unexpected type of ${value}`);
    }
    const entries = Object.entries(value);
    if (entries.length === 1) {
      const key = entries[0][0];
      if (key === "$bytes") {
        if (typeof value.$bytes !== "string") {
          throw new Error(`Malformed $bytes field on ${value}`);
        }
        return toByteArray(value.$bytes).buffer;
      }
      if (key === "$integer") {
        if (typeof value.$integer !== "string") {
          throw new Error(`Malformed $integer field on ${value}`);
        }
        return base64ToBigInt(value.$integer);
      }
      if (key === "$float") {
        if (typeof value.$float !== "string") {
          throw new Error(`Malformed $float field on ${value}`);
        }
        const floatBytes = toByteArray(value.$float);
        if (floatBytes.byteLength !== 8) {
          throw new Error(
            `Received ${floatBytes.byteLength} bytes, expected 8 for $float`
          );
        }
        const floatBytesView = new DataView(floatBytes.buffer);
        const float = floatBytesView.getFloat64(0, LITTLE_ENDIAN);
        if (!isSpecial(float)) {
          throw new Error(`Float ${float} should be encoded as a number`);
        }
        return float;
      }
      if (key === "$commitTs") {
        if (value.$commitTs !== null) {
          throw new Error(`Malformed $commitTs field on ${value}`);
        }
        return commitTsPlaceholder;
      }
      if (key === "$set") {
        throw new Error(
          `Received a Set which is no longer supported as a Convex type.`
        );
      }
      if (key === "$map") {
        throw new Error(
          `Received a Map which is no longer supported as a Convex type.`
        );
      }
    }
    const out = {};
    for (const [k, v2] of Object.entries(value)) {
      validateObjectField(k);
      out[k] = jsonToConvex(v2);
    }
    return out;
  }
  var MAX_VALUE_FOR_ERROR_LEN = 16384;
  function stringifyValueForError(value) {
    const str = JSON.stringify(value, (_key, value2) => {
      if (value2 === void 0) {
        return "undefined";
      }
      if (typeof value2 === "bigint") {
        return `${value2.toString()}n`;
      }
      return value2;
    });
    if (str.length > MAX_VALUE_FOR_ERROR_LEN) {
      const rest = "[...truncated]";
      let truncateAt = MAX_VALUE_FOR_ERROR_LEN - rest.length;
      const codePoint = str.codePointAt(truncateAt - 1);
      if (codePoint !== void 0 && codePoint > 65535) {
        truncateAt -= 1;
      }
      return str.substring(0, truncateAt) + rest;
    }
    return str;
  }
  function convexToJsonInternal(value, originalValue, context, includeTopLevelUndefined) {
    if (value === void 0) {
      const contextText = context && ` (present at path ${context} in original object ${stringifyValueForError(
        originalValue
      )})`;
      throw new Error(
        `undefined is not a valid Convex value${contextText}. To learn about Convex's supported types, see https://docs.convex.dev/using/types.`
      );
    }
    if (value === null) {
      return value;
    }
    if (typeof value === "bigint") {
      if (value < MIN_INT64 || MAX_INT64 < value) {
        throw new Error(
          `BigInt ${value} does not fit into a 64-bit signed integer.`
        );
      }
      return { $integer: bigIntToBase64(value) };
    }
    if (typeof value === "number") {
      if (isSpecial(value)) {
        const buffer = new ArrayBuffer(8);
        new DataView(buffer).setFloat64(0, value, LITTLE_ENDIAN);
        return { $float: fromByteArray(new Uint8Array(buffer)) };
      } else {
        return value;
      }
    }
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "string") {
      return value;
    }
    if (value instanceof ArrayBuffer) {
      return { $bytes: fromByteArray(new Uint8Array(value)) };
    }
    if (value instanceof CommitTsPlaceholder) {
      return { $commitTs: null };
    }
    if (Array.isArray(value)) {
      return value.map(
        (value2, i) => convexToJsonInternal(value2, originalValue, context + `[${i}]`, false)
      );
    }
    if (value instanceof Set) {
      throw new Error(
        errorMessageForUnsupportedType(context, "Set", [...value], originalValue)
      );
    }
    if (value instanceof Map) {
      throw new Error(
        errorMessageForUnsupportedType(context, "Map", [...value], originalValue)
      );
    }
    if (!isSimpleObject(value)) {
      const theType = value?.constructor?.name;
      const typeName = theType ? `${theType} ` : "";
      throw new Error(
        errorMessageForUnsupportedType(context, typeName, value, originalValue)
      );
    }
    const out = {};
    const entries = Object.entries(value);
    entries.sort(([k1, _v1], [k2, _v2]) => k1 === k2 ? 0 : k1 < k2 ? -1 : 1);
    for (const [k, v2] of entries) {
      if (v2 !== void 0) {
        validateObjectField(k);
        out[k] = convexToJsonInternal(v2, originalValue, context + `.${k}`, false);
      } else if (includeTopLevelUndefined) {
        validateObjectField(k);
        out[k] = convexOrUndefinedToJsonInternal(
          v2,
          originalValue,
          context + `.${k}`
        );
      }
    }
    return out;
  }
  function errorMessageForUnsupportedType(context, typeName, value, originalValue) {
    if (context) {
      return `${typeName}${stringifyValueForError(
        value
      )} is not a supported Convex type (present at path ${context} in original object ${stringifyValueForError(
        originalValue
      )}). To learn about Convex's supported types, see https://docs.convex.dev/using/types.`;
    } else {
      return `${typeName}${stringifyValueForError(
        value
      )} is not a supported Convex type.`;
    }
  }
  function convexOrUndefinedToJsonInternal(value, originalValue, context) {
    if (value === void 0) {
      return { $undefined: null };
    } else {
      if (originalValue === void 0) {
        throw new Error(
          `Programming error. Current value is ${stringifyValueForError(
            value
          )} but original value is undefined`
        );
      }
      return convexToJsonInternal(value, originalValue, context, false);
    }
  }
  function convexToJson(value) {
    return convexToJsonInternal(value, value, "", false);
  }

  // node_modules/convex/dist/esm/values/validators.js
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  var UNDEFINED_VALIDATOR_ERROR_URL = "https://docs.convex.dev/error#undefined-validator";
  function throwUndefinedValidatorError(context, fieldName) {
    const fieldInfo = fieldName !== void 0 ? ` for field "${fieldName}"` : "";
    throw new Error(
      `A validator is undefined${fieldInfo} in ${context}. This is often caused by circular imports. See ${UNDEFINED_VALIDATOR_ERROR_URL} for details.`
    );
  }
  var BaseValidator = class {
    constructor({ isOptional }) {
      __publicField(this, "type");
      __publicField(this, "fieldPaths");
      __publicField(this, "isOptional");
      __publicField(this, "isConvexValidator");
      this.isOptional = isOptional;
      this.isConvexValidator = true;
    }
  };
  var VId = class _VId extends BaseValidator {
    /**
     * Usually you'd use `v.id(tableName)` instead.
     */
    constructor({
      isOptional,
      tableName
    }) {
      super({ isOptional });
      __publicField(this, "tableName");
      __publicField(this, "kind", "id");
      if (typeof tableName !== "string") {
        throw new Error("v.id(tableName) requires a string");
      }
      this.tableName = tableName;
    }
    /** @internal */
    get json() {
      return { type: "id", tableName: this.tableName };
    }
    /** Allow this field to be validated as absent. */
    optional() {
      return new _VId({
        isOptional: "optional",
        tableName: this.tableName
      });
    }
    /** @internal */
    asOptional() {
      return this.optional();
    }
  };
  var VFloat64 = class _VFloat64 extends BaseValidator {
    constructor() {
      super(...arguments);
      __publicField(this, "kind", "float64");
    }
    /** @internal */
    get json() {
      return { type: "number" };
    }
    /** Allow this field to be validated as absent. */
    optional() {
      return new _VFloat64({
        isOptional: "optional"
      });
    }
    /** @internal */
    asOptional() {
      return this.optional();
    }
  };
  var VInt64 = class _VInt64 extends BaseValidator {
    constructor() {
      super(...arguments);
      __publicField(this, "kind", "int64");
    }
    /** @internal */
    get json() {
      return { type: "bigint" };
    }
    /** Allow this validated field to be absent. */
    optional() {
      return new _VInt64({ isOptional: "optional" });
    }
    /** @internal */
    asOptional() {
      return this.optional();
    }
  };
  var VCommitTs = class _VCommitTs extends BaseValidator {
    constructor() {
      super(...arguments);
      __publicField(this, "kind", "commitTs");
    }
    /** @internal */
    get json() {
      return { type: this.kind };
    }
    /** Allow this validated field to be absent. */
    optional() {
      return new _VCommitTs({
        isOptional: "optional"
      });
    }
    /** @internal */
    asOptional() {
      return this.optional();
    }
  };
  var VBoolean = class _VBoolean extends BaseValidator {
    constructor() {
      super(...arguments);
      __publicField(this, "kind", "boolean");
    }
    /** @internal */
    get json() {
      return { type: this.kind };
    }
    /** Allow this validated field to be absent. */
    optional() {
      return new _VBoolean({
        isOptional: "optional"
      });
    }
    /** @internal */
    asOptional() {
      return this.optional();
    }
  };
  var VBytes = class _VBytes extends BaseValidator {
    constructor() {
      super(...arguments);
      __publicField(this, "kind", "bytes");
    }
    /** @internal */
    get json() {
      return { type: this.kind };
    }
    /** Allow this validated field to be absent. */
    optional() {
      return new _VBytes({ isOptional: "optional" });
    }
    /** @internal */
    asOptional() {
      return this.optional();
    }
  };
  var VString = class _VString extends BaseValidator {
    constructor() {
      super(...arguments);
      __publicField(this, "kind", "string");
    }
    /** @internal */
    get json() {
      return { type: this.kind };
    }
    /** Allow this validated field to be absent. */
    optional() {
      return new _VString({
        isOptional: "optional"
      });
    }
    /** @internal */
    asOptional() {
      return this.optional();
    }
  };
  var VNull = class _VNull extends BaseValidator {
    constructor() {
      super(...arguments);
      __publicField(this, "kind", "null");
    }
    /** @internal */
    get json() {
      return { type: this.kind };
    }
    /** Allow this validated field to be absent. */
    optional() {
      return new _VNull({ isOptional: "optional" });
    }
    /** @internal */
    asOptional() {
      return this.optional();
    }
  };
  var VAny = class _VAny extends BaseValidator {
    constructor() {
      super(...arguments);
      __publicField(this, "kind", "any");
    }
    /** @internal */
    get json() {
      return {
        type: this.kind
      };
    }
    /** Allow this validated field to be absent. */
    optional() {
      return new _VAny({
        isOptional: "optional"
      });
    }
    /** @internal */
    asOptional() {
      return this.optional();
    }
  };
  var VObject = class _VObject extends BaseValidator {
    /**
     * Usually you'd use `v.object({ ... })` instead.
     */
    constructor({
      isOptional,
      fields
    }) {
      super({ isOptional });
      __publicField(this, "fields");
      __publicField(this, "kind", "object");
      globalThis.Object.entries(fields).forEach(([fieldName, validator]) => {
        if (validator === void 0) {
          throwUndefinedValidatorError("v.object()", fieldName);
        }
        if (!validator.isConvexValidator) {
          throw new Error("v.object() entries must be validators");
        }
      });
      this.fields = fields;
    }
    /** @internal */
    get json() {
      return {
        type: this.kind,
        value: globalThis.Object.fromEntries(
          globalThis.Object.entries(this.fields).map(([k, v2]) => [
            k,
            {
              fieldType: v2.json,
              optional: v2.isOptional === "optional" ? true : false
            }
          ])
        )
      };
    }
    /** Allow this validated field to be absent. */
    optional() {
      return new _VObject({
        isOptional: "optional",
        fields: this.fields
      });
    }
    /** @internal */
    asOptional() {
      return this.optional();
    }
    /**
     * Create a new VObject with the specified fields omitted.
     * @param fields The field names to omit from this VObject.
     */
    omit(...fields) {
      const newFields = { ...this.fields };
      for (const field of fields) {
        delete newFields[field];
      }
      return new _VObject({
        isOptional: this.isOptional,
        fields: newFields
      });
    }
    /**
     * Create a new VObject with only the specified fields.
     * @param fields The field names to pick from this VObject.
     */
    pick(...fields) {
      const newFields = {};
      for (const field of fields) {
        newFields[field] = this.fields[field];
      }
      return new _VObject({
        isOptional: this.isOptional,
        fields: newFields
      });
    }
    /**
     * Create a new VObject with all fields marked as optional.
     */
    partial() {
      const newFields = {};
      for (const [key, validator] of globalThis.Object.entries(this.fields)) {
        newFields[key] = validator.asOptional();
      }
      return new _VObject({
        isOptional: this.isOptional,
        fields: newFields
      });
    }
    /**
     * Create a new VObject with additional fields merged in.
     * @param fields An object with additional validators to merge into this VObject.
     */
    extend(fields) {
      return new _VObject({
        isOptional: this.isOptional,
        fields: { ...this.fields, ...fields }
      });
    }
  };
  var VLiteral = class _VLiteral extends BaseValidator {
    /**
     * Usually you'd use `v.literal(value)` instead.
     */
    constructor({ isOptional, value }) {
      super({ isOptional });
      __publicField(this, "value");
      __publicField(this, "kind", "literal");
      if (typeof value !== "string" && typeof value !== "boolean" && typeof value !== "number" && typeof value !== "bigint") {
        throw new Error("v.literal(value) must be a string, number, or boolean");
      }
      this.value = value;
    }
    /** @internal */
    get json() {
      return {
        type: this.kind,
        value: convexToJson(this.value)
      };
    }
    /** Allow this validated field to be absent. */
    optional() {
      return new _VLiteral({
        isOptional: "optional",
        value: this.value
      });
    }
    /** @internal */
    asOptional() {
      return this.optional();
    }
  };
  var VArray = class _VArray extends BaseValidator {
    /**
     * Usually you'd use `v.array(element)` instead.
     */
    constructor({
      isOptional,
      element
    }) {
      super({ isOptional });
      __publicField(this, "element");
      __publicField(this, "kind", "array");
      if (element === void 0) {
        throwUndefinedValidatorError("v.array()");
      }
      this.element = element;
    }
    /** @internal */
    get json() {
      return {
        type: this.kind,
        value: this.element.json
      };
    }
    /** Allow this validated field to be absent. */
    optional() {
      return new _VArray({
        isOptional: "optional",
        element: this.element
      });
    }
    /** @internal */
    asOptional() {
      return this.optional();
    }
  };
  var VRecord = class _VRecord extends BaseValidator {
    /**
     * Usually you'd use `v.record(key, value)` instead.
     */
    constructor({
      isOptional,
      key,
      value
    }) {
      super({ isOptional });
      __publicField(this, "key");
      __publicField(this, "value");
      __publicField(this, "kind", "record");
      if (key === void 0) {
        throwUndefinedValidatorError("v.record()", "key");
      }
      if (value === void 0) {
        throwUndefinedValidatorError("v.record()", "value");
      }
      if (key.isOptional === "optional") {
        throw new Error("Record validator cannot have optional keys");
      }
      if (value.isOptional === "optional") {
        throw new Error("Record validator cannot have optional values");
      }
      if (!key.isConvexValidator || !value.isConvexValidator) {
        throw new Error("Key and value of v.record() but be validators");
      }
      this.key = key;
      this.value = value;
    }
    /** @internal */
    get json() {
      return {
        type: this.kind,
        // This cast is needed because TypeScript thinks the key type is too wide
        keys: this.key.json,
        values: {
          fieldType: this.value.json,
          optional: false
        }
      };
    }
    /** Allow this validated field to be absent. */
    optional() {
      return new _VRecord({
        isOptional: "optional",
        key: this.key,
        value: this.value
      });
    }
    /** @internal */
    asOptional() {
      return this.optional();
    }
  };
  var VUnion = class _VUnion extends BaseValidator {
    /**
     * Usually you'd use `v.union(...members)` instead.
     */
    constructor({ isOptional, members }) {
      super({ isOptional });
      __publicField(this, "members");
      __publicField(this, "kind", "union");
      members.forEach((member, index) => {
        if (member === void 0) {
          throwUndefinedValidatorError("v.union()", `member at index ${index}`);
        }
        if (!member.isConvexValidator) {
          throw new Error("All members of v.union() must be validators");
        }
      });
      this.members = members;
    }
    /** @internal */
    get json() {
      return {
        type: this.kind,
        value: this.members.map((v2) => v2.json)
      };
    }
    /** Allow this validated field to be absent. */
    optional() {
      return new _VUnion({
        isOptional: "optional",
        members: this.members
      });
    }
    /** @internal */
    asOptional() {
      return this.optional();
    }
  };

  // node_modules/convex/dist/esm/values/validator.js
  function isValidator(v2) {
    return v2?.isConvexValidator === true;
  }
  var v = {
    /**
     * Validates that the value is a document ID for the given table.
     *
     * IDs are strings at runtime but are typed as `Id<"tableName">` in
     * TypeScript for type safety.
     *
     * @example
     * ```typescript
     * args: { userId: v.id("users") }
     * ```
     *
     * @param tableName The name of the table.
     */
    id: (tableName) => {
      return new VId({
        isOptional: "required",
        tableName
      });
    },
    /**
     * Validates that the value is `null`.
     *
     * Use `returns: v.null()` for functions that don't return a meaningful value.
     * JavaScript `undefined` is not a valid Convex value, it is automatically
     * converted to `null`.
     */
    null: () => {
      return new VNull({ isOptional: "required" });
    },
    /**
     * Validates that the value is a JavaScript `number` (Convex Float64).
     *
     * Supports all IEEE-754 double-precision floating point numbers including
     * NaN and Infinity.
     *
     * Alias for `v.float64()`.
     */
    number: () => {
      return new VFloat64({ isOptional: "required" });
    },
    /**
     * Validates that the value is a JavaScript `number` (Convex Float64).
     *
     * Supports all IEEE-754 double-precision floating point numbers.
     */
    float64: () => {
      return new VFloat64({ isOptional: "required" });
    },
    /**
     * @deprecated Use `v.int64()` instead.
     */
    bigint: () => {
      return new VInt64({ isOptional: "required" });
    },
    /**
     * Validates that the value is a JavaScript `bigint` (Convex Int64).
     *
     * Supports BigInts between -2^63 and 2^63-1.
     *
     * @example
     * ```typescript
     * args: { timestamp: v.int64() }
     * // Usage: createDoc({ timestamp: 1234567890n })
     * ```
     */
    int64: () => {
      return new VInt64({ isOptional: "required" });
    },
    /**
     * Validates that the value is a commit timestamp: an int64 (`bigint`)
     * assigned from the transaction's commit timestamp.
     *
     * An index on a field with this validator orders documents by commit order.
     * Accepts any int64 value; write `db.vars.commitTs` to have the field
     * resolve to the commit timestamp when the mutation commits.
     */
    commitTs: () => {
      return new VCommitTs({ isOptional: "required" });
    },
    /**
     * Validates that the value is a `boolean`.
     */
    boolean: () => {
      return new VBoolean({ isOptional: "required" });
    },
    /**
     * Validates that the value is a `string`.
     *
     * Strings are stored as UTF-8 and their storage size is calculated as their
     * UTF-8 encoded size.
     */
    string: () => {
      return new VString({ isOptional: "required" });
    },
    /**
     * Validates that the value is an `ArrayBuffer` (Convex Bytes).
     *
     * Use for binary data.
     */
    bytes: () => {
      return new VBytes({ isOptional: "required" });
    },
    /**
     * Validates that the value is exactly equal to the given literal.
     *
     * Useful for discriminated unions and enum-like patterns.
     *
     * @example
     * ```typescript
     * // Discriminated union pattern:
     * v.union(
     *   v.object({ kind: v.literal("error"), message: v.string() }),
     *   v.object({ kind: v.literal("success"), value: v.number() }),
     * )
     * ```
     *
     * @param literal The literal value to compare against.
     */
    literal: (literal) => {
      return new VLiteral({ isOptional: "required", value: literal });
    },
    /**
     * Validates that the value is an `Array` where every element matches the
     * given validator.
     *
     * Arrays can have at most 8192 elements.
     *
     * @example
     * ```typescript
     * args: { tags: v.array(v.string()) }
     * args: { coordinates: v.array(v.number()) }
     * args: { items: v.array(v.object({ name: v.string(), qty: v.number() })) }
     * ```
     *
     * @param element The validator for the elements of the array.
     */
    array: (element) => {
      return new VArray({ isOptional: "required", element });
    },
    /**
     * Validates that the value is an `Object` with the specified properties.
     *
     * Objects can have at most 1024 entries. Field names must be non-empty and
     * must not start with `"$"` or `"_"` (`_` is reserved for system fields
     * like `_id` and `_creationTime`; `$` is reserved for Convex internal use).
     *
     * @example
     * ```typescript
     * args: {
     *   user: v.object({
     *     name: v.string(),
     *     email: v.string(),
     *     age: v.optional(v.number()),
     *   })
     * }
     * ```
     *
     * @param fields An object mapping property names to their validators.
     */
    object: (fields) => {
      return new VObject({ isOptional: "required", fields });
    },
    /**
     * Validates that the value is a `Record` (object with dynamic keys).
     *
     * Records are objects at runtime but allow dynamic keys, unlike `v.object()`
     * which requires known property names. Keys must be ASCII characters only,
     * non-empty, and not start with `"$"` or `"_"`.
     *
     * @example
     * ```typescript
     * // Map of user IDs to scores:
     * args: { scores: v.record(v.id("users"), v.number()) }
     *
     * // Map of string keys to string values:
     * args: { metadata: v.record(v.string(), v.string()) }
     * ```
     *
     * @param keys The validator for the keys of the record.
     * @param values The validator for the values of the record.
     */
    record: (keys, values) => {
      return new VRecord({
        isOptional: "required",
        key: keys,
        value: values
      });
    },
    /**
     * Validates that the value matches at least one of the given validators.
     *
     * @example
     * ```typescript
     * // Allow string or number:
     * args: { value: v.union(v.string(), v.number()) }
     *
     * // Discriminated union (recommended pattern):
     * v.union(
     *   v.object({ kind: v.literal("text"), body: v.string() }),
     *   v.object({ kind: v.literal("image"), url: v.string() }),
     * )
     *
     * // Nullable value:
     * returns: v.union(v.object({ ... }), v.null())
     * ```
     *
     * @param members The validators to match against.
     */
    union: (...members) => {
      return new VUnion({
        isOptional: "required",
        members
      });
    },
    /**
     * A validator that accepts any Convex value without validation.
     *
     * Prefer using specific validators when possible for better type safety
     * and runtime validation.
     */
    any: () => {
      return new VAny({ isOptional: "required" });
    },
    /**
     * Makes a property optional in an object validator.
     *
     * An optional property can be omitted entirely when creating a document or
     * calling a function. This is different from `v.nullable()` which requires
     * the property to be present but allows `null`.
     *
     * @example
     * ```typescript
     * v.object({
     *   name: v.string(),              // required
     *   nickname: v.optional(v.string()), // can be omitted
     * })
     *
     * // Valid: { name: "Alice" }
     * // Valid: { name: "Alice", nickname: "Ali" }
     * // Invalid: { name: "Alice", nickname: null }  - use v.nullable() for this
     * ```
     *
     * @param value The property value validator to make optional.
     */
    optional: (value) => {
      return value.asOptional();
    },
    /**
     * Allows a value to be either the given type or `null`.
     *
     * This is shorthand for `v.union(value, v.null())`. Unlike `v.optional()`,
     * the property must still be present, but may be `null`.
     *
     * @example
     * ```typescript
     * v.object({
     *   name: v.string(),
     *   deletedAt: v.nullable(v.number()), // must be present, can be null
     * })
     *
     * // Valid: { name: "Alice", deletedAt: null }
     * // Valid: { name: "Alice", deletedAt: 1234567890 }
     * // Invalid: { name: "Alice" }  - deletedAt is required
     * ```
     */
    nullable: (value) => {
      return v.union(value, v.null());
    }
  };

  // node_modules/convex/dist/esm/values/errors.js
  var __defProp2 = Object.defineProperty;
  var __defNormalProp2 = (obj, key, value) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField2 = (obj, key, value) => __defNormalProp2(obj, typeof key !== "symbol" ? key + "" : key, value);
  var _a;
  var _b;
  var IDENTIFYING_FIELD = Symbol.for("ConvexError");
  var ConvexError = class extends (_b = Error, _a = IDENTIFYING_FIELD, _b) {
    constructor(data) {
      super(typeof data === "string" ? data : stringifyValueForError(data));
      __publicField2(this, "name", "ConvexError");
      __publicField2(this, "data");
      __publicField2(this, _a, true);
      this.data = data;
    }
  };

  // node_modules/convex/dist/esm/values/compare_utf8.js
  var arr = () => Array.from({ length: 4 }, () => 0);
  var aBytes = arr();
  var bBytes = arr();

  // node_modules/convex/dist/esm/browser/logging.js
  var __defProp3 = Object.defineProperty;
  var __defNormalProp3 = (obj, key, value) => key in obj ? __defProp3(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField3 = (obj, key, value) => __defNormalProp3(obj, typeof key !== "symbol" ? key + "" : key, value);
  var INFO_COLOR = "color:rgb(0, 145, 255)";
  function prefix_for_source(source) {
    switch (source) {
      case "query":
        return "Q";
      case "mutation":
        return "M";
      case "action":
        return "A";
      case "any":
        return "?";
    }
  }
  var DefaultLogger = class {
    constructor(options) {
      __publicField3(this, "_onLogLineFuncs");
      __publicField3(this, "_verbose");
      this._onLogLineFuncs = {};
      this._verbose = options.verbose;
    }
    addLogLineListener(func) {
      let id = Math.random().toString(36).substring(2, 15);
      for (let i = 0; i < 10; i++) {
        if (this._onLogLineFuncs[id] === void 0) {
          break;
        }
        id = Math.random().toString(36).substring(2, 15);
      }
      this._onLogLineFuncs[id] = func;
      return () => {
        delete this._onLogLineFuncs[id];
      };
    }
    logVerbose(...args) {
      if (this._verbose) {
        for (const func of Object.values(this._onLogLineFuncs)) {
          func("debug", `${(/* @__PURE__ */ new Date()).toISOString()}`, ...args);
        }
      }
    }
    log(...args) {
      for (const func of Object.values(this._onLogLineFuncs)) {
        func("info", ...args);
      }
    }
    warn(...args) {
      for (const func of Object.values(this._onLogLineFuncs)) {
        func("warn", ...args);
      }
    }
    error(...args) {
      for (const func of Object.values(this._onLogLineFuncs)) {
        func("error", ...args);
      }
    }
  };
  function instantiateDefaultLogger(options) {
    const logger = new DefaultLogger(options);
    logger.addLogLineListener((level, ...args) => {
      switch (level) {
        case "debug":
          console.debug(...args);
          break;
        case "info":
          console.log(...args);
          break;
        case "warn":
          console.warn(...args);
          break;
        case "error":
          console.error(...args);
          break;
        default: {
          level;
          console.log(...args);
        }
      }
    });
    return logger;
  }
  function instantiateNoopLogger(options) {
    return new DefaultLogger(options);
  }
  function logForFunction(logger, type, source, udfPath, message) {
    const prefix = prefix_for_source(source);
    if (typeof message === "object") {
      message = `ConvexError ${JSON.stringify(message.errorData, null, 2)}`;
    }
    if (type === "info") {
      const match = message.match(/^\[.*?\] /);
      if (match === null) {
        logger.error(
          `[CONVEX ${prefix}(${udfPath})] Could not parse console.log`
        );
        return;
      }
      const level = message.slice(1, match[0].length - 2);
      const args = message.slice(match[0].length);
      logger.log(`%c[CONVEX ${prefix}(${udfPath})] [${level}]`, INFO_COLOR, args);
    } else {
      logger.error(`[CONVEX ${prefix}(${udfPath})] ${message}`);
    }
  }

  // node_modules/convex/dist/esm/server/functionName.js
  var functionName = Symbol.for("functionName");

  // node_modules/convex/dist/esm/server/components/paths.js
  var toReferencePath = Symbol.for("toReferencePath");
  function extractReferencePath(reference) {
    return reference[toReferencePath] ?? null;
  }
  function isFunctionHandle(s) {
    return s.startsWith("function://");
  }
  function getFunctionAddress(functionReference) {
    let functionAddress;
    if (typeof functionReference === "string") {
      if (isFunctionHandle(functionReference)) {
        functionAddress = { functionHandle: functionReference };
      } else {
        functionAddress = { name: functionReference };
      }
    } else if (functionReference[functionName]) {
      functionAddress = { name: functionReference[functionName] };
    } else {
      const referencePath = extractReferencePath(functionReference);
      if (!referencePath) {
        throw new Error(`${functionReference} is not a functionReference`);
      }
      functionAddress = { reference: referencePath };
    }
    return functionAddress;
  }

  // node_modules/convex/dist/esm/server/api.js
  function getFunctionName(functionReference) {
    const address = getFunctionAddress(functionReference);
    if (address.name === void 0) {
      if (address.functionHandle !== void 0) {
        throw new Error(
          `Expected function reference like "api.file.func" or "internal.file.func", but received function handle ${address.functionHandle}`
        );
      } else if (address.reference !== void 0) {
        throw new Error(
          `Expected function reference in the current component like "api.file.func" or "internal.file.func", but received reference ${address.reference}`
        );
      }
      throw new Error(
        `Expected function reference like "api.file.func" or "internal.file.func", but received ${JSON.stringify(address)}`
      );
    }
    if (typeof functionReference === "string") return functionReference;
    const name = functionReference[functionName];
    if (!name) {
      throw new Error(`${functionReference} is not a functionReference`);
    }
    return name;
  }
  function makeFunctionReference(name) {
    return { [functionName]: name };
  }
  function createApi(pathParts = []) {
    const handler = {
      get(_, prop) {
        if (typeof prop === "string") {
          const newParts = [...pathParts, prop];
          return createApi(newParts);
        } else if (prop === functionName) {
          if (pathParts.length < 2) {
            const found = ["api", ...pathParts].join(".");
            throw new Error(
              `API path is expected to be of the form \`api.moduleName.functionName\`. Found: \`${found}\``
            );
          }
          const path = pathParts.slice(0, -1).join("/");
          const exportName = pathParts[pathParts.length - 1];
          if (exportName === "default") {
            return path;
          } else {
            return path + ":" + exportName;
          }
        } else if (prop === Symbol.toStringTag) {
          return "FunctionReference";
        } else {
          return void 0;
        }
      }
    };
    return new Proxy({}, handler);
  }
  var anyApi = createApi();

  // node_modules/convex/dist/esm/vendor/long.js
  var __defProp4 = Object.defineProperty;
  var __defNormalProp4 = (obj, key, value) => key in obj ? __defProp4(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField4 = (obj, key, value) => __defNormalProp4(obj, typeof key !== "symbol" ? key + "" : key, value);
  var Long = class _Long {
    constructor(low, high) {
      __publicField4(this, "low");
      __publicField4(this, "high");
      __publicField4(this, "__isUnsignedLong__");
      this.low = low | 0;
      this.high = high | 0;
      this.__isUnsignedLong__ = true;
    }
    static isLong(obj) {
      return (obj && obj.__isUnsignedLong__) === true;
    }
    // prettier-ignore
    static fromBytesLE(bytes) {
      return new _Long(
        bytes[0] | bytes[1] << 8 | bytes[2] << 16 | bytes[3] << 24,
        bytes[4] | bytes[5] << 8 | bytes[6] << 16 | bytes[7] << 24
      );
    }
    // prettier-ignore
    toBytesLE() {
      const hi = this.high;
      const lo = this.low;
      return [
        lo & 255,
        lo >>> 8 & 255,
        lo >>> 16 & 255,
        lo >>> 24,
        hi & 255,
        hi >>> 8 & 255,
        hi >>> 16 & 255,
        hi >>> 24
      ];
    }
    static fromNumber(value) {
      if (isNaN(value)) return UZERO;
      if (value < 0) return UZERO;
      if (value >= TWO_PWR_64_DBL) return MAX_UNSIGNED_VALUE;
      return new _Long(value % TWO_PWR_32_DBL | 0, value / TWO_PWR_32_DBL | 0);
    }
    toString() {
      return (BigInt(this.high) * BigInt(TWO_PWR_32_DBL) + BigInt(this.low)).toString();
    }
    equals(other) {
      if (!_Long.isLong(other)) other = _Long.fromValue(other);
      if (this.high >>> 31 === 1 && other.high >>> 31 === 1) return false;
      return this.high === other.high && this.low === other.low;
    }
    notEquals(other) {
      return !this.equals(other);
    }
    comp(other) {
      if (!_Long.isLong(other)) other = _Long.fromValue(other);
      if (this.equals(other)) return 0;
      return other.high >>> 0 > this.high >>> 0 || other.high === this.high && other.low >>> 0 > this.low >>> 0 ? -1 : 1;
    }
    lessThanOrEqual(other) {
      return this.comp(
        /* validates */
        other
      ) <= 0;
    }
    static fromValue(val) {
      if (typeof val === "number") return _Long.fromNumber(val);
      return new _Long(val.low, val.high);
    }
  };
  var UZERO = new Long(0, 0);
  var TWO_PWR_16_DBL = 1 << 16;
  var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;
  var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;
  var MAX_UNSIGNED_VALUE = new Long(4294967295 | 0, 4294967295 | 0);

  // node_modules/convex/dist/esm/vendor/jwt-decode/index.js
  var InvalidTokenError = class extends Error {
  };
  InvalidTokenError.prototype.name = "InvalidTokenError";

  // node_modules/convex/dist/esm/browser/sync/authentication_manager.js
  var MAXIMUM_REFRESH_DELAY = 20 * 24 * 60 * 60 * 1e3;

  // node_modules/convex/dist/esm/browser/http_client.js
  var __defProp5 = Object.defineProperty;
  var __defNormalProp5 = (obj, key, value) => key in obj ? __defProp5(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField5 = (obj, key, value) => __defNormalProp5(obj, typeof key !== "symbol" ? key + "" : key, value);
  var STATUS_CODE_UDF_FAILED = 560;
  var specifiedFetch = void 0;
  var ConvexHttpClient = class {
    /**
     * Create a new {@link ConvexHttpClient}.
     *
     * @param address - The url of your Convex deployment, often provided
     * by an environment variable. E.g. `https://small-mouse-123.convex.cloud`.
     * @param options - An object of options.
     * - `skipConvexDeploymentUrlCheck` - Skip validating that the Convex deployment URL looks like
     * `https://happy-animal-123.convex.cloud` or localhost. This can be useful if running a self-hosted
     * Convex backend that uses a different URL.
     * - `logger` - A logger or a boolean. If not provided, logs to the console.
     * You can construct your own logger to customize logging to log elsewhere
     * or not log at all, or use `false` as a shorthand for a no-op logger.
     * A logger is an object with 4 methods: log(), warn(), error(), and logVerbose().
     * These methods can receive multiple arguments of any types, like console.log().
     * - `auth` - A JWT containing identity claims accessible in Convex functions.
     * This identity may expire so it may be necessary to call `setAuth()` later,
     * but for short-lived clients it's convenient to specify this value here.
     * - `fetch` - A custom fetch implementation to use for all HTTP requests made by this client.
     */
    constructor(address, options) {
      __publicField5(this, "address");
      __publicField5(this, "auth");
      __publicField5(this, "adminAuth");
      __publicField5(this, "encodedTsPromise");
      __publicField5(this, "debug");
      __publicField5(this, "fetchOptions");
      __publicField5(this, "fetch");
      __publicField5(this, "logger");
      __publicField5(this, "mutationQueue", []);
      __publicField5(this, "isProcessingQueue", false);
      if (typeof options === "boolean") {
        throw new Error(
          "skipConvexDeploymentUrlCheck as the second argument is no longer supported. Please pass an options object, `{ skipConvexDeploymentUrlCheck: true }`."
        );
      }
      const opts = options ?? {};
      if (opts.skipConvexDeploymentUrlCheck !== true) {
        validateDeploymentUrl(address);
      }
      this.logger = options?.logger === false ? instantiateNoopLogger({ verbose: false }) : options?.logger !== true && options?.logger ? options.logger : instantiateDefaultLogger({ verbose: false });
      this.address = address;
      this.debug = true;
      this.auth = void 0;
      this.adminAuth = void 0;
      this.fetch = options?.fetch;
      if (options?.auth) {
        this.setAuth(options.auth);
      }
    }
    /**
     * Obtain the {@link ConvexHttpClient}'s URL to its backend.
     * @deprecated Use url, which returns the url without /api at the end.
     *
     * @returns The URL to the Convex backend, including the client's API version.
     */
    backendUrl() {
      return `${this.address}/api`;
    }
    /**
     * Return the address for this client, useful for creating a new client.
     *
     * Not guaranteed to match the address with which this client was constructed:
     * it may be canonicalized.
     */
    get url() {
      return this.address;
    }
    /**
     * Set the authentication token to be used for subsequent queries and mutations.
     *
     * Should be called whenever the token changes (i.e. due to expiration and refresh).
     *
     * @param value - JWT-encoded OpenID Connect identity token.
     */
    setAuth(value) {
      this.clearAuth();
      this.auth = value;
    }
    /**
     * Set admin auth token to allow calling internal queries, mutations, and actions
     * and acting as an identity.
     *
     * @internal
     */
    setAdminAuth(token, actingAsIdentity) {
      this.clearAuth();
      if (actingAsIdentity !== void 0) {
        const bytes = new TextEncoder().encode(JSON.stringify(actingAsIdentity));
        const actingAsIdentityEncoded = btoa(String.fromCodePoint(...bytes));
        this.adminAuth = `${token}:${actingAsIdentityEncoded}`;
      } else {
        this.adminAuth = token;
      }
    }
    /**
     * Clear the current authentication token if set.
     */
    clearAuth() {
      this.auth = void 0;
      this.adminAuth = void 0;
    }
    /**
     * Sets whether the result log lines should be printed on the console or not.
     *
     * @internal
     */
    setDebug(debug) {
      this.debug = debug;
    }
    /**
     * Used to customize the fetch behavior in some runtimes.
     *
     * @internal
     */
    setFetchOptions(fetchOptions) {
      this.fetchOptions = fetchOptions;
    }
    /**
     * This API is experimental: it may change or disappear.
     *
     * Execute a Convex query function at the same timestamp as every other
     * consistent query execution run by this HTTP client.
     *
     * This doesn't make sense for long-lived ConvexHttpClients as Convex
     * backends can read a limited amount into the past: beyond 30 seconds
     * in the past may not be available.
     *
     * Create a new client to use a consistent time.
     *
     * @param name - The name of the query.
     * @param args - The arguments object for the query. If this is omitted,
     * the arguments will be `{}`.
     * @returns A promise of the query's result.
     *
     * @deprecated This API is experimental: it may change or disappear.
     */
    async consistentQuery(query2, ...args) {
      const queryArgs = parseArgs(args[0]);
      const timestampPromise = this.getTimestamp();
      return await this.queryInner(query2, queryArgs, { timestampPromise });
    }
    async getTimestamp() {
      if (this.encodedTsPromise) {
        return this.encodedTsPromise;
      }
      return this.encodedTsPromise = this.getTimestampInner();
    }
    async getTimestampInner() {
      const localFetch = this.fetch || specifiedFetch || fetch;
      const headers = {
        "Content-Type": "application/json",
        "Convex-Client": `npm-${version}`
      };
      const response = await localFetch(`${this.address}/api/query_ts`, {
        ...this.fetchOptions,
        method: "POST",
        headers
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const { ts } = await response.json();
      return ts;
    }
    /**
     * Execute a Convex query function.
     *
     * @param name - The name of the query.
     * @param args - The arguments object for the query. If this is omitted,
     * the arguments will be `{}`.
     * @returns A promise of the query's result.
     */
    async query(query2, ...args) {
      const queryArgs = parseArgs(args[0]);
      return await this.queryInner(query2, queryArgs, {});
    }
    async queryInner(query2, queryArgs, options) {
      const name = getFunctionName(query2);
      const args = [convexToJson(queryArgs)];
      const headers = {
        "Content-Type": "application/json",
        "Convex-Client": `npm-${version}`
      };
      if (this.adminAuth) {
        headers["Authorization"] = `Convex ${this.adminAuth}`;
      } else if (this.auth) {
        headers["Authorization"] = `Bearer ${this.auth}`;
      }
      const localFetch = this.fetch || specifiedFetch || fetch;
      const timestamp = options.timestampPromise ? await options.timestampPromise : void 0;
      const body = JSON.stringify({
        path: name,
        format: "convex_encoded_json",
        args,
        ...timestamp ? { ts: timestamp } : {}
      });
      const endpoint = timestamp ? `${this.address}/api/query_at_ts` : `${this.address}/api/query`;
      const response = await localFetch(endpoint, {
        ...this.fetchOptions,
        body,
        method: "POST",
        headers
      });
      if (!response.ok && response.status !== STATUS_CODE_UDF_FAILED) {
        throw new Error(await response.text());
      }
      const respJSON = await response.json();
      if (this.debug) {
        for (const line of respJSON.logLines ?? []) {
          logForFunction(this.logger, "info", "query", name, line);
        }
      }
      switch (respJSON.status) {
        case "success":
          return jsonToConvex(respJSON.value);
        case "error":
          if (respJSON.errorData !== void 0) {
            throw forwardErrorData(
              respJSON.errorData,
              new ConvexError(respJSON.errorMessage)
            );
          }
          throw new Error(respJSON.errorMessage);
        default:
          throw new Error(`Invalid response: ${JSON.stringify(respJSON)}`);
      }
    }
    async mutationInner(mutation2, mutationArgs) {
      const name = getFunctionName(mutation2);
      const body = JSON.stringify({
        path: name,
        format: "convex_encoded_json",
        args: [convexToJson(mutationArgs)]
      });
      const headers = {
        "Content-Type": "application/json",
        "Convex-Client": `npm-${version}`
      };
      if (this.adminAuth) {
        headers["Authorization"] = `Convex ${this.adminAuth}`;
      } else if (this.auth) {
        headers["Authorization"] = `Bearer ${this.auth}`;
      }
      const localFetch = this.fetch || specifiedFetch || fetch;
      const response = await localFetch(`${this.address}/api/mutation`, {
        ...this.fetchOptions,
        body,
        method: "POST",
        headers
      });
      if (!response.ok && response.status !== STATUS_CODE_UDF_FAILED) {
        throw new Error(await response.text());
      }
      const respJSON = await response.json();
      if (this.debug) {
        for (const line of respJSON.logLines ?? []) {
          logForFunction(this.logger, "info", "mutation", name, line);
        }
      }
      switch (respJSON.status) {
        case "success":
          return jsonToConvex(respJSON.value);
        case "error":
          if (respJSON.errorData !== void 0) {
            throw forwardErrorData(
              respJSON.errorData,
              new ConvexError(respJSON.errorMessage)
            );
          }
          throw new Error(respJSON.errorMessage);
        default:
          throw new Error(`Invalid response: ${JSON.stringify(respJSON)}`);
      }
    }
    async processMutationQueue() {
      if (this.isProcessingQueue) {
        return;
      }
      this.isProcessingQueue = true;
      while (this.mutationQueue.length > 0) {
        const { mutation: mutation2, args, resolve, reject } = this.mutationQueue.shift();
        try {
          const result = await this.mutationInner(mutation2, args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }
      this.isProcessingQueue = false;
    }
    enqueueMutation(mutation2, args) {
      return new Promise((resolve, reject) => {
        this.mutationQueue.push({ mutation: mutation2, args, resolve, reject });
        void this.processMutationQueue();
      });
    }
    /**
     * Execute a Convex mutation function. Mutations are queued by default.
     *
     * @param name - The name of the mutation.
     * @param args - The arguments object for the mutation. If this is omitted,
     * the arguments will be `{}`.
     * @param options - An optional object containing
     * @returns A promise of the mutation's result.
     */
    async mutation(mutation2, ...args) {
      const [fnArgs, options] = args;
      const mutationArgs = parseArgs(fnArgs);
      const queued = !options?.skipQueue;
      if (queued) {
        return await this.enqueueMutation(mutation2, mutationArgs);
      } else {
        return await this.mutationInner(mutation2, mutationArgs);
      }
    }
    /**
     * Execute a Convex action function. Actions are not queued.
     *
     * @param name - The name of the action.
     * @param args - The arguments object for the action. If this is omitted,
     * the arguments will be `{}`.
     * @returns A promise of the action's result.
     */
    async action(action, ...args) {
      const actionArgs = parseArgs(args[0]);
      const name = getFunctionName(action);
      const body = JSON.stringify({
        path: name,
        format: "convex_encoded_json",
        args: [convexToJson(actionArgs)]
      });
      const headers = {
        "Content-Type": "application/json",
        "Convex-Client": `npm-${version}`
      };
      if (this.adminAuth) {
        headers["Authorization"] = `Convex ${this.adminAuth}`;
      } else if (this.auth) {
        headers["Authorization"] = `Bearer ${this.auth}`;
      }
      const localFetch = this.fetch || specifiedFetch || fetch;
      const response = await localFetch(`${this.address}/api/action`, {
        ...this.fetchOptions,
        body,
        method: "POST",
        headers
      });
      if (!response.ok && response.status !== STATUS_CODE_UDF_FAILED) {
        throw new Error(await response.text());
      }
      const respJSON = await response.json();
      if (this.debug) {
        for (const line of respJSON.logLines ?? []) {
          logForFunction(this.logger, "info", "action", name, line);
        }
      }
      switch (respJSON.status) {
        case "success":
          return jsonToConvex(respJSON.value);
        case "error":
          if (respJSON.errorData !== void 0) {
            throw forwardErrorData(
              respJSON.errorData,
              new ConvexError(respJSON.errorMessage)
            );
          }
          throw new Error(respJSON.errorMessage);
        default:
          throw new Error(`Invalid response: ${JSON.stringify(respJSON)}`);
      }
    }
    /**
     * Execute a Convex function of an unknown type. These function calls are not queued.
     *
     * @param name - The name of the function.
     * @param args - The arguments object for the function. If this is omitted,
     * the arguments will be `{}`.
     * @returns A promise of the function's result.
     *
     * @internal
     */
    async function(anyFunction, componentPath, ...args) {
      const functionArgs = parseArgs(args[0]);
      const name = typeof anyFunction === "string" ? anyFunction : getFunctionName(anyFunction);
      const body = JSON.stringify({
        componentPath,
        path: name,
        format: "convex_encoded_json",
        args: convexToJson(functionArgs)
      });
      const headers = {
        "Content-Type": "application/json",
        "Convex-Client": `npm-${version}`
      };
      if (this.adminAuth) {
        headers["Authorization"] = `Convex ${this.adminAuth}`;
      } else if (this.auth) {
        headers["Authorization"] = `Bearer ${this.auth}`;
      }
      const localFetch = this.fetch || specifiedFetch || fetch;
      const response = await localFetch(`${this.address}/api/function`, {
        ...this.fetchOptions,
        body,
        method: "POST",
        headers
      });
      if (!response.ok && response.status !== STATUS_CODE_UDF_FAILED) {
        throw new Error(await response.text());
      }
      const respJSON = await response.json();
      if (this.debug) {
        for (const line of respJSON.logLines ?? []) {
          logForFunction(this.logger, "info", "any", name, line);
        }
      }
      switch (respJSON.status) {
        case "success":
          return jsonToConvex(respJSON.value);
        case "error":
          if (respJSON.errorData !== void 0) {
            throw forwardErrorData(
              respJSON.errorData,
              new ConvexError(respJSON.errorMessage)
            );
          }
          throw new Error(respJSON.errorMessage);
        default:
          throw new Error(`Invalid response: ${JSON.stringify(respJSON)}`);
      }
    }
  };
  function forwardErrorData(errorData, error) {
    error.data = jsonToConvex(errorData);
    return error;
  }

  // node_modules/convex/dist/esm/server/pagination.js
  var paginationOptsValidator = v.object({
    numItems: v.number(),
    cursor: v.union(v.string(), v.null()),
    endCursor: v.optional(v.union(v.string(), v.null())),
    id: v.optional(v.number()),
    maximumRowsRead: v.optional(v.number()),
    maximumBytesRead: v.optional(v.number())
  });

  // node_modules/convex/dist/esm/server/logVars.js
  var REQUEST_ID = Symbol("var.requestId");
  var IP = Symbol("var.ip");
  var USER_AGENT = Symbol("var.userAgent");
  var NOW = Symbol("var.now");
  var CONVEX_ACTOR = Symbol("var.convexActor");
  var varNames = {
    [REQUEST_ID]: "requestId",
    [IP]: "ip",
    [USER_AGENT]: "userAgent",
    [NOW]: "now",
    [CONVEX_ACTOR]: "convexActor"
  };

  // node_modules/convex/dist/esm/server/schema.js
  var __defProp6 = Object.defineProperty;
  var __defNormalProp6 = (obj, key, value) => key in obj ? __defProp6(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField6 = (obj, key, value) => __defNormalProp6(obj, typeof key !== "symbol" ? key + "" : key, value);
  var TableDefinition = class {
    /**
     * @internal
     */
    constructor(documentType) {
      __publicField6(this, "indexes");
      __publicField6(this, "stagedDbIndexes");
      __publicField6(this, "searchIndexes");
      __publicField6(this, "stagedSearchIndexes");
      __publicField6(this, "vectorIndexes");
      __publicField6(this, "stagedVectorIndexes");
      __publicField6(this, "validator");
      __publicField6(this, "stagedValidator");
      this.indexes = [];
      this.stagedDbIndexes = [];
      this.searchIndexes = [];
      this.stagedSearchIndexes = [];
      this.vectorIndexes = [];
      this.stagedVectorIndexes = [];
      this.validator = documentType;
    }
    /**
     * This API is experimental: it may change or disappear.
     *
     * Returns indexes defined on this table.
     * Intended for the advanced use cases of dynamically deciding which index to use for a query.
     * If you think you need this, please chime in on ths issue in the Convex JS GitHub repo.
     * https://github.com/get-convex/convex-js/issues/49
     */
    " indexes"() {
      return this.indexes;
    }
    index(name, indexConfig) {
      if (Array.isArray(indexConfig)) {
        this.indexes.push({
          indexDescriptor: name,
          fields: indexConfig
        });
      } else if (indexConfig.staged) {
        this.stagedDbIndexes.push({
          indexDescriptor: name,
          fields: indexConfig.fields
        });
      } else {
        this.indexes.push({
          indexDescriptor: name,
          fields: indexConfig.fields
        });
      }
      return this;
    }
    searchIndex(name, indexConfig) {
      if (indexConfig.staged) {
        this.stagedSearchIndexes.push({
          indexDescriptor: name,
          searchField: indexConfig.searchField,
          filterFields: indexConfig.filterFields || []
        });
      } else {
        this.searchIndexes.push({
          indexDescriptor: name,
          searchField: indexConfig.searchField,
          filterFields: indexConfig.filterFields || []
        });
      }
      return this;
    }
    vectorIndex(name, indexConfig) {
      if (indexConfig.staged) {
        this.stagedVectorIndexes.push({
          indexDescriptor: name,
          vectorField: indexConfig.vectorField,
          dimensions: indexConfig.dimensions,
          filterFields: indexConfig.filterFields || []
        });
      } else {
        this.vectorIndexes.push({
          indexDescriptor: name,
          vectorField: indexConfig.vectorField,
          dimensions: indexConfig.dimensions,
          filterFields: indexConfig.filterFields || []
        });
      }
      return this;
    }
    /**
     * Stage a new document validator for this table.
     *
     * Convex validates the staged validator against the table's existing
     * documents in the background, while the validator passed to
     * {@link defineTable} remains the one enforced on reads and writes. Once
     * the background validation succeeds, make the staged validator the
     * table's validator and remove `.staged()`.
     *
     * ```ts
     * defineTable({
     *   author: v.string(),
     * }).staged({
     *   author: v.array(v.string()),
     * })
     * ```
     *
     * TODO: link a worked staged-schema example from the docs once one exists.
     *
     * @param documentSchema - The proposed next type of documents stored in
     * this table, as an object of field validators or a schema validator.
     * @returns A {@link TableDefinition} with the staged validator attached.
     *
     * @internal
     */
    staged(documentSchema) {
      if (this.stagedValidator !== void 0) {
        throw new Error("Table cannot have more than one staged validator.");
      }
      this.stagedValidator = isValidator(documentSchema) ? documentSchema : v.object(documentSchema);
      return this.self();
    }
    /**
     * Work around for https://github.com/microsoft/TypeScript/issues/57035
     */
    self() {
      return this;
    }
    /**
     * Export the contents of this definition.
     *
     * This is called internally by the Convex framework.
     * @internal
     */
    export() {
      const documentType = this.validator.json;
      if (typeof documentType !== "object") {
        throw new Error(
          "Invalid validator: please make sure that the parameter of `defineTable` is valid (see https://docs.convex.dev/database/schemas)"
        );
      }
      let stagedDocumentType = void 0;
      if (this.stagedValidator !== void 0) {
        stagedDocumentType = this.stagedValidator.json;
        if (typeof stagedDocumentType !== "object") {
          throw new Error(
            "Invalid staged validator: please make sure that the parameter of `.staged()` is valid (see https://docs.convex.dev/database/schemas)"
          );
        }
      }
      return {
        indexes: this.indexes,
        stagedDbIndexes: this.stagedDbIndexes,
        searchIndexes: this.searchIndexes,
        stagedSearchIndexes: this.stagedSearchIndexes,
        vectorIndexes: this.vectorIndexes,
        stagedVectorIndexes: this.stagedVectorIndexes,
        documentType,
        stagedDocumentType
      };
    }
  };
  function defineTable(documentSchema) {
    if (isValidator(documentSchema)) {
      return new TableDefinition(documentSchema);
    } else {
      return new TableDefinition(v.object(documentSchema));
    }
  }
  function addSystemFields(tableName, validator) {
    switch (validator.kind) {
      case "object":
        return validator.extend({
          _id: v.id(tableName),
          _creationTime: v.number()
        });
      case "union":
        return v.union(
          ...validator.members.map(
            (member) => addSystemFields(tableName, member)
          )
        );
      // `v.any()` already permits the system fields.
      case "any":
        return validator;
      default:
        throw new Error(
          `Invalid validator for table "${tableName}": a table's documents must be objects, or a union of objects (see https://docs.convex.dev/database/schemas)`
        );
    }
  }
  function docValidator(tableName, table) {
    return addSystemFields(tableName, table.validator);
  }
  function tableInSchema(schema, tableName) {
    const table = schema.tables[tableName];
    if (table === void 0) {
      throw new Error(
        `Table "${tableName}" is not in this schema. Tables in this schema: ${Object.keys(
          schema.tables
        ).join(", ")}`
      );
    }
    return table;
  }
  var SchemaDefinition = class {
    /**
     * @internal
     */
    constructor(tables, options) {
      __publicField6(this, "tables");
      __publicField6(this, "strictTableNameTypes");
      __publicField6(this, "schemaValidation");
      this.tables = tables;
      this.schemaValidation = options?.schemaValidation === void 0 ? true : options.schemaValidation;
    }
    /**
     * The validator for whole documents of a table in this schema: the table's
     * own validator with the `_id` and `_creationTime` system fields added.
     *
     * @example
     * ```ts
     * export const get = query({
     *   args: { id: schema.id("messages") },
     *   returns: v.union(schema.doc("messages"), v.null()),
     *   handler: (ctx, args) => ctx.db.get(args.id),
     * });
     * ```
     *
     * @param tableName - The name of a table in this schema.
     * @returns A validator matching documents of that table.
     */
    doc(tableName) {
      return docValidator(tableName, tableInSchema(this, tableName));
    }
    /**
     * The validator for IDs of a table in this schema.
     *
     * Same as `v.id(tableName)`, but only accepts tables in this schema.
     *
     * @param tableName - The name of a table in this schema.
     * @returns A validator matching IDs of that table.
     */
    id(tableName) {
      tableInSchema(this, tableName);
      return v.id(tableName);
    }
    /**
     * Export the contents of this definition.
     *
     * This is called internally by the Convex framework.
     * @internal
     */
    export() {
      return JSON.stringify({
        tables: Object.entries(this.tables).map(([tableName, definition]) => {
          const {
            indexes,
            stagedDbIndexes,
            searchIndexes,
            stagedSearchIndexes,
            vectorIndexes,
            stagedVectorIndexes,
            documentType,
            stagedDocumentType
          } = definition.export();
          return {
            tableName,
            indexes,
            stagedDbIndexes,
            searchIndexes,
            stagedSearchIndexes,
            vectorIndexes,
            stagedVectorIndexes,
            documentType,
            stagedDocumentType
          };
        }),
        schemaValidation: this.schemaValidation
      });
    }
  };
  function defineSchema(schema, options) {
    return new SchemaDefinition(schema, options);
  }
  var _systemSchema = defineSchema({
    _scheduled_functions: defineTable({
      name: v.string(),
      args: v.array(v.any()),
      scheduledTime: v.float64(),
      completedTime: v.optional(v.float64()),
      state: v.union(
        v.object({ kind: v.literal("pending") }),
        v.object({ kind: v.literal("inProgress") }),
        v.object({ kind: v.literal("success") }),
        v.object({ kind: v.literal("failed"), error: v.string() }),
        v.object({ kind: v.literal("canceled") })
      )
    }),
    _storage: defineTable({
      sha256: v.string(),
      size: v.float64(),
      contentType: v.optional(v.string())
    })
  });

  // src/cloud-client.js
  var config = window.PRACTICE_CLOUD_CONFIG || {};
  var enabled = Boolean(config.enabled && config.convexUrl);
  var client = enabled ? new ConvexHttpClient(config.convexUrl) : null;
  var randomToken = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) => b.toString(16).padStart(2, "0")).join("");
  var deviceToken;
  try {
    deviceToken = localStorage.getItem("practice-room-device");
    if (!/^[a-f0-9]{64}$/.test(deviceToken || "")) {
      deviceToken = randomToken();
      localStorage.setItem("practice-room-device", deviceToken);
    }
  } catch {
    deviceToken = randomToken();
  }
  var pending = /* @__PURE__ */ new Set();
  var latest;
  var query = (name, args = {}) => client.query(makeFunctionReference(name), args);
  var mutation = (name, args = {}) => client.mutation(makeFunctionReference(name), args);
  function status(text) {
    const panel = document.getElementById("panel");
    if (!panel) return;
    let el = panel.querySelector(".cloud-save-status");
    if (!el) {
      el = document.createElement("p");
      el.className = "cloud-save-status";
      el.setAttribute("role", "status");
      el.style.cssText = "font:14px/1.5 system-ui,sans-serif";
      const timing = panel.querySelector(".attempt-time");
      if (timing) timing.after(el);
      else panel.append(el);
    }
    el.textContent = text;
  }
  async function start(snapshot) {
    latest = snapshot;
    if (!enabled || !snapshot.tracking) return;
    try {
      await mutation("grades:begin", { deviceToken, attemptKey: snapshot.tracking.id, quizPath: snapshot.quizPath });
      snapshot.tracking.cloudStarted = true;
    } catch {
      status("Offline \u2014 your answers are saved on this device.");
    }
  }
  async function submit(snapshot) {
    latest = snapshot;
    if (!enabled || !snapshot.tracking) return;
    const key = snapshot.tracking.id;
    if (pending.has(key)) return;
    pending.add(key);
    status("Saving result\u2026");
    try {
      await mutation("grades:begin", { deviceToken, attemptKey: key, quizPath: snapshot.quizPath });
      await mutation("grades:submit", { deviceToken, attemptKey: key, answers: snapshot.answers.map(({ id, answer }) => ({ id, answer })), activeMs: snapshot.tracking.activeMs, partialTiming: snapshot.tracking.partial });
      status("Result saved. Identified by this browser\u2019s device number.");
    } catch {
      status("Result not sent. Your answers are saved here.");
      const retry = document.createElement("button");
      retry.textContent = "Retry saving";
      retry.type = "button";
      retry.onclick = () => submit(snapshot);
      document.querySelector(".cloud-save-status")?.append(" ", retry);
    } finally {
      pending.delete(key);
    }
  }
  window.PracticeCloud = { enabled, query, mutation, randomToken, start, submit };
  window.addEventListener("practice:submitted", (e) => submit(e.detail));
  window.addEventListener("online", () => {
    if (latest?.tracking?.submittedAt) submit(latest);
    else if (latest) start(latest);
  });
})();
