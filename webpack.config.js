var webpack      = require('webpack'),
    path         = require('path'),
    sourcePath   = path.resolve(__dirname, './app'),
    autoprefixer = require('autoprefixer')

console.log("./webpack.config.js",sourcePath);
module.exports = {
    context: sourcePath,
    entry: [
        'webpack-hot-middleware/client',
        './index'
    ],
    output: {
        path: path.resolve(__dirname, './build/'),
        // Webpack uses `publicPath` to determine where the app is being served from.
        // In development, we always serve from the root. This makes config easier.
        publicPath: '/static',
        filename: 'build.js'
    },
    //MUST BE DEFINED BEFORE MODULES
    plugins: [
            new webpack.optimize.OccurrenceOrderPlugin(),
            new webpack.HotModuleReplacementPlugin()
    ],
    module: {
        loaders: [
            // Process JS with Babel.
            {
                test: /\.js$/,
                include: sourcePath,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test:   /\.css$/,
                loader: [
                  'style-loader',
                  'css-loader?importLoaders=1',
                  'postcss-loader'
                ]
            }
        ],
        postcss: function () {
            return [
                autoprefixer
            ];
        }
    }
}