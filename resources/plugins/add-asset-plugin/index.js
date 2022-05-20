const webpack = require("webpack");

class AddAssetPlugin {
  assets = [];

  constructor(data = []) {
    this.assets.concat(data);
  }

  //? Todo: [unsafe undocumented api] allow user to push asset at any compiler hook
  //? Todo: [unsafe undocumented api] allow user to push asset at any compilation hook
  //? Todo: [unsafe undocumented api] allow use to push asset at any stage

  //Todo: Allow user to push asset at all documented stages

  //!Temporary Api
  addBeforeCompression(fileName, content) {
    this.assets.push({
      compilerHook: "thisCompilation",
      compilationHook: "processAssets",
      stage: webpack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
      fileName: fileName,
      content: content,
    });
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap("AddAssetPlugin", (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: "AddAssetPlugin",
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
        },
        () => {
          this.assets.forEach(function (asset) {
            compilation.emitAsset(
              asset.fileName,
              new webpack.sources.RawSource(asset.content)
            );
          });
        }
      );
    });
  }
}

module.exports = AddAssetPlugin;
