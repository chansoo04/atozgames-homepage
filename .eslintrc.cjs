// .eslintrc.cjs
module.exports = {
    root: true,
    env: { node: true, browser: true, es2022: true },
    parserOptions: { ecmaVersion: "latest", sourceType: "module" },
    plugins: [],
    extends: [],
    ignorePatterns: ["dist", ".next", "node_modules"],
    overrides: [
        {
            files: ["packages/web/**/*.{ts,tsx}"],
            extends: ["next/core-web-vitals", "plugin:@typescript-eslint/recommended"]
        },
        {
            files: ["packages/backend/**/*.ts"],
            extends: ["plugin:@typescript-eslint/recommended",
                "eslint-config-nestjs",   // Nest 전용 규칙&#8203;:contentReference[oaicite:5]{index=5}
                "prettier"]
        }
    ]
};
