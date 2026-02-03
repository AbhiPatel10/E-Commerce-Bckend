import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer'; // Assuming multer is installed, typically is for NestJS file upload
import { extname } from 'path';

// Helper for file upload (simplified without Cloudinary/S3 for now)
const storage = diskStorage({
    destination: './uploads/products',
    filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
    },
});

@ApiTags('Products')
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    @UseInterceptors(FileInterceptor('images', { storage })) // Admin panel sends 'images'
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                price: { type: 'number' },
                stock: { type: 'number' },
                categoryId: { type: 'number' },
                images: { type: 'string', format: 'binary' },
            },
        },
    })
    async create(@Body() createProductDto: any, @UploadedFile() file: any) {
        // Convert strings to numbers if coming from FormData
        const payload = {
            ...createProductDto,
            price: Number(createProductDto.price),
            stock: Number(createProductDto.stock),
            categoryId: Number(createProductDto.category || createProductDto.categoryId), // Admin panel sent 'category'
            imageUrl: file ? `/uploads/products/${file.filename}` : createProductDto.imageUrl, // Simple local serve
        };
        return this.productsService.create(payload);
    }

    @Get()
    findAll(@Query('page') page: string, @Query('limit') limit: string) {
        return this.productsService.findAll(Number(page) || 1, Number(limit) || 10);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(+id);
    }

    @Patch(':id')
    @UseInterceptors(FileInterceptor('images', { storage }))
    async update(@Param('id') id: string, @Body() updateProductDto: any, @UploadedFile() file: any) {
        const payload = {
            ...updateProductDto,
            price: updateProductDto.price ? Number(updateProductDto.price) : undefined,
            stock: updateProductDto.stock ? Number(updateProductDto.stock) : undefined,
            categoryId: updateProductDto.category ? Number(updateProductDto.category) : undefined,
        };
        if (file) {
            payload.imageUrl = `/uploads/products/${file.filename}`;
        }
        return this.productsService.update(+id, payload);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.productsService.remove(+id);
    }
}

