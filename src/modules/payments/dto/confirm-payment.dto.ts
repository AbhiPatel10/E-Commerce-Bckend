import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ConfirmPaymentDto {
    @IsString()
    @IsNotEmpty()
    paymentIntentId: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    orderNumber?: string;
}
