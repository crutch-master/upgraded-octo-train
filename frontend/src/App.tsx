import { Link } from "./components/Link";

const App = () => (
	<div class="flex flex-col gap-5">
		<div class="text-4xl text-center">
			Funny Quiz Game With a Less Funny Name
		</div>

		<Link href="/host" class="block text-3xl">
			Host a Game
		</Link>

		<Link href="/join" class="block text-3xl">
			Join a Game
		</Link>
	</div>
);

export default App;
