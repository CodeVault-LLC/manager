import { Readable } from 'node:stream';
import { s3 } from '@/aws-client';
import { db } from '@/data-source';
import { files } from '@/models/file.model';
import {
  GetObjectCommand,
  ObjectCannedACL,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { eq } from 'drizzle-orm';

interface FileData {
  file: Express.Multer.File;
  acl?: ObjectCannedACL;
}

interface FileMetadata {
  id: number;
  fileName: string;
  bucket: string;
  bucketId: string;
  lastAccessed: Date;
}

export const FileService = {
  sanitizeFileName(fileName: string): string {
    return fileName.replace(/[^a-z0-9_.-]/gi, '_');
  },

  isValidFile(file: Express.Multer.File): boolean {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const maxSize = 1024 * 1024 * 5; // 5MB

    return allowedTypes.includes(file.mimetype) && file.size <= maxSize;
  },

  generateId(fileName: string): string {
    return `${Date.now()}-${fileName}`;
  },

  /**
   * Uploads a file to S3 and saves metadata in the database.
   * @param fileData - The file data to upload.
   * @returns The file ID.
   */
  async uploadAvatar(fileData: FileData): Promise<string> {
    const { file, acl } = fileData;

    const fileName = FileService.sanitizeFileName(file.originalname);
    if (!FileService.isValidFile(file)) {
      throw new Error('Invalid file type or size.');
    }

    const id = FileService.generateId(fileName);

    const params = new PutObjectCommand({
      Bucket: 'avatars',
      Key: id,
      Body: file.buffer,
      ACL: acl || 'private',
      ContentType: file.mimetype || 'application/octet-stream',
    });

    try {
      await s3.send(params);

      await db
        .insert(files)
        .values({
          filename: fileName,
          bucket: 'avatars',
          bucketId: id,
          filetype: file.mimetype || 'unknown',
          mimetype: file.mimetype || 'application/octet-stream',
          size: file.size,
          last_accessed: new Date(),
        })
        .execute();

      return id;
    } catch (error) {
      throw new Error(`Error uploading file:${error?.message}`);
    }
  },

  /**
   * Retrieves file metadata from the database.
   * @param id - The file ID to retrieve metadata for.
   * @returns The file metadata or null if not found.
   */
  async getFileMetadata(id: string): Promise<FileMetadata | null> {
    const result = await db.query.files.findFirst({
      where: eq(files.bucketId, id),
    });

    if (!result) {
      return null;
    }

    return {
      id: result.id,
      fileName: result.filename,
      bucket: result.bucket,
      bucketId: result.bucketId,
      lastAccessed: result.last_accessed,
    };
  },

  /**
   * Retrieves a file from S3 and updates the last accessed time in the database.
   * @param id - The file ID to retrieve.
   * @returns The file buffer or null if not found.
   */
  async getFile(id: string): Promise<Buffer | null> {
    const fileMetadata = await FileService.getFileMetadata(id);
    if (!fileMetadata) {
      throw new Error('File not found.');
    }

    // Fetch file from S3
    const params = new GetObjectCommand({
      Bucket: fileMetadata.bucket,
      Key: id,
    });

    try {
      const { Body } = await s3.send(params);

      if (Body instanceof Readable) {
        const chunks: Uint8Array[] = [];
        for await (const chunk of Body) {
          chunks.push(chunk as Uint8Array);
        }
        const buffer = Buffer.concat(chunks);

        // Update last accessed time in the database
        await db
          .update(files)
          .set({
            last_accessed: new Date(),
          })
          .where(eq(files.bucketId, id));

        return buffer;
      }
      throw new Error('Error retrieving file stream.');
    } catch (error) {
      throw new Error('Error retrieving file.');
    }
  },

  getFileUrl(id: string): string {
    const S3_BASE_URL = 'http://localhost:9000';

    const isS3ObjectId = /^\d+-.*$/.test(id);
    if (isS3ObjectId) {
      return `${S3_BASE_URL}/avatars/${id}`;
    }

    return `${S3_BASE_URL}/avatars/${id}`;
  },
};
