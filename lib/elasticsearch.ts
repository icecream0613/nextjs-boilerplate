// lib/elasticsearch.ts
import { Client } from '@elastic/elasticsearch';

const client = new Client({
  node: process.env.ELASTIC_ENDPOINT!,
  auth: {
    apiKey: process.env.ELASTIC_API_KEY!,
  },
});

export { client };