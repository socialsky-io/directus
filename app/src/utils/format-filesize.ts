export function formatFilesize(bytes = 0, decimal = true): string {
	const threshold = decimal ? 1000 : 1024;

	if (Boolean(bytes) === false) {
		return '--';
	}

	if (Math.abs(bytes) < threshold) {
		return `${bytes} B`;
	}

	const units = decimal
		? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
		: ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

	let unitIndex = -1;
	let remainingBytes = bytes;

	do {
		remainingBytes /= threshold;
		unitIndex += 1;
	} while (Math.abs(remainingBytes) >= threshold && unitIndex < units.length - 1);

	return `${remainingBytes.toFixed(1)} ${units[unitIndex]}`;
}
