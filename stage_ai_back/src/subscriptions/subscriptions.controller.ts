import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@ApiTags('Abonnements')
@ApiBearerAuth()
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  @ApiOperation({ summary: 'Lister tous les abonnements' })
  findAll() {
    return this.subscriptionsService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Abonnements d\'un utilisateur' })
  findByUser(@Param('userId') userId: string) {
    return this.subscriptionsService.findByUserId(userId);
  }

  @Get('user/:userId/active')
  @ApiOperation({ summary: 'Vérifier si un abonnement est actif' })
  getActive(@Param('userId') userId: string) {
    return this.subscriptionsService.getActive(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Souscrire à un abonnement' })
  create(@Body() dto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(dto);
  }

  @Delete('user/:userId')
  @ApiOperation({ summary: 'Annuler un abonnement' })
  cancel(@Param('userId') userId: string) {
    return this.subscriptionsService.cancel(userId);
  }
}