import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { put } from '@vercel/blob';
import { diskStorage, memoryStorage } from 'multer';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { extname } from 'path';
import { MulterExceptionFilter } from './multer-exception.filter';
import { UPLOADS_DIR } from './uploads.constants';

/** Types d'images acceptés (SVG exclu : risque d'injection de script). */
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];

/**
 * Taille maximale d'un fichier : 4 Mo.
 * (Les fonctions Vercel limitent le corps de requête à 4,5 Mo, en-têtes multipart compris.)
 */
const MAX_FILE_SIZE = 4 * 1024 * 1024;

/**
 * En production (Vercel), les images sont stockées sur Vercel Blob dès que le token est fourni.
 * En local sans token, elles sont écrites dans le dossier "uploads" servi par l'API.
 */
const USE_BLOB_STORAGE = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

// En mode stockage disque, le dossier doit exister avant le démarrage de multer.
// Sur un système de fichiers en lecture seule (ex. Vercel), l'erreur est ignorée :
// l'upload renverra alors un message explicite à l'appel.
if (!USE_BLOB_STORAGE) {
  try {
    if (!existsSync(UPLOADS_DIR)) {
      mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  } catch {
    // Système de fichiers en lecture seule : le dossier ne peut pas être créé.
  }
}

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  @Post()
  @ApiOperation({
    summary: 'Téléverser une image',
    description:
      "Enregistre une image (logo de programme, miniature de cours…) et renvoie son URL. Stockage Vercel Blob en production, dossier local \"uploads\" en développement.",
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'Image (4 Mo maximum)' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Image téléversée', schema: {
    type: 'object',
    properties: {
      url: { type: 'string', example: '/uploads/4f8c9d2e-1a3b-4c5d-8e7f-9a0b1c2d3e4f.png' },
      filename: { type: 'string', example: '4f8c….png' },
    },
  } })
  @ApiResponse({ status: 400, description: 'Aucun fichier, format non supporté ou fichier trop volumineux' })
  @UseFilters(MulterExceptionFilter)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: USE_BLOB_STORAGE
        ? memoryStorage()
        : diskStorage({
            destination: UPLOADS_DIR,
            filename: (_req, file, callback) => {
              const extension = extname(file.originalname).toLowerCase();
              callback(null, `${randomUUID()}${extension}`);
            },
          }),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, callback) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
          return callback(
            new BadRequestException(
              'Format non supporté. Utilisez une image PNG, JPG, WEBP ou GIF.',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(
        'Aucun fichier reçu. Sélectionnez une image puis réessayez.',
      );
    }

    // Production : stockage objet Vercel Blob → URL absolue et persistante.
    if (USE_BLOB_STORAGE && file.buffer) {
      const extension = extname(file.originalname).toLowerCase();
      const filename = `${randomUUID()}${extension}`;
      const blob = await put(`uploads/${filename}`, file.buffer, {
        access: 'public',
        contentType: file.mimetype,
      });
      return { url: blob.url, filename };
    }

    // Développement : fichier écrit sur disque et servi sur /uploads/...
    if (!file.filename) {
      throw new BadRequestException(
        "Le stockage des images n'est pas configuré sur ce serveur.",
      );
    }
    return {
      url: `/uploads/${file.filename}`,
      filename: file.filename,
    };
  }
}
