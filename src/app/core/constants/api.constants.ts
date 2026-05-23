import { environment } from '../../../environments/environment';

const OVERRIDE_KEY = 'api_base_url_override';

function getRuntimeOverride(): string | null {
	try {
		const value = localStorage.getItem(OVERRIDE_KEY)?.trim();
		return value ? value : null;
	} catch {
		return null;
	}
}

export const API_BASE_URL = getRuntimeOverride() ?? environment.apiBaseUrl;