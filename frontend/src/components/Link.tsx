import { A } from "@solidjs/router";
import type { Component, JSX } from "solid-js";

export const Link: Component<{
	href: string;
	class?: string;
	children?: JSX.Element;
}> = (props) => (
	<A
		href={props.href}
		class={`border-2 border-solid border-black hover:bg-gray-200 active:bg-gray-400 rounded-lg p-5 text-center ${props.class}`}
	>
		{props.children}
	</A>
);
