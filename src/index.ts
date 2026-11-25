/**
 * Bundle entry. The stylesheet is imported here, and not in `calendar.ts`, because `tsc` preserves
 * side-effect imports in declaration files, which would not resolve for consumers.
 */
import "./calendar.css";

export * from "./calendar.ts";
