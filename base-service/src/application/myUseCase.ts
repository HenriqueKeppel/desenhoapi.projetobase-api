'use strict';

export class MyUSeCase {
    public async sayHello(name?: string): Promise<string> {
        return `Hello ${name ? name : 'World'}`;
    }
}
