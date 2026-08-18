import { Injectable, BadRequestException } from '@nestjs/common';
import { ExecuteCodeDto } from './dto/execute-code.dto';

const PISTON_API_URL = 'https://emkc.org/api/v2/piston/execute';

// Mapping des langages frontend vers les langages Piston
const LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
  python: { language: 'python', version: '3.10.0' },
  javascript: { language: 'javascript', version: '18.15.0' },
  java: { language: 'java', version: '15.0.2' },
  c: { language: 'c', version: '10.2.0' },
  cpp: { language: 'c++', version: '10.2.0' },
};

@Injectable()
export class SandboxService {
  async execute(dto: ExecuteCodeDto) {
    const config = LANGUAGE_MAP[dto.language];
    if (!config) {
      throw new BadRequestException(`Langage non supporté: ${dto.language}`);
    }

    try {
      const response = await fetch(PISTON_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: config.language,
          version: config.version,
          files: [
            {
              name: 'main',
              content: dto.code,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Piston API error: ${response.status}`);
      }

      const result = await response.json();
      return {
        output: result.run?.output || '',
        stderr: result.run?.stderr || '',
        exitCode: result.run?.code ?? 0,
        signal: result.run?.signal || null,
      };
    } catch (err: any) {
      throw new BadRequestException(`Erreur d'exécution: ${err.message}`);
    }
  }
}