module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "no-unsafe-finally": "error",
        "no-empty-function": "error",
        "no-empty-pattern": "error",
        "no-lone-blocks": "error",
        "no-labels": "error",
        "no-eval": "error",
        "no-magic-numbers": ["warn", { "ignore": [0,1,-1] }],
        "no-native-reassign": "error",
        "no-new-func": "error",
        "no-multi-spaces": "error",
        "no-extend-native": "error",
        "no-iterator": "error",
        "no-implicit-coercion": "error",
        "no-implicit-globals": "error",
        "no-invalid-this": "error",
        "camelcase": ["warn", {properties: "always"}],
        "no-with": "error",
        "strict": "error",
        "no-unused-vars": ["warn", { "args": "none" }],
        "no-undefined": "error",
        "no-undef-init": "error",
        "no-undef": "error",
        "no-shadow-restricted-names": "error",
        "no-label-var": "error",
        "no-delete-var": "error",
        "no-catch-shadow": "error",
        "handle-callback-err": ["error", "^.*(e|E)rr"],
        "no-new-require": "error",
        "no-new-wrappers": "error",
        "no-proto": "error",
        "no-self-compare": "error",
        "no-sequences": "error",
        "no-throw-literal": "error",
        "no-unmodified-loop-condition":"error",
        "no-useless-call": "error",
        "no-process-env": "warn",
        "no-process-exit":"warn",
        "array-bracket-spacing": ["error", "never"],
        "block-spacing": ["error", "never"],
        "brace-style": ["error", "allman", { "allowSingleLine": true }],
        "new-parens": "error",
        "newline-per-chained-call": ["error"],
        "no-array-constructor": "error",
        "no-mixed-spaces-and-tabs": ["error", "smart-tabs"],
        "no-useless-concat": "error",
        "no-useless-escape": "error",
        "no-void": "error",
        "yoda": ["error", "never", { "exceptRange": true }],
        "no-unused-expressions": [
            "error",
            {
                "allowShortCircuit": true,
                "allowTernary": true
            }
        ],
        "no-return-assign": "error",
        "comma-spacing": [
            "error",
            {
                "before": false,
                "after": true
            }
        ],
        "comma-style":["error", "last"],
        "computed-property-spacing": ["error", "never"],
        "consistent-this": ["error", "self"],
        "indent": ["error", "tab"],
        "key-spacing": ["error", {
            "singleLine": {
                "beforeColon": false,
                "afterColon": true
            },
            "multiLine": {
                "beforeColon": true,
                "afterColon": true,
                "align": "colon"
            }
        }],
        "keyword-spacing": ["error", { "overrides":
        {
            "if": { "after": true },
            "for": { "after": true },
            "while": { "after": true }
        } }],
        "func-style": ["error", "declaration", { "allowArrowFunctions": true }],
        "block-scoped-var":"error",
        "no-else-return": "error",
        "no-nested-ternary": "error",
        "no-new-object": "error",
        "no-spaced-func": "error",
        "no-trailing-spaces": ["error", { "skipBlankLines": true }],
        "no-whitespace-before-property": "error",
        "object-curly-spacing": ["error", "never"],
        "object-property-newline": "error",
        "no-multiple-empty-lines":[
            "error",
            {
                max: 1,
                maxEOF: 1
            }
        ],
        "generator-star-spacing":[
            "error",
            {
                "before": true,
                "after": false
            }
        ],
        "no-console":"off",
        "require-jsdoc": [
            "error", {
                "require": {
                    "FunctionDeclaration": true,
                    "MethodDefinition": false,
                    "ClassDeclaration": false
                }
            }],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "semi-spacing": ["error", { "before": false, "after": true }],
        "space-before-blocks": "error",
        "space-before-function-paren": ["error", "never"],
        "space-in-parens": ["error", "never"],
        "space-infix-ops": "error",
        "spaced-comment": ["error", "always"],
        "arrow-body-style": ["error", "always"],
        "arrow-spacing": ["error", { "before": true, "after": true }],
        "constructor-super": "error",
        "no-class-assign": "error",
        "no-const-assign": "error",
        "no-dupe-class-members": "error",
        "no-duplicate-imports": "error",
        "no-new-symbol": "error",
        "no-this-before-super": "error",
        "no-useless-computed-key": "error",
        "no-useless-constructor": "error",
        "no-var": "error",
        "prefer-const": "error",
        "prefer-rest-params": "error",
        "prefer-spread": "error",
        "prefer-template": "error",
        "template-curly-spacing": "error",
        "yield-star-spacing": ["error", "before"],
        "require-yield": "off"
    }
};