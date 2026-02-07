import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UsePipes, ValidationPipe, UseGuards, Version } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AdminJwtAuthGuard } from '../admin/auth/guards/admin-jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    //#region CREATE CATEGORY
    @Post()
    @Version('1')
    @UseGuards(AdminJwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new category' })
    @ApiResponse({ status: 201, description: 'Category created successfully' })
    @UsePipes(new ValidationPipe({ transform: true }))
    create(@Body() createCategoryDto: CreateCategoryDto) {
        return this.categoriesService.create(createCategoryDto);
    }
    //#endregion

    //#region GET CATEGORIES
    @Get()
    @Version('1')
    @ApiOperation({ summary: 'Get all categories' })
    @ApiResponse({ status: 200, description: 'Return all categories' })
    findAll() {
        return this.categoriesService.findAll();
    }

    @Get(':id')
    @Version('1')
    @ApiOperation({ summary: 'Get category by ID' })
    @ApiResponse({ status: 200, description: 'Return single category' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.categoriesService.findOne(id);
    }
    //#endregion

    //#region UPDATE CATEGORY
    @Patch(':id')
    @Version('1')
    @UseGuards(AdminJwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update category by ID' })
    @ApiResponse({ status: 200, description: 'Category updated successfully' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    @UsePipes(new ValidationPipe({ transform: true }))
    update(@Param('id', ParseIntPipe) id: number, @Body() updateCategoryDto: UpdateCategoryDto) {
        return this.categoriesService.update(id, updateCategoryDto);
    }
    //#endregion

    //#region DELETE CATEGORY
    @Delete(':id')
    @Version('1')
    @UseGuards(AdminJwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete category by ID' })
    @ApiResponse({ status: 200, description: 'Category deleted successfully' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.categoriesService.remove(id);
    }
    //#endregion
}
