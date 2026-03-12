import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { Admin } from "../../../entities";
import { AdminLoginDto } from "./dto/admin-login.dto";

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private jwtService: JwtService,
  ) {}

  async login(adminLoginDto: AdminLoginDto) {
    const { email, password } = adminLoginDto;

    const admin = await this.adminRepository.findOne({
      where: { email },
    });

    if (!admin) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload = {
      sub: admin.id,
      email: admin.email,
      name: admin.name,
      role: "ADMIN",
    };

    return {
      token: this.jwtService.sign(payload),
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: "ADMIN",
      },
    };
  }

  async validateAdmin(id: number) {
    return this.adminRepository.findOne({
      where: { id },
    });
  }
}
