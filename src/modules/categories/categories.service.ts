import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    async create(createCategoryDto: CreateCategoryDto) {
        return this.prisma.category.create({
            data: createCategoryDto,
        });
    }

    async findAll() {
        return this.prisma.category.findMany();
    }

    async findOne(id: number) {
        return this.prisma.category.findUnique({
            where: { id },
        });
    }

    async update(id: number, updateCategoryDto: UpdateCategoryDto) {
        return this.prisma.category.update({
            where: { id },
            data: updateCategoryDto,
        });
    }

    async remove(id: number) {
        return this.prisma.category.delete({
            where: { id },
        });
    }
}

