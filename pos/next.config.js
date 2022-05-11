/** @type {import('next').NextConfig} */
const nextConfig = {
    trailingSlash: true,
    reactStrictMode: true,
    basePath: process.env.APP_BASE_PATH,
    exportPathMap: () => {
        return {
            '/': { page: '/new' },
            '/new': { page: '/new' },
            '/confirmed': { page: '/confirmed' },
            '/pending': { page: '/pending' },
            '/transactions': { page: '/transactions' },
        };
    },
    async redirects() {
        return [
            {
                source: '/',
                destination: '/new',
                permanent: false,
                has: [
                    {
                        type: 'query',
                        key: 'recipient',
                    },
                    {
                        type: 'query',
                        key: 'label',
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
