// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
//const { resolve } = require('path');

const config = getDefaultConfig(__dirname);


/** Удалили алиасы после создания интерфейсов как отдельного пакета
 * 
// Добавляем алиасы
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@interfaces': resolve(__dirname, '../interfaces'),
};

// Или, более современный способ — через `resolver.alias` (лучше)
config.resolver.alias = {
  ...config.resolver.alias,
  '@interfaces': resolve(__dirname, '../interfaces'),
};

*/

module.exports = config;