import { Inject, Injectable } from "@nestjs/common";
import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from "class-validator";
import { DataSource, EntityTarget } from "typeorm";

type Target = string | EntityTarget<object>;

@ValidatorConstraint({ name: "ExistsIn", async: true })
@Injectable()
export class ExistsInConstraint implements ValidatorConstraintInterface {
    constructor(@Inject(DataSource) private readonly dataSource: DataSource) {}

    async validate(value: unknown, args: ValidationArguments): Promise<boolean> {
        if (value === undefined || value === null) return true;
        const [target, column] = args.constraints as [Target, string];
        const values = [...new Set(Array.isArray(value) ? value : [value])];
        if (!values.length) return true;
        const col = this.dataSource.driver.escape(column);
        const row = await this.dataSource
            .createQueryBuilder()
            .select(`COUNT(DISTINCT t.${col})`, "count")
            .from(target, "t")
            .where(`t.${col} IN (:...values)`, { values })
            .getRawOne<{ count: string }>();
        return Number(row?.count) === values.length;
    }

    defaultMessage(args: ValidationArguments): string {
        return `${args.property} contains values that do not exist`;
    }
}

export function ExistsIn(target: Target, column = "id", options?: ValidationOptions) {
    return (object: object, propertyName: string) =>
        registerDecorator({
            name: "ExistsIn",
            target: object.constructor,
            propertyName,
            options,
            constraints: [target, column],
            validator: ExistsInConstraint
        });
}
