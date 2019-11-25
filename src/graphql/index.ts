import { Injectable } from '@nestjs/common';
import { GqlOptionsFactory, GqlModuleOptions } from '@nestjs/graphql';
import { gql } from 'apollo-server-core';
import { join } from 'path';
import { buildFederatedSchema } from '@apollo/federation';
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';

const users = [
	{
		id: '1',
		name: 'Ada Lovelace',
		birthDate: '1815-12-10',
		username: '@ada',
	},
	{
		id: '2',
		name: 'Alan Turing',
		birthDate: '1912-06-23',
		username: '@complete',
	},
];

const typeDefs = gql`
  extend type Query {
    me: User
  }

  type User @key(fields: "id") {
    id: ID!
    name: String
    username: String
  }
`;

const resolvers = {
	Query: {
		me() {
			return users[1];
		},
	},
	User: {
		__resolveReference(object) {
			return users.find(user => user.id === object.id);
		},
	},
};
// const resolversArray = mergeResolvers(fileLoader(join(__dirname, '../resolvers')));

// console.log(resolversArray)
@Injectable()
export class GraphqlService implements GqlOptionsFactory {
	async createGqlOptions(): Promise<GqlModuleOptions> {
		return {
			schema: buildFederatedSchema([
				{
					typeDefs,
					resolvers,
				},
			]),
			formatError: error => {
				return {
					message: error.message,
					code: error.extensions && error.extensions.code,
					locations: error.locations,
					path: error.path,
				};
			},
			formatResponse: response => {
				return response;
			},
			installSubscriptionHandlers: true,
			tracing: true,
			introspection: true,
			playground: true,
		};
	}
}
