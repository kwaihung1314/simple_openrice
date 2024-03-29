module.exports = {
    mysql: {
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || 'password',
        database: process.env.DB_NAME || 'simple_openrice',
        port: 3306
    },
    modelNames: {
        restaurant: 'Restaurant',
        region: 'Region',
        image: 'Image',
        review: 'Review',
        user: 'User',
        comment: 'Comment',
    },
    jwtSecret: 'thisIsTheSecret',
};
