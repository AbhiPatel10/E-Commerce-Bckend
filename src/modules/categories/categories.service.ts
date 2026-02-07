import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ServiceResponse } from '../../common/interfaces/service-response.interface';
import { Category } from '@prisma/client';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    //#region CREATE CATEGORY
    async create(createCategoryDto: CreateCategoryDto): Promise<ServiceResponse<Category>> {
        const slug = this.generateSlug(createCategoryDto.name);

        const category = await this.prisma.category.create({
            data: {
                ...createCategoryDto,
                slug,
            },
        });

        return {
            success: true,
            message: 'Category created successfully',
            data: category,
        };
    }
    //#endregion

    //#region FIND CATEGORIES
    async findAll(): Promise<ServiceResponse<Category[]>> {
        const categories = await this.prisma.category.findMany({
            include: {
                _count: {
                    select: { products: true },
                },
            },
        });

        return {
            success: true,
            message: 'Categories fetched successfully',
            data: categories,
        };
    }

    async findOne(id: number): Promise<ServiceResponse<Category>> {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: { products: true },
        });

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        return {
            success: true,
            message: 'Category fetched successfully',
            data: category,
        };
    }
    //#endregion

    //#region UPDATE CATEGORY
    async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<ServiceResponse<Category>> {
        const existingCategory = await this.prisma.category.findUnique({
            where: { id },
        });

        if (!existingCategory) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        const data: any = { ...updateCategoryDto };
        if (updateCategoryDto.name) {
            data.slug = this.generateSlug(updateCategoryDto.name);
        }

        const updatedCategory = await this.prisma.category.update({
            where: { id },
            data,
        });

        return {
            success: true,
            message: 'Category updated successfully',
            data: updatedCategory,
        };
    }
    //#endregion

    //#region DELETE CATEGORY
    async remove(id: number): Promise<ServiceResponse<null>> {
        const existingCategory = await this.prisma.category.findUnique({
            where: { id },
        });

        if (!existingCategory) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        await this.prisma.category.delete({
            where: { id },
        });

        return {
            success: true,
            message: 'Category deleted successfully',
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
