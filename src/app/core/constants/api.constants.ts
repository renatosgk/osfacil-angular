import { environment } from '../../../environments/environment';

const OVERRIDE_KEY = 'api_base_url_override';
export const ONLINE_API_BASE_URL = 'https://osfacil.onrender.com';

function getRuntimeOverride(): string | null {
	try {
		const value = localStorage.getItem(OVERRIDE_KEY)?.trim();
		return value ? value : null;
	} catch {
		return null;
	}
}

export const API_BASE_URL = getRuntimeOverride() ?? environment.apiBaseUrl;

export function isLocalApiUrl(url: string): boolean {
	try {
		const parsed = new URL(url);
		return parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
	} catch {
		return false;
	}
}