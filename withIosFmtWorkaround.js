const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withIosFmtWorkaround(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const file = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      if (fs.existsSync(file)) {
        let contents = fs.readFileSync(file, 'utf8');

        // Remove global use_modular_headers! if present to prevent react_runtime module redefinition
        contents = contents.replace(/^use_modular_headers!\n?/m, '');

        // Inject selective modular headers for Firebase/Google pods
        const firebaseModularHeaders = `
  pod 'GoogleUtilities', :modular_headers => true
  pod 'FirebaseCoreInternal', :modular_headers => true
  pod 'FirebaseCore', :modular_headers => true
  pod 'FirebaseAppCheckInterop', :modular_headers => true
  pod 'FirebaseCoreExtension', :modular_headers => true
`;
        if (!contents.includes("pod 'GoogleUtilities'")) {
          contents = contents.replace(
            /use_expo_modules!/g,
            `use_expo_modules!\n${firebaseModularHeaders}`
          );
        }

        // Append a new post_install block for the fmt workaround.
        // CocoaPods supports multiple post_install hooks — they all run.
        // This is safer than trying to inject inside an existing block via regex.
        if (!contents.includes("CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'")) {
          const workaround = `
# WORKAROUND FOR XCODE 16 / XCODE 26 FMT CONSTEVAL BUG
post_install do |installer|
  installer.pods_project.targets.each do |target|
    if target.name == 'fmt'
      target.build_configurations.each do |config|
        config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
      end
    end
  end
end
`;
          contents = contents.trimEnd() + '\n' + workaround;
          fs.writeFileSync(file, contents);
        }
      }
      return config;
    },
  ]);
};
