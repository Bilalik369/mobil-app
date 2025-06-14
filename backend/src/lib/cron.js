import cron from "cron"; 
import https from "https"; 

const job = new cron.CronJob("*/14 * * * *", function () {
    
    https
      .get(process.env.API_URL, (res) => {
        if (res.statusCode === 200) {
            console.log("Requête GET envoyée avec succès");
        } else {
            console.log("Échec de la requête GET", res.statusCode);
        }
      })
      .on("error", (e) => {
        console.error("Erreur lors de l'envoi de la requête", e);
      });
});

export default job; 