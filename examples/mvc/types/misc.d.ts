import { ValueObject } from '@metsci/gleam-util';
export declare const RED_WITH_TRIANGULAR_ALPHA: readonly ["red-with-triangular-alpha", import("@metsci/gleam-core").ColorTablePopulator];
export declare const YELLOW_WITH_TRIANGULAR_ALPHA: readonly ["yellow-with-triangular-alpha", import("@metsci/gleam-core").ColorTablePopulator];
export declare const GREEN_WITH_TRIANGULAR_ALPHA: readonly ["green-with-triangular-alpha", import("@metsci/gleam-core").ColorTablePopulator];
export declare class Dot implements ValueObject {
    readonly x: number;
    readonly y: number;
    readonly z: number;
    readonly t_PSEC: number;
    constructor(x: number, y: number, z: number, t_PSEC: number);
    withXy(x: number, y: number): Dot;
    withZt(z: number, t_PSEC: number): Dot;
    hashCode(): number;
    equals(o: any): boolean;
}
export declare function firstValue<T>(items: Iterable<[unknown, T]>): T | undefined;
//# sourceMappingURL=misc.d.ts.map