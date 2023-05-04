import { Module } from '@nestjs/common';
import { LocationController } from "./controller/location.controller";

@Module({
    imports: [],
    controllers: [LocationController],
    providers: [],
})
export class LocationModule {}
