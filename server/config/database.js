import DatabaseHandler from "../models/connection.model.js";

class Connections {
  constructor(is_pool_connection = true) {
    this.soc_med = new DatabaseHandler(is_pool_connection).DatabaseConnection;
  }

  disconnectAll = () => {
    let connections = this;

    return new Promise(async (resolve, reject) => {
      try{
        connections?.soc_med && await connections.soc_med.end();
        resolve(true);
      }
      catch(error){
        console.log(error);
        resolve(true);
      }
    });
  }
}


export default Connections