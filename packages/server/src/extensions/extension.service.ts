import { db } from '@/data-source';
import {
  Extension,
  ExtensionMarket,
  extensions,
} from '@/models/extension.model';
import { eq, sql } from 'drizzle-orm';

export const extensionService = {
  sanitize(extension: Extension) {
    return {
      id: extension.id,
      name: extension.name,
      slug: extension.slug,
      description: extension.description,

      repositoryUrl: extension.repositoryUrl,
      latestVersion: extension.latestVersion,

      createdAt: extension.createdAt,
      updatedAt: extension.updatedAt,
    };
  },

  sanitizeMarket(extension: ExtensionMarket) {
    return {
      ...this.sanitize(extension),
      installedCount: extension.installedCount ?? 0,
      isOfficial: extension.isOfficial,
      isVerified: extension.isVerified,
      isPublic: extension.isPublic,
      isListed: extension.isListed,
    };
  },

  getAll: async (includePrivate = false) => {
    const extensionsList = await db.query.extensions.findMany({
      extras: {
        installedCount: sql`(
          SELECT COUNT(*)
          FROM user_extensions
          WHERE user_extensions.extension_id = extensions.id
        )`.as('installed_count'),
      },
      with: {
        createdBy: true,
      },
      where: eq(extensions.isPublic, includePrivate),
      limit: 25,
    });

    return extensionsList;
  },

  getBySlug: async (slug: string) => {
    const extension = await db.query.extensions.findFirst({
      where: eq(extensions.slug, slug),
      with: {
        createdBy: true,
      },
    });

    return extension;
  },

  update: async (id: number, data: Partial<Extension>) => {
    const updatedExtensionId = await db
      .update(extensions)
      .set(data)
      .where(eq(extensions.id, id))
      .returning({ id: extensions.id });

    return updatedExtensionId[0].id;
  },

  create: async (data: Partial<Extension>) => {
    /*const newExtensionId = await db
      .insert(extensions)
      .values({
        name: data.name ?? '',
        slug: data.slug,
        description: data.description,
        repositoryUrl: data.repositoryUrl,
        releasesUrl: data.releasesUrl,
      })
      .returning({ id: extensions.id });*/

    console.log('Creating new extension:', data);

    return 0;
  },
};
