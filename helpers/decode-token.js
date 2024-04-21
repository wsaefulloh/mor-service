const jwt = require('jsonwebtoken');

module.exports = {
    decodeToken: (authentication) => {

        let user_id = 0

        //Checking token
        if (authentication && authentication.startsWith('Bearer')) {
            let access_token = authentication.split(" ")[1];
            const decoded = jwt.verify(access_token, process.env.JWT_SECRET);
            user_id = decoded.id
        }

        return user_id
    }
}