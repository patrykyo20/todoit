/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as authAdopter from "../authAdopter.js";
import type * as files from "../files.js";
import type * as googleCalendar from "../googleCalendar.js";
import type * as googleCalendarTest from "../googleCalendarTest.js";
import type * as http from "../http.js";
import type * as label from "../label.js";
import type * as openapi from "../openapi.js";
import type * as project from "../project.js";
import type * as search from "../search.js";
import type * as subTasks from "../subTasks.js";
import type * as tasks from "../tasks.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  authAdopter: typeof authAdopter;
  files: typeof files;
  googleCalendar: typeof googleCalendar;
  googleCalendarTest: typeof googleCalendarTest;
  http: typeof http;
  label: typeof label;
  openapi: typeof openapi;
  project: typeof project;
  search: typeof search;
  subTasks: typeof subTasks;
  tasks: typeof tasks;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
