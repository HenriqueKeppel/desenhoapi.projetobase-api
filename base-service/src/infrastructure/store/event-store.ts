'use strict';

import { EventStore, RedisProvider } from '@eventstore.net/event.store';
import { Configurations } from '../command-line';

export class EventStoreFactory {

    public static get() {
        if (!EventStoreFactory.eventStore) {
            EventStoreFactory.eventStore = new EventStore(new RedisProvider(Configurations.eventStore));
        }
        return EventStoreFactory.eventStore;
    }
    private static eventStore: EventStore;
}