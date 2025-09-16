import type { SetStoreFunction } from "solid-js/store";

// Util for stores with union types to use with a <Switch>.
// Solid's <Switch> doesn't help typescript infer union variants
// so working with these values becomes a nightmare.

export const extract =
	<T extends { type: unknown }>() =>
	<V extends T["type"]>(val: T): Extract<T, { type: V }> =>
		val as Extract<T, { type: V }>;

export const extractSet =
	<T extends { type: unknown }>() =>
	<V extends T["type"]>(
		setter: SetStoreFunction<T>,
	): SetStoreFunction<Extract<T, { type: V }>> =>
		setter as unknown as SetStoreFunction<Extract<T, { type: V }>>;
