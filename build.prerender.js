/* eslint @typescript-eslint/no-var-requires: "off" */
/* eslint @typescript-eslint/no-unused-vars: "off" */

const path = require("path");
const PrerenderSPAPlugin = require("prerender-webpack5-plugin");

const CompressionPlugin = require("compression-webpack-plugin");
const zlib = require("zlib");

module.exports = (api, options) => {
  api.registerCommand("build:prerender", async () => {
    api.chainWebpack((config) => {
      config.plugin("PrerenderSpaPlugin").use(PrerenderSPAPlugin, [
        {
          indexPath: "index.html",
          routes: ["/"],
        },
      ]);
      config.plugin("CompressionPlugin").use(CompressionPlugin, [
        {
          test: /\.(js|css|svg|html)$/,
          include: undefined,
          exclude: undefined,
          algorithm: "brotliCompress",
          compressionOptions: {
            params: {
              [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
            },
          },
          threshold: 0,
          minRatio: 0.9,
          filename: "[path][base].br",
          deleteOriginalAssets: true,
        },
      ]);
    });
    await api.service.run("build");
  });
};
module.exports.defaultModes = {
  "build:prerender": "production",
};
