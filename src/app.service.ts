import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
    about(): string {
        return "Nest auth server"
    }

    checkHealth(): string {
        return "Server Up!";
    }
}
