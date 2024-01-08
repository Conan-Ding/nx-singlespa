const fs = require('fs');
const path = require('path');
import { exec } from 'child_process';
import { initGenerator } from '@nx/js';
import {
  Tree,
  names,
  generateFiles,
  joinPathFragments,
  GeneratorCallback,
  logger,
  readJsonFile,
  writeJsonFile,
  workspaceRoot,
} from '@nx/devkit';
import { NormalizedReactSinglespaGeneratorSchema } from '../application/schema';

export function shouldIgnoreFile(fileName: string, pattern?: RegExp): boolean {
  // const ignoreRegex = /^\./;
  const ignoreList = [
    'node_modules',
    'dist',
    'build',
    'coverage',
    'README.md',
    'package.json',
    'package-lock.json',
    'yarn.lock',
  ];

  return pattern
    ? ignoreList.includes(fileName) || pattern.test(fileName)
    : ignoreList.includes(fileName);
}

export function lookupRootConfigFile(
  dir: string,
  projectName: string,
  targetFileName: string,
  ignorePattern?: RegExp
): string | null {
  const isCurrDirectory = fs.statSync(dir).isDirectory();
  const pathArr = dir.split('/');
  const curr = pathArr[pathArr.length - 1];
  const parent = pathArr[pathArr.length - 2];
  // just ignore the files in the ignore list
  if (shouldIgnoreFile(curr, ignorePattern)) {
    return null;
  }
  // if the current file is not directory, we should check if it is the target file
  if (!isCurrDirectory) {
    return curr === targetFileName && parent === projectName ? dir : null;
  }
  // when it is directy, look into the children files
  const children = fs.readdirSync(dir);
  for (const child of children) {
    const childPath = path.join(dir, child);
    const result = lookupRootConfigFile(childPath, projectName, targetFileName);
    if (result) {
      return result;
    }
  }
}

// update ts config for single spa
export function updateTsConfig(
  tree: Tree,
  options: NormalizedReactSinglespaGeneratorSchema
): void {
  const tsConfigFile = lookupRootConfigFile(
    tree.root,
    options.projectName,
    'tsconfig.json',
    /^\./
  );
  // call readJsonFile to read directly from the path. cannot read with readJson
  const tsConfigJson = readJsonFile(tsConfigFile);
  tsConfigJson.references = [];
  tsConfigJson.includes = ['declarations.d.ts', 'src/**/*'];
  // update the JSON file
  writeJsonFile(tsConfigFile, tsConfigJson);
}
// update the babel rc add necessary presets and plugins for single spa
export function updateBabelrc(
  tree: Tree,
  options: NormalizedReactSinglespaGeneratorSchema
): void {
  const babelrcFile = lookupRootConfigFile(
    tree.root,
    options.projectName,
    '.babelrc'
  );
  if (!fs.existsSync(babelrcFile)) {
    throw new Error(
      `NX: Could not find .babelrc files in for project ${options.projectName}.`
    );
  }
  const babelrcJson = readJsonFile(babelrcFile);
  babelrcJson.presets = [
    ...babelrcJson.presets,
    '@babel/preset-env',
    '@babel/preset-react',
    '@babel/preset-typescript',
  ];
  babelrcJson.plugins = [
    ...babelrcJson.plugins,
    '@babel/plugin-syntax-dynamic-import',
    ['@babel/plugin-transform-private-methods', { loose: true }],
    ["@babel/plugin-transform-class-properties", { "loose": true }],
    ["@babel/plugin-transform-private-property-in-object", { "loose": true }]
  ];
  writeJsonFile(babelrcFile, babelrcJson);
}
// update package.json
export function updatePackageJson(tree: Tree, options: NormalizedReactSinglespaGeneratorSchema): void {
  const pkgJsonPath = joinPathFragments(workspaceRoot, 'package.json');
  if (!fs.existsSync(pkgJsonPath)) {
    throw new Error(
      'NX: Could not find root package.json to determine dependency versions.'
    );
  }
  const packageJson = readJsonFile(pkgJsonPath);
  packageJson.dependencies = {
    ...packageJson.dependencies,
    mobx: '^6.12.0',
    'single-spa': '^6.0.0',
    '@reduxjs/toolkit': '^1.9.7',
    'react-redux': '^8.1.3',
  };
  packageJson.devDependencies = {
    ...packageJson.devDependencies,
    'single-spa-react': '^5.1.4',
    'webpack-config-single-spa-react': '^4.0.4',
    '@babel/plugin-syntax-dynamic-import': '^7.8.3',
    '@babel/preset-env': '^7.23.3',
    '@babel/preset-react': '^7.23.3',
    'babel-jest': '^29.4.1',
  };
  const {
    projectParentDirectory,
    projectName,
  } = options;
  const webpackBasePath = joinPathFragments(projectParentDirectory, projectName)
  packageJson.scripts[`run:single-spa-${options.projectName}`] = `webpack serve --config ${webpackBasePath}/extra-webpack.config.js`;
  writeJsonFile(pkgJsonPath, packageJson);
  process.chdir(workspaceRoot);

  exec('npm install', (error, stdout, stderr) => {
    // Handle error, stdout, and stderr as before
  });
}

// TODO remove unnecessary default files
export async function removeFiles(
  tree: Tree,
  options: NormalizedReactSinglespaGeneratorSchema
) {
  await initGenerator(tree, options);
}
// add files from template for single spa support
export function addSingleSpaFiles(
  tree: Tree,
  options: NormalizedReactSinglespaGeneratorSchema
) {
  const {
    appProjectRoot,
    projectOrganization,
    projectName,
    projectParentDirectory,
  } = options;
  // console.log(options.projectRoot)
  const templateOptions = {
    ...options,
    ...names(projectOrganization),
    ...names(projectName),
    templ: '',
  };
  const srcPath = joinPathFragments(__dirname, '..', 'application', 'files');
  const targetPath = projectParentDirectory ? joinPathFragments(projectParentDirectory, projectName) : joinPathFragments(appProjectRoot);
  generateFiles(tree, srcPath, targetPath, templateOptions);
}
export async function updateFilesGenerator(
  tree: Tree,
  options: NormalizedReactSinglespaGeneratorSchema
): Promise<GeneratorCallback> {
  return () => {
    updateTsConfig(tree, options);
    updateBabelrc(tree, options);
    updatePackageJson(tree, options);
  };
}
export default updateFilesGenerator;
