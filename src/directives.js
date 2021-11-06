const { SchemaDirectiveVisitor } = require('apollo-server')
const { defaultFieldResolver, GraphQLString } = require('graphql')
const {formatDate} = require('./utils')
const {authenticated, authorized} = require('./auth')


class FormatDateDirective extends SchemaDirectiveVisitor {
    visitFieldDefinition(field){
        const resolver = field.resolve || defaultFieldResolver
        const {format: schemaFormat} = this.args // this refers to the schemaVisitor, this.args refers to the args of the schema definition

        field.args.push({
            name: 'format',
            type: GraphQLString
        })

        field.resolve = async (root, {format, ...rest}, ctx, info) => {
            const result = await resolver.call(this, root, rest, ctx, info)
            return formatDate(result, format || schemaFormat)
        }
        field.type = GraphQLString
    }
}

class AuthenticationDirective extends SchemaDirectiveVisitor {
    visitFieldDefinition(field){
        const resolver = field.resolve || defaultFieldResolver
        
        field.resolve = authenticated((root, args, ctx, info) => {
            return resolver(root, args, ctx, info)
        })
    }
}

class AuthorizationDirective extends SchemaDirectiveVisitor {
    visitFieldDefinition(field){
        const resolver = field.resolve || defaultFieldResolver
        const {role: schemaRole} = this.args

        field.args.push({
            name: 'role',
            type: GraphQLString
        })

        field.resolve = authorized(schemaRole, (root, args, ctx, info) => {
            return resolver(root, args, ctx, info)
        })
    }
}

module.exports = {
    FormatDateDirective,
    AuthenticationDirective,
    AuthorizationDirective
}
