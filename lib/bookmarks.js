import MiniSearch from "minisearch";

import data from "./data.json" assert { type: "json" };
import awsData from "./aws-data.json" assert { type: "json" };

const awsLinks = awsData.services
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

export const ms = new MiniSearch({
	fields: ["title", "url", "tags"],
	storeFields: ["title", "url", "description", "tags"],
});

ms.addAll(awsLinks);
