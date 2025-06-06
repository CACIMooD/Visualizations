//
// Generate files that require Globally Unique IDentifiers (GUIDs)
// from Embedded JavaScript (EJS) templates
// 
var ejs = require('ejs');
var uuid = require('uuid');
var fs = require('fs');
//
// Get the source template and destination file paths
//
var files = [{ srcPath: "./src/no-guid.package.json.ejs", destPath: "./src/package.json.ejs" }]
    .concat(fs
        .readdirSync(__dirname + '/../src')
        .filter(d => fs.lstatSync(__dirname + '/../src/' + d).isDirectory())
        .map(function (d) {
            return {
                srcPath: "./src/" + d + "/no-guid.visualization.config.json.ejs",
                destPath: "./src/" + d + "/visualization.config.json.ejs"
            }
        }));
//
// Loop to generate files
// Report error if source file doesn't exists
// Report error if destination file already exists
//
files.forEach(generate);

function generate(item) {
    let outStr;

    if (!fs.existsSync(item.srcPath))
    {
        return console.log('Error: file ' + item.srcPath + ' doesn\'t exists');
    }

    if (fs.existsSync(item.destPath))
    {
        return console.log('Error: file ' + item.destPath + ' already exists');
    }

    ejs.renderFile(item.srcPath, { uuid: uuid }, function(err, str) {
        if (err) {
            return console.log(err);
        }
        outStr = str;
    });
    
    fs.writeFile(item.destPath, outStr, function(err) {
        if (err) {
            return console.log(err);
        }
    });
}