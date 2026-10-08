const {withAppBuildGradle}=require('expo/config-plugins');

// Codegen's absolute source paths can exceed older Windows Ninja limits.
// Let CMake hash object directories; keep the change reproducible via prebuild.
module.exports=function withShortCmakePaths(config) {
 return withAppBuildGradle(config,c=>{
  const marker='// AI Learning: short native staging and modern Ninja';
  if(c.modResults.contents.includes(marker)) return c;
  const anchor='defaultConfig {';
  if(!c.modResults.contents.includes(anchor)) throw new Error('Android defaultConfig anchor changed; review the CMake path plugin.');
  if(!c.modResults.contents.includes('CMAKE_OBJECT_PATH_MAX')) c.modResults.contents=c.modResults.contents.replace(anchor,`${anchor}\n        externalNativeBuild {\n            cmake { arguments "-DCMAKE_OBJECT_PATH_MAX=240" }\n        }`);
  c.modResults.contents=c.modResults.contents.replace('android {',`android {\n    ${marker}\n    if (System.getProperty("os.name").toLowerCase().contains("windows")) {\n        externalNativeBuild {\n            cmake { buildStagingDirectory new File(System.getProperty("java.io.tmpdir"), "ai-learning-cxx") }\n        }\n        def modernNinja = new File(rootDir, "../tools/ninja/ninja.exe")\n        if (modernNinja.exists()) {\n            defaultConfig { externalNativeBuild { cmake { arguments "-DCMAKE_MAKE_PROGRAM=" + modernNinja.absolutePath } } }\n        }\n    }`);
  return c;
 });
};
