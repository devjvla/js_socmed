import JWT from "jsonwebtoken";
import AppConstants from "../config/constants.js";

class AuthHelper {
  /**
  * DOCU: This function handles the creation of JWT.
  * Last Updated Date: March 18, 2024
  * @async
  * @function
  * @param {object}
  * @returns {object} - {status, result, error}
  * @memberOf AuthHelper
  * @author JV
  **/
  createUserToken = (user_data) => {
    let response_data = { status: false, result: {}, error: null }

    try {
      if(!user_data || !Object.keys(user_data).length) {
        throw new Error("A token cannot be created because User data is not found.");
      }

      let token = JWT.sign(user_data, process.env.JWT_SECRET, { expiresIn: AppConstants.JWT_TOKEN_EXPIRATION });

      response_data.status = true;
      response_data.result = token;
    } catch (error) {
      response_data.error = error.message;
    }

    return response_data;
  }

  /**
  * DOCU: This function handles the verification of JWT.
  * Last Updated Date: April 23, 2024
  * @async
  * @function
  * @param {object}
  * @returns {object} - {status, result, error}
  * @memberOf AuthHelper
  * @author JV
  **/
  checkUserToken = (req, res, next) => {
    try {
      const user_token = req.cookies.user_token;

      if(!user_token) {
        res.status(401);
        throw new Error("Failed to authenticate user");
      }
      
      const user = JWT.verify(user_token, process.env.JWT_SECRET);
      req.user = user;
    } catch (error) {
      res.error = error.message;
      res.clearCookie("user_token");
    }

    next();
  }
}

export default AuthHelper;