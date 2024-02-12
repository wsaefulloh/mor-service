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

            let data

            let tokenPayload = { id: userInfo[0][0].user_id }
            console.log(tokenPayload)
            const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '30d' })
            console.log(token)

            if (userInfo[0].length != 0) {
                data = {
                    status: 200,
                    message: "Login Success",
                    data: userInfo[0],
                    token: token
                };
            } else {
                data = {
                    status: 401,
                    message: "Unauthenticated",
                    data: userInfo[0]
                };
            }

            return data;
        } catch (error) {
            throw error;
        }
    },
};
