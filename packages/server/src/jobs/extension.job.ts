import { extensionService } from '@/extensions/extension.service';
import { nameToSlug } from '@/utils/slug';

export const ExtensionJob = async () => {
  try {
    const response = await fetch(
      'https://raw.githubusercontent.com/codevault-llc/manager-registry/master/extensions.json',
    );

    const data = await response.json();
    const extensions = data.extensions;

    await extensions.map(async (extension: any) => {
      const requiredFields = [
        'name',
        'description',
        'repositoryUrl',
        'manifestUrl',
        'latestVersion',
      ];

      if (requiredFields.some((field) => !extension[field])) {
        throw new Error(
          `Missing required field in extension: ${extension.name}`,
        );
      }

      // Check if the extension already exists in the database
      const existingExtension = await extensionService.getBySlug(
        nameToSlug(extension.name),
      );

      if (existingExtension) {
        await extensionService.update(existingExtension.id, {
          ...extension,
          slug: nameToSlug(extension.name),
        });
      } else {
        await extensionService.create({
          ...extension,
          slug: nameToSlug(extension.name),
        });
      }



      return {
        name: extension.name,
        slug: nameToSlug(extension.name),
        description: extension.description,
        manifestUrl: extension.manifestUrl,
        repositoryUrl: extension.repositoryUrl,
        latestVersion: extension.latestVersion,
      };
    });
  } catch (error) {
    console.error('Error fetching or processing extensions:', error);
  }
};
