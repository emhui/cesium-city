const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpack = require('webpack')
const path = require('path')

const debug = process.env.NODE_ENV !== 'production'

const cesiumSource = './node_modules/cesium/Source'
const cesiumWorkers = '../Build/Cesium/Workers'

module.exports = {
    publicPath: '',
    devServer: {
        port: 8090 //修改服务端口号
    },
    outputDir: 'docs', //设置 build 输出目录
    configureWebpack: {
        output: {
            sourcePrefix: ' '
        },
        amd: {
            toUrlUndefined: true
        },
        resolve: {
            alias: {
                'vue$': 'vue/dist/vue.esm.js',
                '@': path.resolve('src'),
                'cesium': path.resolve(__dirname, cesiumSource)
            }
        },
        plugins: [
            new CopyWebpackPlugin([{ from: path.join(cesiumSource, cesiumWorkers), to: 'Workers' }]),
            new CopyWebpackPlugin([{ from: path.join(cesiumSource, 'Assets'), to: 'Assets' }]),
            new CopyWebpackPlugin([{ from: path.join(cesiumSource, 'Widgets'), to: 'Widgets' }]),
            new CopyWebpackPlugin([{ from: path.join(cesiumSource, 'ThirdParty/Workers'), to: 'ThirdParty/Workers' }]),
            new webpack.DefinePlugin({
                CESIUM_BASE_URL: JSON.stringify('./')
            })
        ],
        module: {
            unknownContextCritical: /^.\/.*$/,
            unknownContextCritical: false

        }
    },

/*     devServer: {
        proxy: {
            "/proxy": {
                "target": "http://127.0.0.1:8080/",
                "pathRewrite": {
                    "^/proxy": ""
                }
            }
        }
    } */
}