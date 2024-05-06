// Helpers
import { validationResult } from "express-validator";
import AuthHelper from "../helpers/auth.helper.js";

// Model
import UserModel from "../models/user.model.js";

/** 
* @class UsersController
* Handles all User-related API calls
* Last Updated Date: March 12, 2024
* @author JV
*/
class UsersController {
  /**
  * DOCU: This function will validate the input provided by the user
  * If valid, proceed to userModel.signupUser. If not, prompt user with an error message.
  * Triggered by: POST request to /signup  <br>
  * Last Updated Date: May 6, 2024
  * @async
  * @function
  * @memberOf DatabaseModel
  * @return {db_connection} - returns database connection
  * @author JV
  */
  signup = async (req, res) => {
    const response_data = { status: false, result: {}, error: [] };

    try {
      const validation_errors = validationResult(req).errors;
      
      if(validation_errors.length) {
        // Populate object to store input fields with errors
        validation_errors.forEach(error => {
          response_data.result[error.path] = error.msg;
        });
      }
      else {
        // Process to Sign up process
        let userModel = new UserModel();
        let signup_user = await userModel.signupUser(req.body);

        if(!signup_user.status) {
          throw new Error(signup_user.error);
        }

        // Create token
        let authHelper   = new AuthHelper();
        let create_token = await authHelper.createUserToken({ ...signup_user.result });

        if(!create_token.status) {
          throw new Error(create_token.error);
        }

        // Set HTTP-Only Cookie
        res.cookie("user_token", create_token.result, { httpOnly: true });

        response_data.status = true;
        response_data.result = { ...signup_user.result };
      }
    } catch (error) {
      response_data.error = error.message;
    }

    res.json(response_data);
  }
}

export default (function user(){
  return new UsersController();
})();