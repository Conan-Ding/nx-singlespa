import { normalizeOptions as _normalizeOptions } from '@nx/react/src/generators/application/lib/normalize-options';
import { Tree } from '@nx/devkit';
import { ReactSinglespaGeneratorSchema, NormalizedReactSinglespaGeneratorSchema } from '../application/schema';

export  async function normalizeOptions(tree: Tree, options: ReactSinglespaGeneratorSchema): Promise<NormalizedReactSinglespaGeneratorSchema> {
    const { organization, ...rest } = options;
    console.log(`normalizeOptions has rest: ${JSON.stringify(rest)}`);
    const _normalizedOptions = await _normalizeOptions(tree, rest);
    return {
        ..._normalizedOptions,
        projectOrganization: options.organization
    };
}

export default normalizeOptions;