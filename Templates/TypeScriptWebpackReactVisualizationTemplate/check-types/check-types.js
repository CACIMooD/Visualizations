const glob = require("glob");
const {exec} = require("child_process");

/**
 * Run TSC on all ts/x files inside the multiple visualization folders
 */
glob("src/**/tsconfig.json", function (er, files) {
  files.forEach(function (file) {
    console.log(`npx tsc --project ${file} --noEmit --skipLibCheck`)
    const tscheck = exec(`npx tsc --project ${file} --noEmit --skipLibCheck`);
    tscheck.stdout.pipe(process.stdout);
  });
});