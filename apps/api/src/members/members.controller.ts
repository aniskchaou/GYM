import { Controller, Get, Param, Body, Put, Query, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { MembersService } from './members.service';
import { UpdateMemberDto } from './dto/update-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Members')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('members')
export class MembersController {
  constructor(private membersService: MembersService) {}

  @Get()
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.RECEPTIONIST, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all members of a gym' })
  findAll(@CurrentUser('gymId') gymId: string, @Query() query: any) {
    return this.membersService.findAll(gymId, query);
  }

  @Get('me/card')
  @Roles(UserRole.MEMBER)
  @ApiOperation({ summary: 'Get current member digital card' })
  myCard(@CurrentUser('id') memberId: string) {
    return this.membersService.getMembershipCard(memberId);
  }

  @Get(':id')
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.RECEPTIONIST, UserRole.SUPER_ADMIN, UserRole.TRAINER)
  @ApiOperation({ summary: 'Get member details' })
  findOne(@Param('id') id: string, @CurrentUser('gymId') gymId: string) {
    return this.membersService.findOne(id, gymId);
  }

  @Put(':id')
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Update member profile' })
  update(
    @Param('id') id: string,
    @CurrentUser('gymId') gymId: string,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.membersService.update(id, gymId, dto);
  }

  @Get(':id/attendance')
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get member attendance history' })
  attendance(@Param('id') id: string, @CurrentUser('gymId') gymId: string) {
    return this.membersService.getAttendanceHistory(id, gymId);
  }

  @Post(':id/measurements')
  @Roles(UserRole.TRAINER, UserRole.GYM_OWNER)
  @ApiOperation({ summary: 'Add body measurement for member' })
  addMeasurement(@Param('id') memberId: string, @Body() dto: any) {
    return this.membersService.addBodyMeasurement(memberId, dto);
  }

  @Post(':id/assign-trainer')
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER)
  @ApiOperation({ summary: 'Assign a trainer to a member' })
  assignTrainer(
    @Param('id') memberId: string,
    @CurrentUser('gymId') gymId: string,
    @Body('trainerId') trainerId: string,
  ) {
    return this.membersService.assignTrainer(memberId, gymId, trainerId);
  }

  @Post(':id/complaint')
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Add a complaint note for a member' })
  addComplaint(
    @Param('id') memberId: string,
    @CurrentUser('gymId') gymId: string,
    @Body() dto: { subject: string; description: string; priority?: string },
  ) {
    return this.membersService.addComplaint(memberId, gymId, dto);
  }

  @Get('complaints/all')
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER)
  @ApiOperation({ summary: 'List all complaints for a gym' })
  listComplaints(@CurrentUser('gymId') gymId: string) {
    return this.membersService.listComplaints(gymId);
  }

  @Post('complaints/:ticketId/resolve')
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER)
  @ApiOperation({ summary: 'Resolve a member complaint' })
  resolveComplaint(@Param('ticketId') ticketId: string, @CurrentUser('gymId') gymId: string) {
    return this.membersService.resolveComplaint(ticketId, gymId);
  }

  // ─── Pending membership approvals ───────────────────────────────────────

  @Get('pending-memberships')
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'List members with pending memberships' })
  pendingMemberships(@CurrentUser('gymId') gymId: string) {
    return this.membersService.getPendingMemberships(gymId);
  }

  @Post(':id/measurements')
  @Roles(UserRole.TRAINER, UserRole.GYM_OWNER)
  @ApiOperation({ summary: 'Add body measurement for member' })
  addMeasurement(@Param('id') memberId: string, @Body() dto: any) {
    return this.membersService.addBodyMeasurement(memberId, dto);
  }
}
