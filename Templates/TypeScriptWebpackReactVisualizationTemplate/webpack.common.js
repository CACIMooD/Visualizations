const CopyPlugin = require('copy-webpack-plugin');
const VersionFile = require('webpack-version-file-plugin'); // Used to write package version number into visualization config
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const path = require('path');
const outputPath = path.join(__dirname, 'dist');
const fs = require('fs');

module.exports = {
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            "@babel/react", 
                            "@babel/typescript",
                            [
                                '@babel/preset-env',
                                {
                                    useBuiltIns: 'usage',
                                    corejs: '3.19',
                                    forceAllTransforms: false,
                                    targets: {
                                        chrome: 34,
                                        ie: 11,
                                        edge: 20,
                                        firefox: 30,
                                    },
                                    modules: false
                                }
                            ]
                        ],
                        plugins: [
                        ],
                    }
                }
            },            
            {
                test: /\.js$/,
                use: ["source-map-loader"],
                enforce: "pre",
            },
            {
                test: /\.css$/i,
                use: ["style-loader", {
                    loader: "css-loader",
                    options: {
                        modules: {
                            localIdentName: '[local]'
                        }
                    }
                }],
            }
        ],
    },
    resolve: {
        plugins: getResolvers(),
        extensions: [".tsx", ".ts", ".js"],
    },
    entry: fs.readdirSync(path.join(__dirname, 'src'))
        .filter(d => fs.lstatSync(path.join(__dirname, 'src', d)).isDirectory())
        .filter(d => fs.readdirSync(path.join(__dirname, 'src', d)).find(d => d === 'visualization.config.json'))
        .reduce(function (prev, current) {
            prev[current] = path.join(
                __dirname,
                'src',
                current,
                require('./src/' + current + '/visualization.config.json').webpackEntry
            );
            return prev;
        }, {}),
    output: {
        filename: '[name]/visualization.js',
        path: outputPath,
        environment: {
            arrowFunction: false,
            bigIntLiteral: false,
            const: false,
            destructuring: false,
            dynamicImport: false,
            forOf: false,
            module: false
        },
        //libraryTarget: "var",
        library: 'vis',
        hashFunction: "sha256"
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                "react" : {
                    test: /[\\/]node_modules[\\/](react.*)[\\/]/,
                    name: 'react',
                    chunks: 'all',
                    priority: 1,
                    enforce: true
                },
                "other" : {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'other',
                    chunks: 'all',
                    priority: -10,
                    enforce: true
                }
            }
        }
    },
    plugins: getPlugins()
};

function getPlugins() {
    class VisualizationDirectory
    {
        constructor(dirName) {
            this.directoryName = dirName;

            this.ejsFiles = fs.readdirSync(path.join(__dirname, 'src', dirName))
                            .filter(f => path.extname(f) === '.ejs');
        }
        containsEJS() {
            return this.ejsFiles.length > 0
        }
        imageFiles() {
            return fs.readdirSync(
                        path.join(__dirname,
                        'src',
                        this.directoryName))
                    .filter(f => path.extname(f) == '.png');
                }
        cssFiles() {
            return fs.readdirSync(
                        path.join(__dirname,
                        'src',
                        this.directoryName))
                    .filter(f => path.extname(f) == '.css');
                }
        configFiles() {
            return [
                'visualization.config.json',
                'visualization.datashape.gql'
            ]
        }
    }

    let VisualizationDirectories = fs.readdirSync(path.join(__dirname, 'src'))
        .filter(d => fs.lstatSync(path.join(__dirname, 'src', d)).isDirectory())
        .map(d => new VisualizationDirectory(d));
//
// VersionFile for visualization package configuration
//
  let vpcVersionFile = Object(new VersionFile({
    packageFile: path.join(__dirname, 'package.json'),
    template: path.join(__dirname, 'src/package.json.ejs'),
    outputFile: path.join(__dirname, 'src/package.json')
  }));
//
//  VersionFiles for each visualization configuration
//
  let vcVersionFiles = VisualizationDirectories
    .filter(d => d.containsEJS() === true)
    .map(d => Object(new VersionFile({
        packageFile: path.join(__dirname, 'package.json'),
        template: path.join(__dirname, 'src', d.directoryName, 'visualization.config.json.ejs'),
        outputFile: path.join(__dirname, 'src', d.directoryName, 'visualization.config.json')
        })));
//
// CopyPlugin for visualization package configuration
//
    let copyPatterns = [getCopyPluginOption('', 'package.json')]
//
// CopyPlugin for each visualization configuration
//
    VisualizationDirectories
        .filter(d => d.containsEJS() === true)
        .map(d => d.configFiles().forEach(f => copyPatterns.push(getCopyPluginOption(d.directoryName, f))))
//
// CopyPlugin for each visualization image file
//
    VisualizationDirectories
        .map(d => d.imageFiles().forEach(f => copyPatterns.push(getCopyPluginOption(d.directoryName, f))))
//
// CopyPlugin for each CSS file
//
    VisualizationDirectories
        .map(d => d.cssFiles().forEach(f => copyPatterns.push(getCopyPluginOption(d.directoryName, f))))

let copyPlugins = Object(new CopyPlugin({
    patterns: copyPatterns
}))

return [vpcVersionFile, copyPlugins].concat(vcVersionFiles);
}

function getResolvers() {
  //
  // tsconfig-paths-webpack-plugin for each visualization project file
  //
  return fs.readdirSync(path.join(__dirname, 'src'))
        .filter(d => fs.lstatSync(path.join(__dirname, 'src', d)).isDirectory())
        .map(d => new TsconfigPathsPlugin({ configFile: path.join(__dirname, 'src', d, "tsconfig.json")}));
}

/**
 * 
 * @param {string} directoryName - name of sub-directory containing file or empty
 * @param {string} fileName - name of file
 */
function getCopyPluginOption(directoryName, fileName)
{
    return {
        context: __dirname,
        from: path.join('src', directoryName, fileName),
        to: path.join(directoryName, fileName)
    };
}
