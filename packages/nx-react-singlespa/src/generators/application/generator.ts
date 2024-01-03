import {
  addDependenciesToPackageJson,
  ensurePackage,
  formatFiles,
  GeneratorCallback,
  joinPathFragments,
  logger,
  runTasksInSerial,
  stripIndents,
  Tree,
} from '@nx/devkit';
import {
  ReactSinglespaGeneratorSchema,
  NormalizedReactSinglespaGeneratorSchema,
} from './schema';
import * as chalk from 'chalk';
import { initGenerator as jsInitGenerator } from '@nx/js';
import { applicationGenerator } from '@nx/react';
import { normalizeOptions } from '../lib/normalize-options';
import { updateFiles } from '../lib/update-files';
export async function appGenerator(
  tree: Tree,
  options: ReactSinglespaGeneratorSchema
) : Promise<GeneratorCallback>{
  const tasks: GeneratorCallback[] = [];
  const { organization, ...rest } = options;
  const normalizedOptions: NormalizedReactSinglespaGeneratorSchema =
    await normalizeOptions(tree, options);
  const { projectOrganization, projectName } = normalizedOptions;
  logger.info(`${chalk.bold.yellow('normalizedOptions')} has projectOrganization: ${projectOrganization} and projectName : ${projectName}`)
  // let @nx/react generate content first
  const originalAppGen = await applicationGenerator(tree, rest);
  tasks.push(originalAppGen);
  const jsInit = await jsInitGenerator(tree, {
    skipFormat: true,
  });
  tasks.push(jsInit);
  const updateFilesGen = await updateFiles(tree, normalizedOptions);
  tasks.push(updateFilesGen);
  //TODO add files after the @nx/react generate content

  //TODO update dependencies in package.json after the @nx/react generate content
  //TODO install deps after the @nx/react generate content
  return runTasksInSerial(...tasks);
}

export default appGenerator;
