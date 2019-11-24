import { N9Log } from '@neo9/n9-node-log';
import { N9NodeRouting } from 'n9-node-routing';

export interface Conf {
	// n9-node-routing config
	prometheus: N9NodeRouting.PrometheusOptions;
	http?: N9NodeRouting.HttpOptions;
	log?: N9Log.Options;
	env?: string;
	name?: string;
	version?: string;

	// Custom config
	io?: {
		enabled: boolean;
	};

	authorizedEmails: string[];
	mailjet: {
		apiKey?: string;
		apiSecretKey?: string;
		sender?: {
			email?: string;
			name?: string;
		};
	};
	activationURL: {
		base?: string
	};
	targetServer: {
		checkURL?: string;
		check?: {
			headers?: object;
		};
		switchOnUrl?: string;
	};
}
