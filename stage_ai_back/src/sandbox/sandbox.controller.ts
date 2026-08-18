import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SandboxService } from './sandbox.service';
import { ExecuteCodeDto } from './dto/execute-code.dto';

@ApiTags('Sandbox')
@Controller('sandbox')
export class SandboxController {
  constructor(private readonly sandboxService: SandboxService) {}

  @Post('execute')
  @ApiOperation({ summary: 'Exécuter du code via Piston API' })
  @ApiResponse({ status: 200, description: 'Code exécuté avec succès' })
  @ApiResponse({ status: 400, description: 'Langage non supporté ou erreur d\'exécution' })
  execute(@Body() dto: ExecuteCodeDto) {
    return this.sandboxService.execute(dto);
  }
}