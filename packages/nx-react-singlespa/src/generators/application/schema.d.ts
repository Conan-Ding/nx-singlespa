import { Schema as BaseSchema, NormalizedSchema as BaseNormalizedSchema } from '@nx/react/src/generators/application/schema';


export interface ReactSinglespaGeneratorSchema extends BaseSchema {
    organization: string;
}

export interface NormalizedReactSinglespaGeneratorSchema extends BaseNormalizedSchema {
    // transfer organization to projectOrganization
    projectOrganization: string;
}