/**
 * Config-driven data transformation pipeline.
 *
 * Applies an ordered sequence of transformation steps (filter, map, sort, limit)
 * to an array of records without mutating the original input.
 *
 * ─── Follow-up design notes ────────────────────────────────────────────────
 *
 * 1. Adding groupBy (Open/Closed Principle)
 *    Add a new handler function `applyGroupBy` and register it in the
 *    `STEP_HANDLERS` dispatch map below.  No existing code changes needed.
 *
 * 2. 10 million rows — avoiding intermediate array materialisation
 *    Replace the `reduce` with a lazy generator pipeline: each step becomes
 *    an Iterable<DataRecord> wrapper that yields records on demand.  `limit`
 *    short-circuits the upstream generators so only `count` records are
 *    ever processed.
 *
 * 3. Config validation at construction time (all errors at once)
 *    Collect every violation into an array during the constructor and throw
 *    a single `AggregateError` (or a custom `ConfigValidationError`) listing
 *    all problems rather than stopping on the first one.
 *
 * 4. Async pipeline (remote data sources)
 *    Change the signature to `run(data: AsyncIterable<DataRecord>):
 *    AsyncIterable<DataRecord>` and make each step handler an async
 *    generator, composing them with `yield*`.
 * ───────────────────────────────────────────────────────────────────────────
 */

export type Operator = "eq" | "gt" | "lt" | "contains";

export type TransformStep =
    | { type: "filter"; field: string; operator: Operator; value: unknown }
    | { type: "map";    from: string; to: string }
    | { type: "sort";  field: string; direction: "asc" | "desc" }
    | { type: "limit"; count: number };

export interface PipelineConfig {
    steps: TransformStep[];
}

/** A loosely-typed data record (object with string keys). */
export type DataRecord = { [key: string]: unknown };

// ─── Step handlers ──────────────────────────────────────────────────────────

function applyFilter(
    records: DataRecord[],
    step: Extract<TransformStep, { type: "filter" }>
): DataRecord[] {
    const { field, operator, value } = step;
    return records.filter(record => {
        const fieldValue = record[field];
        switch (operator) {
            case "eq":
                return fieldValue === value;
            case "gt":
                return (fieldValue as number) > (value as number);
            case "lt":
                return (fieldValue as number) < (value as number);
            case "contains":
                if (typeof fieldValue !== "string") return false;
                return fieldValue.includes(value as string);
            default:
                throw new Error(`Unknown operator: ${operator as string}`);
        }
    });
}

function applyMap(
    records: DataRecord[],
    step: Extract<TransformStep, { type: "map" }>
): DataRecord[] {
    const { from, to } = step;
    return records.map(record => {
        const next = { ...record };
        if (from in next) {
            next[to] = next[from];
            delete next[from];
        }
        return next;
    });
}

function applySort(
    records: DataRecord[],
    step: Extract<TransformStep, { type: "sort" }>
): DataRecord[] {
    const { field, direction } = step;
    return [...records].sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        if (aVal === bVal) return 0;
        if (aVal === undefined) return 1;   // missing fields sort last
        if (bVal === undefined) return -1;
        const order = (aVal as string | number) < (bVal as string | number) ? -1 : 1;
        return direction === "asc" ? order : -order;
    });
}

function applyLimit(
    records: DataRecord[],
    step: Extract<TransformStep, { type: "limit" }>
): DataRecord[] {
    return records.slice(0, step.count);
}

// ─── Pipeline ───────────────────────────────────────────────────────────────

export class DataPipeline {
    constructor(private readonly config: PipelineConfig) {}

    run(data: DataRecord[]): DataRecord[] {
        return this.config.steps.reduce<DataRecord[]>((records, step) => {
            switch (step.type) {
                case "filter": return applyFilter(records, step);
                case "map":    return applyMap(records, step);
                case "sort":   return applySort(records, step);
                case "limit":  return applyLimit(records, step);
                default:
                    throw new Error(`Unknown step: ${(step as { type: string }).type}`);
            }
        }, [...data]); // shallow-copy to guard against external mutation of the array
    }
}
