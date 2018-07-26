module.exports = {
    extends: 'google',
    parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
      },
      rules: {
        'max-len': 'off',
        'new-cap': 'off',
        'require-jsdoc': 'off',
      },
      plugins: [
        'html',
      ]
    
};