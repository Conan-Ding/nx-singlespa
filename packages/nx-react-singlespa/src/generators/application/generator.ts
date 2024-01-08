import {
  formatFiles,
  GeneratorCallback,
  logger,
  runTasksInSerial,
  Tree,
  getWorkspaceLayout,
} from '@nx/devkit';
import {
  ReactSinglespaGeneratorSchema,
  NormalizedReactSinglespaGeneratorSchema,
} from './schema';
import * as chalk from 'chalk';
import { applicationGenerator } from '@nx/react';
import { normalizeOptions } from '../lib/normalize-options';
import {
  addSingleSpaFiles,
  updateFilesGenerator,
} from '../lib/update-files';
// default generator
export async function appGenerator(
  tree: Tree,
  options: ReactSinglespaGeneratorSchema
): Promise<GeneratorCallback> {
  logger.info(chalk.green('appGenerator: start to generate app'));
  const tasks: GeneratorCallback[] = [];
  const { organization, ...rest } = options;
  // normalize the options
  const normalizedOptions: NormalizedReactSinglespaGeneratorSchema =
    await normalizeOptions(tree, options);
  // if appDir exists in nx.json, use it, ensure all the files from original generator are in the same directory
  const { appsDir } = getWorkspaceLayout(tree);
  if(appsDir) {
    rest.directory = '.';
  }
  // first step, call original generator
  const originalAppGen = await applicationGenerator(tree, rest);
  tasks.push(originalAppGen);
  // add more files
  addSingleSpaFiles(tree, normalizedOptions);

  // update files
  const updateFilesGen = await updateFilesGenerator(tree, normalizedOptions);
  tasks.push(updateFilesGen);

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
  return runTasksInSerial(...tasks);
}

export default appGenerator;
