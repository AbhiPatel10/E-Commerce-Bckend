import { IsString, IsInt, Min, Max, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReviewDto {
    @IsInt()
    @Type(() => Number)
    productId: number;

    @IsString()
    @IsNotEmpty()
    customerName: string;

    @IsInt()
    @Min(1)
    @Max(5)
    @Type(() => Number)
    rating: number;

    @IsString()
    @IsNotEmpty()
    comment: string;
}
