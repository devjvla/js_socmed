class QueryHelper {
  /**
  * DOCU: This function generates the WHERE Clause of a MySQL query based on the params passed to it
  * Last Updated Date: March 18, 2024
  * @async
  * @function
  * @param {object}
  * @returns {object} - {status, result, error}
  * @memberOf QueryHelper    
  * @author JV
  **/
  buildWhereClause = async (params) => {
    let response_data = { status: false, result: {}, error: null }
    
    try {
      /* build where clause */
      let where_clause = "";
      let bind_params  = [];
      let last_key     = Object.keys(params).pop();

      for(const [key, value] of Object.entries(params)) {
        bind_params.push(value);
        where_clause += ` ${key} = ?`;
  
        /* check if current key is the last key. don't append "AND" if it's the last key */
        if(key !== last_key) {
          where_clause += " AND";
        }

        response_data.status = true;
        response_data.result = { where_clause, bind_params };
      }
    } catch (error) {
      response_data.error = error.message;
    }

    return response_data;
  }
}

export default QueryHelper;