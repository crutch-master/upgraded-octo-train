/* @refresh reload */
import { render } from "solid-js/web";
import App from "./App.tsx";
import "./index.css";
import { Route, Router, type RouteSectionProps } from "@solidjs/router";

const root = document.getElementById("root");

const Layout = (props: RouteSectionProps) => (
	<div class="w-screen h-screen flex justify-center">
		<div class="w-xl h-screen flex items-center">
			<div class="h-fit w-full">{props.children}</div>
		</div>
	</div>
);

render(
	() => (
		<Router root={Layout}>
			<Route path="/" component={App} />
		</Router>
	),
	root as NonNullable<typeof root>,
);
