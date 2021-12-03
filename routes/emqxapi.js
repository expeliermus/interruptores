const express = require("express");
const router = express.Router();

import EmqxAuthRule from "../models/emqx_auth.js";

const auth = {
  auth: {
    username: "admin",
    password: "emqxapipassword"
  }
};

global.saverResource = null;
global.alarmResource = null;

// ****************************************
// ******** EMQX RESOURCES MANAGER ********
// ****************************************

/* This manager corroborates that there are 2 resources,
If there are none, then create them.
If there are one or more than two, issue a warning.
To manually delete the resources and restart node */

/* Este administrador corrobora que existan 2 recursos,
Si no hay ninguno, entonces los crea.
Si hay uno o más de dos, lanza advertencia. 
Para borrar manualmente los recursos y reiniciemos node */

//https://docs.emqx.io/en/broker/v4.1/advanced/http-api.html#response-code

//list resources


//check if superuser exist if not we create one
global.check_mqtt_superuser = async function checkMqttSuperUser() {

  try {
    const superusers = await EmqxAuthRule.find({ type: "superuser" });

    if (superusers.length > 0) {

      return;

    } else if (superusers.length == 0) {

      await EmqxAuthRule.create(
        {
          publish: ["#"],
          subscribe: ["#"],
          userId: "emqxmqttsuperuser",
          username: "websuperuser",
          password: "websocketpassword",
          type: "superuser",
          time: Date.now(),
          updatedTime: Date.now()
        }
      );

      console.log("Mqtt super user created");

    }
  } catch (error) {
    console.log("error creating mqtt superuser ");
    console.log(error);
  }
};




module.exports = router;
