import { Controller, Post, Delete, Param, UseInterceptors, UploadedFile, ParseIntPipe, UseGuards, Version } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';
import { AdminJwtAuthGuard } from '../admin/auth/guards/admin-jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Images')
@Controller('images')
export class ImagesController {
    constructor(private readonly imagesService: ImagesService) { }

    //#region UPLOAD IMAGE
    @Post('upload')
    @Version('1')
    @UseGuards(AdminJwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Upload an image' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Image uploaded successfully' })
    @UseInterceptors(FileInterceptor('file'))
    upload(@UploadedFile() file: Express.Multer.File) {
        return this.imagesService.upload(file);
    }
    //#endregion

    //#region DELETE IMAGE
    @Delete(':id')
    @Version('1')
    @UseGuards(AdminJwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete an image' })
    @ApiResponse({ status: 200, description: 'Image deleted successfully' })
    @ApiResponse({ status: 404, description: 'Image not found' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.imagesService.remove(id);
    }
    //#endregion
}
