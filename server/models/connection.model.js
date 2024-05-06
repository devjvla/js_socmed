import { createPool }   from "mysql";
import AppConstants from "../config/constants.js";
const { DB_CONFIG } = AppConstants;

/** 
* @class DatabaseConnection
* Handles the Database Connection. <br>
* Last Updated Date: August 17, 2023
*/
class DatabaseConnection {
  /**
  * Default constructor.
  * Triggered: This is being called by the database config, catching errors from try/catch.<br>
  * Last Updated Date: August 17, 2023
  * @async
  * @function
  * @memberOf DatabaseConnection
  * @param {boolean} is_mysql_pool
  * @author Elchapo
  */
  constructor(is_mysql_pool = true){
    this.database = "SocMed Database";

    /*  variables related to database connection */ 
    this.is_connected       = false;
    this.DatabaseConnection = false;
    this.retryCount         = 0;
    this.connect_started_at = new Date().getTime();

    if(is_mysql_pool){
      this.createPoolConnection();
    }
  }

  /**
  * DOCU: Function to get the database config
  * Triggered: This is being called by createPoolConnection.<br>
  * Last Updated Date: August 17, 2023
  * @async
  * @function
  * @memberOf DatabaseConnection
  * @return {database_config} - returns database config from constants
  * @author Elchapo
  */
  getDatabaseConfig = () => {
    return DB_CONFIG;
  }

  /**
  * DOCU: Function to Create / initiate database pool connection
  * Triggered: This is being called by the constructor.<br>
  * Last Updated Date: August 17, 2023
  * @async
  * @function
  * @memberOf DatabaseConnection
  * @author Elchapo
  */
  createPoolConnection = () => {
    let database = this.getDatabaseConfig();
    this.DatabaseConnection = createPool(Object.assign({connectionLimit: 128}, database));
  }
}

export default DatabaseConnection;