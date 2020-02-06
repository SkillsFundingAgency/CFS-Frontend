const proxy = require('http-proxy-middleware');
module.exports = function(app) {
    app.use(
        '/api',
        proxy({
            target: 'http://localhost:52646',
            changeOrigin: true,
        })
    );
};
