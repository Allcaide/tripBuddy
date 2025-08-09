const Tour = require('./../Models/tourModels'); // Importing the Tour model

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8')
// );

// exports.checkID = (req, res, next, val) => {
//     // if (Number(req.params.id) * 1 > tours.length) {
//     //   return res.status(404).json({
//     //     status: '404',
//     //     message: 'Invalid Id',
//     //   }

//   console.log(`Tour id is: ${val}`);
//   //console.log('req params id ', req.params.id, 'tours len ', tours.length);
//   next();
// };

//Route Handlers
exports.getAllTours = async (req, res) => {
  //(req,res) => é o que vem do cliente, e o que é enviado de volta para o cliente, tipicamente chamamos de route handler
  // res.status(200).json({
  //   status: 'success',
  //   ResponseTime: req.resquestTime,
  //   results: tours.length,
  //   data: {
  //     tours: tours,
  //   },
  // });

  // app.get('/api/v1/tours/:id', (req, res) => {
  //   console.log(req.params)
  //   //(req,res) => é o que vem do cliente, e o que é enviado de volta para o cliente, tipicamente chamamos de route handler
  //   res.status(200).json({
  //     status: 'success',
  //   //   results: tours.length,
  //   //   data: {
  //   //     tours: tours,
  //   //   },
  //   });
  // });
  try {
    const Tours = await Tour.find();
    res.status(200).json({
      status: 'success',
      results: Tours.length,
      data: {
        tours: Tours,
      },
    });
  } catch (err) {
    console.error('Error fetching tours:', err);
    res.status(500).json({
      status: 'fail',
      message: 'Error fetching tours',
    });
  }
};

exports.addNewTour = async (req, res) => {
  try {
    // const newTour = new tour({});
    // newTour.save(); //Como se fazia antes de saber como se faz bem

    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    console.error('Error creating new tour:', err);
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent',
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Tour not found' });
    }
    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (err) {
    console.error('Error fetching tour:', err);
    res.status(500).json({ status: 'fail', message: 'Error fetching tour' });
  }
};

exports.updateTour = (req, res) => {
  const id = req.params.id * 1; //Converting to number
  //recolher o input vindo do client
  console.log(req.body);
  //encontrar o tour que tem o id igual ao id do parametro
  const tour = tours.find((el) => el.id === id);
  console.log(tour);
  //substituir apenas a tour selecionada
  if (!tour) {
    return res.status(404).json({
      status: '404',
      message: 'Invalid Id',
    });
  }
  //atualizar o tour
  // Esta linha copia todas as propriedades do objeto req.body para o objeto tour existente,
  // sobrescrevendo (atualizando) quaisquer propriedades de tour que também existam em req.body.
  // O método Object.assign modifica o objeto tour original, não cria um novo objeto.
  // Exemplo: se req.body = { name: "Novo Nome" }, então tour.name será atualizado para "Novo Nome".
  const updatedTour = Object.assign(tour, req.body); //
  console.log(updatedTour);
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    () => {
      res.status(200).json({
        status: 'success',
        data: {
          tour: updatedTour,
        },
      });
    }
  );
};

exports.deleteTour = (req, res) => {
  const id = req.params.id * 1; //Converting to number
  //Identificar o objeto com o id que é para eliminar
  // Supondo que 'tours' é um array de objetos, cada um com uma propriedade 'id'.
  // Exemplo: [{id: 1, nome: 'Tour A'}, {id: 2, nome: 'Tour B'}, ...]

  // O método findIndex procura o índice do primeiro elemento que satisfaz a condição dada.
  // 'el' representa cada elemento do array durante a iteração.
  // 'el => el.id === id' é uma arrow function que retorna true se o id do elemento for igual ao id procurado.
  const index = tours.findIndex((el) => el.id === id);
  console.log(index);
  // O método splice remove elementos do array.
  // O primeiro argumento é o índice inicial para remoção (aqui, o índice encontrado).
  // O segundo argumento é o número de elementos a remover (aqui, 1 elemento).
  tours.splice(index, 1);
  tours.forEach((tour, idx) => {
    tour.id = idx;
  });
  if (index === -1) {
    return res.status(404).json({
      status: '404',
      message: 'Invalid Id',
    });
  }
  //Eliminar o objeto com o ID e orientar a ordem dos outros
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    () => {
      res.status(204).json({
        status: 'success',
        data: null,
        message: 'Apagado com sucesso',
      });
    }
  );
  console.log(`deleted Tour ${id} with success`);
};
