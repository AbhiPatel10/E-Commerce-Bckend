import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UsePipes, ValidationPipe, UseGuards, Version } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { AdminJwtAuthGuard } from '../admin/auth/guards/admin-jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('Brands')
@Controller('brands')
export class BrandsController {
    constructor(private readonly brandsService: BrandsService) { }

    //#region CREATE BRAND
    @Post()
    @Version('1')
    @UseGuards(AdminJwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new brand' })
    @ApiResponse({ status: 201, description: 'Brand created successfully' })
    @UsePipes(new ValidationPipe({ transform: true }))
    create(@Body() createBrandDto: CreateBrandDto) {
        return this.brandsService.create(createBrandDto);
    }
    //#endregion

    //#region GET BRANDS
    @Get()
    @Version('1')
    @ApiOperation({ summary: 'Get all brands' })
    @ApiResponse({ status: 200, description: 'Return all brands' })
    findAll() {
        return this.brandsService.findAll();
    }

    @Get(':id')
    @Version('1')
    @ApiOperation({ summary: 'Get brand by ID' })
    @ApiResponse({ status: 200, description: 'Return single brand' })
    @ApiResponse({ status: 404, description: 'Brand not found' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.brandsService.findOne(id);
    }
    //#endregion

    //#region UPDATE BRAND
    @Patch(':id')
    @Version('1')
    @UseGuards(AdminJwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update brand by ID' })
    @ApiResponse({ status: 200, description: 'Brand updated successfully' })
    @ApiResponse({ status: 404, description: 'Brand not found' })
    @UsePipes(new ValidationPipe({ transform: true }))
    update(@Param('id', ParseIntPipe) id: number, @Body() updateBrandDto: UpdateBrandDto) {
        return this.brandsService.update(id, updateBrandDto);
    }
    //#endregion

    //#region DELETE BRAND
    @Delete(':id')
    @Version('1')
    @UseGuards(AdminJwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete brand by ID' })
    @ApiResponse({ status: 200, description: 'Brand deleted successfully' })
    @ApiResponse({ status: 404, description: 'Brand not found' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.brandsService.remove(id);
    }
    //#endregion
}
