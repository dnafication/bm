import MiniSearch from "minisearch";
import { readFile } from "fs";
import { promisify } from "util";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const readFileAsync = promisify(readFile);

export class Bookmark {
	constructor() {
		this.ms = new MiniSearch({
			fields: ["title", "url", "tags"],
			storeFields: ["title", "url", "description", "tags"],
		});
	}

	async init() {
		const awsData = await readFileAsync(
			join(__dirname, "./aws-data.json"),
			"utf8"
		);
		const awsDataJson = JSON.parse(awsData);
		const awsLinks = awsDataJson.services
			.filter((s) => !s.unlisted)
			.map((service) => ({
				id: service.id,
				title: service.label,
				url: service.external_link
					? service.url
					: `https://ap-southeast-2.console.aws.amazon.com${service.url}?region=ap-southeast-2`,
				description: service.caption,
				service_ids: service.service_ids,
				tags: ["aws", "services"],
			}));

		this.ms.addAll(awsLinks);
		this.ms.addAll(awsDataJson.custom);
	}
}
