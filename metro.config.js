const path = require('path');
const fs = require('fs');
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const reactI18nextCjs = path.resolve(__dirname, 'node_modules/react-i18next/dist/commonjs');

const defaultResolve = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-i18next') {
    return {
      filePath: path.join(reactI18nextCjs, 'index.js'),
      type: 'sourceFile',
    };
  }

  const origin = context.originModulePath ?? '';
  if (origin.includes(`${path.sep}react-i18next${path.sep}`) && moduleName.startsWith('.')) {
    const base = path.dirname(origin);
    const candidates = [
      path.resolve(base, moduleName),
      path.resolve(base, `${moduleName}.js`),
      path.resolve(base, moduleName.replace(/\.js$/, '') + '.js'),
    ];
    for (const filePath of candidates) {
      if (fs.existsSync(filePath)) {
        return { filePath, type: 'sourceFile' };
      }
    }
  }

  if (defaultResolve) {
    return defaultResolve(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
