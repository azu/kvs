console.log("SAUCE_USERNAME", process.env.SAUCE_USERNAME);
module.exports = require("@jsdevtools/karma-config")({
    tests: ["src/**/*.ts", "test/**/*.test.ts"],
    browsers: Boolean(process.env.CI) ? {} : { safari: false },
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
