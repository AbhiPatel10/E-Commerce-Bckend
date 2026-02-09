import { IsString, IsEmail, IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CustomerDetailsDto {
    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsNotEmpty()
    state: string;

    @IsString()
    @IsNotEmpty()
    country: string;

    @IsString()
    @IsNotEmpty()
    pincode: string;
}

export class CheckoutDto {
    @IsUUID(4)
    sessionId: string;

    @ValidateNested()
    @Type(() => CustomerDetailsDto)
    customerDetails: CustomerDetailsDto;
}
