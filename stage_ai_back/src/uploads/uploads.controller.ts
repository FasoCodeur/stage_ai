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
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { extname } from 'path';
import { MulterExceptionFilter } from './multer-exception.filter';
import { UPLOADS_DIR } from './uploads.constants';

/** Types d'images acceptés (SVG exclu : risque d'injection de script). */
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];

/** Taille maximale d'un fichier : 5 Mo. */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Le dossier doit exister avant le démarrage de multer
if (!existsSync(UPLOADS_DIR)) {
  mkdirSync(UPLOADS_DIR, { recursive: true });
}

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  @Post()
  @ApiOperation({
    summary: 'Téléverser une image',
    description:
      'Enregistre une image (logo de programme, miniature de cours…) dans le dossier "uploads" du backend et renvoie son URL.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'Image (5 Mo maximum)' },
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
      storage: diskStorage({
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
  upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(
        'Aucun fichier reçu. Sélectionnez une image puis réessayez.',
      );
    }

    return {
      url: `/uploads/${file.filename}`,
      filename: file.filename,
    };
  }
}
