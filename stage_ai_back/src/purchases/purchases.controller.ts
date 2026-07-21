import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';

@ApiTags('Achats')
@ApiBearerAuth()
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Get()
  @ApiOperation({ summary: 'Lister tous les achats' })
  findAll() {
    return this.purchasesService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Achats d\'un utilisateur' })
  findByUser(@Param('userId') userId: string) {
    return this.purchasesService.findByUserId(userId);
  }

  @Get('check/:userId/:courseId')
  @ApiOperation({ summary: 'Vérifier si un cours a été acheté' })
  check(@Param('userId') userId: string, @Param('courseId') courseId: string) {
    return { purchased: this.purchasesService.hasPurchased(userId, courseId) };
  }

  @Post()
  @ApiOperation({ summary: 'Enregistrer un achat' })
  create(@Body() dto: CreatePurchaseDto) {
    return this.purchasesService.create(dto);
  }
}