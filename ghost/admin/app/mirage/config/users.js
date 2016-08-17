import Mirage from 'ember-cli-mirage';
import {isBlank} from 'ember-utils';

export default function mockUsers(server) {
    server.post('/users/', function (db, request) {
        let [attrs] = JSON.parse(request.requestBody).users;
        let user;

        if (!isBlank(attrs.email)) {
            attrs.slug = attrs.email.split('@')[0].dasherize();
        }

        // NOTE: this does not use the user factory to fill in blank fields
        user = db.users.insert(attrs);

        return {
            users: [user]
        };
    });

    // /users/me = Always return the user with ID=1
    server.get('/users/me', function (db) {
        return {
            users: [db.users.find(1)]
        };
    });

    server.get('/users/', 'users');

    server.get('/users/slug/:slug/', function (db, request) {
        let user = db.users.where({slug: request.params.slug});

        return {
            users: user
        };
    });

    server.del('/users/:id/', function (db, request) {
        db.users.remove(request.params.id);

        return new Mirage.Response(204, {}, {});
    });

    server.get('/users/:id', function (db, request) {
        return {
            users: [db.users.find(request.params.id)]
        };
    });

    server.put('/users/:id/', function (db, request) {
        let {id} = request.params;

        if (id === 'password') {
            return {
                password: [{message: 'Password changed successfully.'}]
            };
        } else {
            let [attrs] = JSON.parse(request.requestBody).users;
            let record = db.users.update(id, attrs);

            return {
                user: record
            };
        }
    });
}
