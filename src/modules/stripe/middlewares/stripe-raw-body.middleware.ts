import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const getRawBody = require('raw-body');

@Injectable()
export class StripeRawBodyMiddleware implements NestMiddleware {
    async use(req: Request, res: Response, next: NextFunction) {
        if ((req as any).rawBody) {
            return next();
        }

        try {
            const buffer = await getRawBody(req, {
                encoding: null, // Return buffer
            });
            (req as any).rawBody = buffer;
            next();
        } catch (error) {
            console.error('Error getting raw body:', error);
            next(error);
        }
    }
}
