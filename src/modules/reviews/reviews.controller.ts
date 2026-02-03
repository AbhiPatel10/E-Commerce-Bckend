import { Controller, Get, Post, Body, Param, ParseIntPipe, UsePipes, ValidationPipe } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @Post()
    @UsePipes(new ValidationPipe({ transform: true }))
    create(@Body() createReviewDto: CreateReviewDto) {
        return this.reviewsService.create(createReviewDto);
    }

    @Get('product/:productId')
    findAllByProduct(@Param('productId', ParseIntPipe) productId: number) {
        return this.reviewsService.findAllByProduct(productId);
    }
}
