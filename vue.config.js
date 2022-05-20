/* eslint @typescript-eslint/no-var-requires: "off" */
/* eslint @typescript-eslint/no-unused-vars: "off" */

const path = require("path");
const webpack = require("webpack");

//!Todo: extract into an external lib [or use loader-utils after future base64url support]
const xxhash = require("xxhash");
const base64url = require("base64url");
function getContentHashBase64url(data) {
  return base64url.encode(xxhash.hash64(Buffer.from(data), 0, "Buffer"));
}

const Handlebars = require("handlebars");

const CssMinimizerWebpackPlugin = require("css-minimizer-webpack-plugin");
const cssNanoPresetAdvanced = require("cssnano-preset-advanced");
const posthtml = require("posthtml");
const minifyClassnames = require("posthtml-minify-classnames");

const cheerio = require("cheerio");

const TerserPlugin = require("terser-webpack-plugin");

const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

const PreloadWebpackPlugin = require("@vue/preload-webpack-plugin");

const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const AddAssetPlugin = require("add-asset-plugin");
const addAssetPlugin = new AddAssetPlugin();

const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,
  filenameHashing: false,
  publicPath: process.env.BASE_URL,

  outputDir: process.env.VUE_APP_RELEASE
    ? path.resolve(__dirname, "server", "prerendered")
    : path.resolve(__dirname, "dist"),

  pages: {
    index: {
      entry: ["src/main.ts"],
      title: "",
      filename: "index.html",
      template: `./public/index.ejs`,
      templateContent: false,

      templateParameters: {
        /* EJS parameters here [use ejs-loader variable parameter to access them — "data" by default]*/

        EXTRACT_STYLES_TO_LINK: function (data) {
          const $ = cheerio.load(data, null, false);

          let extractedCss = "";
          $("style").each(function () {
            extractedCss += $(this).html();
          });

          $("style").each(function () {
            $(this).remove();
          });
          let extractedHtml = $.html();

          let fileName;
          if (process.env.NODE_ENV === "production") {
            let cssContentHash = getContentHashBase64url(extractedCss);
            fileName = cssContentHash + ".css";
          } else {
            fileName = "css/noscript.css";
          }

          addAssetPlugin.addBeforeCompression(fileName, extractedCss);

          let htmlWithLink =
            `<link rel="stylesheet" href="${
              process.env.BASE_URL + fileName
            }">` + extractedHtml;

          return htmlWithLink;
        },
        MINIFY_IDS_AND_CLASS_NAMES: function (code) {
          /* Minifies at only inline style tags */
          return posthtml([
            minifyClassnames({
              genNameClass: "genName",
              genNameId: "genName",
            }),
          ]).process(code, { sync: true }).html;
        },
      },
      inject: true,
      publicPath: process.env.BASE_URL,
      scriptLoading: "defer",
      favicon: "",
      meta: {},
      base: {},
      minify: {
        caseSensitive: true,
        collapseBooleanAttributes: true,
        collapseInlineTagWhitespace: true,
        collapseWhitespace: true,
        conservativeCollapse: true,
        decodeEntities: true,
        html5: true,
        keepClosingSlash: true,
        minifyCSS: true,
        minifyJS: true,
        minifyURLs: true,
        noNewlinesBeforeTagClose: true,
        removeAttributeQuotes: true,
        removeComments: true,
        removeEmptyAttributes: true,
        removeOptionalTags: true,
        removeRedundantAttributes: true,
        sortAttributes: true,
        sortClassName: true,
        trimCustomFragments: true,
        useShortDoctype: true,
      },
      hash: false,
      cache: true,
      showErrors: process.env.NODE_ENV !== "production",
      chunks: ["index"],
      chunksSortMode: "auto",
      excludeChunks: "",
      xhtml: true,
    },
  },

  css: {
    loaderOptions: {
      css: {},
    },
    extract: {
      filename:
        process.env.NODE_ENV === "production"
          ? "[contenthash].css"
          : "css/[name][id].css",
      chunkFilename:
        process.env.NODE_ENV === "production"
          ? "[contenthash].css"
          : "css/[name][id].css",
      ignoreOrder: false,
      insert: "document.head.appendChild(linkTag)",
      attributes: {},
      linkType: "text/css",
      runtime: false,
      experimentalUseImportModule: undefined,
    },
    sourceMap: process.env.NODE_ENV !== "production",
  },

  chainWebpack: (config) => {
    config.resolve.alias.set("§", path.resolve(__dirname, "resources"));

    config.module
      .rule("ejs")
      .test(/\.ejs$/)
      .use("ejs-loader")
      .loader("ejs-loader")
      .set("options", {
        esModule: false,
      });
    config.module
      .rule("hbs")
      .test(/\.hbs$/)
      .use("html-loader")
      .loader("html-loader")
      .set("options", {
        sources: true,
        preprocessor: async (content, loaderContext) => {
          let result;
          try {
            result = await Handlebars.compile(content)({
              /* HBS parameters here */
            });
          } catch (error) {
            await loaderContext.emitError(error);
            return content;
          }
          return result;
        },
        minimize: process.env.NODE_ENV === "production",
        esModule: false,
      });
    config.module.rule("svg").set("generator", {
      filename:
        process.env.NODE_ENV === "production"
          ? "[contenthash][ext]"
          : "img/[name][id][ext]",
    });
    config.module.rule("images").set("generator", {
      filename:
        process.env.NODE_ENV === "production"
          ? "[contenthash][ext]"
          : "img/[name][id][ext]",
    });
    config.module.rule("media").set("generator", {
      filename:
        process.env.NODE_ENV === "production"
          ? "[contenthash][ext]"
          : "media/[name][id][ext]",
    });
    config.module.rule("fonts").set("generator", {
      filename:
        process.env.NODE_ENV === "production"
          ? "[contenthash][ext]"
          : "fonts/[name][id][ext]",
    });

    config.plugin("WebpackDefinePlugin").use(webpack.DefinePlugin, [
      {
        VUE_APP_URL: JSON.stringify("http://localhost:8080/"),
        VUE_APP_WS_URL: JSON.stringify("ws://localhost:8080/"),
      },
    ]);
    config.plugin("WebpackProvidePlugin").use(webpack.ProvidePlugin, [
      {
        _: "underscore",
      },
    ]);

    config.plugin("BundleAnalyzerPlugin").use(BundleAnalyzerPlugin, [
      {
        analyzerMode: "server",
        analyzerHost: "localhost",
        alalyzerPort: 8888,
        reportFilename: "report.html",
        reportTitle: "BundleAnalyzer",
        defaultSizes: "parsed",
        openAnalyzer: false,
        generateStatsFile: false,
        statsFilename: "stats.json",
        statsOptions: null,
        excludeAssets: null,
        logLevel: "info",
      },
    ]);

    if (process.env.NODE_ENV === "production") {
      config.plugin("PreloadWebpackPlugin").use(PreloadWebpackPlugin, [
        {
          rel: "preload",
          as(entry) {
            if (/\.(css)$/.test(entry)) return "style";
            if (/\.(eot|woff|woff2|ttf)$/.test(entry)) return "font";
            if (/\.(avif|gif|jpeg|png|svg|webp)$/.test(entry)) return "image";
            return "script";
          },
          include: "asyncChunks",
        },
      ]);
    }
  },

  configureWebpack: (config) => {
    (config.devtool =
      process.env.NODE_ENV === "production" ? false : "source-map"),
      Object.assign(config.optimization, {
        chunkIds: "total-size",
        concatenateModules: process.env.NODE_ENV === "production",
        emitOnErrors: false,
        flagIncludedChunks: process.env.NODE_ENV === "production",
        innerGraph: process.env.NODE_ENV === "production",
        mangleExports: process.env.NODE_ENV === "production" ? "size" : false,
        mangleWasmImports: process.env.NODE_ENV === "production",
        mergeDuplicateChunks: process.env.NODE_ENV === "production",

        minimize: process.env.NODE_ENV === "production",

        minimizer: [
          new TerserPlugin({
            test: /\.js(\?.*)?$/i,
            include: undefined,
            exclude: undefined,
            parallel: true,
            minify: TerserPlugin.terserMinify,
            terserOptions: {
              ecma: 2016,
              enclose: false,
              parse: {
                bare_returns: true,
                html5_comments: true,
                shebang: true,
                spidermonkey: false,
              },
              compress: {
                defaults: true,
                arrows: true,
                arguments: true,
                booleans: true,
                booleans_as_integers: false,
                collapse_vars: true,
                comparisons: true,
                computed_props: true,
                conditionals: true,
                dead_code: true,
                directives: true,
                drop_console: true,
                drop_debugger: true,
                ecma: 2016,
                evaluate: true,
                expression: false,
                global_defs: {},
                hoist_funs: false,
                hoist_props: true,
                hoist_vars: false,
                if_return: true,
                inline: true,
                join_vars: true,
                keep_classnames: false,
                keep_fargs: true,
                keep_fnames: false,
                keep_infinity: false,
                loops: true,
                module: false,
                negate_iife: true,
                passes: 10,
                properties: true,
                pure_funcs: [],
                pure_getters: "strict",
                reduce_vars: true,
                reduce_funcs: true,
                sequences: true,
                side_effects: true,
                switches: true,
                toplevel: false,
                top_retain: null,
                typeofs: true,

                unsafe: true,
                unsafe_arrows: true,
                unsafe_comps: true,
                unsafe_Function: true,
                unsafe_methods: true,
                unsafe_proto: true,
                unsafe_regexp: true,
                unsafe_undefined: true,
                unused: true,
              },
              mangle: true,
              module: true,
              output: {
                comments: false,
              },
              format: null,
              sourceMap: false,
              toplevel: false,
              nameCache: null,
              ie8: false,
              keep_classnames: undefined,
              keep_fnames: false,
              safari10: false,
            },
            extractComments: false,
          }),
          "...",
          new CssMinimizerWebpackPlugin({
            test: /\.foo\.css$/i,
            include: undefined,
            exclude: undefined,
            parallel: false,
            minify: [
              CssMinimizerWebpackPlugin.cssoMinify,
              CssMinimizerWebpackPlugin.cssnanoMinify,
              CssMinimizerWebpackPlugin.cleanCssMinify,
            ],
            minimizerOptions: [
              {
                restructure: true,
              },
              {
                preset: cssNanoPresetAdvanced,
              },
              {
                level: {
                  1: {
                    roundingPrecision: "all=5",
                  },
                  2: {},
                },
              },
            ],
          }),
          "...",
          new ImageMinimizerPlugin({
            test: /.(svg)$/i,
            include: undefined,
            exclude: undefined,
            minimizer: {
              implementation: ImageMinimizerPlugin.imageminMinify,
              filter: () => true,
              filename: "[path][name][ext]",
              options: {
                plugins: ["imagemin-svgo"],
                encodeOptions: {},
              },
            },
            /*
              ? Do you prefer compile-time image rerendering or designer will give me the most optimized images?
              generator: [
                {
                  preset: "avif",
                  implementation: ImageMinimizerPlugin.squooshGenerate,
                  options: {
                    encodeOptions: {
                      avif: {
                        cqLevel: 33,
                      },
                    },
                  },
                },
              ],*/
            severityError: "error",
            loader: true,
            deleteOriginalAssets: true,
          }),
        ],
        moduleIds: process.env.NODE_ENV === "production" ? "size" : "named",
        portableRecords: true,
        providedExports: process.env.NODE_ENV === "production",
        realContentHash: process.env.NODE_ENV === "production",
        removeAvailableModules: process.env.NODE_ENV === "production",
        removeEmptyChunks: process.env.NODE_ENV === "production",
        runtimeChunk: false,
        sideEffects: process.env.NODE_ENV === "production",
        splitChunks:
          process.env.NODE_ENV === "production"
            ? {
                chunks: "all",

                maxAsyncRequests: 32,
                maxInitialRequests: 32,

                minChunks: 1,
                hidePathInfo: true,

                //? Do I need to increase performance by increasing the final size after compression?
                //minSize: 51200,
                //minSizeReduction: 10240,
                // enforceSizeThreshold: 51200,
                minRemainingSize: 0,
                //maxSize: 0,
                name: false,
                usedExports: true,
                cacheGroups: {
                  defaultVendors: {
                    reuseExistingChunk: true,
                    filename: "[contenthash].js",
                  },
                  extractPopupStyles: {
                    name: "style",
                    chunks: (chunk) => chunk.name === "popup",
                  },
                },
              }
            : false,
        usedExports: process.env.NODE_ENV === "production",
      });

    config.plugins.push(addAssetPlugin);

    Object.assign(config.output, {
      hashFunction: "xxhash64",
      hashDigest: "base64url",
      filename:
        process.env.NODE_ENV === "production"
          ? "[contenthash].js"
          : "js/[name][id].js",
      chunkFilename:
        process.env.NODE_ENV === "production"
          ? "[contenthash].js"
          : "js/[name][id].js",
    });
  },

  pluginOptions: {
    i18n: {
      locale: "en",
      fallbackLocale: "en",
      localeDir: "locales",
      enableLegacy: false,
      runtimeOnly: false,
      compositionOnly: false,
      fullInstall: true,
    },
  },
});
