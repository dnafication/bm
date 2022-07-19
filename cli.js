#!/usr/bin/env node
import meow from "meow";
import open from "open";
import prompts from "prompts";
import { ms } from "./lib/bookmarks.js";

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
				default: "google chrome",
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

const results = ms.search(cli.input[0], {
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
		choices: results.map((result) => ({
			title: result.title,
			value: result,
			description: result.description,
		})),
	});

	if (answer.pick) {
		await openLink(answer.pick);
	}
}

if (results.length === 1) {
	await openLink(results[0]);
}
