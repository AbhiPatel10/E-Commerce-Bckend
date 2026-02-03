import { IsString, IsNumber, IsOptional, IsInt, Min, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty()
    @IsNumber()
    @Min(0)
    price: number;

    @ApiProperty()
    @IsInt()
    @Min(0)
    stock: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    imageUrl?: string;

    @ApiProperty()
    @IsInt() // Prisma schema says categoryId is Int
    categoryId: number; // Frontend sends 'category' but we can map it or expect categoryId
}

export class UpdateProductDto extends CreateProductDto { }
