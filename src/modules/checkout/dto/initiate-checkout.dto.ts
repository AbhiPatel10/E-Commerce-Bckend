import { IsNotEmpty, IsObject, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CustomerDetailsDto } from './checkout.dto';

export class InitiateCheckoutDto {
    @IsUUID(4)
    sessionId: string;

    @IsObject()
    @ValidateNested()
    @Type(() => CustomerDetailsDto)
    customerDetails: CustomerDetailsDto;
}
