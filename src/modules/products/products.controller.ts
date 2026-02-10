import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Version, ParseIntPipe, ValidationPipe, UsePipes } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from '../admin/auth/guards/admin-jwt-auth.guard';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    @Version('1')
    @UseGuards(AdminJwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new product' })
    @ApiResponse({ status: 201, description: 'Product created successfully' })
    @UsePipes(new ValidationPipe({ transform: true }))
    create(@Body() createProductDto: CreateProductDto) {
        return this.productsService.create(createProductDto);
    }

    @Get()
    @Version('1')
    @ApiOperation({ summary: 'Get all products with pagination' })
    @ApiResponse({ status: 200, description: 'Return products and total count' })
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('category') category?: string,
        @Query('brand') brand?: string,
        @Query('minPrice') minPrice?: string,
        @Query('maxPrice') maxPrice?: string,
        @Query('search') search?: string,
    ) {
        return this.productsService.findAll(
            Number(page) || 1,
            Number(limit) || 10,
            {
                category,
                brand,
                minPrice: minPrice ? Number(minPrice) : undefined,
                maxPrice: maxPrice ? Number(maxPrice) : undefined,
                search
            }
        );
    }

    @Get(':id')
    @Version('1')
    @ApiOperation({ summary: 'Get product by ID' })
    @ApiResponse({ status: 200, description: 'Return single product' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.findOne(id);
    }

    @Get('slug/:slug')
    @Version('1')
    @ApiOperation({ summary: 'Get product by slug' })
    @ApiResponse({ status: 200, description: 'Return single product' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    findBySlug(@Param('slug') slug: string) {
        return this.productsService.findBySlug(slug);
    }

    @Patch(':id')
    @Version('1')
    @UseGuards(AdminJwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update product by ID' })
    @ApiResponse({ status: 200, description: 'Product updated successfully' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    @UsePipes(new ValidationPipe({ transform: true }))
    update(@Param('id', ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto) {
        return this.productsService.update(id, updateProductDto);
    }

    @Delete(':id')
    @Version('1')
    @UseGuards(AdminJwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete product by ID' })
    @ApiResponse({ status: 200, description: 'Product deleted successfully' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.remove(id);
    }
}
