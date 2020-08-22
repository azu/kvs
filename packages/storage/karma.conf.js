module.exports = require("@jsdevtools/karma-config")({
    tests: ["src/**/*.ts", "test/**/*.test.ts"],
    browsers: Boolean(process.env.CI)
        ? {
              firefox: true,
              chrome: true,
              safari: false
              // MSEdge does not work correctly
              // edge: false,
          }
        : {
              // manually attach to test bed
              firefox: false,
              chrome: false,
              edge: false,
              safari: false
          },
    config: {
        webpack: {
            resolve: {
                extensions: [".js", ".jsx", ".ts", ".tsx"]
            },
            mode: "development",
            module: {
                rules: [{ test: /\.ts$/, use: "ts-loader" }]
            }
        },
        client: {
            mocha: {
                timeout: 5 * 1000 // 5 sec
            }
        }
    }
});
