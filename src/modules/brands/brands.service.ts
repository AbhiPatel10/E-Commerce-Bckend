import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { ServiceResponse } from '../../common/interfaces/service-response.interface';
import { Brand } from '@prisma/client';

@Injectable()
export class BrandsService {
    constructor(private prisma: PrismaService) { }

    //#region CREATE BRAND
    async create(createBrandDto: CreateBrandDto): Promise<ServiceResponse<Brand>> {
        const slug = this.generateSlug(createBrandDto.name);

        const brand = await this.prisma.brand.create({
            data: {
                ...createBrandDto,
                slug,
            },
            include: { logoImage: true },
        });

        return {
            success: true,
            message: 'Brand created successfully',
            data: brand,
        };
    }
    //#endregion

    //#region FIND BRANDS
    async findAll(): Promise<ServiceResponse<Brand[]>> {
        const brands = await this.prisma.brand.findMany({
            include: {
                logoImage: true,
                _count: {
                    select: { products: true },
                },
            },
        });

        return {
            success: true,
            message: 'Brands fetched successfully',
            data: brands,
        };
    }

    async findOne(id: number): Promise<ServiceResponse<Brand>> {
        const brand = await this.prisma.brand.findUnique({
            where: { id },
            include: {
                logoImage: true,
                products: true
            },
        });

        if (!brand) {
            throw new NotFoundException(`Brand with ID ${id} not found`);
        }

        return {
            success: true,
            message: 'Brand fetched successfully',
            data: brand,
        };
    }
    //#endregion

    //#region UPDATE BRAND
    async update(id: number, updateBrandDto: UpdateBrandDto): Promise<ServiceResponse<Brand>> {
        const existingBrand = await this.prisma.brand.findUnique({
            where: { id },
        });

        if (!existingBrand) {
            throw new NotFoundException(`Brand with ID ${id} not found`);
        }

        const data: any = { ...updateBrandDto };
        if (updateBrandDto.name) {
            data.slug = this.generateSlug(updateBrandDto.name);
        }

        const updatedBrand = await this.prisma.brand.update({
            where: { id },
            data,
            include: { logoImage: true },
        });

        return {
            success: true,
            message: 'Brand updated successfully',
            data: updatedBrand,
        };
    }
    //#endregion

    //#region DELETE BRAND
    async remove(id: number): Promise<ServiceResponse<null>> {
        const existingBrand = await this.prisma.brand.findUnique({
            where: { id },
        });

        if (!existingBrand) {
            throw new NotFoundException(`Brand with ID ${id} not found`);
        }

        await this.prisma.brand.delete({
            where: { id },
        });

        return {
            success: true,
            message: 'Brand deleted successfully',
            data: null,
        };
    }
    //#endregion

    //#region HELPERS
    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .trim()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '');
    }
    //#endregion
}
