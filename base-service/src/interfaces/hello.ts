'use strict';

import { Inject } from 'typescript-ioc';
import { GET, Path, QueryParam } from 'typescript-rest';
import * as swagger from 'typescript-rest-swagger';
import { MyUSeCase } from '../application/myUseCase';

@Path('/hello')
@swagger.Tags('Hello')
/**
 * Exemplo de projeto para construir um serviço.
 */
export class HelloRestService {

    @Inject private myUseCase: MyUSeCase;

    /**
     * Retorna uma saudação  
     * @param name Quando fornecido, altera a saudação incluindo o nome da pessoa a ser saudada.
     * @returns Uma saudação.
     */
    @GET
    public async sayHello(@QueryParam('name') name?: string): Promise<string> {
        return await this.myUseCase.sayHello(name);
    }
}