"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// vitest.config.ts
const config_1 = require("vitest/config");
// https://vitejs.dev/config/
exports.default = (0, config_1.defineConfig)({
    test: {
        include: ["**/*.{test,spec}.{ts,tsx}"],
        environment: "node",
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            exclude: [
                "node_modules/",
                "dist/",
            ],
        },
    },
    resolve: {
        alias: {
            "@models": "./src/models",
            "@services": "./src/services",
            "@utils": "./src/utils",
            "@interfaces": "../interfaces",
            "@controllers": "./src/controllers",
            "@routes": "./src/routes",
        },
    }
});
