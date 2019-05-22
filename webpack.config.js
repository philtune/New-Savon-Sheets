const path = require('path');

module.exports = {
	mode: 'development',
	entry: './src/master.js',
	output: {
		filename: 'master.js',
		path: path.resolve(__dirname, 'public_html/js')
	},
	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env']
					}
				}
			}
		]
	}
};