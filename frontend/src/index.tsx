/* @refresh reload */
import { render } from "solid-js/web";
import App from "./App.tsx";
import Host from "./Host.tsx";
import Join from "./Join.tsx";
import "./index.css";
import { Route, Router, type RouteSectionProps } from "@solidjs/router";

const root = document.getElementById("root");

const Layout = (props: RouteSectionProps) => (
	<div class="w-screen h-screen flex justify-center font-mono">
		<div class="w-xl h-screen flex items-center">
			<div class="h-fit w-full">{props.children}</div>
		</div>
	</div>
);

render(
	() => (
		<Router root={Layout}>
			<Route path="/" component={App} />
			<Route path="/host" component={Host} />
			<Route path="/join" component={Join} />
		</Router>
	),
	root as NonNullable<typeof root>,
);
