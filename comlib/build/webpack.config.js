const path = require('path');

module.exports = {
  entry: {'xgraph.comlib':'./src/index.ts'},
  //devtool: 'cheap-module-source-map',
  //devtool:'cheap-module-eval-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true
        }
        // exclude: /node_modules/
      },
      {
        test: /\.css$/,
        // exclude: /node_modules/,
        use: ['style-loader', 'css-loader']
      },
      // {
      //   test: /\.nmd(?=\.less)$/gi,
      //   use: ['style-loader', 'css-loader', 'less-loader']
      // },
      {
        test: /\.less$/i,
        use: [
          {loader: 'style-loader'},
          {
            loader: 'css-loader',
            options: {
              modules: {
                //exportGlobals:true,
                // auto(resourcePath) {
                //   // if (resourcePath.indexOf('/antd/dist/') > 0) {
                //   //   console.log(resourcePath)
                //   //   return false
                //   // }
                //   return true
                // },
                localIdentName: '[local]-[hash:5]'
              }
            }
          },
          {
            loader: 'less-loader',
            options: {
              javascriptEnabled: true
            }
          }
        ]
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 100000
            }
          },
        ],
      },
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts'],
    alias: {
      'xgraph.sdk': require('path').resolve(__dirname, '../node_modules/@vdian/xgraph.sdk')
    }
  },
  externals: [{
    'React': 'React',
    'react': 'React',
    // 'react-dom': 'ReactDOM',
    'react-dom': {
      'commonjs': 'react-dom',
      'commonjs2': 'react-dom',
      'amd': 'react-dom',
      'root': 'ReactDOM'
    },
    'rxui': 'rxui',
    'pceditors': 'pceditors',
    'antd': 'antd',
    'axios': 'axios',
    '@ant-design/icons': 'icons',
    'BizCharts': 'BizCharts',
    'bizcharts': 'BizCharts',
    // 'Mock': 'mockjs',
    'mockjs': 'Mock',
    // 'mockjs': 'mockjs',
    '@antv/data-set': 'DataSet',
    '@turf/turf': 'turf',
    'lodash': {commonjs: "lodash", commonjs2: "lodash", amd: "lodash", root: "_"},
    'moment': 'moment',
    'vue': 'Vue',
    'element-ui': 'ElementUI'
  }],
  output: {
    globalObject: 'this',
    filename: 'index.js',
    path: path.resolve(__dirname, '../'),
    libraryTarget: 'umd',
    library: '[name]'
  }
}
