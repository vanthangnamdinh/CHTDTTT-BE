const { monan } = require("./Food");

const minCalo = 220;
const maxCalo = 350;
const mutationRate = 0.02;
const populationSize = 1000;

class Individual {
  constructor(genes) {
    this.genes = genes;
    this.fitness = 0;
  }
}

function calculateFitness(individual, proteinData, fiberData, tien) {
  let fitness = 0;
  for (const dayMeals of individual.genes) {
    const proteinInfo = proteinData.find((item) => item.meal === dayMeals[0]);
    const fiberInfo = fiberData.find((item) => item.meal === dayMeals[1]);

    const totalCalories = proteinInfo.calories + fiberInfo.calories;
    const totalPrice = proteinInfo.price + fiberInfo.price;
    // console.log(totalCalories, totalPrice);
    if (minCalo <= totalCalories && totalCalories <= maxCalo) {
      fitness++;
    }
    if (totalPrice <= tien) {
      fitness++;
    }

    // Các bữa ăn trong tuần không được trùng nhau
    if (
      individual.genes.flat().filter((item) => item === dayMeals[0]).length ===
        1 &&
      individual.genes.flat().filter((item) => item === dayMeals[1]).length ===
        1
    ) {
      fitness++;
    }
  }
  individual.fitness = fitness;
  return individual;
}

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

function tournamentSelection(population, tournamentSize) {
  const selected = [];
  while (selected.length < population.length) {
    const competitors = getRandomSample(population, tournamentSize);
    const winner = competitors.reduce((maxFitness, current) =>
      current.fitness > maxFitness.fitness ? current : maxFitness
    );
    selected.push(winner);
  }
  return selected;
}

function partiallyMappedCrossover(parent1, parent2) {
  const child1 = [];
  const child2 = [];
  const crossoverPoint = 3;

  for (let i = 0; i < 5; i++) {
    if (i < crossoverPoint) {
      child1.push(parent1.genes[i]);
      child2.push(parent2.genes[i]);
    } else {
      child1.push(parent2.genes[i]);
      child2.push(parent1.genes[i]);
    }
  }

  return [new Individual(child1), new Individual(child2)];
}

function mutate(gen) {
  const randomRate = Math.random();
  if (randomRate < mutationRate) {
    const [index1, index2] = getRandomSample(
      [...Array(gen.genes.length).keys()],
      2
    );
    [gen.genes[index1], gen.genes[index2]] = [
      gen.genes[index2],
      gen.genes[index1],
    ];
  }
  return gen;
}

function generate(population) {
  const selected = tournamentSelection(population, 5);
  const nextGeneration = [];
  for (let i = 0; i < population.length; i++) {
    const [parent1, parent2] = getRandomSample(selected, 2);
    const [child1, child2] = partiallyMappedCrossover(parent1, parent2);
    nextGeneration.push(mutate(child1), mutate(child2));
  }
  return nextGeneration;
}

function geneticAlgorithm(populationSize, proteinData, fiberData, tien) {
  let population = initializePopulation(populationSize, proteinData, fiberData);
  //   console.log(population, " ");
  let gen = 0;
  const result = [];
  while (true) {
    const resultItem = {};
    population = population.map((item) =>
      calculateFitness(item, proteinData, fiberData, tien)
    );
    population.sort((a, b) => b.fitness - a.fitness);
    const bestSolution = population[0];
    const weekData = [];
    bestSolution.genes.forEach((item, day) => {
      const proteinInfo = proteinData.find((i) => i.meal === item[0]);
      const fiberInfo = fiberData.find((i) => i.meal === item[1]);

      const totalCalories = proteinInfo.calories + fiberInfo.calories;
      const totalPrice = proteinInfo.price + fiberInfo.price;
      weekData.push([...item, totalCalories + 150, totalPrice + 5000]);
    });
    Object.assign(resultItem, {
      gen: gen + 1,
      fitness: bestSolution.fitness,
      data: weekData,
    });
    result.push(resultItem);
    if (bestSolution.fitness === 15) {
      break;
    }
    population = generate(population);
    gen++;
  }
  return result;
}

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomSample(array, size) {
  return array.sort(() => Math.random() - 0.5).slice(0, size);
}

module.exports.Generic = async (req, res) => {
  const tien = req.body.ga - 5000;
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
  const resData = geneticAlgorithm(
    populationSize,
    proteinData,
    fiberData,
    tien
  );
  res.status(200).json({ data: resData });
};
