import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { MulterError } from 'multer';
import type { Response } from 'express';

/**
 * Convertit les erreurs de multer (fichier trop volumineux, champ inattendu…)
 * en messages français lisibles par l'utilisateur.
 */
@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: MulterError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    const message =
      exception.code === 'LIMIT_FILE_SIZE'
        ? "L'image est trop volumineuse (5 Mo maximum)."
        : "Le téléversement de l'image a échoué. Vérifiez le fichier puis réessayez.";

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message,
    });
  }
}
