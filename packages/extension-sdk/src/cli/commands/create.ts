/* eslint-disable no-console */

import path from 'path';
import chalk from 'chalk';
import fse from 'fs-extra';
import execa from 'execa';
import ora from 'ora';
import { EXTENSION_TYPES } from '@directus/shared/constants';
import { ExtensionType } from '@directus/shared/types';

const pkg = require('../../../../package.json');

const TEMPLATE_PATH = path.resolve(__dirname, '..', '..', '..', '..', 'templates');

export default async function create(type: ExtensionType, name: string): Promise<void> {
	const targetPath = path.resolve(name);

	if (!EXTENSION_TYPES.includes(type)) {
		console.log(
			`${chalk.bold.red('[Error]')} Extension type ${chalk.bold(
				type
			)} does not exist. Available extension types: ${EXTENSION_TYPES.map((t) => chalk.bold.cyan(t)).join(', ')}.`
		);
		process.exit(1);
	}

	if (await fse.pathExists(targetPath)) {
		const info = await fse.stat(targetPath);

		if (!info.isDirectory()) {
			console.log(
				`${chalk.bold.red('[Error]')} Destination ${chalk.bold(name)} already exists and is not a directory.`
			);
			process.exit(1);
		}

		const files = await fse.readdir(targetPath);

		if (files.length > 0) {
			console.log(`${chalk.bold.red('[Error]')} Destination ${chalk.bold(name)} already exists and is not empty.`);
			process.exit(1);
		}
	}

	const spinner = ora(`Scaffolding Directus extension...`).start();

	await fse.ensureDir(targetPath);

	await fse.copy(path.join(TEMPLATE_PATH, 'common'), targetPath);
	await fse.copy(path.join(TEMPLATE_PATH, type), targetPath);

	const packageManifest = {
		name: `directus-extension-${name}`,
		version: '1.0.0',
		keywords: ['directus', 'directus-extension', `directus-custom-${type}`],
		'directus:extension': {
			type: type,
			path: 'dist/index.js',
			host: `^${pkg.version}`,
			hidden: false,
		},
		scripts: {
			build: 'directus-extension build',
		},
		devDependencies: {
			'@directus/extension-sdk': `^${pkg.version}`,
		},
	};

	await fse.writeJSON(path.join(targetPath, 'package.json'), packageManifest, { spaces: '\t' });

	await execa('npm', ['install'], { cwd: targetPath });

	spinner.succeed('Done');

	console.log(`
Your ${type} extension has been created at ${chalk.green(targetPath)}

Build your extension by running:
  ${chalk.blue('cd')} ${name}
  ${chalk.blue('npm run')} build
	`);
}
