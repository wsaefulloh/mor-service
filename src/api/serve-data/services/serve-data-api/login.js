"use strict";
const { getPagination, getPagingData } = require("../../../../../helpers/paging");
const jwt = require("jsonwebtoken");

module.exports = {
    login: async (searchComponent, authentication) => {
        try {
            let {
                email,
                password
            } = searchComponent;

            let userInfo = await strapi.db.connection.context.raw(
                `select * from (
                    select uu.id as user_id, rm.name from up_users uu 
                    left join up_users_role_mor_links uurml on uurml.user_id = uu.id 
                    left join role_mors rm on rm.id = uurml.role_mor_id 
                    where uu.email = '${email}' AND uu.password_mor = '${password}') a`
            );

            let data = {
                data: userInfo[0]
            };

            return data;
        } catch (error) {
            throw error;
        }
    },
};
