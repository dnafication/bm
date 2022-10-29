#!/usr/bin/env node
import meow from "meow";
import open from "open";
import prompts from "prompts";
import { Bookmark } from "./lib/bookmarks.js";

const cli = meow(
	`
	Usage
	  $ bm [input]

	Options
	  --in <app name>
		--incognito

	Examples
	  $ bm lambda
	  $ bm ec2 --in firefox --incognito
	  $ bm dynamo --in "google chrome"
`,
	{
		flags: {
			in: {
				type: "string",
				default: "",
			},
			incognito: {
				type: "boolean",
				default: false,
			},
		},
	}
);

// console.log(cli.input);
// console.log(cli.flags);

const bm = new Bookmark();
await bm.init();

const results = bm.ms.search(cli.input[0], {
	fields: ["title", "url"],
	fuzzy: 0.2,
	prefix: true,
});

const openLink = async (searchResult) => {
	console.log(
		`Opening ${searchResult.title} in ${cli.flags.in}. InCognito: ${cli.flags.incognito}`
	);
	await open(searchResult.url, {
		app: {
			name: cli.flags.in,
			arguments: cli.flags.incognito ? ["--incognito"] : [],
		},
	});
};

if (results.length > 1) {
	const answer = await prompts({
		type: "autocomplete",
		message: "Which one?",
		name: "pick",
		suggest: (input, choices) =>
			Promise.resolve(
				choices.filter((c) =>
					c.title.toLowerCase().includes(input.toLowerCase())
				)
			),
		choices: results.map((result) => ({
			title: result.title,
			value: result,
			description: result.description,
		})),
		onState: ({ aborted, exited }) => {
			if (aborted || exited) process.exit(0);
		},
	});

	if (answer.pick) {
		await openLink(answer.pick);
		process.exit(0);
	}
	process.exit(0);
}

if (results.length === 1) {
	await openLink(results[0]);
	process.exit(0);
}

console.log("No results found");
