/**
 * Config loader
 */

import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import * as yaml from 'js-yaml';
import { Source, Mixin } from './types.js';

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

/**
 * Path of configuration directory
 */
const dir = `${_dirname}/../../../../.config`;

/**
 * Path of configuration file
 */
const path = process.env.NODE_ENV === 'test'
	? `${dir}/test.yml`
	: `${dir}/default.yml`;

function assignToPath(root, path, value) {
	let obj = root;
	while (path.length !== 1) {
		const key = path.shift();
		if (!obj[key]) {
			obj[key] = {};
		}
		obj = obj[key];
	}
	obj[path[0]] = value;
	return root;
}

function stringToValue(value) {
	try {
		return JSON.parse(value);
	} catch (_err) {
		return value;
	}
}

function fillConfigFromEnv(config, prefix) {
	return Object.entries(process.env)
		.filter(([k, _]) => k.startsWith(prefix))
		.reduce((acc, [k, v]) => assignToPath(acc, k.slice(prefix.length).split('_'), stringToValue(v)), config);
}

export default function load() {
	const meta = JSON.parse(fs.readFileSync(`${_dirname}/../../../../built/meta.json`, 'utf-8'));
	const clientManifest = JSON.parse(fs.readFileSync(`${_dirname}/../../../../built/_client_dist_/manifest.json`, 'utf-8'));
	const fileConfig = yaml.load(fs.readFileSync(path, 'utf-8')) as Source;
	const config = fillConfigFromEnv(fileConfig, 'MISSKEY_');

	const mixin = {} as Mixin;

	const url = tryCreateUrl(config.url);

	config.url = url.origin;

	config.port = config.port || parseInt(process.env.PORT || '', 10);

	mixin.version = meta.version;
	mixin.host = url.host;
	mixin.hostname = url.hostname;
	mixin.scheme = url.protocol.replace(/:$/, '');
	mixin.wsScheme = mixin.scheme.replace('http', 'ws');
	mixin.wsUrl = `${mixin.wsScheme}://${mixin.host}`;
	mixin.apiUrl = `${mixin.scheme}://${mixin.host}/api`;
	mixin.authUrl = `${mixin.scheme}://${mixin.host}/auth`;
	mixin.driveUrl = `${mixin.scheme}://${mixin.host}/files`;
	mixin.userAgent = `Misskey/${meta.version} (${config.url})`;
	mixin.clientEntry = clientManifest['src/init.ts'];

	if (!config.redis.prefix) config.redis.prefix = mixin.host;

	return Object.assign(config, mixin);
}

function tryCreateUrl(url: string) {
	try {
		return new URL(url);
	} catch (e) {
		throw `url="${url}" is not a valid URL.`;
	}
}
