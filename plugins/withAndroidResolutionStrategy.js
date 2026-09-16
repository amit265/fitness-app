const { withProjectBuildGradle } = require('@expo/config-plugins');

module.exports = function withAndroidResolutionStrategy(config) {
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      let updatedBuildGradle = config.modResults.contents;
      
      // Fix for react-native-iap plugin that injects supportLibVersion in Android root build.gradle
      if (updatedBuildGradle.includes('supportLibVersion = "28.0.0"')) {
        console.log('[withAndroidResolutionStrategy] Removing invalid supportLibVersion');
      }
      updatedBuildGradle = updatedBuildGradle.replace(/supportLibVersion = "28\.0\.0"\s*/g, '');

      if (updatedBuildGradle.includes('force "androidx.core:core:')) {
        updatedBuildGradle = updatedBuildGradle.replace(/force "androidx\.core:core:[0-9.]+"/g, 'force "androidx.core:core:1.17.0"');
        updatedBuildGradle = updatedBuildGradle.replace(/force "androidx\.core:core-ktx:[0-9.]+"/g, 'force "androidx.core:core-ktx:1.17.0"');
      } else {
        updatedBuildGradle = updatedBuildGradle.replace(
          /allprojects\s*{/,
          `allprojects {
  configurations.all {
    resolutionStrategy {
      force "androidx.core:core:1.17.0"
      force "androidx.core:core-ktx:1.17.0"
    }
  }`
        );
      }
      config.modResults.contents = updatedBuildGradle;
    }
    return config;
  });

  return config;
};
