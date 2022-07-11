import { URL } from 'node:url';
import S3 from 'aws-sdk/clients/s3.js';
import { getAgentByUrl } from '@/misc/fetch.js';
import config from '@/config/index.js';

export function getS3() {
	const u = config.objectStorage.endpoint != null
		? `${config.objectStorage.useSSL ? 'https://' : 'http://'}${config.objectStorage.endpoint}`
		: `${config.objectStorage.useSSL ? 'https://' : 'http://'}example.net`;

	return new S3({
		endpoint: config.objectStorage.endpoint || undefined,
		accessKeyId: config.objectStorage.accessKey!,
		secretAccessKey: config.objectStorage.secretKey!,
		region: config.objectStorage.region || undefined,
		sslEnabled: config.objectStorage.useSSL,
		s3ForcePathStyle: !config.objectStorage.endpoint	// AWS with endPoint omitted
			? false
			: config.objectStorage.s3ForcePathStyle,
		httpOptions: {
			agent: getAgentByUrl(new URL(u), !config.objectStorage.useProxy),
		},
	});
}
