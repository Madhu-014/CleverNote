/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as fileStorage from "../fileStorage.js";
import type * as langchain_db from "../langchain/db.js";
import type * as myAction from "../myAction.js";
import type * as notes from "../notes.js";
import type * as user from "../user.js";
import type * as utils_config from "../utils/config.js";
import type * as utils_errors from "../utils/errors.js";
import type * as utils_fileHelpers from "../utils/fileHelpers.js";
import type * as utils_logger from "../utils/logger.js";
import type * as utils_validators from "../utils/validators.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  fileStorage: typeof fileStorage;
  "langchain/db": typeof langchain_db;
  myAction: typeof myAction;
  notes: typeof notes;
  user: typeof user;
  "utils/config": typeof utils_config;
  "utils/errors": typeof utils_errors;
  "utils/fileHelpers": typeof utils_fileHelpers;
  "utils/logger": typeof utils_logger;
  "utils/validators": typeof utils_validators;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
