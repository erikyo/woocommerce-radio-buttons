/**
 * Set WordPress presets
 */

const eslintConfig = {
	extends: ['plugin:@wordpress/eslint-plugin/recommended'],
	globals: {
		jQuery: true,
		$: true,
	},
	rules: {
		'padding-line-between-statements': [
			'error',
			{
				blankLine: 'always',
				prev: ['const', 'let', 'var'],
				next: 'return',
			},
			{
				blankLine: 'any',
				prev: ['const', 'let', 'var'],
				next: ['const', 'let', 'var'],
			},
		],
		'max-len': ['error', { code: 120, tabWidth: 8 }],
	},
};

eslintConfig.parserOptions = {
	ecmaVersion: 6,
	babelOptions: {
		presets: [require.resolve('@wordpress/babel-preset-default')],
	},
};

module.exports = eslintConfig;
