import { IsString, IsEmail, IsNotEmpty, IsUUID, Matches } from 'class-validator';

export class CheckoutDto {
    @IsUUID(4)
    sessionId: string;

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
