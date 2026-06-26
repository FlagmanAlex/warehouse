// vitest.config.ts
import { defineConfig } from "vitest/config";
import { resolve } from "path";

const r = (p: string) => resolve(__dirname, p);

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
            "@models": r("./src/models"),
            "@services": r("./src/services"),
            "@utils": r("./src/utils"),
            "@interfaces": r("../interfaces"),
            "@controllers": r("./src/controllers"),
            "@routes": r("./src/routes"),
            "@middlewares": r("./src/middlewares"),
            "@warehouse/config": r("../config"),
            "@warehouse/interfaces": r("../interfaces"),
            "@warehouse/interfaces/DTO": r("../interfaces/DTO"),
        },
    }
});
