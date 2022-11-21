import { createColorTable_RGBA8UI, GL, newColorTableEntry, RGBA8UI } from '@metsci/gleam-core';
import { hashCode, isNullish, ValueObject } from '@metsci/gleam-util';

const { abs, max } = Math;

const RED_WITH_TRIANGULAR_ALPHA_RGBA8UI = createColorTable_RGBA8UI( 1024, ( frac, color ) => {
    color.r = 1;
    color.g = 0;
    color.b = 0;
    color.a = max( 0.3, 1 - 1.4*abs( frac - 0.5 ) );
} );

const YELLOW_WITH_TRIANGULAR_ALPHA_RGBA8UI = createColorTable_RGBA8UI( 1024, ( frac, color ) => {
    color.r = 1;
    color.g = 1;
    color.b = 0;
    color.a = max( 0.3, 1 - 1.4*abs( frac - 0.5 ) );
} );

const GREEN_WITH_TRIANGULAR_ALPHA_RGBA8UI = createColorTable_RGBA8UI( 1024, ( frac, color ) => {
    color.r = 0;
    color.g = 1;
    color.b = 0;
    color.a = max( 0.3, 1 - 1.4*abs( frac - 0.5 ) );
} );

export const RED_WITH_TRIANGULAR_ALPHA = /*@__PURE__*/newColorTableEntry( 'red-with-triangular-alpha', RGBA8UI, GL.NEAREST, RED_WITH_TRIANGULAR_ALPHA_RGBA8UI );
export const YELLOW_WITH_TRIANGULAR_ALPHA = /*@__PURE__*/newColorTableEntry( 'yellow-with-triangular-alpha', RGBA8UI, GL.NEAREST, YELLOW_WITH_TRIANGULAR_ALPHA_RGBA8UI );
export const GREEN_WITH_TRIANGULAR_ALPHA = /*@__PURE__*/newColorTableEntry( 'green-with-triangular-alpha', RGBA8UI, GL.NEAREST, GREEN_WITH_TRIANGULAR_ALPHA_RGBA8UI );

export class Dot implements ValueObject {
    constructor(
        readonly x: number,
        readonly y: number,
        readonly z: number,
        readonly t_PSEC: number,
    ) {
    }

    withXy( x: number, y: number ): Dot {
        return new Dot( x, y, this.z, this.t_PSEC );
    }

    withZt( z: number, t_PSEC: number ): Dot {
        return new Dot( this.x, this.y, z, t_PSEC );
    }

    hashCode( ): number {
        const prime = 31;
        let result = 1;
        result = prime*result + hashCode( this.x );
        result = prime*result + hashCode( this.y );
        result = prime*result + hashCode( this.z );
        result = prime*result + hashCode( this.t_PSEC );
        return result;
    }

    equals( o: any ): boolean {
        if ( o === this ) {
            return true;
        }
        else if ( isNullish( o ) ) {
            return false;
        }
        else {
            return ( o.x === this.x
                  && o.y === this.y
                  && o.z === this.z
                  && o.t_PSEC === this.t_PSEC );
        }
    }
}

export function firstValue<T>( items: Iterable<[unknown,T]> ): T | undefined {
    for ( const [ _, item ] of items ) {
        return item;
    }
    return undefined;
}
