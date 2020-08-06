const path = require("path");
module.exports = require("@jsdevtools/karma-config")({
    tests: ["src/**/*.ts", "test/**/*.test.ts"],
    browsers: {
        safari: Boolean(process.env.CI)
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
        }
    }
});
