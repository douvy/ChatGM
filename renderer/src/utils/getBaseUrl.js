export default function getBaseUrl() {
    if (typeof window !== 'undefined')
        // browser should use relative path
        return '';

    if (process.env.VERCEL_URL)
        // reference for vercel.com
        return `https://${process.env.VERCEL_URL}`;

    if (process.env.RENDER_EXTERNAL_HOSTNAME)
        // reference for render.com
        return `http://${process.env.RENDER_EXTERNAL_HOSTNAME}`;

    // assume localhost
    return `http://localhost:${process.env.PORT ?? 3000}`;
}