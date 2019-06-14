'use strict';

import { Inject } from 'typescript-ioc';
import { GET, Path, QueryParam } from 'typescript-rest';
import * as swagger from 'typescript-rest-swagger';
import { TestTicket } from '../application/TestTicket';

@Path('/ticket')
@swagger.Tags('Ticket')
/**
 * Exemplo de projeto para construir um serviço.
 */

export class TicketRestService {

    @Inject private testTicket: TestTicket;

    /**
     * Retorna uma saudação  
     * @param name Quando fornecido, altera a saudação incluindo o nome da pessoa a ser saudada.
     * @returns Uma saudação.
     */
    @GET
    public async sayHello(@QueryParam('name') name?: string): Promise<string> {
        return await this.testTicket.sayHello(name);
    }
}

