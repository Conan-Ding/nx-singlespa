import { normalizeOptions as _normalizeOptions } from '@nx/react/src/generators/application/lib/normalize-options';
import { Tree, getWorkspaceLayout } from '@nx/devkit';
import { ReactSinglespaGeneratorSchema, NormalizedReactSinglespaGeneratorSchema } from '../application/schema';

export  async function normalizeOptions(tree: Tree, options: ReactSinglespaGeneratorSchema): Promise<NormalizedReactSinglespaGeneratorSchema> {
    const { appsDir } = getWorkspaceLayout(tree);
    const { organization, ...rest } = options;
    const _normalizedOptions = await _normalizeOptions(tree, rest);
    return {
        ..._normalizedOptions,
        projectOrganization: options.organization,
        projectParentDirectory: appsDir
    };
}

export default normalizeOptions;