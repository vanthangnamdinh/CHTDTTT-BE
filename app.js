const express = require("express");
const app = express();
const port = 3001;
const bodyParser = require("body-parser");
const { monan } = require("./src/Food");
const { Generic } = require("./src/router");
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
class Individual {
  constructor(genes) {
    this.genes = genes;
    this.fitness = 0;
  }
}
const db = require("./src/db");

// Create an anonymous function to establish the database connection.
// After the connection is established, start the server.
const initApp = async () => {
  console.log("Testing the database connection..");

  // Test the connection.
  try {
    await db.authenticate();
    console.log("Connection has been established successfully.");
    /**
     * Start the web server on the specified port.
     */
  } catch (error) {
    console.error("Unable to connect to the database:", error.original);
  }
};

function initializePopulation(populationSize, proteinData, fiberData) {
  const population = [];
  for (let i = 0; i < populationSize; i++) {
    const genes = [];
    for (let j = 0; j < 5; j++) {
      const dayGenes = [];
      while (dayGenes.length < 2) {
        const proteinMeal = randomChoice(proteinData).meal;
        const fiberMeal = randomChoice(fiberData).meal;
        if (
          !genes.flat().includes(proteinMeal) &&
          !genes.flat().includes(fiberMeal)
        ) {
          dayGenes.push(proteinMeal, fiberMeal);
        }
      }
      genes.push(dayGenes);
    }
    const individual = new Individual(genes);
    population.push(individual);
  }
  return population;
}

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}
const fetchData = async () => {
  const protein = await monan.findAll({
    where: {
      loai: 1,
    },
  });
  const fiber = await monan.findAll({
    where: {
      loai: 0,
    },
  });
  const proteinData = protein.map((item) => ({
    meal: item.tenMonAn,
    calories: item.kalo,
    price: item.gia,
  }));
  const fiberData = fiber.map((item) => ({
    meal: item.tenMonAn,
    calories: item.kalo,
    price: item.gia,
  }));
  const population = initializePopulation(1000, proteinData, fiberData);
  app.locals.population = population;
  app.locals.proteinData = proteinData;
  app.locals.fiberData = fiberData;
};
fetchData();
/**
 * Initialize the application.
 */
initApp();
app.locals.thang = 1;
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.post("/ga", Generic);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
