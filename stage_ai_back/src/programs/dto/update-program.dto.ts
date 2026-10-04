import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateProgramDto } from './create-program.dto';

// Les niveaux ne sont pas modifiables ici : ils ont leurs propres routes
// (/programs/:id/levels) afin de préserver la progression des étudiants.
export class UpdateProgramDto extends PartialType(
  OmitType(CreateProgramDto, ['levels'] as const),
) {}