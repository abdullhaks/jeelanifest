import { Controller, Get, Query, Param } from '@nestjs/common';
import { PublicService } from './public.service';
import type { PaginationQuery } from '../common/pagination.schema';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('dashboard/groups')
  getGroups() {
    return this.publicService.getDashboardGroups();
  }

  @Get('dashboard/group-analytics')
  getGroupAnalytics(@Query('filter') filter?: string) {
    return this.publicService.getGroupAnalytics(filter);
  }

  @Get('dashboard/pro-analytics')
  getProAnalyticsData() {
    return this.publicService.getProAnalyticsData();
  }

  @Get('dashboard/students')
  getStudents() {
    return this.publicService.getDashboardStudents();
  }

  @Get('dashboard/ongoing-programs')
  getOngoingPrograms() {
    return this.publicService.getOngoingPrograms();
  }

  @Get('dashboard/stats')
  getStats() {
    return this.publicService.getDashboardStats();
  }

  // --- Phase 12: Paginated Public Listings ---

  @Get('results')
  getResults(@Query() query: PaginationQuery) {
    return this.publicService.getResults(query);
  }

  @Get('results/:id')
  getResultById(@Param('id') id: string) {
    return this.publicService.getResultById(id);
  }

  @Get('groups')
  getGroupsList(@Query() query: PaginationQuery) {
    return this.publicService.getGroups(query);
  }

  @Get('groups/:id')
  getGroupById(@Param('id') id: string) {
    return this.publicService.getGroupById(id);
  }

  @Get('gallery')
  getGallery(@Query() query: PaginationQuery) {
    return this.publicService.getGalleryImages(query);
  }

  @Get('students')
  getStudentsList(@Query() query: PaginationQuery) {
    return this.publicService.getStudents(query);
  }

  @Get('students/:id')
  getStudentById(@Param('id') id: string) {
    return this.publicService.getStudentById(id);
  }
}
