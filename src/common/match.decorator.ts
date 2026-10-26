import {
    registerDecorator,
    type ValidationArguments,
    type ValidationOptions
} from "class-validator";

export function Match(property: string, options?: ValidationOptions) {
    return (object: object, propertyName: string) => {
        registerDecorator({
            name: "match",
            target: object.constructor,
            propertyName,
            constraints: [property],
            options,
            validator: {
                validate(value: unknown, args: ValidationArguments) {
                    const [relatedName] = args.constraints;
                    return value === (args.object as Record<string, unknown>)[relatedName];
                }
            }
        });
    };
}
