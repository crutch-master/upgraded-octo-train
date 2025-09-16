import type { Component, JSX } from "solid-js";

export const Button: Component<{
	onClick: () => void;
	class?: string;
	children?: JSX.Element;
}> = (props) => (
	<button
		type="button"
		onClick={props.onClick}
		class={`border-2 border-solid border-black hover:bg-gray-200 active:bg-gray-400 rounded-lg p-5 text-center ${props.class}`}
	>
		{props.children}
	</button>
);
