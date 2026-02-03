import { IsString, IsInt, Min, IsUUID, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class AddToCartDto {
    @IsUUID(4)
    sessionId: string;

    @IsInt()
    @Type(() => Number)
    productId: number;

    @IsInt()
    @Min(1)
    @Type(() => Number)
    quantity: number;
}

export class UpdateCartItemDto {
    @IsUUID(4)
    sessionId: string;

    @IsInt()
    @Type(() => Number)
    productId: number;

    @IsInt()
    @Min(1)
    @Type(() => Number)
    quantity: number;
}
