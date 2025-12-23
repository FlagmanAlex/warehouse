// vitest.config.ts
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
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
