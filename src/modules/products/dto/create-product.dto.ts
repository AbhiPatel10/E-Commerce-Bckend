import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsArray, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '@prisma/client';

export class CreateProductDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    shortDescription?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    price: number;

    @ApiPropertyOptional({ default: 0 })
    @IsNumber()
    @IsOptional()
    @Min(0)
    discountPercentage?: number;

    @ApiPropertyOptional({ default: 0 })
    @IsNumber()
    @IsOptional()
    @Min(0)
    vatPercentage?: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    stock: number;

    @ApiProperty({ enum: ProductStatus, default: ProductStatus.ACTIVE })
    @IsEnum(ProductStatus)
    @IsOptional()
    status?: ProductStatus;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    categoryId: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    brandId?: number;

    @ApiProperty({ type: [Number], description: 'Array of Image IDs already uploaded' })
    @IsArray()
    @IsNumber({}, { each: true })
    @IsOptional()
    imageIds?: number[];
}
