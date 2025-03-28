import Protocol from 'Common/Types/API/Protocol';
import URL from 'Common/Types/API/URL';

type GetEnvFunction = (key: string) => string;

export const env: GetEnvFunction = (key: string): string => {
    return (process.env[key] as string) || '';
};

export const HOST: string = env('HOST') || 'localhost';

export const HTTP_PROTOCOL: Protocol =
    env('HTTP_PROTOCOL') === 'https' ? Protocol.HTTPS : Protocol.HTTP;

export const BASE_URL: URL = URL.fromString(`${HTTP_PROTOCOL}${HOST}`);
