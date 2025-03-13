// eslint.config.js
const { defineConfig } = require('eslint/config');

module.exports = defineConfig([
	{
		// 全局忽略文件
		ignores: [
			'node_modules/**',
			'.next/**',
			'out/**',
			'build/**',
			'dist/**',
			'public/**',
			'next-env.d.ts',
			'.vercel/**',
		],
	},
	{
		// 所有JavaScript和TypeScript文件的基本配置
		files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
		rules: {
			// 'no-console': 'warn',
			semi: ['warn', 'always'],
			quotes: ['warn', 'single'],
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					vars: 'all',
					varsIgnorePattern: '^_',
					args: 'after-used',
					ignoreRestSiblings: false,
				},
			],
		},
		plugins: {
			'@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
			import: require('eslint-plugin-import'),
		},
		languageOptions: {
			parser: require('@typescript-eslint/parser'),
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
		},
		settings: {
			'import/parsers': {
				'@typescript-eslint/parser': ['.ts', '.tsx'],
			},
		},
	},
	{
		// 导入排序规则
		files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
		rules: {
			'import/order': [
				'warn',
				{
					groups: [
						'builtin',
						'external',
						'internal',
						'parent',
						'sibling',
						'index',
					],
					pathGroups: [
						{
							pattern: 'react',
							group: 'external',
							position: 'before',
						},
					],
					pathGroupsExcludedImportTypes: ['react'],
					'newlines-between': 'always',
					alphabetize: {
						order: 'asc',
						caseInsensitive: true,
					},
				},
			],
		},
	},
]);
