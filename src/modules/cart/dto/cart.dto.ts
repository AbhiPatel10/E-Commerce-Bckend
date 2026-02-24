import { IsString, IsInt, Min, IsUUID, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class AddToCartDto {
    @IsInt()
    @Type(() => Number)
    productId: number;

    @IsInt()
    @Min(1)
    @Type(() => Number)
    quantity: number;
}

export class UpdateCartItemDto {
    @IsInt()
    @Min(1)
    @Type(() => Number)
    quantity: number;
}
