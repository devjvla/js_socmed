import Connections from "../config/database.js";

/* setup / initialize database connections */
const DBConnections = new Connections(true);

/**
* @class QueryModel
* Handles the Database Queries. <br>
* Last Updated Date: June 27, 2022
*/
class QueryModel{
  /**
  * Default constructor.
  * Triggered: This is being called by all the models.<br>
  * Last Updated Date: August 22, 2023
  * @async
  * @function
  * @memberOf QueryModel
  * @author Elchapo, updated by Jerome
  */
	constructor(active_transaction=null){
    this.DBConnection = DBConnections.soc_med;
		this.active_transaction = active_transaction || {
			keyword: null,
			start_time: null,
			connection: null
		};
	}

	/**
  * DOCU: This function will establish connection and executes the given query. <br>
  * Used by all models. <br>
  * Triggered: When runnning raw queries from executeQuery. <br>
  * Last Updated Date: August 17, 2023
  * @async
  * @function
  * @memberOf QueryModel
  * @param {String} keyword - details where the query was called
  * @param {String} query - formatted query to be executed (make sure to use mysql.format(`SELECT * FROM users WHERE id = ?`, [user_id]);)
  * @param {Boolean=} restrict_result - default false. Throw error if query returned empty result
  * @param {String=} error_message - default "No Data". Error message to be thrown when query returns empty result and restrict_result = true
  * @param {DatabaseConnection=} transaction_connection - default null. Determines if the query will be executed on a transaction or not
  * @returns {PromiseCallback} returns array result if success, and error if failed;
  * @author Elchapo
  */
	executeQuery = (keyword, query, restrict_result = false, error_message = "No Data") => {
		let query_model = this;

		return new Promise( async (resolve, reject) => {
			let start_time = new Date().getTime();
			
			/* Get new connection if transaction_connection is not provided */
			if(!query_model.active_transaction.connection){
				query_model.DBConnection.getConnection(async function(err, connection) {
					if (err) {
						reject(err);
					}
					else{
						/* run query statement */
						let execute_response_data = await query_model.runQueryStatement(connection, {start_time, keyword, query, restrict_result, error_message});

						/* resolve promise if query was successfully executed */
						if(execute_response_data.status){
							resolve(execute_response_data.result);
						}
						else{
							reject(execute_response_data.error);
						}
					}
				});
			}
			else{
				/* run query statement */
				let execute_response_data = await query_model.runQueryStatement(query_model.active_transaction.connection, {start_time, keyword, query, restrict_result, error_message}, true);

				/* resolve promise if query was successfully executed */
				if(execute_response_data.status){
					resolve(execute_response_data.result);
				}
				else{
					reject(execute_response_data.error);
				}
			}
		});
	}


	/**
  * DOCU: This function will run the given query. <br>
  * Used by Query model. <br>
  * Triggered: When runnning raw queries from executeQuery. <br>
  * Last Updated Date: August 17, 2023
  * @async
  * @function
  * @memberOf QueryModel
  * @param {DatabaseConnection} connection - connection to be used to execute the given query, either from transaction or established connection
  * @param {Object} query_details - requires keyword, query
  * @returns {PromiseCallback} returns response_data { status: false, result: [], error: false };
  * @author Elchapo
  */
	runQueryStatement = (connection, {start_time, keyword, query, restrict_result, error_message}, is_transaction = false) => {
		let query_model = this;

		return new Promise((resolve, reject) => {
			let execute_start_time = start_time || new Date().getTime();
						
			connection.query(query, function (error, result) {
				let response_data = { status: false, result: null, error: false }; 
				let total_duration = ((new Date().getTime()) - execute_start_time) / 1000;

				/* release connection if connection is not a transaction connection */
				if(!is_transaction){
					query_model.releaseDatabaseConnection(connection);
				}
				
				/*	track mysql errors */ 
				if(error  || (restrict_result && result.length === 0)) {
					if(restrict_result && result.length === 0){
						response_data.error = new Error(error_message);
						resolve(response_data);
					}
					else{
						response_data.error = error;
						resolve(response_data);
					}
				}
				else{
					/*	track slow queries based from the computed total duration */ 
					if(total_duration > 1){
						let custom_error =  new Error(`SlowQueryException: ${keyword}`);
					}

					response_data.status = true;
					response_data.result = result;

					resolve(response_data);
				}
			});   
		});
	}

	/**
  * DOCU: This function will start a transaction. <br>
  * Used in all Models that needs Transaction. <br>
  * Triggered: When there are 2 or more insert/update queries run on a single request. <br>
  * Last Updated Date: August 17, 2023
  * @async
  * @function
  * @memberOf QueryModel
  * @param {String} keyword - activkeyword to be passed on logging
  * @returns {PromiseCallback} returns transaction connection if true, and returns error if failed starting connection
  * @author Elchapo
  */
	startTransaction = (keyword) => {
		let query_model = this;
		query_model.active_transaction.keyword = keyword;
		query_model.active_transaction.start_time = new Date().getTime();

		return new Promise((resolve, reject) => {
			/* DOCU: start transaction */			
			query_model.DBConnection.getConnection(async function(err, connection) {
				if (err) {
					reject(err);
				}
			    else{
					connection.beginTransaction(async (err) => {
						if(err){
							await query_model.cancelTransaction(err, connection);
							reject(err);
						}
						else{
							query_model.active_transaction.connection = connection;
							resolve(connection);
						}
					});
				}
			});
		});
	}

	/**
  * DOCU: This function will rollback the transaction. <br>
  * Used in all Models with Transaction. <br>
  * Triggered: when a certain query was not successfully executed. <br>
  * Last Updated Date: August 22, 2023
  * @async
  * @function
  * @memberOf QueryModel
  * @param {DatabaseConnection} connection - active connection to be committed
  * @returns {PromiseCallback} returns boolean true
  * @author Elchapo, updated by Jerome
  */
	cancelTransaction = () => {
		let query_model = this;

		return new Promise((resolve, reject) => {
			if(query_model?.active_transaction?.connection){
				query_model.active_transaction.connection.rollback(function() {		
					console.log(`Cancel transaction: ${query_model.active_transaction.keyword}`);
					query_model.active_transaction.keyword = null;
					query_model.active_transaction.start_time = null;

					/* release database connection */
					query_model.releaseDatabaseConnection(query_model.active_transaction.connection);
					resolve(true);
				});
			}
			else{
				resolve(true);
			}
		});
	}

	/**
  * DOCU: This function will commit the transaction. <br>
  * Used in all Models with Transaction. <br>
  * Triggered: When all queries was successfully executed. <br>
  * Last Updated Date: August 17, 2023
  * @async
  * @function
  * @memberOf QueryModel
  * @param {DatabaseConnection} connection - active connection to be committed
  * @returns {PromiseCallback} returns boolean true if success, and transaction error if failed to commit
  * @author Elchapo
  */
	commitTransaction = () => {	
		let query_model = this;

		return new Promise((resolve, reject) => {
			query_model.active_transaction.connection.commit(async function(transaction_err) {
				if (transaction_err) {
					/*  DOCU: rollbacks transaction when commit was not successful */
					await query_model.cancelTransaction(transaction_err, query_model.active_transaction.connection);
					reject(transaction_err);
				}
				else{
					query_model.active_transaction.keyword = null;
					query_model.active_transaction.start_time = null;

					/* release database connection */
					query_model.releaseDatabaseConnection(query_model.active_transaction.connection);
				
					resolve(true);
				}
			});
		});
  }

	/**
  * DOCU: This function will release / free up the connection from Database Pool Connection. <br>
  * Used in executeQuery, cancelTransaction and commitTransaction function. <br>
  * Triggered: When query was executed or commit / cancel transaction. <br>
  * Last Updated Date: August 22, 2023
  * @async
  * @function
  * @memberOf QueryModel
  * @param {DatabaseConnection} connection - active connection to be released
  * @author Elchapo, updated by Jerome
  */
	releaseDatabaseConnection = (connection) => {
		/* get connection from pool connections using the threadId */
		let [poolConnection] = this.DBConnection?._allConnections.filter((conn) => { return conn.threadId === connection.threadId });
		
		try{
			/* Check if poolConnection still exists in the pool connections */
			if(poolConnection){
				connection.release();
			}
		}
		catch(e){
			/* ignore errors */
		}
	}
}

export default QueryModel;