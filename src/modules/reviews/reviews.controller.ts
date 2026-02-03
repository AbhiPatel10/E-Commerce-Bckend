import { Controller, Get, Param, Delete } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @Get()
    findAll() {
        return this.reviewsService.findAll();
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.reviewsService.remove(+id);
    }
}
