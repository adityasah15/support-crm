import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { QueryTicketsDto } from './dto/query-tickets.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly tickets: TicketsService) {}

  @Post()
  create(@Body() dto: CreateTicketDto) {
    return this.tickets.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryTicketsDto) {
    return this.tickets.findAll(query);
  }

  @Get(':ticketId')
  findOne(@Param('ticketId') ticketId: string) {
    return this.tickets.findOne(ticketId);
  }

  @Put(':ticketId')
  update(
    @Param('ticketId') ticketId: string,
    @Body() dto: UpdateTicketDto,
  ) {
    return this.tickets.update(ticketId, dto);
  }
}
