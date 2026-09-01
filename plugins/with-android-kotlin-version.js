const { createRunOncePlugin, withProjectBuildGradle } = require('@expo/config-plugins');

const PLUGIN_NAME = 'with-android-kotlin-version';
const DEFAULT_KOTLIN_VERSION = '2.3.0';

function applyKotlinVersion(buildGradle, kotlinVersion) {
  let contents = buildGradle;

  if (!contents.includes("ext {\n    kotlinVersion = '" + kotlinVersion + "'\n  }")) {
    contents = contents.replace(
      /buildscript\s*\{\n/,
      `buildscript {\n  ext {\n    kotlinVersion = '${kotlinVersion}'\n  }\n`
    );
  }

  contents = contents.replace(
    "classpath('org.jetbrains.kotlin:kotlin-gradle-plugin')",
    `classpath(\"org.jetbrains.kotlin:kotlin-gradle-plugin:\${kotlinVersion}\")`
  );

  return contents;
}

function withAndroidKotlinVersion(config, props = {}) {
  const kotlinVersion = props.version || DEFAULT_KOTLIN_VERSION;

  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language !== 'groovy') {
      return config;
    }

    config.modResults.contents = applyKotlinVersion(config.modResults.contents, kotlinVersion);
    return config;
  });
}

module.exports = createRunOncePlugin(
  withAndroidKotlinVersion,
  PLUGIN_NAME,
  '1.0.0'
);
