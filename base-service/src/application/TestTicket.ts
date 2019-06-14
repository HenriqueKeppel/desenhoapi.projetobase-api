'use strict';

export class TestTicket {
    public async sayHello(name?: string): Promise<string> {
        return `Hello ${name ? name : 'World'}`;
    }
}