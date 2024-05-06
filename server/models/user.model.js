import moment from "moment/moment.js";
import { format as mysqlFormat } from "mysql";
import QueryModel from "./query.model.js";
import QueryHelper from "../helpers/query.helper.js";

// Constants
import AppConstants from "../config/constants.js";
const { QUERY_YES } = AppConstants;

// Model
import ProfileModel from "./profile.model.js";

/** 
* @class UserModel
* Handles all User-related methods
* Last Updated Date: May 6, 2024
* @author JV
*/
class UserModel extends QueryModel {
  constructor(){
    super();
  }

  /**
  * DOCU: Function will check if email address exists in the database.
  * Proceed in creating a user and profile record if email address doesn't exist in the database.
  * Triggered by: UsersController.signupUser <br>
  * Last Updated Date: May 6, 2024
  * @async
  * @function
  * @memberOf QueryModel
  * @param {object} - params (e.g. id, first_name, last_name, or email_address)
  * @return {object} - response_data { status, result, error }
  * @author JV
  */
  signupUser = async (params) => {
    let response_data = { status: false, result: {}, error: null };

    try {
      await this.startTransaction("Signup User Transaction");

      const { first_name, last_name, email_address, password } = params;

      // Check if email_address exists in the database
      let get_user = await this.getUser({ email_address });

      /* 
        Immediately throw an error when get user objet has value and password has value.
        Password is empty if user used sign up with Google
      */
      if(Object.keys(get_user.result).length && password) {
        throw new Error("Email address is already registered.");
      }

      let created_at        = moment().format("YYYY-MM-DD HH:mm:ss");
      let create_user_query = mysqlFormat("INSERT INTO users (first_name, last_name, email_address, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW());", [first_name, last_name, email_address, QUERY_YES, created_at]);
      let create_user       = await this.executeQuery("User Model | signupUser", create_user_query);

      if(!create_user) {
        throw new Error("An error occured while creating user record.");
      }
      
      // Update user record with a hashed password using created_at as the salt
      if(password) {
        let hash_user_password = await this._hashPassword({ user_id: create_user.insertId, salt: created_at, password });
  
        if(!hash_user_password.status) {
          throw new Error(hash_user_password.error);
        }
      }

      // Create user's Profile record
      let profileModel = new ProfileModel(this.active_transaction);
      let create_profile = await profileModel.createProfile(create_user.insertId);

      console.log(create_profile);

      if(!create_profile.status) {
        throw new Error(create_profile.error);
      }

      await this.commitTransaction();

      response_data.status = true;
      response_data.result = {
        first_name, last_name, email_address, 
        id: create_user.insertId
      }
    } catch (error) {
      await this.cancelTransaction();

      response_data.error = error.message;
    }

    return response_data;
  }

  /**
  * DOCU: Function will fetch a user record that matches the given email address and password.
  * Triggered by: UsersController.signinUser <br>
  * Last Updated Date: April 16, 2024
  * @async
  * @function
  * @memberOf QueryModel
  * @param {object} - params (email_address, password)
  * @return {object} - response_data { status, result, error }
  * @author JV
  */
  signinUser = async (params) => {
    let response_data = { status: false, result: {}, error: null };

    try {
      let { email_address, password } = params;

      /* Get user using email_address and password */
      let get_user_query = mysqlFormat(`SELECT id, first_name, last_name FROM users WHERE email_address = ? AND password = SHA1(CONCAT(created_at, ?));`, [email_address, password]);
      let [get_user]     = await this.executeQuery("UserModel | SigninUser", get_user_query);

      if(!get_user) {
        throw new Error("Email address or password is incorrect.");
      }

      response_data.status = true;
      response_data.result = { ...get_user, email_address }
    } catch (error) {
      response_data.error = error.message;
    }

    return response_data;
  }

  /**
  * DOCU: Function for fetching a user record
  * Triggered by: UsersController.signUpUser <br>
  * Last Updated Date: March 17, 2024
  * @async
  * @function
  * @memberOf QueryModel
  * @param {object} - params (e.g. id, first_name, last_name, or email_address)
  * @return {object} - response_data { status, result, error }
  * @author JV
  */
  getUser = async (params) => {
    let response_data = { status: false, result: {}, error: null };

    try {
      /* build query params */
      let queryHelper        = new QueryHelper();
      let build_where_clause = await queryHelper.buildWhereClause(params);

      if(!build_where_clause.status) {
        throw new Error(build_where_clause.error);
      }

      let { where_clause, bind_params } = build_where_clause.result; 

      const get_user_query = mysqlFormat(`SELECT id FROM users WHERE${where_clause};`, bind_params);
      const [get_user]     = await this.executeQuery("UserModel | getUser", get_user_query);

      response_data.status = true;
      response_data.result = get_user || {}; // Only pass value of get_user if it's not undefined/empty
    } catch (error) {
      response_data.error = error.message;
    }

    return response_data;
  }

  /**
  * DOCU: Function will update user record with an hashed password
  * Triggered by: this.signupUser <br>
  * Last Updated Date: March 17, 2024
  * @async
  * @function
  * @memberOf QueryModel
  * @param {object} - params (user_id, salt, password)
  * @return {object} - response_data { status, result, error }
  * @author JV
  */
  _hashPassword = async (params) => {
    let response_data = { status: false, result: {}, error: null };
    
    try {
      let { user_id, salt, password } = params;

      let hash_user_password_query = mysqlFormat("UPDATE users SET password = SHA1(CONCAT(?, ?)) WHERE id = ?;", [salt, password, user_id]);
      let hash_user_password       = await this.executeQuery("UserModel | _hashPassword", hash_user_password_query);

      if(!hash_user_password) {
        throw new Error("An error occured while updating user password.");
      }

      response_data.status = true;
    } catch (error) {
      response_data.error = error.message;
    }

    return response_data;
  }
}

export default UserModel;