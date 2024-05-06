import { format as mysqlFormat } from "mysql";
import QueryModel from "./query.model.js";

// Constants
import AppConstants from "../config/constants.js";
const { QUERY_NO } = AppConstants;

/** 
* @class ProfileModel
* Handles all Profile-related methods
* Last Updated Date: May 6, 2024
* @author JV
*/
class ProfileModel extends QueryModel {
  constructor(active_transaction = null) {
    super(active_transaction);
  }

  /**
  * DOCU: Function will create a user's profile record
  * Triggered by: UserModel.signupUser <br>
  * Last Updated Date: May 6, 2024
  * @async
  * @function
  * @memberOf QueryModel
  * @param {integer} - user_id
  * @return {object} - response_data { status, result, error }
  * @author JV
  */
  createProfile = async (user_id) => {
    let response_data = { status: false, result: {}, error: [] };

    try {
      let create_profile_query = mysqlFormat("INSERT INTO profiles (user_id, is_private, created_at, updated_at) VALUES (?, ?, NOW(), NOW());", [user_id, QUERY_NO]);
      let create_profile       = await this.executeQuery("Profile Model | createProfile", create_profile_query);

      if(!create_profile) {
        throw new Error("An error occured while creating user profile record.");
      }

      response_data.status = true;
    } catch (error) {
      response_data.error = error.message;
    }

    return response_data;
  }
}

export default ProfileModel;