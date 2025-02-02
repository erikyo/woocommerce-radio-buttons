require("@wordpress/dependency-extraction-webpack-plugin");
const defaultConfig = require("@wordpress/scripts/config/webpack.config");

const production = "development" !== process.env.NODE_ENV;

module.exports = {
  ...defaultConfig,
  module: {
    ...defaultConfig.module,
    rules: [
      ...defaultConfig.module.rules,
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          {
            loader: require.resolve("babel-loader"),
            options: {
              presets: [
                [
                  "@babel/preset-env",
                  {
                    useBuiltIns: "usage",
                    corejs: 3,
                    targets: {
                      browsers: ["last 2 versions, > 0.25%, not dead"],
                    },
                  },
                ],
                "@wordpress/babel-preset-default",
              ],
              plugins: ["@babel/plugin-proposal-async-generator-functions"],
            },
          },
        ],
      },
    ],
  },
  plugins: [
    ...defaultConfig.plugins.filter(
      (plugin) => plugin.constructor.name !== "CleanWebpackPlugin"
    ),
  ],
};

if (production) {
  module.exports.devtool = false;
}
