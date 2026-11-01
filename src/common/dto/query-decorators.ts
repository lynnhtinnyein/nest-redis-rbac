import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

type Ctor<T> = new (...args: any[]) => T;

const applyToProp =
    (key: string, ...decorators: PropertyDecorator[]) =>
    (target: Ctor<unknown>) =>
        decorators.forEach((d) => d(target.prototype, key));

export const Searchable =
    () =>
    <T extends Ctor<{ search?: string }>>(target: T) =>
        applyToProp(
            "search",
            ApiPropertyOptional({ type: String, maxLength: 255 }),
            IsOptional(),
            IsString(),
            MaxLength(255)
        )(target);

export const Sortable =
    <K extends string>(keys: readonly K[]) =>
    <T extends Ctor<{ sortBy?: K; sortOrder?: "ASC" | "DESC" }>>(target: T) => {
        applyToProp(
            "sortBy",
            ApiPropertyOptional({ enum: [...keys] }),
            IsOptional(),
            IsString(),
            IsIn(keys, { message: `sortBy must be one of: ${keys.join(", ")}` })
        )(target);

        applyToProp(
            "sortOrder",
            ApiPropertyOptional({ enum: ["ASC", "DESC"] }),
            IsOptional(),
            Transform(({ value }) => (typeof value === "string" ? value.toUpperCase() : value)),
            IsString(),
            IsIn(["ASC", "DESC"], { message: "sortOrder must be either ASC or DESC" })
        )(target);
    };
