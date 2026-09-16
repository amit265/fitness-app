const { withProjectBuildGradle, withGradleProperties } = require('@expo/config-plugins');

module.exports = function withAndroidResolutionStrategy(config) {
  // 1. Patch root build.gradle for dependency resolution and supportLibVersion
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

  // 2. Patch gradle.properties to ensure JVM memory is large enough for native builds
  config = withGradleProperties(config, (config) => {
    const props = config.modResults;

    const setOrReplace = (key, value) => {
      const idx = props.findIndex((p) => p.type === 'property' && p.key === key);
      if (idx >= 0) {
        props[idx].value = value;
      } else {
        props.push({ type: 'property', key, value });
      }
    };

    setOrReplace('org.gradle.jvmargs', '-Xmx6144m -XX:MaxMetaspaceSize=2048m -XX:+HeapDumpOnOutOfMemoryError');
    setOrReplace('org.gradle.daemon', 'true');
    setOrReplace('org.gradle.parallel', 'true');
    setOrReplace('org.gradle.configureondemand', 'true');

    return config;
  });

  return config;
};
