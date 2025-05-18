import { createLogger, format, transports } from 'winston';

export interface ILogger {
    info(message: string): void;
    warn(message: string): void;
    error(message: string, error?: unknown): void;
    debug(message: string): void;
}

export class WinstonLogger implements ILogger {
    private logger = createLogger({
        level: 'info',
        format: format.combine(
            format.colorize(),
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.printf(({ timestamp, level, message }) => {
                return `${timestamp} [${level}]: ${message}`;
            })
        ),
        transports: [new transports.Console()],
    });

    info(message: string): void {
        this.logger.info(message);
    }

    warn(message: string): void {
        this.logger.warn(message);
    }

    error(message: string, error?: unknown): void {
        if (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`${message} ${errorMessage}`);
        } else {
            this.logger.error(message);
        }
    }

    debug(message: string): void {
        this.logger.debug(message);
    }
}
