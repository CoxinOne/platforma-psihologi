import next from "eslint-config-next/core-web-vitals";

const config = [
  ...next,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "coverage/**",
      ".pgbin/**",
      ".pgdata/**",
      "next-env.d.ts",
    ],
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      // Server Components async și calculele de timp sunt intenționat efectuate
      // la randare; regulile React Compiler nu se aplică acestui model.
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
    },
  },
];

export default config;
